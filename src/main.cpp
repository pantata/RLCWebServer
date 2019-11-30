///
/// @mainpage	RlcWebFw
///
/// @details    WiFi chip firmware
/// @n
/// @n
///
/// @date		21.10.16 15:51
/// @version v0.2-10-gf4a3c71
///
///
/// @see		ReadMe.txt for references
///

///
#include <Esp.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <FS.h>

#include <time.h>
#include <Hash.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoOTA.h>
#include <NTPClient.h>
#include <MyTimeLib.h>
#include <DNSServer.h>
#include <ESP8266mDNS.h>
#include <Wire.h> 
#include "SSD1306Brzo.h"

#include "common.h"
#include "RlcWebFw.h"

#include "webserver.h"
#include "sampling.h"
#include "tz.h"

//#include "espping.h"

extern "C" {
#include "user_interface.h"
}

#define COREVERSION 0x0102

const uint16_t coreVersion = COREVERSION;

SSD1306Brzo  display(0x3c, D1, D2);

WiFiUDP Udp;
NTPClient ntpClient(Udp, TIMESERVER, 0, NTPSYNCINTERVAL);
DNSServer dnsServer;

Config config;
WifiNetworks wifinetworks[16];
struct Samplings samplings;
struct VersionInfo versionInfo;

bool shouldReboot = false;
bool shouldReconnect = false;
bool startUpdate = false;
bool updateExited = false;
bool isDNSStarted = false;
bool arduinoFlash = false;
bool incomingLedValues = false;

String inputString = "";
uint8_t inStr = 0;

uint8_t lang = 0;
t_changed changed = NONE;

uint8_t modulesCount=16;


int8_t modulesTemperature[16];
uint8_t mode = 0;

bool _is_static_ip = false;
uint8_t _wifi_retry_count = 0;
uint32_t _wifi_retry_timeout = 0;

bool syncTime = false;

int dstOffset[] = { -720, -660, -600, -540, -480, -420, -360, -300, -240, -210,
		-180, -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360,
		390, 420, 480, 540, 570, 600, 660, 720, 780 };

const char* str_wifistatus[] = { "WL_IDLE_STATUS", "WL_NO_SSID_AVAIL",
		"WL_SCAN_COMPLETED", "WL_CONNECTED", "WL_CONNECT_FAILED",
		"WL_CONNECTION_LOST", "WL_DISCONNECTED" };

const char* str_wifimode[] = { "OFF", "STA", "AP", "AP_STA" };

const char* str_wifiauth[] = { "AUTH_OPEN", "AUTH_WEP", "AUTH_WPA_PSK",
		"AUTH_WPA2_PSK", "AUTH_WPA_WPA2_PSK", "AUTH_MAX" };

const char* str_timestatus[] = { "timeNotSet", "timeNeedsSync", "timeSet" };

const char* str_lang[] = { "en", "cs", "pl", "de" };

union Unixtime unixtime;


// SKETCH BEGIN

WiFiEventHandler connectedEventHandler, disconnectedEventHandler;

/*--- Internet test ----------*/
/*
 bool inetTest() {
 const IPAddress test_ip(8,8,8,8);

 if(Ping.ping(test_ip)) {
 return true;
 } else {
 return false;
 }
 }
 */

/*-------- NTP code ----------*/
time_t getNtpTime() {
	time_t l = 0;
	if (ntpClient.forceUpdate()) {
		l = ntpClient.getEpochTime();
	}
	DEBUG_MSG("Epoch: %lu\n", l);
	return l;
}

uint8_t waitForConnectResult(unsigned long _connectTimeout) {
	DEBUG_MSG("%s\n", "Waiting for connection result with time out");
	unsigned long start = millis();
	boolean keepConnecting = true;
	uint8_t status;
	while (keepConnecting) {
		esp_yield();
		status = WiFi.status();
		if (millis() > start + _connectTimeout) {
			keepConnecting = false;
			DEBUG_MSG("%s\n", "Connection timed out");
		}
		if ((status == WL_CONNECTED) || (status == WL_CONNECT_FAILED)) {
			keepConnecting = false;
		}
		delay(100);
	}
	return status;
}

