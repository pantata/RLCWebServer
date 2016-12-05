///
/// @mainpage	RlcWebFw
///
/// @details    WiFi chip firmware
/// @n
/// @n
///
/// @date		21.10.16 15:51
/// @version v0.2-1-g519ac0c
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

#include "common.h"
#include "RlcWebFw.h"
#include "webserver.h"
#include "sampling.h"
#include "serial.h"
#include "tz.h"

extern "C" {
  #include "user_interface.h"
}

#define VER "undefined"

WiFiUDP Udp;
NTPClient ntpClient(Udp, TIMESERVER, 0, NTPSYNCINTERVAL);
DNSServer dnsServer;

Config config;
WifiNetworks wifinetworks[16];
Samplings samplings;

bool shouldReboot = false;
bool shouldReconnect = false;
bool startUpdate=false;
bool updateExited=false;
bool isDNSStarted = false;

String inputString="" ;
boolean stringComplete = false;

uint8_t changed = 0;
uint8_t lang = 0;
uint8_t modulecount = 4;
uint8_t mode = 0;

bool _is_static_ip = false;
uint8_t _wifi_is_connected = 0;
uint8_t _wifi_retry_count = 0;
uint32_t _wifi_retry_timeout = 0;

#ifdef VERSION
    const char* version = VERSION;
#else
    const char* version = VER;
#endif

const char* str_wifistatus[] = {
    "WL_IDLE_STATUS",
    "WL_NO_SSID_AVAIL",
    "WL_SCAN_COMPLETED",
    "WL_CONNECTED",
    "WL_CONNECT_FAILED",
    "WL_CONNECTION_LOST",
    "WL_DISCONNECTED"
};

const char* str_wifimode[] = {"OFF","STA","AP","AP_STA"};

const char* str_wifiauth[] = {
    "AUTH_OPEN",
    "AUTH_WEP",
    "AUTH_WPA_PSK",
    "AUTH_WPA2_PSK",
    "AUTH_WPA_WPA2_PSK",
    "AUTH_MAX"
};

const char* str_timestatus[] = {
    "timeNotSet",
    "timeNeedsSync",
    "timeSet"
};

union Unixtime unixtime;



// SKETCH BEGIN


WiFiEventHandler connectedEventHandler, disconnectedEventHandler;

/*-------- NTP code ----------*/
time_t getNtpTime() {
    time_t l = 0;
    if ( ntpClient.forceUpdate() ) {
        l = ntpClient.getEpochTime();
    }
    DEBUG_MSG("Epoch: %lu\n",l);
    return l;
}

