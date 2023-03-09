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
#if DEBUG > 0
    #define DEBUGSER Serial
	#define DEBUGSER_BEGIN(BAUD) DEBUGSER.begin(BAUD)
    #define DEBUG_MSG(...) DEBUGSER.printf(__VA_ARGS__)
    #define DEBUG_MSG1(fmt, ...) for(;0;)
    #define PRINT_CONFIG(...) DEBUGSER.printf("HEAP = %d\n",ESP.getFreeHeap())
#else    
    #define DEBUGSER_BEGIN(BAUD) {;}
    #define DEBUG_MSG(fmt, ...) for(;0;)
    #define PRINT_CONFIG(c) for(;0;)
#endif

#define constrain(amt,low,high) ((amt)<(low)?(low):((amt)>(high)?(high):(amt)))
#define MAX_PWM 4000
#define MAX_MODULES 1
#define CHANNELS 7

#define PEERS 16

#define STATUSLED 3   //statusled output

#define AP_IP   String("192.168.4.1")
#define AP_MASK String("255.255.255.0")
#define APPWD   "nereus"
#define MAINNAME "NEREUS"
#define HOSTNAME String("NEREUS_") + String(getChipID(), HEX)
#define DNS_PORT 53
#define TIMESERVER "pool.ntp.org"
#define CFGNAME    "/nereus.cfg"

#define fwUrlBase "http://192.168.1.82:8080/nereus/"

#define WIFITIMEOUT  15
#define SAMPLING_MAX 840 //6*12 bodu na kanal
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
#define TASK2      60000   //time sync
#define TASK3      24*60*1000   //finding fw updates 

typedef enum {
    W_DISCONNECT       =  0,
    W_CONNECTED        =  1,
    W_AP_STARTED   	   =  2
} wifi_is_connected_t;

struct esp_now_peer_info_t {
	uint8_t mac[6];
};


struct Config {
    uint16_t version;
    String ssid; // par ssid
    String pwd;  // par pwd
    String hostname; // par apname
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
    uint8_t peersCount;
    uint8_t peerMode;
    esp_now_peer_info_t peers[PEERS];
};

//var dateFormat = ["DD.MM.YY","DD/MM/YY","DD-MM-YY","YY/MM/DD","YY-MM-DD"];
//var timeFormat = ["HH:MI:SS P","HH.MI:SS P","HH24:MI:SS","HH24.MI:SS","HH:MI P","HH.MI P","HH24:MI","HH24.MI"];

struct __attribute__((packed)) Sampling {
    uint8_t channel; 
    uint8_t timeSlot;
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
	uint16_t slaveModule[4];      //LSB main, MSB subversion
};


extern int16_t ledValue[];
extern struct VersionInfo versionInfo;
extern struct Samplings samplings;

extern struct Config config;
extern struct WifiNetworks wifinetworks[];

extern union Unixtime unixtime;

extern bool isWifiClient;
extern bool shouldReconnect;
extern bool shouldReboot;
//extern byte modulesCount;

extern const char* str_wifistatus[];
extern const char* str_wifimode[];
extern const char* str_wifiauth[];
extern const char* str_timestatus[];

extern int8_t moduleTemperature[];

enum t_changed  {NONE, CONFIG, LED, WIFI, RESET, AVRUPDATE, SEARCHPEERS, CONFIRMPEERS, UPDATE} ;

extern t_changed changed;
extern uint8_t lang;
extern uint8_t modulesCount;
extern uint8_t mode;
extern uint8_t peersCount;
extern const int dstOffset[];
extern bool syncTime;
extern const char *str_lang[4];
extern bool isUpdateAvailable;

#define LOW_BYTE(x)        	(x & 0xff)
#define HIGH_BYTE(x)       	((x >> 8) & 0xff)

/*
extern String inputString;
extern boolean stringComplete;
extern bool incomingLedValues;
*/
extern const uint16_t coreVersion;
const uint16_t port = 328;

//bool saveSamplingStruct(String filename);
//bool loadSamplingStruct(String filename,Samplings *s );

void readTemperature();
void sendValToSlave();
uint8_t searchPeers();
int managePeers(bool state, uint8_t *mac = nullptr);
void removeFromPeers(uint8_t *mac);
void checkForFwUpdate();

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