void connectWifi(String ssid, String pass) {
	DEBUG_MSG("wifi begin");
	WiFi.begin ( ssid, pass );  	
}

void wifiConnect() {
	DEBUG_MSG("wifiConnect");
	normalizeConfig();

	if (config.wifimode == WIFI_STA) {
		if (!config.wifidhcp) {
			IPAddress ip = IPAddress((uint32_t) 0);
			IPAddress gw = IPAddress((uint32_t) 0);
			IPAddress mask = IPAddress((uint32_t) 0);
			IPAddress dns1 = IPAddress((uint32_t) 0);
			IPAddress dns2 = IPAddress((uint32_t) 0);
			gw.fromString(config.wifigw);
			mask.fromString(config.wifimask);
			ip.fromString(config.wifiip);
			dns1.fromString(config.wifidns1);
			dns2.fromString(config.wifidns1);

			WiFi.config(ip, gw, mask, dns1, dns2);

		} else {
			WiFi.config(0U, 0U, 0U, 0U, 0U);
		}
		connectWifi(config.ssid.c_str(), config.pwd.c_str());
	} else {
		WiFi.mode(WIFI_AP);
		IPAddress apip = IPAddress((uint32_t) 0);
		IPAddress apmask = IPAddress((uint32_t) 0);
		if ((apip.fromString(config.apip))
				&& (apmask.fromString(config.apmask))) {
			WiFi.softAPConfig(apip, apip, apmask);
		}
		WiFi.hostname(config.hostname.c_str());
		WiFi.softAP(config.hostname.c_str(),
				config.appwd.length() == 0 ? NULL : config.appwd.c_str(),
				config.apchannel);
		//_wifi_is_connected = WIFI_AP_STARTED;
		delay(500);
		DEBUG_MSG("Start DNS server, IP: %s, PORRT %d \n",
				WiFi.softAPIP().toString().c_str(), DNS_PORT);
		if (isDNSStarted)
			dnsServer.stop();
		isDNSStarted = dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
	}
}

void wifiFailover() {
	DEBUG_MSG("%s\n", "STA FAIL ...");
	normalizeConfig();

	WiFi.mode(WIFI_AP);
	IPAddress apip = IPAddress((uint32_t) 0);
	IPAddress apmask = IPAddress((uint32_t) 0);

	apip.fromString(AP_IP);
	apmask.fromString(AP_MASK);

	WiFi.softAPConfig(apip, apip, apmask);
	WiFi.hostname(config.hostname.c_str());
	WiFi.softAP(config.hostname.c_str());

	DEBUG_MSG("Not connected %s, start AP: %s\n", config.ssid.c_str(),
			config.hostname.c_str());
	//_wifi_is_connected = WIFI_AP_STARTED;
	delay(500);
	//start DNS server
	DEBUG_MSG("Start DNS server, IP: %s, PORRT %d \n",
			WiFi.softAPIP().toString().c_str(), DNS_PORT);
	if (isDNSStarted)
		dnsServer.stop();
	isDNSStarted = dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
}

void normalizeConfig() {
	if (config.hostname.length() == 0)
		config.hostname = HOSTNAME;

	if (config.ssid.length() == 0) {
		config.ssid = HOSTNAME;
		config.wifimode = WIFI_AP;
		config.useNtp = false;
	}

	if (config.wifimode == 0)
		config.wifimode = WIFI_AP;
	if (config.apip.length() == 0)
		config.apip = AP_IP;
	if (config.apmask.length() == 0)
		config.apmask = AP_MASK;
	if (config.ntpServer.length() == 0)
		config.ntpServer = TIMESERVER;
	if (config.wifiip.length() == 0)
		config.wifidhcp = false;

	config.apchannel = constrain(config.apchannel, 1, 11);

	if (config.useDST == NULL)
		config.useDST = true;
	if (config.tzRule.tzName.length() == 0) {
		config.tzRule.tzName = "SEC";
		config.tzRule.dstStart.month = Mar;
		config.tzRule.dstStart.week = Second;
		config.tzRule.dstStart.day = Sun;
		config.tzRule.dstStart.hour = 2;
		config.tzRule.dstStart.offset = 120;
		config.tzRule.dstEnd.month = Oct;
		config.tzRule.dstEnd.week = Last;
		config.tzRule.dstEnd.day = Sun;
		config.tzRule.dstEnd.hour = 3;
		config.tzRule.dstEnd.offset = 60;
	}

	config.dtFormat = constrain(config.dtFormat, 0, 4);
	config.tmFormat = constrain(config.tmFormat, 0, 7);

	config.lcdTimeout = constrain(config.lcdTimeout, 5, 127);
	config.menuTimeout = constrain(config.menuTimeout, 5, 127);
	config.lang = constrain(config.lang, 0, 3);
}