uint8_t waitForConnectResult(unsigned long  _connectTimeout) {
    DEBUG_MSG ("%s\n","Waiting for connection result with time out");
    unsigned long start = millis();
    boolean keepConnecting = true;
    uint8_t status;
    while (keepConnecting) {
        status = WiFi.status();
        if (millis() > start + _connectTimeout) {
            keepConnecting = false;
            DEBUG_MSG ("%s\n","Connection timed out");
        }
        if ( (status == WL_CONNECTED) || (status == WL_CONNECT_FAILED) ) {
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
        DEBUG_MSG("%s\n","Already connected. Disconnecting ...");
        WiFi.disconnect();
    }
    
    if (WiFi.getMode() != WIFI_STA) {
        DEBUG_MSG("%s\n","Set STA mode");
        WiFi.mode(WIFI_STA);
    }
    
    if (ssid != "") {
        DEBUG_MSG("Connecting to ::%s:: and ::%s:: \n",ssid.c_str(), pass.c_str());
        WiFi.begin(ssid.c_str(), pass.c_str());
    } else {
        if (WiFi.SSID()) {
            DEBUG_MSG("%s\n","Using last saved values, should be faster");
            //trying to fix connection in progress hanging
            ETS_UART_INTR_DISABLE();
            wifi_station_disconnect();
            ETS_UART_INTR_ENABLE();
            WiFi.begin();
        } else {
            DEBUG_MSG("%s\n","No saved credentials");
        }
    }
}

void wifiConnect() {
    _wifi_retry_count = 0;
    
    normalizeConfig();
    
    if (config.wifimode == WIFI_STA) {
        if (!config.wifidhcp) {
            IPAddress ip = IPAddress((uint32_t)0);
            IPAddress gw = IPAddress((uint32_t)0);
            IPAddress mask = IPAddress((uint32_t)0);
            IPAddress dns1 = IPAddress((uint32_t)0);
            IPAddress dns2 = IPAddress((uint32_t)0);
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
        _wifi_is_connected = 4;
    } else {
        WiFi.mode(WIFI_AP);
        IPAddress apip = IPAddress((uint32_t)0);
        IPAddress apmask = IPAddress((uint32_t)0);
        if ( (apip.fromString(config.apip) ) && (apmask.fromString(config.apmask)) ) {
            WiFi.softAPConfig(apip,apip,apmask);
        }
        WiFi.hostname(config.hostname.c_str());
        WiFi.softAP(config.hostname.c_str(),config.appwd.length() == 0?NULL:config.appwd.c_str(),config.apchannel);
        _wifi_is_connected = 2;
        delay(500);
        DEBUG_MSG("Start DNS server, IP: %s, PORRT %d \n",WiFi.softAPIP().toString().c_str(), DNS_PORT);
        if (isDNSStarted) dnsServer.stop();
        isDNSStarted = dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
    }
}

void wifiFailover() {
    DEBUG_MSG("%s\n","STA FAIL ...");
    normalizeConfig();
    
    WiFi.mode(WIFI_AP);
    IPAddress apip = IPAddress((uint32_t)0);
    IPAddress apmask = IPAddress((uint32_t)0);
    
    apip.fromString(AP_IP);
    apmask.fromString(AP_MASK);
    
    WiFi.softAPConfig(apip,apip,apmask);
    WiFi.hostname(config.hostname.c_str());
    WiFi.softAP(config.hostname.c_str());
    
    DEBUG_MSG("Not connected %s, start AP: %s\n",config.ssid.c_str(),config.hostname.c_str());
    _wifi_is_connected = 2;
    delay(500);
    //start DNS server
    DEBUG_MSG("Start DNS server, IP: %s, PORRT %d \n",WiFi.softAPIP().toString().c_str(), DNS_PORT);
    if (isDNSStarted) dnsServer.stop();
    isDNSStarted = dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
}

void normalizeConfig() {
   	if (config.hostname.length() == 0) config.hostname = HOSTNAME;
    
   	if (config.ssid.length() == 0) {
   		config.ssid = HOSTNAME;
   		config.wifimode = WIFI_AP;
   		config.useNtp = false;
   	}

    
    if (config.wifimode == 0) config.wifimode = WIFI_AP;
    if (config.apip.length() == 0 ) config.apip = AP_IP;
    if (config.apmask.length() == 0 ) config.apmask = AP_MASK;
    if (config.ntpServer.length() == 0 ) config.ntpServer = TIMESERVER;
    if (config.wifiip.length() == 0) config.wifidhcp = false;
    if ( (config.apchannel < 1) || (config.apchannel > 11) ) config.apchannel = 1;
    
    if (config.useDST == NULL) config.useDST = true;
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
}

bool loadConfig(Config *conf)
{
    DEBUG_MSG("%s\n","loadConfig start");
    File configFile = SPIFFS.open("/config.json", "r");
    if (!configFile) {
        DEBUG_MSG("%s\n","Failed to open config file");
        return false;
    }
    size_t size = configFile.size();
    /*  if (size > 1024) {
     #ifdef DEBUG
     Serial.println("Config file size is too large");
     #endif
     return false;
     }
     */
    char * pf=new char[size]; 
    std::unique_ptr<char[]> buf(pf);
    configFile.readBytes(buf.get(), size);
    
    StaticJsonBuffer<600> jsonBuffer;
    JsonObject& json = jsonBuffer.parseObject(buf.get());
    
    if (!json.success()) {
        DEBUG_MSG("%s\n","Failed to parse config file");
        /*free(pf);*/
        return false;
    }

    DEBUG_MSG("%s\n","loadConfig json.success ");

    
    if(json.containsKey("ssid"))conf->ssid=String((const char *)json["ssid"]);
    if(json.containsKey("pwd"))conf->pwd=String((const char *)json["pwd"]);
    if(json.containsKey("hostname"))conf->hostname=String((const char *)json["hostname"]);
    if(json.containsKey("wifimode"))conf->wifimode=json["wifimode"];
    if(json.containsKey("ntpServer"))conf->ntpServer=String((const char*)json["ntpServer"]);
    if(json.containsKey("localPort"))conf->localPort=json["localPort"];
    String useNtp=(json.containsKey("useNtp"))?String((const char*)json["useNtp"]):"false";
    conf->useNtp=(useNtp.equals("true"))?1:0;
    if(json.containsKey("profileFileName"))conf->profileFileName=String((const char*)json["profileFileName"]);
    String wifidhcp=(json.containsKey("wifidhcp"))?String((const char*)json["wifidhcp"]):"true";
    conf->wifidhcp=(wifidhcp.equals("true"))?1:0;
    if(json.containsKey("wifiip"))conf->wifiip=String((const char*)json["wifiip"]);
    if(json.containsKey("wifimask"))conf->wifimask=String((const char*)json["wifimask"]);
    if(json.containsKey("wifigw"))conf->wifigw=String((const char*)json["wifigw"]);
    if(json.containsKey("wifidns1"))conf->wifidns1=String((const char*)json["wifidns1"]);
    if(json.containsKey("wifidns2"))conf->wifidns2=String((const char*)json["wifidns2"]);
    if(json.containsKey("appwd"))conf->appwd=String((const char*)json["appwd"]);
    if(json.containsKey("apchannel"))conf->apchannel=json["apchannel"];
    if(json.containsKey("apip"))conf->apip=String((const char*)json["apip"]);
    if(json.containsKey("apmask"))conf->apmask=String((const char*)json["apmask"]);
    if(json.containsKey("apgw"))conf->apgw=String((const char*)json["apgw"]);
    String useDST=(json.containsKey("useDST"))?String((const char*)json["useDST"]):"false";
    conf->useDST=(useDST.equals("true"))?1:0;
    conf->tzRule=TzRule();
    if(json.containsKey("tzRule.tzName"))conf->tzRule.tzName=String((const char*)json["tzRule.tzName"]);
    if(json.containsKey("tzRule.dstStart.day"))conf->tzRule.dstStart.day=json["tzRule.dstStart.day"];
    if(json.containsKey("tzRule.dstStart.hour"))conf->tzRule.dstStart.hour=json["tzRule.dstStart.hour"];
    if(json.containsKey("tzRule.dstStart.month"))conf->tzRule.dstStart.month=json["tzRule.dstStart.month"];
    if(json.containsKey("tzRule.dstStart.offset"))conf->tzRule.dstStart.offset=json["tzRule.dstStart.offset"];
    if(json.containsKey("tzRule.dstStart.weeek"))conf->tzRule.dstStart.week=json["tzRule.dstStart.weeek"];
    if(json.containsKey("tzRule.dstEnd.day"))conf->tzRule.dstEnd.day=json["tzRule.dstEnd.day"];
    if(json.containsKey("tzRule.dstEnd.hour"))conf->tzRule.dstEnd.hour=json["tzRule.dstEnd.hour"];
    if(json.containsKey("tzRule.dstEnd.month"))conf->tzRule.dstEnd.month=json["tzRule.dstEnd.month"];
    if(json.containsKey("tzRule.dstEnd.offset"))conf->tzRule.dstEnd.offset=json["tzRule.dstEnd.offset"];
    if(json.containsKey("tzRule.dstEnd.week"))conf->tzRule.dstEnd.week=json["tzRule.dstEnd.week"];

    /* Normalize config file */
    normalizeConfig();
    DEBUG_MSG("%s\n","parsing config file success");
    /*free(pf);*/
    return true;
    
}

bool saveSamplingStruct(String filename)
{

  File f = SPIFFS.open(filename.c_str(), "w");
  if (!f) {
        DEBUG_MSG("Failed to open file %s for writing\n",filename.c_str());
        return false;
  }
  if (f.write((const uint8_t *)&samplings,sizeof(samplings)))
  {
      f.close();
      return true;
  }
  else
  {
     f.close();
     return false;
  }

  return false;    
}

bool loadSamplingStruct(String filename,Samplings *s )
{
    File f = SPIFFS.open(filename.c_str(), "r");

  if (f.read((uint8_t *)s,sizeof(samplings))!=-1)
  {
      f.close();
      return true;
  }
  else
  {
     f.close();
     return false;
  }

  return false;    


}


bool saveConfig()
{
    struct Config confsaved;
    
    if (loadConfig(&confsaved))
    {
        DEBUG_MSG("%s","Load config.json to comparing\n\n");
        DEBUG_MSG("config.ssid=%s  confsaved.ssid=%s\n",config.ssid.c_str(),confsaved.ssid.c_str());
        DEBUG_MSG("config.pwd=%s  confsaved.pwd=%s\n",config.pwd.c_str(),confsaved.pwd.c_str());
        DEBUG_MSG("config.hostname=%s  confsaved.hostname=%s\n",config.hostname.c_str(),confsaved.hostname.c_str());
        DEBUG_MSG("config.wifimode=%d  confsaved.wifimode=%d\n",config.wifimode,confsaved.wifimode);
        DEBUG_MSG("config.ntpServer=%s  confsaved.ntpServer=%s\n",config.ntpServer.c_str(),confsaved.ntpServer.c_str());
        DEBUG_MSG("config.localPort=%d  confsaved.localPort=%d\n",config.localPort,confsaved.localPort);
        DEBUG_MSG("config.useNtp=%d  confsaved.useNtp=%d\n",config.useNtp,confsaved.useNtp);
        DEBUG_MSG("config.wifidhcp=%d  confsaved.wifidhcp=%d\n",config.wifidhcp,confsaved.wifidhcp);
        DEBUG_MSG("config.wifiip=%s  confsaved.wifiip=%s\n",config.wifiip.c_str(),confsaved.wifiip.c_str());
        DEBUG_MSG("config.wifimask=%s  confsaved.wifimask=%s\n",config.wifimask.c_str(),confsaved.wifimask.c_str());
        DEBUG_MSG("config.wifigw=%s  confsaved.wifigw=%s\n",config.wifigw.c_str(),confsaved.wifigw.c_str());
        DEBUG_MSG("config.wifidns1=%s  confsaved.wifidns1=%s\n",config.wifidns1.c_str(),confsaved.wifidns1.c_str());
        DEBUG_MSG("config.wifidns2=%s  confsaved.wifidns2=%s\n",config.wifidns2.c_str(),confsaved.wifidns2.c_str());
        DEBUG_MSG("config.appwd=%s  confsaved.appwd=%s\n",config.appwd.c_str(),confsaved.appwd.c_str());
        DEBUG_MSG("config.apchannel=%d  confsaved.apchannel=%d\n",config.apchannel,confsaved.apchannel);
        DEBUG_MSG("config.apip=%s  confsaved.apip=%s\n",config.apip.c_str(),confsaved.apip.c_str());
        DEBUG_MSG("config.apmask=%s  confsaved.apmask=%s\n",config.apmask.c_str(),confsaved.apmask.c_str());
        DEBUG_MSG("config.apgw=%s  confsaved.apgw=%s\n",config.apgw.c_str(),confsaved.apgw.c_str());
        DEBUG_MSG("config.useDST=%d  confsaved.useDST=%d\n",config.useDST,confsaved.useDST);
        DEBUG_MSG("config.tzRule.tzName=%s  confsaved.tzRule.tzName=%s\n",config.tzRule.tzName.c_str(),confsaved.tzRule.tzName.c_str());
        DEBUG_MSG("config.tzRule.dstStart.day=%d  confsaved.tzRule.dstStart.day=%d\n",config.tzRule.dstStart.day,confsaved.tzRule.dstStart.day);
        DEBUG_MSG("config.tzRule.dstStart.hour=%d  confsaved.tzRule.dstStart.hour=%d\n",config.tzRule.dstStart.hour,confsaved.tzRule.dstStart.hour);
        DEBUG_MSG("config.tzRule.dstStart.month=%d  confsaved.tzRule.dstStart.month=%d\n",config.tzRule.dstStart.month,confsaved.tzRule.dstStart.month);
        DEBUG_MSG("config.tzRule.dstStart.offset=%d  confsaved.tzRule.dstStart.offset=%d\n",config.tzRule.dstStart.offset,confsaved.tzRule.dstStart.offset);
        DEBUG_MSG("config.tzRule.dstStart.week=%d  confsaved.tzRule.dstStart.week=%d\n",config.tzRule.dstStart.week,confsaved.tzRule.dstStart.week);
        DEBUG_MSG("config.tzRule.dstEnd.day=%d  confsaved.tzRule.dstEnd.day=%d\n",config.tzRule.dstEnd.day,confsaved.tzRule.dstEnd.day);
        DEBUG_MSG("config.tzRule.dstEnd.hour=%d  confsaved.tzRule.dstEnd.hour=%d\n",config.tzRule.dstEnd.hour,confsaved.tzRule.dstEnd.hour);
        DEBUG_MSG("config.tzRule.dstEnd.month=%d  confsaved.tzRule.dstEnd.month=%d\n",config.tzRule.dstEnd.month,confsaved.tzRule.dstEnd.month);
        DEBUG_MSG("config.tzRule.dstEnd.offset=%d  confsaved.tzRule.dstEnd.offset=%d\n",config.tzRule.dstEnd.offset,confsaved.tzRule.dstEnd.offset);
        DEBUG_MSG("config.tzRule.dstEnd.week=%d  confsaved.tzRule.dstEnd.week=%d\n",config.tzRule.dstEnd.week,confsaved.tzRule.dstEnd.week);
        
        if (config.ssid.equals(confsaved.ssid)&&
            config.pwd.equals(confsaved.pwd)&&
            config.hostname.equals(confsaved.hostname)&&
            config.ntpServer.equals(confsaved.ntpServer)&&
            config.wifimode==confsaved.wifimode&&
            config.localPort==confsaved.localPort&&
            config.useNtp==confsaved.useNtp&&
            config.profileFileName.equals(confsaved.profileFileName)&&
            config.wifidhcp==confsaved.wifidhcp&&
            config.wifiip.equals(confsaved.wifiip)&&
            config.wifimask.equals(confsaved.wifimask)&&
            config.wifigw.equals(confsaved.wifigw)&&
            config.wifidns1.equals(confsaved.wifidns1)&&
            config.wifidns2.equals(confsaved.wifidns2)&&
            config.appwd.equals(confsaved.appwd)&&
            config.apchannel==confsaved.apchannel&&
            config.apip.equals(confsaved.apip)&&
            config.apmask.equals(confsaved.apmask)&&
            config.apgw.equals(confsaved.apgw)&&
			config.useDST==confsaved.useDST&&
			config.tzRule.tzName.equals(confsaved.tzRule.tzName)&&
			config.tzRule.dstStart.day==confsaved.tzRule.dstStart.day&&
			config.tzRule.dstStart.hour==confsaved.tzRule.dstStart.hour&&
			config.tzRule.dstStart.month==confsaved.tzRule.dstStart.month&&
			config.tzRule.dstStart.offset==confsaved.tzRule.dstStart.offset&&
			config.tzRule.dstStart.week==confsaved.tzRule.dstStart.week&&
			config.tzRule.dstEnd.day==confsaved.tzRule.dstEnd.day&&
			config.tzRule.dstEnd.hour==confsaved.tzRule.dstEnd.hour&&
			config.tzRule.dstEnd.month==confsaved.tzRule.dstEnd.month&&
			config.tzRule.dstEnd.offset==confsaved.tzRule.dstEnd.offset&&
			config.tzRule.dstEnd.week==confsaved.tzRule.dstEnd.week
            )
        return false;
    }
    
    StaticJsonBuffer<600> jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    
    json["ssid"]=config.ssid.c_str();
    json["pwd"]=config.pwd.c_str();
    json["hostname"]=config.hostname.c_str();
    json["wifimode"]=config.wifimode;
    json["ntpServer"]=config.ntpServer.c_str();
    json["localPort"]=config.localPort;
    json["useNtp"]=(config.useNtp)?"true":"false";
    json["profileFileName"]=config.profileFileName.c_str();
    json["wifidhcp"]=(config.wifidhcp)?"true":"false";
    json["wifiip"]=config.wifiip.c_str();
    json["wifimask"]=config.wifimask.c_str();
    json["wifigw"]=config.wifigw.c_str();
    json["wifidns1"]=config.wifidns1.c_str();
    json["wifidns2"]=config.wifidns2.c_str();
    json["appwd"]=config.appwd.c_str();
    json["apchannel"]=config.apchannel;
    json["apip"]=config.apip.c_str();
    json["apmask"]=config.apmask.c_str();
    json["apgw"]=config.apgw.c_str();
    json["useDST"]=(config.useDST)?"true":"false";
    json["tzRule.tzName"]=config.tzRule.tzName.c_str();
    json["tzRule.dstStart.day"]=config.tzRule.dstStart.day;
    json["tzRule.dstStart.hour"]=config.tzRule.dstStart.hour;
    json["tzRule.dstStart.month"]=config.tzRule.dstStart.month;
    json["tzRule.dstStart.offset"]=config.tzRule.dstStart.offset;
    json["tzRule.dstStart.week"]=config.tzRule.dstStart.week;
    json["tzRule.dstEnd.day"]=config.tzRule.dstEnd.day;
    json["tzRule.dstEnd.hour"]=config.tzRule.dstEnd.hour;
    json["tzRule.dstEnd.month"]=config.tzRule.dstEnd.month;
    json["tzRule.dstEnd.offset"]=config.tzRule.dstEnd.offset;
    json["tzRule.dstEnd.week"]=config.tzRule.dstEnd.week;


    
    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
        DEBUG_MSG("%s\n","Failed to open config file for writing");
        return false;
    }
    json.printTo(configFile);
    return true;
    
}




/*
bool isSummerTime(int timezoneOffset)
{
    if(month()>=4&&month()<=9) return true;
    time_t ps=previousSunday(now());
    time_t es=nextSunday(now());

    if (month()==3)
    {
        if (month(ps)==month(es))
        {
           return false;   
        }
        else
        {
            if(day()>day(ps)) return true;
            if(day()==day(ps))
            {
                if (hour()>=timezoneOffset) return true;
                return false;          
            }
        }
        return false;
        
    }

    if (month()==10)
    {
        if (month(ps)==month(es))
        {
           return true;   
        }
        else
        {
            if(day()>day(ps)) return false;
            if(day()==day(ps))
            {
                if (hour()>=timezoneOffset) return false;
                return true;          
            }
        }
        return true;
        
    }

    return false;
}
*/
void setup() {
    
    WiFi.persistent(false);
    WiFi.setAutoConnect(false);
    WiFi.setAutoReconnect(false);
    
    connectedEventHandler = WiFi.onStationModeConnected([](const WiFiEventStationModeConnected& event)
    {
        DEBUG_MSG("%s","Connected ... \n");
        if (_wifi_is_connected == 4) {
            if (saveConfig()) {
                DEBUG_MSG("%s\n","file config.json has been saved");
            } else {
                DEBUG_MSG("%s\n","file config.json has not been saved");
            }
            DEBUG_MSG("\nConnected to %s\n", config.ssid.c_str());

        }
        
        if ( isDNSStarted ) dnsServer.stop();
        
        _wifi_retry_count = 0;
        _wifi_is_connected = 1;
    });
    
    disconnectedEventHandler = WiFi.onStationModeDisconnected([](const WiFiEventStationModeDisconnected& event)
    {
       if (_wifi_is_connected == 1) _wifi_is_connected = 0;
       DEBUG_MSG("%s","Disconnected ... \n");
    });
    
    // initialize serial:
    Serial.begin(115200);
    
#ifdef DEBUG
    Serial.setDebugOutput(true);
    
    ArduinoOTA.onStart([]() {
        Serial.println("Start");
    });
    
    ArduinoOTA.onEnd([]() {
        Serial.println("\nEnd");
    });
    
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("Progress: %u%%\r\n", (progress / (total / 100)));
    });
    
    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("Error[%u]: ", error);
        if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
        else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
        else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
        else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
        else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });
    
    ArduinoOTA.begin();
    
    Serial.printf("Verze: %s\n",version);
