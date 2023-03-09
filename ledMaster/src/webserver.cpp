//
//  webserver.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//  @version v0.2-10-gf4a3c71

#include <Arduino.h>
#include <AsyncElegantOTA.h>
#include <WiFi.h>
#include "FS.h"
#include <LittleFS.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <MyTimeLib.h>
#include <Update.h>
#include "tz.h"
#include "common.h"
#include "RlcWebFw.h"
#include "sampling.h"
#include "webserver.h"
#include "common.h"

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
	DynamicJsonDocument jsonBuffer(256);
	jsonBuffer["result"] = (cond) ? okResultText : errorResultText;
	jsonBuffer["time"] = processedTime;
	serializeJson(jsonBuffer, *response);
	//root.printTo(*response);
	request->send(response);
}

void printDirectory(const char * dirname, int numTabs, AsyncResponseStream *response) {
	bool isDirectory = false;
	File dir = LittleFS.open(dirname);
	if(!dir.isDirectory()){
        //Serial.println(" - not a directory");
        return;
    }
	response->printf_P(list_header_table);
	File file = dir.openNextFile();
	while (file) {
		if(file.isDirectory()) {
			isDirectory = true;
		} else {
			isDirectory = false;
		}
		response->printf_P(PSTR("<tr><td><a href=\""));
		String e = String((const char *) file.name());
		e.replace(".gz", "");
		response->print(e.c_str());
		response->print("\">");
		response->print(file.name());
		response->print("</a>");
		response->printf_P(PSTR("</td><td align=\"right\">"));
		if (!isDirectory) {
			// files have sizes, directories do not
			response->println(file.size(), DEC);
			response->printf_P(PSTR("</td>"));
		}
		response->printf_P(PSTR("</tr>"));
		file = dir.openNextFile();
	}
	//FSInfo info;
	//LittleFS.info(info);
	//response->printf_P(list_footer_html,info.totalBytes,info.usedBytes,(info.totalBytes - info.usedBytes));
	response->printf_P(upload_html);
}