bool loadConfig(Config *conf) {
	File configFile = SPIFFS.open("/config.json", "r");
	if (!configFile) {
		return false;
	}
	size_t size = configFile.size();

	char * pf = new char[size];
	std::unique_ptr<char[]> buf(pf);
	configFile.readBytes(buf.get(), size);

	DynamicJsonBuffer jsonBuffer;
	JsonObject& json = jsonBuffer.parseObject(buf.get());

	if (!json.success()) {
		DEBUG_MSG("%s\n", "Failed to parse config file");
		//free(pf);
		return false;
	}

	if (json.containsKey("ssid"))
		conf->ssid = String((const char *) json["ssid"]);
	if (json.containsKey("pwd"))
		conf->pwd = String((const char *) json["pwd"]);
	if (json.containsKey("hostname"))
		conf->hostname = String((const char *) json["hostname"]);
	if (json.containsKey("wifimode"))
		conf->wifimode = json["wifimode"];
	if (json.containsKey("ntpServer"))
		conf->ntpServer = String((const char*) json["ntpServer"]);
	if (json.containsKey("localPort"))
		conf->localPort = json["localPort"];
	String useNtp =
			(json.containsKey("useNtp")) ?
					String((const char*) json["useNtp"]) : "false";
	conf->useNtp = (useNtp.equals("true")) ? 1 : 0;
	if (json.containsKey("profileFileName"))
		conf->profileFileName = String((const char*) json["profileFileName"]);
	String wifidhcp =
			(json.containsKey("wifidhcp")) ?
					String((const char*) json["wifidhcp"]) : "true";
	conf->wifidhcp = (wifidhcp.equals("true")) ? 1 : 0;
	if (json.containsKey("wifiip"))
		conf->wifiip = String((const char*) json["wifiip"]);
	if (json.containsKey("wifimask"))
		conf->wifimask = String((const char*) json["wifimask"]);
	if (json.containsKey("wifigw"))
		conf->wifigw = String((const char*) json["wifigw"]);
	if (json.containsKey("wifidns1"))
		conf->wifidns1 = String((const char*) json["wifidns1"]);
	if (json.containsKey("wifidns2"))
		conf->wifidns2 = String((const char*) json["wifidns2"]);
	if (json.containsKey("appwd"))
		conf->appwd = String((const char*) json["appwd"]);
	if (json.containsKey("apchannel"))
		conf->apchannel = json["apchannel"];
	if (json.containsKey("apip"))
		conf->apip = String((const char*) json["apip"]);
	if (json.containsKey("apmask"))
		conf->apmask = String((const char*) json["apmask"]);
	if (json.containsKey("apgw"))
		conf->apgw = String((const char*) json["apgw"]);
	String useDST =
			(json.containsKey("useDST")) ?
					String((const char*) json["useDST"]) : "false";
	conf->useDST = (useDST.equals("true")) ? 1 : 0;
	conf->tzRule = TzRule();
	if (json.containsKey("tzRule.tzName"))
		conf->tzRule.tzName = String((const char*) json["tzRule.tzName"]);
	if (json.containsKey("tzRule.dstStart.day"))
		conf->tzRule.dstStart.day = json["tzRule.dstStart.day"];
	if (json.containsKey("tzRule.dstStart.hour"))
		conf->tzRule.dstStart.hour = json["tzRule.dstStart.hour"];
	if (json.containsKey("tzRule.dstStart.month"))
		conf->tzRule.dstStart.month = json["tzRule.dstStart.month"];
	if (json.containsKey("tzRule.dstStart.offset"))
		conf->tzRule.dstStart.offset = json["tzRule.dstStart.offset"];
	if (json.containsKey("tzRule.dstStart.weeek"))
		conf->tzRule.dstStart.week = json["tzRule.dstStart.weeek"];
	if (json.containsKey("tzRule.dstEnd.day"))
		conf->tzRule.dstEnd.day = json["tzRule.dstEnd.day"];
	if (json.containsKey("tzRule.dstEnd.hour"))
		conf->tzRule.dstEnd.hour = json["tzRule.dstEnd.hour"];
	if (json.containsKey("tzRule.dstEnd.month"))
		conf->tzRule.dstEnd.month = json["tzRule.dstEnd.month"];
	if (json.containsKey("tzRule.dstEnd.offset"))
		conf->tzRule.dstEnd.offset = json["tzRule.dstEnd.offset"];
	if (json.containsKey("tzRule.dstEnd.week"))
		conf->tzRule.dstEnd.week = json["tzRule.dstEnd.week"];

	if (json.containsKey("tmFormat"))
		conf->tmFormat = json["tmFormat"];
	if (json.containsKey("dtFormat"))
		conf->dtFormat = json["dtFormat"];

	if (json.containsKey("lcdTimeout"))
		conf->lcdTimeout = json["lcdTimeout"];
	if (json.containsKey("menuTimeout"))
		conf->menuTimeout = json["menuTimeout"];

	if (json.containsKey("lang"))
		conf->lang = json["lang"];

	String useManual =
			(json.containsKey("led.manual")) ?
					String((const char*) json["led.manual"]) : "false";
	conf->manual = (useManual.equals("true")) ? 1 : 0;

	if (json.containsKey("manualValues")) {
		for (int i = 0; i < MAX_MODULES; i++) {
			conf->manualValues[i][0] = json["manualValues"][i][0];
			conf->manualValues[i][1] = json["manualValues"][i][1];
			conf->manualValues[i][2] = json["manualValues"][i][2];
			conf->manualValues[i][3] = json["manualValues"][i][3];
			conf->manualValues[i][4] = json["manualValues"][i][4];
			conf->manualValues[i][5] = json["manualValues"][i][5];
			conf->manualValues[i][6] = json["manualValues"][i][6];
		}
	}

	/* Normalize config file */
	normalizeConfig();
	return true;

}

