
/// @mainpage	RlcWebFw
/// @details    WiFi chip firmware
/// @date		01.03.21
/// @version    v0.5

#include <Esp.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
//#include <FS.h>
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
#include <ESP8266AVRISP.h>
#include <FS.h>
#include <JsonListener.h>
#include <JsonStreamingParser.h>
#include "common.h"
#include "RlcWebFw.h"
#include "webserver.h"
#include "sampling.h"
#include "tz.h"
#include "twi_registry.h"

extern "C" {
	#include "user_interface.h"
}

#define _TASK_TIMECRITICAL

#define COREVERSION 0x0108
const uint16_t coreVersion = COREVERSION;

#define BYTELOW(v)   (*(((unsigned char *) (&v))))
#define BYTEHIGH(v)  (*((unsigned char *) (&v)+1))


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
bool incomingLedValues = false;

String inputString = "";
uint8_t inStr = 0;

uint8_t lang = 0;
t_changed changed = NONE;

uint8_t slaveAddr;
uint16_t slaveVersion;

int8_t modulesTemperature;
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
ESP8266AVRISP avrprog(port, 16);

void t1SendToSlave() {
	//DEBUG_MSG("SendToSlave\n");
	modulesTemperature = readTemperature();
	//DEBUG_MSG("Slave temperature: %d\n",modulesTemperature);
	sendValToSlave();
}

void t2SyncTime() {
	DEBUG_MSG("Synctime\n");
}

uint16_t crc16_update(uint16_t crc, uint8_t a) {
  int i;
  crc ^= a;
  for (i = 0; i < 8; ++i) {
    if (crc & 1)
      crc = (crc >> 1) ^ 0xA001;
    else
      crc = (crc >> 1);
  }

  return crc;
}

uint16_t checkCrc(uint8_t *data) {

	uint16_t crc = 0xffff;

	for (uint8_t i = 0; i < 8; i++) {
		crc = crc16_update(crc, data[i]);
	}
	return crc;
}

uint16_t getCrc(char *data) {

	uint16_t crc = 0xffff;

	for (uint8_t i = 0; i < 6; i++) {
		crc = crc16_update(crc, data[i]);
	}
	return crc;
}

//LED
int16_t channelVal[CHANNELS]; //16x7x2

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
	//fix for auto connect racing issue
	WiFi.setAutoReconnect(false);
	if (WiFi.isConnected()) {
		DEBUG_MSG("%s\n", "Already connected. Disconnecting ...");
		WiFi.disconnect();
	}

	if (WiFi.getMode() != WIFI_STA) {
		DEBUG_MSG("%s\n", "Set STA mode");
		WiFi.mode(WIFI_STA);
	}

	if (ssid != "") {
		DEBUG_MSG("Connecting to ::%s:: and ::%s:: \n", ssid.c_str(),
				pass.c_str());
		WiFi.begin(ssid.c_str(), pass.c_str());
	} else {
		if (WiFi.SSID()) {
			DEBUG_MSG("%s\n", "Using last saved values, should be faster");
			//trying to fix connection in progress hanging
			ETS_UART_INTR_DISABLE();
			wifi_station_disconnect();
			ETS_UART_INTR_ENABLE();
		} else {
			DEBUG_MSG("%s\n", "No saved credentials");
		}
	}
}

void wifiConnect() {
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
	DEBUG_MSG("Normalize config\n");
	
	if (config.profileFileName.length() == 0)
		config.profileFileName = "profile.pjs";
	
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
	config.lang = constrain(config.lang, 0, 3);
	if (config.startUpdate == NULL) config.startUpdate = false;
}