//Handle upload file
void onUpload(AsyncWebServerRequest *request, String filename, size_t index,
		uint8_t *data, size_t len, bool final) {

	File f;
	if (!index) {
		f = LittleFS.open(filename.c_str(), "w");
		DEBUG_MSG("UPLOAD:%s\n",filename.c_str());
	} else {
		f = LittleFS.open(filename.c_str(), "a");
	}

	for (size_t i = 0; i < len; i++) {
		f.write(data[i]);
		DEBUG_MSG("#");
	}

	f.close();

	if (final) {
		DEBUG_MSG("\nUpload finish\n");
		request->send_P(200, "text/html", PSTR("File was successfully uploaded\n"));
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
	request->send_P(200, "text/html", HTMLOK);	
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
	request->send_P(200, "text/html", "OK");

}

void webserver_begin() {

	server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);
	server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html").setCacheControl(
			"no-cache, must-revalidate");

	server.onNotFound([](AsyncWebServerRequest *request) {
		request->send(404);
	});

	server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request) {
		request->send(200);
	}, onUpload);

	server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request) {
		sendJsonResultResponse(request,true);
		changed = RESET;
	});

	server.on("/avrUpdate", HTTP_GET, [](AsyncWebServerRequest *request) {
		sendJsonResultResponse(request,true);
		config.startUpdate = true;
		changed = AVRUPDATE;
	});	

	server.on("/meminfo", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				uint32_t startTime = millis();
				AsyncJsonResponse * response = new AsyncJsonResponse();
				JsonObject root = response->getRoot();
				FlashMode_t ideMode = ESP.getFlashChipMode();
				root["heap"] = ESP.getFreeHeap();
				//root["freeBloskSize"] = ESP.getMaxFreeBlockSize() - 512;
				//root["flashid"] = ESP.getFlashChipId();
				//root["realSize"] = ESP.getFlashChipRealSize();
				root["ideSize"] = ESP.getFlashChipSize();
				//root["byIdSize"] = ESP.getFlashChipSizeByChipId();
				root["sketchSpace"] = ESP.getFreeSketchSpace();
				root["ideSpeed"] = ESP.getFlashChipSpeed();
				//root["ideMode"] = (ideMode == FM_QIO ? "QIO" : ideMode == FM_QOUT ? "QOUT" : ideMode == FM_DIO ? "DIO" : ideMode == FM_DOUT ? "DOUT" : "UNKNOWN");
				root["sdkVersion"] = ESP.getSdkVersion();
				//root["coreVersion"] = ESP.getCoreVersion();
				root["cpuFreq"] = ESP.getCpuFreqMHz();
				//root["lastReset"] = ESP.getResetReason();
				//root["lastResetInfo"] = ESP.getResetInfo();
				root["fwMD5"] = ESP.getSketchMD5();
				root["time"] = millis()-startTime;
				response->setLength();
				request->send(response);

			});

	server.on("/list", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				AsyncResponseStream *response = request->beginResponseStream("text/html");
				response->printf_P(PSTR("<html><body>"));
				response->printf_P(PSTR("<h1>Files List</h1>\n"));
				//File root = LittleFS.openDir("/");
				printDirectory("/",0,response);
				response->printf_P(PSTR("</body></html>"));
				request->send(response);
			});

	server.on("/delete", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				AsyncResponseStream *response = request->beginResponseStream("text/html");
				response->printf_P(PSTR("<html><body>"));
				response->printf_P(PSTR("<h1>Files deleting</h1>"));
				response->printf_P(PSTR("<form  action=\"/delete\" method=\"POST\">"));
				response->printf_P(PSTR("<select name=\"%s\">"),"filename");
				File root = LittleFS.open("/");
				if(!root.isDirectory()){
					//Serial.println(" - not a directory");
					return;
				}
				File entry = root.openNextFile();
				while(entry) {
					response->print("<option>");
					response->print(entry.name());
					response->print("</option>");
					entry = root.openNextFile();
				}
				response->printf_P(PSTR("</select>"));
				response->printf_P(PSTR("<input type=\"submit\" value=\"Delete\">"));
				response->printf_P(PSTR("</form></body></html>"));
				request->send(response);

			});

	server.on("/delete", HTTP_POST,
			[](AsyncWebServerRequest *request) {
				if(request->hasArg("filename")) {
					String arg = request->arg("filename");
					bool ok=LittleFS.remove(arg);
					if (ok) {
						request->send_P(200, "text/html", PSTR("File was successfully deleted"));
					} else {
						request->send_P(200, "text/html", PSTR("File was not deleted"));
					}
				} else {
					request->send_P(200, "text/html", PSTR("Unknown parameter"));
				}
			});

	server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request) {
		request->send(200,"text/html",update_html);
	});

	server.on("/update.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		changed = UPDATE;
		sendJsonResultResponse(request,true);
	});

#if DEBUG > 0
	server.on("/formatfs", HTTP_GET, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		bool ok=LittleFS.format();
		sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
	});