bool saveSamplingStruct(String filename) {
	String fn = "/" + filename;
	File f = SPIFFS.open(fn.c_str(), "w");
	if (!f) {
		DEBUG_MSG("Failed to open file %s for writing\n", fn.c_str());
		return false;
	}
	if (f.write((const uint8_t *) &samplings, sizeof(samplings))) {
		f.close();
		return true;
	} else {
		f.close();
		return false;
	}

	return false;
}

bool loadSamplingStruct(String filename, Samplings *s) {
	String fn = "/" + filename;
	File f = SPIFFS.open(fn.c_str(), "r");
	if (f) {
		if (f.read((uint8_t *) s, sizeof(samplings)) != -1) {
			f.close();
			return true;
		} else {
			f.close();
			return false;
		}
	}

	return false;
}

bool saveConfig() {
	struct Config confsaved;

	if (loadConfig(&confsaved)) {
		if (memcmp(&config, &confsaved, sizeof(config)) == 0)
			return false;
	}

	//StaticJsonBuffer<600> jsonBuffer;
	DynamicJsonBuffer jsonBuffer;
	JsonObject& json = jsonBuffer.createObject();

	json["ssid"] = config.ssid.c_str();
	json["pwd"] = config.pwd.c_str();
	json["hostname"] = config.hostname.c_str();
	json["wifimode"] = config.wifimode;
	json["ntpServer"] = config.ntpServer.c_str();
	json["localPort"] = config.localPort;
	json["useNtp"] = (config.useNtp) ? "true" : "false";
	json["profileFileName"] = config.profileFileName.c_str();
	json["wifidhcp"] = (config.wifidhcp) ? "true" : "false";
	json["wifiip"] = config.wifiip.c_str();
	json["wifimask"] = config.wifimask.c_str();
	json["wifigw"] = config.wifigw.c_str();
	json["wifidns1"] = config.wifidns1.c_str();
	json["wifidns2"] = config.wifidns2.c_str();
	json["appwd"] = config.appwd.c_str();
	json["apchannel"] = config.apchannel;
	json["apip"] = config.apip.c_str();
	json["apmask"] = config.apmask.c_str();
	json["apgw"] = config.apgw.c_str();
	json["useDST"] = (config.useDST) ? "true" : "false";
	json["tzRule.tzName"] = config.tzRule.tzName.c_str();
	json["tzRule.dstStart.day"] = config.tzRule.dstStart.day;
	json["tzRule.dstStart.hour"] = config.tzRule.dstStart.hour;
	json["tzRule.dstStart.month"] = config.tzRule.dstStart.month;
	json["tzRule.dstStart.offset"] = config.tzRule.dstStart.offset;
	json["tzRule.dstStart.week"] = config.tzRule.dstStart.week;
	json["tzRule.dstEnd.day"] = config.tzRule.dstEnd.day;
	json["tzRule.dstEnd.hour"] = config.tzRule.dstEnd.hour;
	json["tzRule.dstEnd.month"] = config.tzRule.dstEnd.month;
	json["tzRule.dstEnd.offset"] = config.tzRule.dstEnd.offset;
	json["tzRule.dstEnd.week"] = config.tzRule.dstEnd.week;

	json["tmFormat"] = config.tmFormat;
	json["dtFormat"] = config.dtFormat;
	json["lcdTimeout"] = config.lcdTimeout;
	json["menuTimeout"] = config.menuTimeout;
	json["led.manual"] = (config.manual) ? "true" : "false";
	json["lang"] = config.lang;

	JsonArray& data = json.createNestedArray("manualValues");
	for (int i = 0; i < MAX_MODULES; i++) {
		JsonArray& ledVal = data.createNestedArray();
		ledVal.add(config.manualValues[i][0]);
		ledVal.add(config.manualValues[i][1]);
		ledVal.add(config.manualValues[i][2]);
		ledVal.add(config.manualValues[i][3]);
		ledVal.add(config.manualValues[i][4]);
		ledVal.add(config.manualValues[i][5]);
		ledVal.add(config.manualValues[i][6]);
	}

	File configFile = SPIFFS.open("/config.json", "w");
	if (!configFile) {
		return false;
	}
	json.printTo(configFile);
	return true;
}