bool loadConfig(Config *conf) {
	if (SPIFFS.exists(CFGNAME)) {
		File configFile = SPIFFS.open(CFGNAME, "r");
		if (!configFile) {
			DEBUG_MSG("Config not exist\n");
			return false;
		}
		/*
		size_t size = configFile.size();

		char * pf = new char[size];
		std::unique_ptr<char[]> buf(pf);
		configFile.readBytes(buf.get(), size);
		configFile.close();
		*/
		DynamicJsonDocument json(2048);
		DeserializationError error = deserializeJson(json, configFile);

		if (error) {
			DEBUG_MSG("Failed to parse config file: %s, %s",CFGNAME,error.c_str());
  			return false;
		}
		if (json.containsKey("version"))
			conf->version = json["version"];
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

		if (json.containsKey("lang"))
			conf->lang = json["lang"];

		if (json.containsKey("startUpdate"))
			conf->startUpdate = json["startUpdate"];

		String useManual =
				(json.containsKey("led.manual")) ?
						String((const char*) json["led.manual"]) : "false";
		conf->manual = (useManual.equals("true")) ? 1 : 0;

		if (json.containsKey("manualValues")) {
			for (int i = 0; i < MAX_MODULES; i++) {
				conf->manualValues[0] = json["manualValues"][0];
				conf->manualValues[1] = json["manualValues"][1];
				conf->manualValues[2] = json["manualValues"][2];
				conf->manualValues[3] = json["manualValues"][3];
				conf->manualValues[4] = json["manualValues"][4];
				conf->manualValues[5] = json["manualValues"][5];
				conf->manualValues[6] = json["manualValues"][6];
			}
		}

		/* Normalize config file */
		normalizeConfig();
		return true;
		configFile.close();
	} 
	return false;
}


bool saveSamplingStruct(String filename) {
	
	File f = SPIFFS.open(("/"+filename).c_str(), "w");
	if (!f) {
		DEBUG_MSG("Failed to open file %s for writing\n", filename.c_str());
		return false;
	}
	if (f.write((const uint8_t *) &samplings, sizeof(samplings))) {
		f.close();
		DEBUG_MSG("File %s saved\n", filename.c_str());
		return true;
	} else {
		f.close();
		return false;
	}

	return false;
}

bool saveSamplingStructToJson(String filename) {
	
	File f = SPIFFS.open(("/"+filename).c_str(), "w");
	if (!f) {
		DEBUG_MSG("Failed to open file %s for writing\n", filename.c_str());
		return false;
	}
	f.printf("{\"used\":%d,\"data\":[",samplings.usedSamplingCount);
	for (uint16_t i = 0; i< SAMPLING_MAX; i++) {
		f.printf("[%d,%d,%u,%d]",
			samplings.sampling[i].channel,
			samplings.sampling[i].timeSlot,
			samplings.sampling[i].value,
			samplings.sampling[i].efect);
		if (i < (SAMPLING_MAX-1)) f.printf(",");
	}
	f.printf("]}");
	f.flush();
	f.close();

	return true;
}

JsonStreamingParser parser;
SamplingJsonListener listener;
String currentKey;
String currentValue;
bool isArr = false;
uint8_t arrIdx = 0;
uint8_t samplingIdx = 0;

void SamplingJsonListener::whitespace(char c) {}
void SamplingJsonListener::startDocument() {}
void SamplingJsonListener::endObject() {}
void SamplingJsonListener::endDocument() {}
void SamplingJsonListener::startObject() {}
void SamplingJsonListener::key(String key) {currentKey = key;}
void SamplingJsonListener::endArray() {isArr = false;arrIdx = 0; }
void SamplingJsonListener::startArray() { isArr = true; }
void SamplingJsonListener::value(String value) {
  currentValue = value;
  if (currentKey == "used") {  	  
	  samplings.usedSamplingCount = value.toInt();
	  currentKey = "";
  }
  if (currentKey == "data") {  
	if (isArr  && (samplingIdx < SAMPLING_MAX)) {
		switch (arrIdx) {
			case 0:
				samplings.sampling[samplingIdx].channel=value.toInt();
				break;
			case 1:
				samplings.sampling[samplingIdx].timeSlot=value.toInt();
				break;
			case 2:
				samplings.sampling[samplingIdx].value=value.toDouble();
				break;
			case 3:
				samplings.sampling[samplingIdx].efect=value.toInt();
				samplingIdx++;
				break;
		}
		arrIdx++;
	}
  }
}

