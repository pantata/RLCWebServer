//
//  webserver.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//  @version v0.2-10-gf4a3c71

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <FS.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <MyTimeLib.h>

#include "tz.h"
#include "common.h"
#include "RlcWebFw.h"
#include "sampling.h"
#include "webserver.h"

#include "avrUpdate.h"

AsyncWebServer server(80);

time_t utc;

DstRule cest = { Mar, Second, Sun, 2, 120 };  //UTC + 2 hours
DstRule cet = { Oct, Last, Sun, 3, 60 };   //UTC + 1 hours
Tz tz(cest, cet);

class CaptiveRequestHandler: public AsyncWebHandler {
public:
	CaptiveRequestHandler() {
	}

	bool canHandle(AsyncWebServerRequest *request) {
		// redirect if not in wifi client mode (through filter)
		// and request for different host (due to DNS * response)
		if (request->host() != WiFi.softAPIP().toString())
			return true;
		else
			return false;
	}

	void handleRequest(AsyncWebServerRequest *request) {
		String location = "http://" + WiFi.softAPIP().toString();
		if (request->host() == config.hostname + ".local")
			location += request->url();
		location += "/?page=wifi";
		request->redirect(location);
	}
};

void sendJsonResultResponse(AsyncWebServerRequest *request, bool cond,
		String okResultText, String errorResultText, uint32_t processedTime) {
	AsyncResponseStream *response = request->beginResponseStream("text/json");
	DynamicJsonBuffer jsonBuffer;
	JsonObject &root = jsonBuffer.createObject();
	root["result"] = (cond) ? okResultText : errorResultText;
	root["time"] = processedTime;
	root.printTo(*response);
	request->send(response);
}

void printDirectory(Dir dir, int numTabs, AsyncResponseStream *response) {
	bool isDirectory = false;
	response->print(
			"<table><tr><td><i>File Name</i></td><td  align=\"right\"><i>Size</i></td></tr>");
	while (dir.next()) {

		File entry = dir.openFile("r");
		if (!entry) {
			// no more files
			//Serial.println("**nomorefiles**");
			isDirectory = true;
		} else {
			isDirectory = false;
		}
		/*for (uint8_t i=0; i<numTabs; i++) {
		 response->print('\t');
		 }*/
		response->print("<tr><td><a href=\"");
		String e = String((const char *) entry.name());
		e.replace(".gz", "");
		response->print(e.c_str());
		response->print("\">");
		response->print(entry.name());
		response->print("</a>");
		response->print("</td><td align=\"right\">");
		if (isDirectory) {
			Dir dir1 = SPIFFS.openDir(dir.fileName() + "/" + entry.name());
			printDirectory(dir1, numTabs + 1, response);
		} else {
			// files have sizes, directories do not

			response->println(entry.size(), DEC);
			response->print("</td>");
		}
		response->print("</tr>");
	}
	FSInfo info;
	SPIFFS.info(info);
	response->print("<tr><td></td></tr>");
	response->print("<tr><td>Bytes Total</td>");
	response->printf("<td align=\"right\">%d</td></tr>", info.totalBytes);
	response->print("<tr><td>Bytes Used</td>");
	response->printf("<td align=\"right\">%d</td></tr>", info.usedBytes);
	response->print("<tr><td>Bytes Free</td>");
	response->printf("<td align=\"right\">%d</td></tr>",
			(info.totalBytes - info.usedBytes));

	response->print("</table>");
}

//Handle upload file
void onUpload(AsyncWebServerRequest *request, String filename, size_t index,
		uint8_t *data, size_t len, bool final) {

	File f;
	String name = "/" + filename;
	if (!index) {
		f = SPIFFS.open(name.c_str(), "w");
	} else {
		f = SPIFFS.open(name.c_str(), "a");
	}

	for (size_t i = 0; i < len; i++)
		f.write(data[i]);

	f.close();

	if (final) {
		request->send_P(200, "text/html", "File was successfully uploaded\n");
	}
}

