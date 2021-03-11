//
//  common.h
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71

#ifndef common_h
#define common_h

#include "Arduino.h"
#include "tz.h"
#include "JsonListener.h"

#define DEBUG 1
#define DEBUGBAUD 57600
#ifdef DEBUG
    #define DEBUGSER Serial
    #define DEBUG_MSG(...) DEBUGSER.printf(__VA_ARGS__)
    //#define PRINT_CONFIG(c) for(;0;)
    #define PRINT_CONFIG(...) DEBUGSER.printf("HEAP = %d\n",ESP.getFreeHeap())
    #else
    #define DEBUG_MSG(fmt, ...) for(;0;)
    #define PRINT_CONFIG(c) for(;0;)
#endif

#define constrain(amt,low,high) ((amt)<(low)?(low):((amt)>(high)?(high):(amt)))
#define MAX_PWM 4000
#define MAX_MODULES 1
#define CHANNELS 7

#define AP_IP   String("192.168.4.1")
#define AP_MASK String("255.255.255.0")
#define APPWD   "nereus"
#define HOSTNAME String("NEREUS") + String(ESP.getChipId(), HEX)
#define DNS_PORT 53
#define TIMESERVER "pool.ntp.org"
#define CFGNAME    "/nereus.cfg"

#define WIFITIMEOUT  15
#define SAMPLING_MAX 504 //max 72 bodu ma kanal
#define SAMPLING_UINT8_MAX_VALUE 255
#define TIMEDELAY 10UL

#define NTPSYNCINTERVAL  3600

#define WAIT_FOR_WIFI 10000
#define WIFI_RETRY_COUNT 10  //10 pokusu po 60 sec = 10 minut
#define WIFI_RETRY_TIMEOUT 60000

#define LEDAUTO    0
#define LEDMANUAL  1

#define ERR_TEMP_READ   -128

#define RESET_AVR  9

#define LEDBLUE    0
#define LEDAMBER   1
#define LEDWHITE   2
#define LEDRED     3
#define LEDGREEN   4
#define LEDRB      5
#define LEDUV      6

#define TASK1      1000  //ms
#define TASK2      60000 

typedef enum {
    W_DISCONNECT       =  0,
    W_CONNECTED        =  1,
    W_AP_STARTED   	   =  2
} wifi_is_connected_t;

struct Config {
    uint16_t version;
    String ssid; // par ssid
    String pwd;  // par pwd
    String hostname; // par apname
    uint8_t wifimode = 0; // par apmode
    String ntpServer;
    unsigned int localPort;
    bool useNtp = true;
    String profileFileName = "";
    bool wifidhcp = false;
    String wifiip;
    String wifimask;
    String wifigw;
    String wifidns1;
    String wifidns2;
    String appwd; // par appwd
    uint8_t apchannel = 0; // par apchannel
    String apip; // par apip
    String apmask; // par apmask
    String apgw; // par apgw
    bool useDST;
    TzRule tzRule;
    uint8_t dtFormat;
    uint8_t tmFormat;
    bool manual;
    uint8_t lang;
    uint16_t manualValues[7];
    bool startUpdate;
};

//var dateFormat = ["DD.MM.YY","DD/MM/YY","DD-MM-YY","YY/MM/DD","YY-MM-DD"];
//var timeFormat = ["HH:MI:SS P","HH.MI:SS P","HH24:MI:SS","HH24.MI:SS","HH:MI P","HH.MI P","HH24:MI","HH24.MI"];

struct Sampling {
    uint8_t channel; //3bit
    uint8_t timeSlot;
    uint8_t efect;
    uint16_t value;
};

struct Samplings {
    Sampling sampling[SAMPLING_MAX];
    uint16_t usedSamplingCount=0;
};

struct WifiNetworks {
    String essid="";
    int32_t rssi;
    int32_t channel;
    uint8_t enc;
    bool exist=false;
};

union Unixtime {
    uint32_t time;
    byte btime[4];
};

struct VersionInfo {
	uint16_t mainModule;        //LSB main, MSB subversion
	uint16_t slaveModule;      //LSB main, MSB subversion
};

extern struct VersionInfo versionInfo;
extern struct Samplings samplings;

extern struct Config config;
extern struct WifiNetworks wifinetworks[];

extern union Unixtime unixtime;

extern bool shouldReconnect;
extern bool shouldReboot;
extern byte modulesCount;

extern const char* str_wifistatus[];
extern const char* str_wifimode[];
extern const char* str_wifiauth[];
extern const char* str_timestatus[];

extern int8_t modulesTemperature;

enum t_changed  {NONE, LED, MANUAL, TIME, TIME_CONFIG, WIFI, IP, LANG, VERSIONINFO, TEMPERATUREINFO} ;

extern t_changed changed;
extern uint8_t lang;
extern uint8_t modulesCount;
extern uint8_t mode;

extern int dstOffset[];
extern bool syncTime;
extern const char *str_lang[4];

#define LOW_BYTE(x)        	(x & 0xff)
#define HIGH_BYTE(x)       	((x >> 8) & 0xff)

extern String inputString;
extern boolean stringComplete;
extern bool incomingLedValues;

extern const uint16_t coreVersion;

const uint16_t port = 328;

bool saveSamplingStruct(String filename);
bool loadSamplingStruct(String filename,Samplings *s );

int8_t readTemperature();
void sendValToSlave();

class SamplingJsonListener: public JsonListener {
  public:
    virtual void whitespace(char c);
    virtual void startDocument();
    virtual void key(String key);
    virtual void value(String value);
    virtual void endArray();
    virtual void endObject();
    virtual void endDocument();
    virtual void startArray();
    virtual void startObject(); 
};



#endif /* common_h */