bool loadSamplingStructFromJson(String filename, Samplings *s) {
	if (!SPIFFS.exists(("/"+filename).c_str())) {
		return false;
	}
	File f = SPIFFS.open(("/"+filename).c_str(), "r");
	if (f) {
		initSamplingValues();
		while(f.available()) {
			char json = f.read();
			parser.parse(json);
		}
	}
	f.close();
	return true;
}

bool loadSamplingStruct(String filename, Samplings *s) {
	if (!SPIFFS.exists(("/"+filename).c_str())) {
		return false;
	}
	File f = SPIFFS.open(("/"+filename).c_str(), "r");
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
	DEBUG_MSG("Save config\n");
	if ((loadConfig(&confsaved)) && (memcmp(&config, &confsaved, sizeof(config)) == 0)) {
		DEBUG_MSG("Config test\n");
		DEBUG_MSG("Config no changes, not saving");
		return false;
	}
	DEBUG_MSG("Create json\n");
	DynamicJsonDocument doc(2048);
	doc["version"] = coreVersion;
	doc["ssid"] = config.ssid.c_str();
	doc["pwd"] = config.pwd.c_str();
	doc["hostname"] = config.hostname.c_str();
	doc["wifimode"] = config.wifimode;
	doc["ntpServer"] = config.ntpServer.c_str();
	doc["localPort"] = config.localPort;
	doc["useNtp"] = (config.useNtp) ? "true" : "false";
	doc["profileFileName"] = config.profileFileName.c_str();
	doc["wifidhcp"] = (config.wifidhcp) ? "true" : "false";
	doc["wifiip"] = config.wifiip.c_str();
	doc["wifimask"] = config.wifimask.c_str();
	doc["wifigw"] = config.wifigw.c_str();
	doc["wifidns1"] = config.wifidns1.c_str();
	doc["wifidns2"] = config.wifidns2.c_str();
	doc["appwd"] = config.appwd.c_str();
	doc["apchannel"] = config.apchannel;
	doc["apip"] = config.apip.c_str();
	doc["apmask"] = config.apmask.c_str();
	doc["apgw"] = config.apgw.c_str();
	doc["useDST"] = (config.useDST) ? "true" : "false";
	doc["tzRule.tzName"] = config.tzRule.tzName.c_str();
	doc["tzRule.dstStart.day"] = config.tzRule.dstStart.day;
	doc["tzRule.dstStart.hour"] = config.tzRule.dstStart.hour;
	doc["tzRule.dstStart.month"] = config.tzRule.dstStart.month;
	doc["tzRule.dstStart.offset"] = config.tzRule.dstStart.offset;
	doc["tzRule.dstStart.week"] = config.tzRule.dstStart.week;
	doc["tzRule.dstEnd.day"] = config.tzRule.dstEnd.day;
	doc["tzRule.dstEnd.hour"] = config.tzRule.dstEnd.hour;
	doc["tzRule.dstEnd.month"] = config.tzRule.dstEnd.month;
	doc["tzRule.dstEnd.offset"] = config.tzRule.dstEnd.offset;
	doc["tzRule.dstEnd.week"] = config.tzRule.dstEnd.week;

	doc["tmFormat"] = config.tmFormat;
	doc["dtFormat"] = config.dtFormat;
	doc["led.manual"] = (config.manual) ? "true" : "false";
	doc["lang"] = config.lang;
	doc["startUpdate"] = config.startUpdate;

	JsonArray data = doc.createNestedArray("manualValues");
	data.add(config.manualValues[0]);
	data.add(config.manualValues[1]);
	data.add(config.manualValues[2]);
	data.add(config.manualValues[3]);
	data.add(config.manualValues[4]);
	data.add(config.manualValues[5]);
	data.add(config.manualValues[6]);
	
    DEBUG_MSG("JSON OK\n");
	File configFile = SPIFFS.open(CFGNAME, "w");
	if (!configFile) {
		DEBUG_MSG("Config save failed \n");	
		return false;
	}
	serializeJson(doc, configFile);
	configFile.close();
	DEBUG_MSG("Config saved: %s \n",CFGNAME);
	return true;
}