//Handle firmware file
void onUpdate(AsyncWebServerRequest *request, String filename, size_t index,
		uint8_t *data, size_t len, bool final) {
	if (!index) {
		Update.runAsync(true);
		if (!Update.begin((ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000)) {
			request->send_P(200, "text/html", "Error");
		}
	}
	if (!Update.hasError()) {
		if (Update.write(data, len) != len) {
			request->send_P(200, "text/html", "Error");
		}
	}
	if (final) {
		if (Update.end(true)) {
			request->send_P(200, "text/html", "Success");
		} else {
			request->send_P(200, "text/html", "Error");
		}
	}
}

size_t findIndex(const char *a[], size_t size, const char *value) {
	size_t index = 0;
	while (index < size && (strcmp(a[index], value) != 0))
		++index;
	return (index == size ? -1 : index);
}

void setLang(AsyncWebServerRequest *request) {
	String lang = request->arg("lang");
	int size = sizeof(str_lang) / sizeof(str_lang[0]);
	config.lang = findIndex(str_lang, size, lang.c_str());
	request->send_P(200, "text/html", "OK");
	saveConfig();
}

void setTimeCgi(AsyncWebServerRequest *request) {
	String useNtp = request->arg("use-ntp");
	String ntpip = request->arg("ntpip");
	String useDST = request->arg("use-dst");
	String dstStartMonth = request->arg("dstStartMonth");
	String dstStartDay = request->arg("dstStartDay");
	String dstStartWeek = request->arg("dstStartWeek");
	String dstStartOffset = request->arg("dstStartOffset");
	String dstEndMonth = request->arg("dstEndMonth");
	String dstEndDay = request->arg("dstEndDay");
	String dstEndWeek = request->arg("dstEndWeek");
	String dstEndOffset = request->arg("dstEndOffset");
	String timezone = request->arg("timezone");
	String yy = request->arg("yy");
	String mm = request->arg("mm");
	String dd = request->arg("dd");
	String hh = request->arg("hh");
	String mi = request->arg("mi");
	String dateFormat = request->arg("dateFormat");
	String timeFormat = request->arg("timeFormat");

	if (useDST.toInt()) {
		config.useDST = true;
		config.tzRule.dstStart.day = atoi(dstStartDay.c_str());
		config.tzRule.dstStart.month = atoi(dstStartMonth.c_str());
		config.tzRule.dstStart.week = atoi(dstStartWeek.c_str());
		config.tzRule.dstStart.offset = dstOffset[atoi(dstStartOffset.c_str())];

		config.tzRule.dstEnd.day = atoi(dstEndDay.c_str());
		config.tzRule.dstEnd.month = atoi(dstEndMonth.c_str());
		config.tzRule.dstEnd.week = atoi(dstEndWeek.c_str());
		config.tzRule.dstEnd.offset = dstOffset[atoi(dstEndOffset.c_str())];
	} else {
		config.tzRule.dstEnd.offset = dstOffset[atoi(timezone.c_str())];
	}

	if (useNtp.toInt()) {
		config.useNtp = true;
		config.ntpServer = String(ntpip);
		syncTime = true;
	} else {
		config.useNtp = false;

		tmElements_t t;
		t.Day = atoi(dd.c_str());
		t.Month = atoi(mm.c_str());
		t.Year = atoi(yy.c_str() + 2000);
		t.Hour = atoi(hh.c_str());
		t.Minute = atoi(mi.c_str());
		t.Second = 0;
		time_t tt = makeTime(t);
		if (config.useDST == true) {
			Tz tzlocal = Tz(config.tzRule.dstStart, config.tzRule.dstEnd);
			setTime(tzlocal.toUTC(tt));
		} else {
			setTime(tt + (config.tzRule.dstEnd.offset * 60));
		}
	}

	config.tmFormat = atoi(timeFormat.c_str());
	config.dtFormat = atoi(dateFormat.c_str());

	normalizeConfig();
	saveConfig();

	request->send_P(200, "text/html", "OK");

}

void webserver_begin() {

	server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);
	server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html").setCacheControl(
			"no-cache, must-revalidate");

	server.onNotFound([](AsyncWebServerRequest *request) {
		request->send(404);
	});

	server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request) {
		request->send(200);
	}, onUpload);

	server.on("/updater.html", HTTP_POST,
			[](AsyncWebServerRequest *request) {
				shouldReboot = !Update.hasError();
				AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", shouldReboot?"OK - Wait 30 sec for restart":"FAIL");
				response->addHeader("refresh","30;url=/");
				request->send(response);
			}, onUpdate);

	server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request) {
		sendJsonResultResponse(request,true);
		shouldReboot = true;
	});

	server.on("/resetavr", HTTP_GET, [](AsyncWebServerRequest *request) {
		sendJsonResultResponse(request,true);
		changed = RESETAVR;
	});

	server.on("/meminfo", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				uint32_t startTime = millis();
				AsyncJsonResponse * response = new AsyncJsonResponse();
				JsonObject& root = response->getRoot();
				FlashMode_t ideMode = ESP.getFlashChipMode();
				root["heap"] = ESP.getFreeHeap();
				root["flashid"] = ESP.getFlashChipId();
				root["realSize"] = ESP.getFlashChipRealSize();
				root["ideSize"] = ESP.getFlashChipSize();
				root["byIdSize"] = ESP.getFlashChipSizeByChipId();
				root["sketchSpace"] = ESP.getFreeSketchSpace();
				root["ideSpeed"] = ESP.getFlashChipSpeed();
				root["ideMode"] = (ideMode == FM_QIO ? "QIO" : ideMode == FM_QOUT ? "QOUT" : ideMode == FM_DIO ? "DIO" : ideMode == FM_DOUT ? "DOUT" : "UNKNOWN");
				root["sdkVersion"] = ESP.getSdkVersion();
				root["coreVersion"] = ESP.getCoreVersion();
				root["cpuFreq"] = ESP.getCpuFreqMHz();
				root["lastReset"] = ESP.getResetReason();
				root["lastResetInfo"] = ESP.getResetInfo();
				root["fwMD5"] = ESP.getSketchMD5();
				root["time"] = millis()-startTime;
				response->setLength();
				request->send(response);

			});

	server.on("/list", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				AsyncResponseStream *response = request->beginResponseStream("text/html");
				response->print("<html><body>");
				response->print("<h1>Files List</h1>\n");
				Dir root = SPIFFS.openDir("/");
				printDirectory(root,0,response);
				response->print("</body></html>");
				request->send(response);
			});

	server.on("/delete", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				AsyncResponseStream *response = request->beginResponseStream("text/html");
				response->print("<html><body>");
				response->print("<h1>Files deleting</h1>");
				response->print("<form  action=\"/delete\" method=\"POST\">");
				response->printf("<select name=\"%s\">","filename");
				Dir root = SPIFFS.openDir("/");
				while(root.next()) {
					File entry = root.openFile("r");
					response->print("<option>");
					response->print(entry.name());
					response->print("</option>");
				}
				response->print("</select>");
				response->print("<input type=\"submit\" value=\"Delete\"\>");
				response->print("</form></body></html>");
				request->send(response);

			});

	server.on("/delete", HTTP_POST,
			[](AsyncWebServerRequest *request) {
				if(request->hasArg("filename")) {
					String arg = request->arg("filename");
					bool ok=SPIFFS.remove(arg);
					if (ok) {
						request->send_P(200, "text/html", "File was successfully deleted");
					} else {
						request->send_P(200, "text/html", "File was not deleted");
					}
				} else {
					request->send_P(200, "text/html", "Unknown parameter");
				}
			});

	server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request) {
		request->send(200,"text/html",update_html);
	});

	server.on("/formatfs", HTTP_GET, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		bool ok=SPIFFS.format();
		sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
	});

	/*
	 *  WiFi scan handler
	 */
	server.on("/wifiscan.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {

		int count = WiFi.scanComplete();
		//send result
			AsyncResponseStream *response = request->beginResponseStream("application/json");
			response->print("{\"result\": {\n");
			response->printf("\"inProgress\": \"%d\",\n",count>=0?0:-1);
			response->print("\"APs\": [\n");

			for(int i=0;i<count;i++) {
				if (i>0) response->printf(",\n");
				response->printf("{\"essid\": \"%s\", \"rssi\": \"%d\", \"enc\": \"%d\", \"ch\": \"%d\"}",WiFi.SSID(i).c_str(),WiFi.RSSI(i),WiFi.encryptionType(i),WiFi.channel(i));
			}
			response->printf("\n");

			response->print("]\n");
			response->print("}\n}\n");
			request->send(response);

			if ( WiFi.scanComplete() != WIFI_SCAN_RUNNING ) {
				WiFi.scanDelete();
				WiFi.scanNetworks(true);
			}
		});

	server.on("/wifistatus.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {

		uint32_t startTime=millis();

		AsyncJsonResponse *response = new AsyncJsonResponse();
		JsonObject& root = response->getRoot();

		root["mode"] = str_wifimode[WiFi.getMode()];
		root["chan"] = WiFi.channel();
		root["ssid"] = WiFi.SSID();
		root["status"] = str_wifistatus[WiFi.status()];
		root["localIp"] = WiFi.localIP().toString();
		root["localMask"] = WiFi.subnetMask().toString();
		root["localGw"] = WiFi.gatewayIP().toString();
		root["apIp"] = WiFi.softAPIP().toString();
		root["rssi"] = WiFi.RSSI();
		root["phy"] = WiFi.getPhyMode();
		root["mac"] = WiFi.macAddress();
		root["psk"] = WiFi.psk();
		root["bssid"] = WiFi.BSSIDstr();
		root["host"] = WiFi.hostname();
		root["time"] = startTime - millis();
		response->setLength();
		request->send(response);
	});

