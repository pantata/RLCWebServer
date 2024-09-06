
/// @mainpage	RlcWebFw
/// @details    WiFi chip firmware
/// @date		01.03.21

/*
*  TODO: ESP NOW pro spolupraci mezi svetly
*  TODO: prepracovani pro ESP32-C3 ( pozor pouze 6 kanalu - 1 kanal softwarove??, nebo sloucit dva kanaly)
*/

#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <LittleFS.h>
#include <time.h>
#include <ESPAsyncWebServer.h>
#include <NTPClient.h>
#include <MyTimeLib.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <Wire.h>
#include <HTTPClient.h>
#include <JsonListener.h>
#include <JsonStreamingParser.h>
#include <jled.h>

#include "common.h"
#include "RlcWebFw.h"
#include "webserver.h"
#include "sampling.h"
#include "tz.h"
#include "version.h"
// #include "HttpsOTAUpdate.h"  // TODO: opravit
#include "updater.h"
#include "ConfigJsonListener.h"

#include "driver/ledc.h"
#include "esp_err.h"

//extern "C" {
//	#include "user_interface.h"
//}

const uint16_t coreVersion = BUILD_NUMBER;
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

bool isUpdateAvailable = false;

uint8_t lang = 0;
t_changed changed = NONE;

uint8_t slaves = 0;
uint8_t slaveAddr[4] = {0};
int8_t moduleTemperature[4] = {0};

bool syncTime = false;

const int dstOffset[] = { -720, -660, -600, -540, -480, -420, -360, -300, -240, -210,
		-180, -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360,
		390, 420, 480, 540, 570, 600, 660, 720, 780 };

const char* str_wifistatus[] = { "WL_IDLE_STATUS", "WL_NO_SSID_AVAIL",
		"WL_SCAN_COMPLETED", "WL_CONNECTED", "WL_CONNECT_FAILED",
		"WL_CONNECTION_LOST", "WL_DISCONNECTED" };

const char* str_wifimode[] = { "OFF", "STA", "AP", "AP_STA" };

const char* str_wifiauth[] = { 
	"AUTH_OPEN", "AUTH_WEP", "AUTH_WPA_PSK",
		"AUTH_WPA2_PSK", "AUTH_WPA_WPA2_PSK", "AUTH_MAX" };

const char* str_timestatus[] = { "timeNotSet", "timeNeedsSync", "timeSet" };

const char* str_lang[] = { "en", "cs", "pl", "de" };

union Unixtime unixtime;

//uint8_t peers[PEERS][6] = {0};
uint8_t peersCount = 0;
bool findingPeers = false;

//led channels
/*
1 - RB + UV
2 - 
3 -
4 - blue
5 - deep red
6 - cyan
*/
const int ledChannel[] = {0,1,2,3,4,5};
const int ledPins[]  =   {3,1,2,6,5,4};

ledc_channel_t ledc_channel[] = {LEDC_CHANNEL_0,LEDC_CHANNEL_1,LEDC_CHANNEL_2,LEDC_CHANNEL_3,LEDC_CHANNEL_4,LEDC_CHANNEL_5};
const int ledFreq = 1000;
const int ledResolution = 12;

#if DEBUG  == 0
auto led = JLed(STATUSLED);
#endif