static uint8_t searchSlave() {
	uint8_t error, address, idx = 0;
	Wire.begin(13,14);
	Wire.setClock(100000);
	slaveAddr = 0;
	for (address = 1; address < 127; address++) {
		Wire.beginTransmission(address);
		//Wire.write(reg_MASTER);
		//Wire.write(0xff); //value 0xFF = controller presence
    	error = Wire.endTransmission();
		if (error == 0) {
			slaveAddr = address;
			DEBUG_MSG("Slave: %03xh\n", slaveAddr);
			idx++;
		} 
	}
	return idx;
}

void sendValToSlave() {
	uint8_t error = 0;
	int ledValue[CHANNELS] = {0};
	//TODO: remap led position from web page to hardware
	#define c_white  0
	#define c_uv     1
	#define c_rb     2
	#define c_blue   3
	#define c_green  4
	#define c_red    5
	#define c_amber  6
	//a takto jsou zapojeny
	//TODO: revize
	uint8_t led_colors[CHANNELS] = {c_blue,c_amber,c_white,c_red,c_green,c_rb,c_uv};

	uint16_t crc = 0xffff;

	//posleme info , ze ridime
	Wire.beginTransmission(slaveAddr);
	Wire.write(reg_MASTER); //register address
	Wire.write(0xff);
	Wire.endTransmission();

	//spocitame crc
	for (uint8_t x = 0; x < CHANNELS; x++) {
		if (config.manual) { 
			ledValue[x] = config.manualValues[x];
		} else {
			ledValue[x] = getSamplingValue(led_colors[x]);
		}
		uint16_t c_val = ledValue[x];
		uint8_t lb = LOW_BYTE(c_val);
		uint8_t hb = HIGH_BYTE(c_val);
		crc = crc16_update(crc, lb);
		crc = crc16_update(crc, hb);
	}

	//posleme data vcetne crc
	Wire.beginTransmission(slaveAddr);
	Wire.write(reg_LED_START); //register address

	for (uint8_t x = 0; x < CHANNELS; x++) {
		uint16_t c_val = ledValue[x];
		uint8_t lb = LOW_BYTE(c_val);
		uint8_t hb = HIGH_BYTE(c_val);

		Wire.write(lb);
		Wire.write(hb);
	}

	//crc
	Wire.write(LOW_BYTE(crc));
	Wire.write(HIGH_BYTE(crc));

	//status reg_DATA_OK
	Wire.write(error);
	Wire.endTransmission();
	//DEBUG_MSG("Data to slave send\n");
}

int8_t readTemperature() {
	uint8_t ret = 0;
	uint8_t temp = 0xff;
	uint8_t temp_status = 0xee;

	Wire.beginTransmission(slaveAddr);
	Wire.write(reg_THERM_STATUS);
	Wire.endTransmission();

	uint8_t cnt = Wire.requestFrom(slaveAddr, 2);
	if (cnt > 1) {
		temp_status = Wire.read();
		temp = Wire.read();
	}

	if (temp_status) {
		ret = temp < 128 ? temp : temp - 256;;
	} else {
		ret = ERR_TEMP_READ;
	}

	return ret;
}

uint16_t readSlaveVersion() {
	uint16_t ret = 0;

	Wire.beginTransmission(slaveAddr);
	Wire.write(reg_VERSION_MAIN);
	Wire.endTransmission();

	uint8_t cnt = Wire.requestFrom(slaveAddr, 2);
	if (cnt > 1) {
		BYTELOW(ret) = Wire.read();
		BYTEHIGH(ret) = Wire.read();
	}
	return ret;
}