#endif
    
    initSamplingValues();
    
    SPIFFS.begin();
    if (!loadConfig(&config))
    {
        /*
        config.hostname = HOSTNAME;
        config.ssid=HOSTNAME;
        config.pwd=String("");
        config.wifimode=WIFI_AP;
        config.ntpServer=String(TIMESERVER);
        config.localPort=2390;
        config.wifidhcp=false;
         */
        normalizeConfig();
        saveConfig();
    }

    PRINT_CONFIG(config);
 
  
    if (config.profileFileName.length()>0)
    {
      
      bool lok=loadSamplingStruct(config.profileFileName,&samplings);
      if (lok==true)
      {
        DEBUG_MSG("loadSamplingStruct from file %s loaded successfully\n",config.profileFileName.c_str());
      }
      else
      {
        DEBUG_MSG("loadSamplingStruct from file %s loaded with error\n",config.profileFileName.c_str());
      }
    }
    
    
    PRINT_CONFIG(config);
  
    /*httpUpdater.setup(server,"/update");*/
    WiFi.hostname(config.hostname.c_str());
    DEBUG_MSG("Set wifi mode %d\n", config.wifimode);
    uint8_t res = WL_DISCONNECTED;
    
    if (  config.wifimode == WIFI_STA) {  //&& (config.wifimode != WIFI_OFF) ) {
        wifiConnect();
        if (waitForConnectResult(WAIT_FOR_WIFI) != WL_CONNECTED) {
            wifiFailover();
        }
    } else  {
        DEBUG_MSG("Set AP: %s",config.hostname.c_str());
        WiFi.mode(WIFI_AP);
        WiFi.softAP(config.hostname.c_str());
        _wifi_is_connected = 0;
    }

    startUpdate=false;

    if (MDNS.begin(config.hostname.c_str())) {
        DEBUG_MSG("mDNS responder started at %s.local\n", config.hostname.c_str());
    }
    else {
        DEBUG_MSG("%s\n", "error setting up mDNS responder\n");
    }
    
    //TODO: osetrit dle pripojeni k internetu!!
    //i v hlavni smycce kontrola, pokud se ztrati spojeni
    //vypnout synchronizaci
    
    ntpClient.begin();
    setSyncInterval(NTPSYNCINTERVAL);
    setSyncProvider(getNtpTime);
    
    
    
    // reserve 200 bytes for the inputString:
    inputString.reserve(200);
    
    webserver_begin();
    //add mDNS service
    MDNS.addService("http", "tcp", 80);
}