uint32_t getChipID() {
    uint32_t chipId = 0;

    for(int i=0; i<17; i=i+8) {
        chipId |= ((ESP.getEfuseMac() >> (40 - i)) & 0xff) << i;
        }
    return chipId;
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

/*-------- NTP code ----------*/
time_t getNtpTime() {
	time_t l = 0;
	if (ntpClient.forceUpdate()) {
		l = ntpClient.getEpochTime();
	}
	DEBUG_MSG("Epoch: %lu\n", l);
	if (l) {
		//rtc.adjust(DateTime(l));
	}
	return l;
}

wl_status_t waitForConnectResult(unsigned long _connectTimeout) {
	DEBUG_MSG("%s\n", "Waiting for connection result with time out");
	unsigned long start = millis();
	boolean keepConnecting = true;
	wl_status_t status;
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

bool connectWifi(String ssid, String pass) {
	bool ret = false;
	//fix for auto connect racing issue
	WiFi.setAutoReconnect(false);
	if (WiFi.isConnected()) {
		DEBUG_MSG("%s\n", "Already connected. Disconnecting ...");
		WiFi.disconnect();
	}

	if (WiFi.getMode() != WIFI_AP_STA) {
		DEBUG_MSG("%s\n", "Set STA mode");
		WiFi.mode(WIFI_AP_STA);
	}

	if (ssid != "") {
		DEBUG_MSG("Connecting to ::%s:: and ::%s:: \n", ssid.c_str(),
				pass.c_str());
		WiFi.begin(ssid.c_str(), pass.c_str());
	} else {
		if (WiFi.SSID()) {
			DEBUG_MSG("%s\n", "Using last saved values, should be faster");
			// TODO: revize pro esp32
			//trying to fix connection in progress hanging
			//ETS_UART_INTR_DISABLE();
			//wifi_station_disconnect();
			//ETS_UART_INTR_ENABLE();
		} else {
			DEBUG_MSG("%s\n", "No saved credentials");
		}
	}
	if (waitForConnectResult(WAIT_FOR_WIFI) == WL_CONNECTED)  {
		DEBUG_MSG("Connected successfully\n");
		return true;
	} else {
		switch(WiFi.status()) {
          case WL_NO_SSID_AVAIL:
            DEBUG_MSG("[WiFi] SSID not found");
            break;
          case WL_CONNECT_FAILED:
            DEBUG_MSG("[WiFi] Failed - WiFi not connected! Reason: ");
            break;
          case WL_CONNECTION_LOST:
            DEBUG_MSG("[WiFi] Connection was lost");
            break;
          case WL_SCAN_COMPLETED:
            DEBUG_MSG("[WiFi] Scan is completed");
            break;
          case WL_DISCONNECTED:
            DEBUG_MSG("[WiFi] WiFi is disconnected");
            break;
          case WL_CONNECTED:
            DEBUG_MSG("[WiFi] WiFi is connected!");
            DEBUG_MSG("[WiFi] IP address: %@",  WiFi.localIP());
            break;
          default:
            DEBUG_MSG("[WiFi] WiFi Status: %d", WiFi.status());
            break;
        }
	}

	return ret;
}

bool wifiConnect() {
	bool ret = false;
	normalizeConfig();
	IPAddress ip = IPAddress((uint32_t) 0);
	IPAddress gw = IPAddress((uint32_t) 0);
	IPAddress mask = IPAddress((uint32_t) 0);
	IPAddress dns1 = IPAddress((uint32_t) 0);
	IPAddress dns2 = IPAddress((uint32_t) 0);	
	if (!config.wifidhcp) {
		gw.fromString(config.wifigw);
		mask.fromString(config.wifimask);
		ip.fromString(config.wifiip);
		dns1.fromString(config.wifidns1);
		dns2.fromString(config.wifidns1);

		WiFi.config(ip, gw, mask, dns1, dns2);
	}
	WiFi.config(ip, gw, mask, dns1, dns2);

	if (config.ssid.length() > 0) {
		ret = connectWifi(config.ssid.c_str(), config.pwd.c_str());		
	}

	IPAddress apip = IPAddress((uint32_t) 0);
	IPAddress apmask = IPAddress((uint32_t) 0);
	if ((apip.fromString(config.apip))
		&& (apmask.fromString(config.apmask))) {
		WiFi.softAPConfig(apip, apip, apmask);
	}
	WiFi.hostname(HOSTNAME);
	WiFi.softAP(HOSTNAME,
	config.appwd.length() == 0 ? NULL : config.appwd.c_str());
	delay(500);
	DEBUG_MSG("Start DNS server, IP: %s, PORT %d \n",
		WiFi.softAPIP().toString().c_str(), DNS_PORT);
	if (isDNSStarted) dnsServer.stop();
	isDNSStarted = dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
	return ret;
}

void normalizeConfig() {
	DEBUG_MSG("Normalize config\n");
	
	if (config.profileFileName.length() == 0)
		config.profileFileName = "profile.pjs";
	
	if (config.hostname.length() == 0)
		config.hostname = HOSTNAME;

	if (config.ssid.length() == 0) {
		config.useNtp = false;
	}

	if (config.apip.length() == 0)
		config.apip = AP_IP;
	if (config.apmask.length() == 0)
		config.apmask = AP_MASK;
	if (config.ntpServer.length() == 0)
		config.ntpServer = TIMESERVER;
	if (config.wifiip.length() == 0)
		config.wifidhcp = false;

	config.apchannel = constrain(config.apchannel, 1, 11);

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
	config.peersCount = constrain(config.peersCount, 0, 16);
}

bool loadConfig(Config *config) {

	if (LittleFS.exists(CFGNAME)) {
		File configFile = LittleFS.open(CFGNAME, "r");
		if (!configFile) {
			DEBUG_MSG("Config not exist\n");
			return false;
		}

		ConfigJsonListener listener(config);
		JsonStreamingParser parser;
		parser.setListener(&listener);

		while (configFile.available()) {
			parser.parse(configFile.read());
		}

  		configFile.close();
		return true;
	}
	return false;
}

bool saveSamplingStructToJson(String filename) {
	
	File f = LittleFS.open(filename.c_str(), "w");
	if (!f) {
		DEBUG_MSG("Failed to open file %s for writing\n", filename.c_str());
		return false;
	}
	f.printf("{\"used\":%d,\"data\":[",samplings.usedSamplingCount);
	for (uint16_t i = 0; i< SAMPLING_MAX; i++) {
		f.printf("[%d,%d,%u,0]",
			samplings.sampling[i].channel,
			samplings.sampling[i].timeSlot,
			samplings.sampling[i].value);
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
bool isArr = false;
uint8_t arrIdx = 0;
uint16_t samplingIdx = 0;

void SamplingJsonListener::whitespace(char c) {}
void SamplingJsonListener::startDocument() { samplingIdx = 0; arrIdx = 0; }
void SamplingJsonListener::endObject() {}
void SamplingJsonListener::endDocument() {
	DEBUG_MSG("\nJSON Loaded: %d\n",samplings.usedSamplingCount);
	PRINT_CONFIG();
}
void SamplingJsonListener::startObject() {}
void SamplingJsonListener::key(String key) {currentKey = key;}
void SamplingJsonListener::endArray() {
#if DEBUG > 1	
	DEBUG_MSG("]\n");
#endif	
	isArr = false;arrIdx = 0; 
}
void SamplingJsonListener::startArray() {
#if DEBUG > 1
	DEBUG_MSG("["); 
#endif	
	isArr = true; 
}
void SamplingJsonListener::value(String value) {
	if (currentKey == "used") {  	  
		DEBUG_MSG("Key: %s:%s",currentKey.c_str(),value.c_str());
		samplings.usedSamplingCount = value.toInt();
		currentKey = "";
	}
	if (isArr) {
		if (samplingIdx < SAMPLING_MAX) {
			int v = value.toInt();
			switch (arrIdx) {			
				case 0:
					samplings.sampling[samplingIdx].channel=v;
					break;
				case 1:
					samplings.sampling[samplingIdx].timeSlot=v;
					break;
				case 2:
					samplings.sampling[samplingIdx].value=v;
					break;
				case 3:
					samplingIdx++;
					break;
			}	
#if DEBUG > 1			
			DEBUG_MSG("%d,",v);	
#endif			
			arrIdx++;
		}
	}
 
}



bool loadSamplingStructFromJson(String filename) {
	DEBUG_MSG("Load sampling: %s\n",filename.c_str());
	if (!LittleFS.exists(filename.c_str())) {
		DEBUG_MSG("Load sampling error\n");
		return false;
	} else {
		DEBUG_MSG("File found");
	}
	File f = LittleFS.open(filename.c_str(), "r");
	if (f) {		
		initSamplingValues();
		parser.setListener(&listener);
		while(f.available()) {
			char json = f.read();
			parser.parse(json);
		}
	}
	f.close();
	return true;
}

bool saveConfig() {
	struct Config confsaved;
	DEBUG_MSG("Save config\n");
	if ((loadConfig(&confsaved)) && (memcmp(&config, &confsaved, sizeof(config)) == 0)) {
		DEBUG_MSG("Config test\n");
		DEBUG_MSG("Config no changes, not saving");
		return false;
	}
	DEBUG_MSG("Create config json\n");
	JsonDocument doc;
	doc["version"] = coreVersion;
	doc["ssid"] = config.ssid.c_str();
	doc["pwd"] = config.pwd.c_str();
	doc["hostname"] = config.hostname.c_str();
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

	//obsolete JsonArray data = doc.createNestedArray("manualValues");
	JsonArray data = doc["manualValues"].to<JsonArray>();
	
	data.add(config.manualValues[0]);
	data.add(config.manualValues[1]);
	data.add(config.manualValues[2]);
	data.add(config.manualValues[3]);
	data.add(config.manualValues[4]);
	data.add(config.manualValues[5]);
	data.add(config.manualValues[6]);
	
	doc["peersCount"] = config.peersCount;
	// Obsolete JsonArray peers = doc.createNestedArray("peers");
	JsonArray peers = doc[peers].to<JsonArray>();
	for (uint8_t i = 0; i < config.peersCount; i++) {
		//JsonArray m = peers.createNestedArray();
		JsonArray m = peers.add<JsonArray>();		
		for (uint8_t ii = 0; ii<6; ii++) {
			m.add(config.peers[i].mac[ii]);
		}
	}

    DEBUG_MSG("JSON OK\n");
	File configFile = LittleFS.open(CFGNAME, "w");
	if (!configFile) {
		DEBUG_MSG("Config save failed \n");	
		return false;
	}
	serializeJson(doc, configFile);
	configFile.close();
	DEBUG_MSG("Config saved: %s \n",CFGNAME);
	return true;
}


int16_t ledValue[CHANNELS] = {0};
int16_t oldLedValue[CHANNELS] = {0};
bool finalPwm = false;

void setPwmVal() {
	// TODO: opravit nacteni manual hodnoty
	// upravit pro fade rezim 
	for (uint8_t x = 0; x < CHANNELS; x++) {
		oldLedValue[x] = ledValue[x];
		if (config.manual) { 
			ledValue[x] = config.manualValues[x];
		} else {
			ledValue[x] = getSamplingValue(x);
		}
		if ( oldLedValue[x] != ledValue[x] ) finalPwm = true;
	}
	//send to peers
	if (finalPwm) {
		if (config.peersCount > 0) {
			DEBUG_MSG("Send to peer\n");
			uint8_t _data[]= {11,
				LOW_BYTE(ledValue[0]),HIGH_BYTE(ledValue[0]),
				LOW_BYTE(ledValue[1]),HIGH_BYTE(ledValue[1]),
				LOW_BYTE(ledValue[2]),HIGH_BYTE(ledValue[2]),
				LOW_BYTE(ledValue[3]),HIGH_BYTE(ledValue[3]),
				LOW_BYTE(ledValue[4]),HIGH_BYTE(ledValue[4]),
				LOW_BYTE(ledValue[5]),HIGH_BYTE(ledValue[5]),
				LOW_BYTE(ledValue[6]),HIGH_BYTE(ledValue[6])
			};

			for (uint8_t i = 0; i < config.peersCount; i++) {
				WifiEspNow.send(config.peers[i].mac, reinterpret_cast<const uint8_t*>(_data), 17);
				DEBUG_MSG("Send status %d\n",WifiEspNow.getSendStatus());
			}
		}
	}
}

#if DEBUG > 0
void debugPrintSampling() {
	for (int16_t i=0;i<SAMPLING_MAX;i++) {
		DEBUG_MSG("%d:CH: %d T: %d, V:%u\n",
		i,
		samplings.sampling[i].channel,
		samplings.sampling[i].timeSlot,
		samplings.sampling[i].value);
	}
}
#endif

/*
void HttpEvent(HttpEvent_t *event)
{
    switch(event->event_id) {
        case HTTP_EVENT_ERROR:
            DEBUG_MSG("Http Event Error");
            break;
        case HTTP_EVENT_ON_CONNECTED:
            DEBUG_MSG("Http Event On Connected");
            break;
        case HTTP_EVENT_HEADER_SENT:
            DEBUG_MSG("Http Event Header Sent");
            break;
        case HTTP_EVENT_ON_HEADER:
            DEBUG_MSG("Http Event On Header, key=%s, value=%s\n", event->header_key, event->header_value);
            break;
        case HTTP_EVENT_ON_DATA:
            break;
        case HTTP_EVENT_ON_FINISH:
            DEBUG_MSG("Http Event On Finish");
            break;
        case HTTP_EVENT_DISCONNECTED:
            DEBUG_MSG("Http Event Disconnected");
            break;
    }
}
*/

void checkForFwUpdate(bool run) {
	
	int newVersion = 0;
	String mac = WiFi.macAddress();
	mac.replace(":","");
	String fwURL = String( fwUrlBase );
	fwURL.concat( mac );
	String fwVersionURL = fwURL;
	fwVersionURL.concat( ".version" );
	DEBUG_MSG("Checking for firmware updates.\nMAC address: %s\nFirmware version URL: %s\n",mac.c_str(),fwVersionURL.c_str());

	HTTPClient httpClient;
	httpClient.begin( fwVersionURL );
	int httpCode = httpClient.GET();
	if( httpCode == 200 ) {
		String newFWVersion = httpClient.getString();
		DEBUG_MSG("Current firmware version: %d\nAvailable firmware version: %s\n",coreVersion,newFWVersion.c_str());
		newVersion = newFWVersion.toInt();
	}
	httpClient.end();

/* TODO: opravit
	HttpsOTAStatus_t otastatus;
	if( newVersion > coreVersion ) {
		isUpdateAvailable = true;
		if (run) {
			DEBUG_MSG( "Preparing to update.\n" );
			String fwImageURL = fwURL;
			fwImageURL.concat( ".bin" );
			HttpsOTA.onHttpEvent(HttpEvent);
    		DEBUG_MSG("Starting OTA");
    		HttpsOTA.begin(url, server_certificate, true);
			while(1) {
				otastatus = HttpsOTA.status();
    			if(otastatus == HTTPS_OTA_SUCCESS) { 
        			DEBUG_MSG("Firmware written successfully. To reboot device, call API ESP.restart() or PUSH restart button on device");
					ESP.restart();
    			} else if(otastatus == HTTPS_OTA_FAIL) { 
        			DEBUG_MSG("Firmware Upgrade Fail");
					break;
    			}
				delay(1000);
			}
		}	
	}
	*/
	
}


void OnDataRecv(const uint8_t mac[6], const uint8_t* data, size_t count, void* cbarg) {
	char macStr[18];
	snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
	DEBUG_MSG("Inc msg: %s, len:%d, type:%d\n",macStr,count,data[0]);
	//TODO: zkontrolovat crc a rozparsovat paket na data
	//[0] - typ: 11 = prikaz k nastaveni do manual modu, 
	//[1..2] - led[0], [3..4] - led[1], [5..6] - led[2]
	//[7..8] - led[3], [9..10] - led[4], [11..12] - led[5]
	//[13..14] - led[6]
	//[15..16] - crc
	config.peerMode = data[0];
	if (config.peerMode == 11) {		
		config.manual = true;
		config.manualValues[0] = (data[2]<<8)|data[1];
		config.manualValues[1] = (data[4]<<8)|data[3];
		config.manualValues[2] = (data[6]<<8)|data[5];
		config.manualValues[3] = (data[8]<<8)|data[7];
		config.manualValues[4] = (data[10]<<8)|data[9];
		config.manualValues[5] = (data[12]<<8)|data[11];
		config.manualValues[6] = (data[14]<<8)|data[13];
		finalPwm = false;
	}
}

/*
void OnDataSent(uint8_t *mac_addr, uint8_t status) {
	char macStr[18];
	snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
	DEBUG_MSG("Last Packet Send Status: %d\n",status);
}
*/

int managePeers(bool state, uint8_t *mac) {	
	if (state) { //ADD
		for (uint8_t i=0; i <  peersCount; i++) {
			DEBUG_MSG("Add peer: %02x:%02x:%02x:%02x:%02x:%02x\n",config.peers[i].mac[0],
				config.peers[i].mac[1],
				config.peers[i].mac[2],
				config.peers[i].mac[3],
				config.peers[i].mac[4],
				config.peers[i].mac[5]);
			if (!WifiEspNow.addPeer(config.peers[i].mac))
				DEBUG_MSG("Registering peer failed\n");
		}
	} else { //REMOVE
		DEBUG_MSG("Delete peer: %02x:%02x:%02x:%02x:%02x:%02x\n",mac[0],mac[1],mac[2],mac[3],mac[4],mac[5]);
		if (WifiEspNow.hasPeer(mac) ) {
			//send unpair mesage				
			uint8_t _data[]= {0};
			WifiEspNow.send(mac, reinterpret_cast<const uint8_t*>(_data), 1);
			DEBUG_MSG("Send status %d\n",WifiEspNow.getSendStatus());
			if (!WifiEspNow.removePeer(mac));
				DEBUG_MSG("Delete peer failed\n");
		}
	}
	config.peersCount = peersCount;
	return 0;
}

void removeFromPeers(uint8_t *mac) {
	DEBUG_MSG("Remove peer: %02x:%02x:%02x:%02x:%02x:%02x\n",mac[0],mac[1],mac[2],mac[3],mac[4],mac[5]);
	int8_t idx = -1;
	for (int8_t i=0; i<peersCount;i++) {
		DEBUG_MSG("Test peer: %02x:%02x:%02x\n",
			config.peers[i].mac[3],
			config.peers[i].mac[4],
			config.peers[i].mac[5]);
		
		if ((config.peers[i].mac[3] == mac[3]) &&
			(config.peers[i].mac[4] == mac[4]) &&
			(config.peers[i].mac[5] == mac[5]) ) {
				idx = i;
				DEBUG_MSG("MAC find in peers: %d\n",idx);
			}
	}
	if (idx >= 0) {
		for (int8_t i=idx; i<(PEERS-1);i++) { 
			config.peers[i].mac[0] = config.peers[i+1].mac[0];
			config.peers[i].mac[1] = config.peers[i+1].mac[1];
			config.peers[i].mac[2] = config.peers[i+1].mac[2];
			config.peers[i].mac[3] = config.peers[i+1].mac[3];
			config.peers[i].mac[4] = config.peers[i+1].mac[4];
			config.peers[i].mac[5] = config.peers[i+1].mac[5];
		}
		//clear last 
		config.peers[PEERS-1].mac[0] = 0;
		config.peers[PEERS-1].mac[1] = 0;
		config.peers[PEERS-1].mac[2] = 0;
		config.peers[PEERS-1].mac[3] = 0;
		config.peers[PEERS-1].mac[4] = 0;
		config.peers[PEERS-1].mac[5] = 0;
		if (peersCount > 0)  peersCount--;
		DEBUG_MSG("Remove & sort, count=%d\n",peersCount);
		managePeers(false,mac);
	}
}

// Scan for slaves in AP mode
uint8_t searchPeers() {
  int8_t slaveCnt = 0;
  int8_t scanResults = WiFi.scanNetworks();
  //reset slaves
  memset(config.peers, 0, sizeof(config.peers));
  if (scanResults == 0) {
    DEBUG_MSG("No peers found'n");
  } else {
    DEBUG_MSG("Found %d devices\n ",scanResults);
    for (int i = 0; i < scanResults; ++i) {
      String SSID = WiFi.SSID(i);
	  String BSSIDstr = WiFi.BSSIDstr(i);
      int32_t RSSI = WiFi.RSSI(i);
	  // Print SSID and RSSI for each device found
	  DEBUG_MSG("%d: %s [%s] (%u)\n",i+1,SSID.c_str(),BSSIDstr.c_str(),RSSI);
      delay(10);
      // Check if the current device starts with `Slave`
      if (SSID.indexOf(MAINNAME) == 0) {
		DEBUG_MSG("%d: %s [%s] (%u)\n",i+1,SSID.c_str(),BSSIDstr.c_str(),RSSI);
        // Get BSSID => Mac Address of the Slave
        int mac[6];
        if ( 6 == sscanf(BSSIDstr.c_str(), "%02x:%02x:%02x:%02x:%02x:%02x",  &mac[0], &mac[1], &mac[2], &mac[3], &mac[4], &mac[5] ) ) {
			for (int ii = 0; ii < 6; ++ii ) {
				config.peers[slaveCnt].mac[ii] = (uint8_t) mac[ii];
			}        
			slaveCnt++;
		}
      }
    }
  }
  DEBUG_MSG("%d Slave(s) found, processing..\n",slaveCnt);
  WiFi.scanDelete();
  return slaveCnt;
}

void setup() {	
	DEBUGSER_BEGIN(DEBUGBAUD);	
	DEBUG_MSG("\nSTART\n");

	#if DEBUG  == 0
		pinMode(STATUSLED,OUTPUT);
	#endif

	initSamplingValues();

	if (LittleFS.begin(true) ) {
		
		DEBUG_MSG("FS start\n");
		if (loadConfig(&config)) {
			DEBUG_MSG("Load config\n");
			if (config.version != coreVersion) {
				config.version = coreVersion;
				//UPDATE ....
				normalizeConfig();
				DEBUG_MSG("Update config\n");
				//saveSamplingStructToJson("profile.pjs");
				saveConfig();
			}			
		} else {
			DEBUG_MSG("Init config\n");
			normalizeConfig();
			saveConfig();
			saveSamplingStructToJson("/profile.pjs");
		}
	} else {
		#if DEBUG > 0
			DEBUG_MSG("FILESYSTEM ERROR\n");
			while (1) {;} 
		#else		
			led.Blink(300,300).Forever();
			while (1) {led.Update();} 
		#endif		
	}

	if (config.profileFileName.length() > 0) {
		bool lok = loadSamplingStructFromJson("/" + config.profileFileName);
		DEBUG_MSG("Sampling config load: %s %s\n",config.profileFileName.c_str(),lok==1?"OK":"Fail");
		#if DEBUG == 2
			debugPrintSampling();
		#endif			
	}
	/*
	DEBUG_MSG("Start WiFi\n");
	WiFi.mode(WIFI_AP_STA);
	//WiFi.hostname(config.hostname.c_str());
	//WiFi.softAP(HOSTNAME);

	if (wifiConnect() == WL_CONNECTED) {
		syncTime = true;
		ntpClient.begin();
		setSyncInterval(NTPSYNCINTERVAL);
		setSyncProvider(getNtpTime);
	}
    */
	DEBUG_MSG("Start WEBSERVER");
	webserver_begin();
	
	//add mDNS service
	if (MDNS.begin(config.hostname.c_str())) {
		MDNS.addService("http", "tcp", 80);
	}

	delay(5000);
	DEBUG_MSG("Searching slave\n");
		
	//search ESP now slave	
	config.peerMode = 0;
	if (!WifiEspNow.begin()) {
		DEBUG_MSG("WifiEspNow.begin() failed\n");
	} else {
		WifiEspNow.onReceive(OnDataRecv, nullptr);
		peersCount = config.peersCount;			
		if (peersCount > 0) {
			managePeers(true);		
		}
	}
	DEBUG_MSG("Setup PWM\n");
	//setup PWM channel and gpio
	for (uint8_t x = 0; x < CHANNELS; x++) {
		ledcSetup(ledChannel[x], ledFreq, ledResolution);
		ledcAttachPin(ledPins[x], ledChannel[x]);
	}


	esp_err_t ret = ledc_fade_func_install(0);
	DEBUG_MSG("Setup END\n");
}

void setLed() {
	for (uint8_t x = 0; x < CHANNELS; x++) {
        ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, ledc_channel[x], ledValue[x], TASK1 - 1);
        ledc_fade_start(LEDC_LOW_SPEED_MODE,ledc_channel[x], LEDC_FADE_NO_WAIT);		
	}
	finalPwm = false;
}

/* ####### main loop ######3 */

uint32_t t1_mm;
uint32_t t2_mm;
uint32_t t3_mm;

int8_t istep = 0;

void loop() {
	uint32_t mm = millis();

	#if DEBUG  == 0	
		led.Update();
	#endif	
	if (isDNSStarted)
		dnsServer.processNextRequest();
	
	bool result = false;
	
	//process data from web
	switch (changed) {
		case LED:		
			DEBUG_MSG("Change profile to %s:\n",config.profileFileName.c_str());
			result = loadSamplingStructFromJson("/" + config.profileFileName);
			if (result) {
				DEBUG_MSG("loadSamplingStructFromJson OK\n");
				#if DEBUG == 2
					debugPrintSampling();
				#endif
				saveConfig();
			} else {
				ESP.restart();
			}
			changed = NONE;
			break;
		case CONFIG:
			saveConfig();
			changed = NONE;
			break;
		case WIFI:
			DEBUG_MSG("Change WIFI\n");
			if (wifiConnect() == true) {
				DEBUG_MSG("Change WIFI END SUCCESS\n");
				syncTime = true;
				saveConfig();
			}
			changed = NONE;
			break;
		case RESET:
			//reboot. manual or after fw update
			DEBUG_MSG("%s\n", "Rebooting...");
			delay(100);
			ESP.restart();			
			break;
		case SEARCHPEERS:
			changed = NONE;
			peersCount = searchPeers();
			DEBUG_MSG("Add peers: %d\n",peersCount);
			break;
		case CONFIRMPEERS:
			changed = CONFIG;
			managePeers(true);
			break;
		case UPDATE:
			changed = NONE;				
			//checkForFwUpdate(true);
			break;				
		default:
			break;
	}

	//je-li to master, pak nastav led hodnoty a posli na slave
	if (config.peerMode == 0) {
		if (mm - t1_mm > TASK1) {
			t1_mm = mm;
			setPwmVal();		
		}
	}

	//doslo-li ke zmene hodnost, nastav nove PWM
	if (finalPwm) {
		setLed();		
	}

	//search updates 1x daily
	if (mm - t3_mm > TASK3) {
		t3_mm = mm;
		//search;
		//checkForFwUpdate(false);
	}
	
	//sync time from Internet
	if (syncTime) now();			
	
	ElegantOTA.loop();
}