void setSlaveDemo( uint8_t start) {
	Wire.beginTransmission(slaveAddr);
	Wire.write(reg_MASTER);
	if (start) Wire.write(0xde); else Wire.write(0xff);
	Wire.endTransmission();
}


void updateAvr() {
	static AVRISPState_t last_state = AVRISP_STATE_IDLE;
	AVRISPState_t new_state = avrprog.update();
	if (last_state != new_state) {
		switch (new_state) {
			case AVRISP_STATE_IDLE: {
				DEBUG_MSG("[AVRISP] now idle\r\n");
				// Use the SPI bus for other purposes
				break;
			}

			case AVRISP_STATE_PENDING: {
				DEBUG_MSG("[AVRISP] connection pending\r\n");
				// Clean up your other purposes and prepare for programming mode
				break;
			}

			case AVRISP_STATE_ACTIVE: {
				DEBUG_MSG("[AVRISP] programming mode\r\n");
				// Stand by for completion
				delay(2000);
				//ESP.reset();
				break;
			}
		}
		last_state = new_state;
	}
	// Serve the client
	if (last_state != AVRISP_STATE_IDLE) {
		avrprog.serve();
	}
}

void blinkLed(uint8_t color=5, uint8_t count=3, uint16_t tm=1000) {
	if (searchSlave() > 0 ) {
		config.manual = true;
		config.manualValues[0] = 0;
		config.manualValues[1] = 0;
		config.manualValues[2] = 0;
		config.manualValues[3] = 0;
		config.manualValues[4] = 0;
		config.manualValues[6] = 0;
		for (uint8_t x=0; x<count; x++) {
			config.manualValues[color] = 200;
			sendValToSlave();
			delay(tm);
			config.manualValues[color] = 0;
			sendValToSlave();
			delay(tm);
		}
	}
}

void setup() {
  #ifdef DEBUG
	DEBUGSER.begin(DEBUGBAUD);
	DEBUG_MSG("\n");
  #endif

  //reset avr, set pin to high
  digitalWrite(RESET_AVR,LOW);
  delay(20);
  digitalWrite(RESET_AVR,HIGH);

  parser.setListener(&listener);
/*
	WiFi.persistent(false);
	WiFi.setAutoConnect(false);
	WiFi.setAutoReconnect(false);
*/

/*
	connectedEventHandler = WiFi.onStationModeConnected(
			[](const WiFiEventStationModeConnected& event) {
				saveConfig();
				if ( isDNSStarted ) dnsServer.stop();
			});

	disconnectedEventHandler = WiFi.onStationModeDisconnected(
			[](const WiFiEventStationModeDisconnected& event)			{
				;
			});
*/

	ArduinoOTA.onStart([]() {
		//blinkLed(LEDRED,3,1000);
		SPIFFS.end();
	});

	ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
		//TODO: add green led blink
		;
  	});

  	ArduinoOTA.onEnd([]() {
		//TODO: add green led blink
		//blinkLed(LEDGREEN,3,1000);
  	});

	initSamplingValues();

	DEBUG_MSG("Init config\n");
	
	if (SPIFFS.begin() ) {
		if (loadConfig(&config)) {
			if (config.version != coreVersion) {
				config.version = coreVersion;
				//UPDATE ....
				normalizeConfig();
				DEBUG_MSG("Update config\n");
				saveSamplingStructToJson("profile.pjs");
				saveConfig();
			}			
		} else {
			DEBUG_MSG("Init config\n");
			normalizeConfig();
			saveConfig();
			saveSamplingStructToJson("profile.pjs");
		}
	} else {
		DEBUG_MSG("ERROR\n");
		while (1) {;} 
	}
#ifdef DEBUG
	for (int16_t i=0;i<SAMPLING_MAX;i++) {
		DEBUG_MSG("CH: %d T: %d, V:%u, E:%d\n",
		samplings.sampling[i].channel,
		samplings.sampling[i].timeSlot,
		samplings.sampling[i].value,
		samplings.sampling[i].efect);
	}