#endif	

	/*
	 *  WiFi scan handler
	 */
	server.on("/wifiscan.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {

		int count = WiFi.scanComplete();
		//send result
			AsyncResponseStream *response = request->beginResponseStream("application/json");
			response->printf_P(PSTR("{\"result\": {\n"));
			response->printf_P(PSTR("\"inProgress\": \"%d\",\n"),count>=0?0:-1);
			response->printf_P(PSTR("\"APs\": [\n"));

			for(int i=0;i<count;i++) {
				if (i>0) response->printf(",\n");
				response->printf_P(PSTR("{\"essid\": \"%s\", \"rssi\": \"%d\", \"enc\": \"%d\", \"ch\": \"%d\"}"),WiFi.SSID(i).c_str(),WiFi.RSSI(i),WiFi.encryptionType(i),WiFi.channel(i));
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
		JsonObject root = response->getRoot();

		root["mode"] = str_wifimode[WiFi.getMode()];
		root["chan"] = WiFi.channel();
		root["ssid"] = WiFi.SSID();
		root["status"] = str_wifistatus[WiFi.status()];
		root["localIp"] = WiFi.localIP().toString();
		root["localMask"] = WiFi.subnetMask().toString();
		root["localGw"] = WiFi.gatewayIP().toString();
		root["apIp"] = WiFi.softAPIP().toString();
		root["rssi"] = WiFi.RSSI();
		//root["phy"] = WiFi.getPhyMode();
		root["mac"] = WiFi.macAddress();
		root["psk"] = WiFi.psk();
		root["bssid"] = WiFi.BSSIDstr();
		root["host"] = WiFi.getHostname();
		root["time"] = startTime - millis();
		response->setLength();
		request->send(response);
	});

	server.on("/wificonnect.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				config.appwd=request->arg("appwd");
				//config.apchannel=atoi(request->arg("apchannel").c_str());
				config.apip=request->arg("apip");
				config.apmask=request->arg("apmask");
				config.apgw=request->arg("apgw");

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

				changed = WIFI;
				AsyncWebServerResponse *response = request->beginResponse(200);
				response->addHeader("refresh","20;url=http://"+config.hostname+".local");
				request->send(response);
			});

	server.on("/settime.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		setTimeCgi(request);
		changed = CONFIG;
	});

	server.on("/setlang.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		setLang(request);
		changed = CONFIG;
	});

	server.on("/getTimeSlotProfiles.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				uint32_t startTime=millis();

				AsyncResponseStream *response = request->beginResponseStream("application/json");

				File root = LittleFS.open("/");
				response->print("{\"profileList\": [");
				bool started=false;
				File entry = root.openNextFile();
				while(entry) {

					String filename=entry.name();

					if (filename.endsWith(".pjs"))
					{
						String ps=(started)?",\n":"";
						response->printf("%s{\"filename\":\"%s\"}",ps.c_str(),filename.c_str());
						started=true;
					}
					entry = root.openNextFile();

				}
				response->printf("],\n\"time\":%ld}",millis()-startTime);
				request->send(response);

			});

	server.on("/getinfo.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {

				uint32_t startTime=millis();

				AsyncJsonResponse * response = new AsyncJsonResponse();
				JsonObject root = response->getRoot();
				root["mode"] = config.manual;

				time_t localtime = now();
				if (config.useDST) {
					Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
					localtime = tzlocal.toLocal(now());
				}

				root["timeslot"] = (uint32_t)hour(localtime)*3600+(uint32_t)minute(localtime)*60+(uint32_t)second(localtime)%600;
				JsonArray tsv = root.createNestedArray("timeSlotValues");
				for(uint8_t j=0;j<CHANNELS;j++) {
					if (config.manual == true) {
						tsv.add((int)config.manualValues[j]);
					} else {
						tsv.add((int)ledValue[j]);
					}
				}
				root["moduleTemperature_0"] =  moduleTemperature[0];
				root["moduleTemperature_1"] =  moduleTemperature[1];
				root["moduleTemperature_2"] =  moduleTemperature[2];
				root["moduleTemperature_3"] =  moduleTemperature[3];
				root["time"] = millis()-startTime;
				response->setLength();
				request->send(response);
				PRINT_CONFIG();
			});
 
 #if DEBUG > 0
	server.on("/samplings.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				AsyncResponseStream *response = request->beginResponseStream("text/html");
				response->printf_P(PSTR("<html><body>"));
				response->printf_P(PSTR("<h1>Data:</h1>\n"));
				for(int16_t j=0;j<samplings.usedSamplingCount;j++) {
					response->printf_P(PSTR("[%d,%d,%d]<br>"),samplings.sampling[j].channel,samplings.sampling[j].timeSlot,samplings.sampling[j].value);
				}
				response->printf_P(PSTR("</body></html>"));
				request->send(response);				
		});