/*
	  server.on("/wifistatus.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
	        DEBUG_MSG("%s\n","WifiStatus started");

	        AsyncResponseStream *response = request->beginResponseStream("text/json");
	        PRINT_CONFIG(config);
	        DEBUG_MSG("%s\n","WifiStatus response stream created");

	        response->print("{");
	        DEBUG_MSG("%s\n","{");

	        response->printf("\"mode\":\"%s\",\n",str_wifimode[WiFi.getMode()]);
	        DEBUG_MSG("\"mode\":\"%d\",\n",WiFi.getMode());

	        response->printf("\"chan\":\"%d\",\n",WiFi.channel());
	        DEBUG_MSG("\"chan\":\"%d\",\n",WiFi.channel());

	        response->printf("\"ssid\":\"%s\",\n",WiFi.SSID().c_str());
	        DEBUG_MSG("\"ssid\":\"%s\",\n",WiFi.SSID().c_str());

	        response->printf("\"status\":\"%s\",\n",str_wifistatus[WiFi.status()]);
	        DEBUG_MSG("\"status\":\"%d\",\n",WiFi.status());

	        response->printf("\"localIp\":\"%s\",\n",WiFi.localIP().toString().c_str());
	        DEBUG_MSG("\"localIp\":\"%s\",\n",WiFi.localIP().toString().c_str());

	        response->printf("\"localMask\":\"%s\",\n",WiFi.subnetMask().toString().c_str());
	        DEBUG_MSG("\"localIp\":\"%s\",\n",WiFi.subnetMask().toString().c_str());

	        response->printf("\"localGw\":\"%s\",\n",WiFi.gatewayIP().toString().c_str());
	        DEBUG_MSG("\"localIp\":\"%s\",\n",WiFi.gatewayIP().toString().c_str());

	        response->printf("\"apIp\":\"%s\",\n",WiFi.softAPIP().toString().c_str());
	        DEBUG_MSG("\"apIp\":\"%s\",\n",WiFi.softAPIP().toString().c_str());

	        response->printf("\"rssi\":\"%d\",\n",WiFi.RSSI());
	        DEBUG_MSG("\"rssi\":\"%d\",\n",WiFi.RSSI());

	        response->printf("\"phy\":\"%d\",\n",WiFi.getPhyMode());
	        DEBUG_MSG("\"phy\":\"%d\",\n",WiFi.getPhyMode());

	        response->printf("\"mac\":\"%s\",\n",WiFi.macAddress().c_str());
	        DEBUG_MSG("\"mac\":\"%s\",\n",WiFi.macAddress().c_str());

	        response->printf("\"psk\":\"%s\",\n",WiFi.psk().c_str());
	        DEBUG_MSG("\"psk\":\"%s\",\n",WiFi.psk().c_str());

	        response->printf("\"bssid\":\"%s\",\n",WiFi.BSSIDstr().c_str());
	        DEBUG_MSG("\"bssid\":\"%s\",\n",WiFi.BSSIDstr().c_str());

	        response->printf("\"host\":\"%s\",\n",WiFi.hostname().c_str());
	        DEBUG_MSG("\"bssid\":\"%s\",\n",WiFi.BSSIDstr().c_str());

	        response->printf("\"warn\":\"%s\"\n","");
	        DEBUG_MSG("\"warn\":\"%s\"\n","");

	        response->print("}\n");
	        DEBUG_MSG("%s\n","}");

	        request->send(response);
	    });
*/

	server.on("/wificonnect.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				config.wifimode=atoi(request->arg("apmode").c_str());

				if (config.wifimode == WIFI_AP) {
					config.hostname=request->arg("apname");
					config.appwd=request->arg("appwd");
					config.apchannel=atoi(request->arg("apchannel").c_str());
					config.apip=request->arg("apip");
					config.apmask=request->arg("apmask");
					config.apgw=request->arg("apgw");
				}

				if (config.wifimode == WIFI_STA) {
					config.ssid=request->arg("ssid");
					config.pwd=request->arg("pwd");
					config.wifidhcp=String(request->arg("dhcponoff")).equals("1");
					if (!config.wifidhcp) {
						config.wifiip=request->arg("ip");
						config.wifimask=request->arg("mask");
						config.wifigw=request->arg("gw");
						config.wifidns1=request->arg("dns1");
						config.wifidns2=request->arg("dns2");
					}
				}
				shouldReconnect = true;
				changed = WIFI;
				AsyncWebServerResponse *response = request->beginResponse(200);
				response->addHeader("refresh","20;url=http://"+config.hostname+".local");
				request->send(response);
			});

	server.on("/settime.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		setTimeCgi(request);
		changed = TIME;
	});

	server.on("/setlang.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		setLang(request);
		changed = LANG;
	});

	server.on("/getTimeSlotProfiles.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				uint32_t startTime=millis();

				AsyncResponseStream *response = request->beginResponseStream("application/json");

				Dir root = SPIFFS.openDir("/");
				response->print("{\"profileList\": [");
				bool started=false;
				while(root.next()) {

					String filename=root.fileName();

					if (filename.endsWith(".pjs"))
					{
						String ps=(started)?",\n":"";
						response->printf("%s{\"filename\":\"%s\"}",ps.c_str(),filename.c_str());
						started=true;
					}

				}
				response->printf("],\n\"time\":%d}",millis()-startTime);
				request->send(response);

			});

	server.on("/getinfo.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {

				uint32_t startTime=millis();

				AsyncJsonResponse * response = new AsyncJsonResponse();
				JsonObject& root = response->getRoot();
				root["mode"] = mode;
				root["modulescount"] = modulesCount;

				time_t localtime = now();
				if (config.useDST) {
					Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
					localtime = tzlocal.toLocal(now());
				}

				root["timeslot"] = (uint32_t)hour(localtime)*3600+(uint32_t)minute(localtime)*60+(uint32_t)second(localtime)%900;
				JsonArray& tsv = root.createNestedArray("timeSlotValues");

				for(uint8_t i=1;i<modulesCount+1;i++) {
					JsonArray& led = tsv.createNestedArray();
					for(uint8_t j=1;j<8;j++) {
						if (config.manual == true) {
							led.add((int)config.manualValues[i-1][j-1]);
						} else {
							led.add((int)getSamplingValue(i,j));
						}
					}

				}

				JsonArray& mt = root.createNestedArray("modulesTemperature");
				for(uint8_t i=0;i<modulesCount;i++) {
					mt.add( modulesTemperature[i]);
				}
				root["time"] = millis()-startTime;
				response->setLength();
				request->send(response);
				PRINT_CONFIG();
			});

	server.on("/getconfig.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		DEBUG_MSG("%s\n","getconfig.cgi");
		AsyncJsonResponse * response = new AsyncJsonResponse();

		JsonObject& root = response->getRoot();
		root["modulescount"] = modulesCount;
		root["lang"] = str_lang[config.lang];
		root["dst"] = config.useDST;
		root["useNTP"] = config.useNtp;
		root["ntpServer"] = config.ntpServer.c_str();
		root["timeZone"] = config.tzRule.tzName.c_str();
		root["dtFormat"] = config.dtFormat;
		root["tmFormat"] = config.tmFormat;
		root["dstStartDay"] = config.tzRule.dstStart.day;
		root["dstStartWeek"] = config.tzRule.dstStart.week;
		root["dstStartMonth"]= config.tzRule.dstStart.month;
		root["dstStartHour"] = config.tzRule.dstStart.hour;
		root["dstStartOffset"]= config.tzRule.dstStart.offset;
		root["dstEndDay"] = config.tzRule.dstEnd.day;
		root["dstEndWeek"] = config.tzRule.dstEnd.week;
		root["dstEndMonth"] = config.tzRule.dstEnd.month;
		root["dstEndHour"] = config.tzRule.dstEnd.hour;
		root["dstEndOffset"] = config.tzRule.dstEnd.offset;
		root["isManual"] = config.manual;
		root["profileFileName"] = config.profileFileName.c_str();
		root["lcdTimeout"] = config.lcdTimeout;
		root["menuTimeout"] = config.menuTimeout;
		root["time"] = millis()-startTime;
		response->setLength();
		request->send(response);
	});

	server.on("/gettime.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		time_t utc = now();    //current time from the Time Library
			AsyncResponseStream *response = request->beginResponseStream("text/json");
			DynamicJsonBuffer jsonBuffer;
			JsonObject &root = jsonBuffer.createObject();
			root["utc"] = utc;
			root.printTo(*response);
			request->send(response);
		});

	/* avr update fw */
	server.on("/avr.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		arduinoFlash = true;
		sendJsonResultResponse(request,true);
	});

	server.on("/avrstatus.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				AsyncResponseStream *response = request->beginResponseStream("text/json");
				DynamicJsonBuffer jsonBuffer;
				JsonObject &root = jsonBuffer.createObject();
				root["status"] = arduinoGetStatus();
				root["pages"] = arduinoPages();
				root["pagesFlashed"] = arduinoPagesFlashed();
				root.printTo(*response);
				request->send(response);
			});

	server.on("/saveSampling.cgi", HTTP_POST,
			[](AsyncWebServerRequest *request) {}, onUpload);

	server.on("/setprofile.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		String profileName=request->arg("profileName");
		String nfilename;
		if (!profileName.endsWith(".pjs")) {
			nfilename=String(profileName+".pjs");
		} else {
			nfilename=String(profileName);
		}

		bool ok=loadSamplingStruct(nfilename,&samplings);
		if (ok) {
			config.profileFileName=String(nfilename);
			ok=saveConfig();
		}
		sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
		changed = LED;
	});

	server.on("/setmanual.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		DEBUG_MSG("%s\n","setmanual.cgi");
		int m = StringToInt((String)request->arg("m"));
		config.manual = m==0?false:true;
		sendJsonResultResponse(request,true);
		saveConfig();
		changed = MANUAL;
	});

	server.on("/showversions.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				uint32_t startTime = millis();
				AsyncResponseStream *response = request->beginResponseStream("text/json");
				DynamicJsonBuffer jsonBuffer;
				JsonObject &root = jsonBuffer.createObject();
				root["coreVersion"] = coreVersion;
				root["masterVersion"] = versionInfo.mainModule;
				JsonArray& mv = root.createNestedArray("modulesVersion");
				for(uint8_t i=0;i<modulesCount;i++) {
					mv.add(versionInfo.slaveModules[i]);
				}

				root["time"] = millis()-startTime;

				root.printTo(*response);
				request->send(response);
			});

	server.on("/setled.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		String json = (String)request->arg("body");
		DynamicJsonBuffer jsonBuffer;
		JsonObject& root = jsonBuffer.parseObject(json);

		if (!root.success()) {
			Serial.println("parseObject() failed");
			sendJsonResultResponse(request,false);
			return;
		}

		int m = root["0"];

		for (uint8_t i=(m>0?m-1:0); i < (m==0?MAX_MODULES:m); i++) {
			config.manualValues[i][0] = (uint16_t)root["1"];
			config.manualValues[i][1] = (uint16_t)root["2"];
			config.manualValues[i][2] = (uint16_t)root["3"];
			config.manualValues[i][3] = (uint16_t)root["4"];
			config.manualValues[i][4] = (uint16_t)root["5"];
			config.manualValues[i][5] = (uint16_t)root["6"];
			config.manualValues[i][6] = (uint16_t)root["7"];
		}
		saveConfig();
		sendJsonResultResponse(request,true);
		changed = MANUAL;
	});

	server.begin();
}