#endif

	//if startUpdate, start SPI and update, otherwise start I2C
	if (config.startUpdate) {
		DEBUG_MSG("Start update avr\n");
		DEBUG_MSG("Set AP: %s\n", config.hostname.c_str());
		WiFi.mode(WIFI_AP);
		WiFi.hostname(config.hostname.c_str());
		WiFi.softAP(config.hostname.c_str());

		MDNS.begin(config.hostname.c_str());
    	MDNS.addService("avrisp", "tcp", port);
		//TODO:  blink yellow led
		blinkLed(LEDAMBER,3,1000);
		avrprog.begin();
		startUpdate = true;
		config.startUpdate = false;
		saveConfig();
		
	} else {

		if (config.profileFileName.length() > 0) {
			bool lok = loadSamplingStructFromJson(config.profileFileName, &samplings);
			DEBUG_MSG("Sampling config load: %s %s\n",config.profileFileName.c_str(),lok==1?"OK":"Fail");
		}

		WiFi.hostname(config.hostname.c_str());
		uint8_t res = WL_DISCONNECTED;

		if (config.wifimode == WIFI_STA) {  //&& (config.wifimode != WIFI_OFF) ) {
			wifiConnect();
			if (waitForConnectResult(WAIT_FOR_WIFI) != WL_CONNECTED) {
				wifiFailover();
			}
		} else {
			DEBUG_MSG("Set AP: %s\n", config.hostname.c_str());
			WiFi.mode(WIFI_AP);
			WiFi.softAP(config.hostname.c_str());
			//_wifi_is_connected = WIFI_AP_STARTED;
		}
		startUpdate = false;
		ntpClient.begin();
		setSyncInterval(NTPSYNCINTERVAL);
		setSyncProvider(getNtpTime);

		webserver_begin();
		//add mDNS service
		if (MDNS.begin(config.hostname.c_str())) {
			MDNS.addService("http", "tcp", 80);
		}

		delay(5000);
		DEBUG_MSG("Searching slave\n");
		if (searchSlave() > 0) {
			versionInfo.slaveModule = readSlaveVersion();
			DEBUG_MSG("Success,  ver.:0x%04X\n", versionInfo.slaveModule);
		} else {
			DEBUG_MSG("fail, no slave found\n");
		}
		ArduinoOTA.begin();					
	}	
	
}

uint32_t t1_mm;

void loop() {
	uint32_t mm = millis();

	if (startUpdate) {
		updateAvr();
	} else {
		if (isDNSStarted)
			dnsServer.processNextRequest();

		ArduinoOTA.handle();

		//wifi change
		if (shouldReconnect) {
			wifiConnect();
			syncTime = true;
			shouldReconnect = false;
		}

		//reboot. manual or after fw update
		if (shouldReboot) {
			DEBUG_MSG("%s\n", "Rebooting...");
			delay(100);
			ESP.restart();
		}

		/* TODO: 
			Periodicka kontrola wifi pripojeni ???
			- nebo to nechame na ESP
			- ale, pokud nam padne wifi, chceme dal ridit svetla, takze by bylo dobre pustit AP
		*/
	/*
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
	*/

		/*
		*/
		/*
		if (syncTime) {
			now(true);
			if (timeStatus() == timeSet)
				changed = TIME;
			syncTime = false;
		}
		*/
		switch (changed) {
			case LED:
				saveConfig();
				changed = NONE;
				break;
			case MANUAL:
				saveConfig();
				changed = NONE;
				break;
			case TIME:
				changed = NONE;
				break;
			case WIFI:
				changed = NONE;
				break;
			case VERSIONINFO:
				//getVersionInfo();
				changed = NONE;
				break;
			case TEMPERATUREINFO:
				//getTemperatureInfo();
				changed = NONE;
				break;
			case IP:
				break;
			case LANG:
				break;
			case TIME_CONFIG:
				break;
			default:
				break;
		}

		if (mm - t1_mm > TASK1) {
			t1_mm = mm;
			t1SendToSlave();
		}
	}
}