void setup() {
	#ifdef DEBUG
		Serial.begin(9600);
	#endif

/*
	WiFi.persistent(false);
	WiFi.setAutoConnect(false);
	WiFi.setAutoReconnect(false);
*/
	display.init();
    display.flipScreenVertically();
    display.setContrast(255);

	connectedEventHandler = WiFi.onStationModeConnected(
			[](const WiFiEventStationModeConnected& event) {
				saveConfig();
				if ( isDNSStarted ) dnsServer.stop();
			});

	disconnectedEventHandler = WiFi.onStationModeDisconnected(
			[](const WiFiEventStationModeDisconnected& event)			{
				;
			});

	ArduinoOTA.onStart([]() {
		SPIFFS.end();

    	display.clear();
    	display.setFont(ArialMT_Plain_10);
    	display.setTextAlignment(TEXT_ALIGN_CENTER_BOTH);
    	display.drawString(display.getWidth()/2, display.getHeight()/2 - 10, "Aktualizace");
    	display.display();		
	});

	ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    	display.drawProgressBar(4, 32, 120, 8, progress / (total / 100) );
    	display.display();
  	});

	ArduinoOTA.onEnd([]() {
    	display.clear();
    	display.setFont(ArialMT_Plain_10);
    	display.setTextAlignment(TEXT_ALIGN_CENTER_BOTH);
    	display.drawString(display.getWidth()/2, display.getHeight()/2, "Restart");
    	display.display();
  	});  

	ArduinoOTA.begin();

	initSamplingValues();

	if (SPIFFS.begin() ) {
		if (!loadConfig(&config)) {
			normalizeConfig();
			saveConfig();
		}
	}

	if (config.profileFileName.length() > 0) {
		bool lok = loadSamplingStruct(config.profileFileName, &samplings);
	}

	WiFi.hostname(config.hostname.c_str());
	uint8_t res = WL_DISCONNECTED;

	if (config.wifimode == WIFI_STA) {  //&& (config.wifimode != WIFI_OFF) ) {
		wifiConnect();
		if (waitForConnectResult(WAIT_FOR_WIFI) != WL_CONNECTED) {
			wifiFailover();
		}
	} else {
		DEBUG_MSG("Set AP: %s", config.hostname.c_str());
		WiFi.mode(WIFI_AP);
		WiFi.softAP(config.hostname.c_str());
		//_wifi_is_connected = WIFI_AP_STARTED;
	}

	startUpdate = false;

	ntpClient.begin();

	setSyncInterval(NTPSYNCINTERVAL);
	setSyncProvider(getNtpTime);

	// reserve 200 bytes for the inputString:
	inputString.reserve(20);

	webserver_begin();
	//add mDNS service
	if (MDNS.begin(config.hostname.c_str())) {
		MDNS.addService("http", "tcp", 80);
	}

	  // Align text vertical/horizontal center
  	display.setTextAlignment(TEXT_ALIGN_CENTER_BOTH);
  	display.setFont(ArialMT_Plain_10);
	if (config.wifimode == WIFI_STA) {  
  		display.drawString(display.getWidth()/2, display.getHeight()/2, "IP:\n" + WiFi.localIP().toString());
	} else {
		display.drawString(display.getWidth()/2, display.getHeight()/2, WiFi.softAPSSID() + "\n" + WiFi.softAPIP().toString());
	}
  	display.display();
}