void loop() {
    
    if (isDNSStarted) dnsServer.processNextRequest();
    
#ifdef DEBUG
    ArduinoOTA.handle();
#endif
    
    //wifi change
    if (shouldReconnect) {
        wifiConnect();
        shouldReconnect = false;
    }
    
    //reboot after success firmware update
    if(shouldReboot){
        DEBUG_MSG("%s\n","Rebooting...");
        delay(100);
        ESP.restart();
    }
    
    //WiFi connection test
    if ((millis() - _wifi_retry_timeout) > WIFI_RETRY ) {    
        DEBUG_MSG("%s - %d\n","WiFi test...", _wifi_retry_count);
        _wifi_retry_timeout = millis();
        if ( (_wifi_is_connected == 0) && (config.wifimode == WIFI_STA) ) {
            _wifi_retry_count++;
            if (_wifi_retry_count > WIFI_RETRY_COUNT) {
                DEBUG_MSG("%s\n","Reconnect...");
                wifiConnect();
            }
        }
        
        if ( (_wifi_is_connected == 4) && (config.wifimode == WIFI_STA) ) {
            _wifi_retry_count++;
            if (_wifi_retry_count > (WIFI_RETRY_COUNT + 2) ) {
                DEBUG_MSG("%s\n","WiFi failover...");
                wifiFailover();
                _wifi_retry_count = 0;
            }
        }
    }
    
    //TODO: Time sync test
        
    if (stringComplete) {
        //Serial.println(inputString);
        // clear the string:
        
        switch(inputString.charAt(0))
        {
            case CODE255: process255();
            break;
            case CODE1:   process1();
            break;
            case CODE2:   process2();
            break;
            case CODE3:   process3();
            break;
            case CODE4:   process4();
            break;
            case CODE5:   process5(inputString);
            break;
            case CODE6:   process6(inputString);
            break;
            case CODE9:   process9(inputString);
            break;
            default:      Serial.printf("default -%c-\n",inputString.charAt(0));
            break;
            
        }
        /*Serial.printf("String input : %s\n",inputString.c_str());*/
        inputString = "";
        stringComplete = false;
        Serial.flush();
    }
    
    while (Serial.available()) {
        
        // get the new byte:
        char inChar = (char)Serial.read();
        
        // add it to the inputString:
        inputString += inChar;
        // if the incoming character is a newline, set a flag
        // so the main loop can do something about it:
        if (inChar == BREAK) {
            stringComplete = true;
        }
    }
    
}