#endif		

	server.on("/getconfig.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		DEBUG_MSG("%s\n","getconfig.cgi");
		AsyncJsonResponse * response = new AsyncJsonResponse();

		JsonObject root = response->getRoot();
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
		root["peerMode"] = config.peerMode;
		root["profileFileName"] = config.profileFileName.c_str();
		JsonArray slv = root.createNestedArray("slaves");
		char buffer[14]  = {'\0'};
		for(uint8_t j=0;j<config.peersCount;j++) {
			snprintf(buffer,14,"NEREUS_%02x%02x%02x", 
			 config.peers[j].mac[3],
			 config.peers[j].mac[4], 
			 config.peers[j].mac[5]);
			slv.add(buffer);
			buffer[0] = '\0';
		}
		root["time"] = millis()-startTime;
		response->setLength();
		request->send(response);
	});

	server.on("/gettime.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		time_t utc = now();    //current time from the Time Library
			AsyncResponseStream *response = request->beginResponseStream("text/json");
			DynamicJsonDocument jsonBuffer(256);
			jsonBuffer["utc"] = utc;
			//jsonBuffer.printTo(*response);
			serializeJson(jsonBuffer, *response);
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
		DEBUG_MSG("Get %s\n",nfilename.c_str());		
		
		config.profileFileName=String(nfilename);
		changed = LED;
		
		sendJsonResultResponse(request,true,"OK","ERROR",millis()-startTime);
	});

	server.on("/setmanual.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		DEBUG_MSG("%s\n","setmanual.cgi");
		int m = StringToInt((String)request->arg("m"));
		config.manual = m==0?false:true;
		sendJsonResultResponse(request,true);		
		changed = CONFIG;
	});

	server.on("/showversions.cgi", HTTP_GET,
			[](AsyncWebServerRequest *request) {
				uint32_t startTime = millis();
				AsyncResponseStream *response = request->beginResponseStream("text/json");
				DynamicJsonDocument doc(1024);
				doc["coreVersion"] = coreVersion;
				doc["masterVersion"] = versionInfo.mainModule;
				doc["Version_0"] = versionInfo.slaveModule[0];
				doc["modulesVersion_1"] = versionInfo.slaveModule[1];
				doc["modulesVersion_2"] = versionInfo.slaveModule[2];
				doc["modulesVersion_3"] = versionInfo.slaveModule[3];
				doc["isUpdateAvailable"] = isUpdateAvailable;
				doc["time"] = millis()-startTime;
				serializeJson(doc, *response);
				request->send(response);
			});

	server.on("/setled.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		String json = (String)request->arg("body");
		DynamicJsonDocument doc(256);
		DeserializationError error = deserializeJson(doc, json);
		if (error) {
			DEBUG_MSG("Error parsing manual values: %s\n",error.c_str());
			sendJsonResultResponse(request,false);
			return;
		}
		JsonArray data = doc["data"];
		for(uint8_t i=0;i<CHANNELS;i++) {
			config.manualValues[i] = (uint16_t)data[i];
		}
		sendJsonResultResponse(request,true);
		changed = CONFIG;
	});

	server.on("/getslaves.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		changed = SEARCHPEERS;
		sendJsonResultResponse(request,true);
	});

	server.on("/showslaves.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		uint32_t startTime=millis();
		AsyncJsonResponse * response = new AsyncJsonResponse();
		JsonObject root = response->getRoot();
		JsonArray slv = root.createNestedArray("slaves");
		char buffer[14]  = {'\0'};
		for(uint8_t j=0;j<peersCount;j++) {
			snprintf(buffer,14,"NEREUS_%02x%02x%02x", 
			 config.peers[j].mac[3] ,
			 config.peers[j].mac[4] ,
			 config.peers[j].mac[5] );
			slv.add(buffer);
			buffer[0] = '\0';
		}
		root["time"] = millis()-startTime;
		response->setLength();
		request->send(response);
	});

	server.on("/peers.cgi", HTTP_GET, [](AsyncWebServerRequest *request) {
		changed = CONFIRMPEERS;
		sendJsonResultResponse(request,true);
	});	

	server.on("/removeslave.cgi", HTTP_POST, [](AsyncWebServerRequest *request) {
		String json = (String)request->arg("body");
		StaticJsonDocument<48> doc;
		DeserializationError error = deserializeJson(doc, json);
		if (error) {
			DEBUG_MSG("Error parsing slave: %s\n",error.c_str());
			sendJsonResultResponse(request,false);
			return;
		}
		String name = doc["slave"];
		DEBUG_MSG("Input: %s\n",name.c_str());		
		uint8_t mac[6] = {0x5E,0xCF,0x7F,0,0,0};
		int x[3];
		if ( 3 == sscanf(name.c_str(), "NEREUS_%02x%02x%02x",  &x[0], &x[1], &x[2] ) ) {
			mac[3]=(uint8_t)x[0];
			mac[4]=(uint8_t)x[1];
			mac[5]=(uint8_t)x[2];
			removeFromPeers(mac);
		}
		sendJsonResultResponse(request,true);
		changed = CONFIG;
	});

	AsyncElegantOTA.begin(&server); 
	server.begin();
}