void loop() {

	if (isDNSStarted)
		dnsServer.processNextRequest();
	// TODO: 
	//if (updateEnabled) {
	ArduinoOTA.handle();
	//}
	
	//wifi change
	if (shouldReconnect) {
		wifiConnect();
		syncTime = true;
		shouldReconnect = false;
	}

	//reboot after success firmware update
	if (shouldReboot) {
		DEBUG_MSG("%s\n", "Rebooting...");
		delay(100);
		ESP.restart();
	}

	/* TODO: otestovat WiFi connection test
	 * pokud mame nakonfigurovane wifi pripojeni a dojde k restartu AP
	 * pak se musime znova pripojit
	 * pokud se pripojeni nepovede do stanoveneho poctu pokusu,
	 * pak spustit vlastni AP
	 */

	if ((WiFi.status() != WL_CONNECTED) && ((millis() - _wifi_retry_timeout) > WIFI_RETRY_TIMEOUT) && (config.wifimode == WIFI_STA)) {
		//odpojeno a vyprsel timeout na test
		_wifi_retry_timeout = millis();
		_wifi_retry_count++;
		if (_wifi_retry_count > WIFI_RETRY_COUNT) {
			wifiFailover();
			_wifi_retry_count = 0;
		} else {
			//pokusime se pripojit
			wifiConnect();
		}
	}

	/*
	 * TODO: dopracovat periodickou synchronizaci casu
	 */
	if (syncTime) {
		now(true);
		if (timeStatus() == timeSet)
			changed = TIME;
		syncTime = false;
	}

	switch (changed) {
	case LED:
		break;
	case MANUAL:
		//sendLedVal();
		changed = NONE;
		break;
	case TIME:
		//uartSendTime();
		changed = TIME_CONFIG;
		break;
	case WIFI:
		//uartSendNetValues();
		changed = NONE;
		break;
	case VERSIONINFO:
		//uartGetVersionInfo();
		changed = NONE;
		break;
	case TEMPERATUREINFO:
		//uartGetTemperatureInfo();
		changed = NONE;
		break;
	case IP:
		break;
	case LANG:
		break;
	case TIME_CONFIG:
		//uartSendTimeConfig();
		changed = NONE;
		break;
	}

	delay(1);
}
