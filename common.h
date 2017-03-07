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

#include "tz.h"

#define DEBUG 1

#ifdef DEBUG
#include <SoftwareSerial.h>

extern SoftwareSerial DEBUGSER;

#define DEBUG_MSG(...) DEBUGSER.printf(__VA_ARGS__)
//#define PRINT_CONFIG(c) for(;0;)
#define PRINT_CONFIG(...) DEBUGSER.printf("HEAP = %d\n",ESP.getFreeHeap())
#else
#define DEBUG_MSG(fmt, ...) for(;0;)
#define PRINT_CONFIG(c) for(;0;)
#endif

#define BAUD_RATE 250000
#define BAUD_RATE_A 115200

#define PING '0'/*char(255) */
#define GETCHANGE '1' /*char(1) */
#define GETTIME '2'/* char(2) */
#define GETCONFIG '3'/* char(3) */
#define GETLEDVALUES '4'/* char(4) */
#define GETNETVALUES '5'/* char(5) */
#define SETMANUAL '6'/* char(6) */
#define CODE61 '1'
#define CODE9 '9'/* char(9) */
#define BREAK '\n'

#define PING_OK   "\x0OK\x0\x0\x0\x0\x0"
#define CHANGE_OK "\x1%c\x0\x0\x0\x0\x0\x0"
#define TIME_OK   "\x2%c%c%c%c%c\x0\x0"
#define _OK       "\x0OK\x0\x0\x0\x0\x0"


#define constrain(amt,low,high) ((amt)<(low)?(low):((amt)>(high)?(high):(amt)))
#define MAX_PWM 1024
#define MAX_MODULES 16

#define AP_IP   String("192.168.4.1")
#define AP_MASK String("255.255.255.0")
#define HOSTNAME String("NEREUS") + String(ESP.getChipId(), HEX);
#define DNS_PORT 53
#define TIMESERVER "pool.ntp.org"

#define WIFITIMEOUT  15
#define SAMPLING_MAX 896 //max 8 bodu na kanal
#define SAMPLING_UINT8_MAX_VALUE 255
#define TIMEDELAY 10UL

#ifdef DEBUG
#define NTPSYNCINTERVAL  3600
#else
#define NTPSYNCINTERVAL  60
#endif

#define WAIT_FOR_WIFI 10000
#define WIFI_RETRY_COUNT 3
#define WIFI_RETRY 5000

#define LEDAUTO    0
#define LEDMANUAL  1

struct Config {
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
    uint8_t lcdTimeout;
    uint8_t menuTimeout;
    bool manual;
    uint8_t lang;
    uint16_t manualValues[MAX_MODULES][7];
};

//var dateFormat = ["DD.MM.YY","DD/MM/YY","DD-MM-YY","YY/MM/DD","YY-MM-DD"];
//var timeFormat = ["HH:MI:SS P","HH.MI:SS P","HH24:MI:SS","HH24.MI:SS","HH:MI P","HH.MI P","HH24:MI","HH24.MI"];

struct Sampling {
    uint8_t modul;   //4bit TODO: sloucit
    uint8_t channel; //4bit
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
} ;

union Unixtime {
    uint32_t time;
    byte btime[4];
};

extern struct Samplings samplings;

extern struct Config config;
extern struct WifiNetworks wifinetworks[];

extern union Unixtime unixtime;

extern bool shouldReconnect;
extern bool shouldReboot;
extern byte modulesCount;
extern bool arduinoFlash;

extern const char* str_wifistatus[];
extern const char* str_wifimode[];
extern const char* str_wifiauth[];
extern const char* str_timestatus[];

enum t_changed  {NONE, LED, MANUAL, TIME, WIFI, IP, LANG} ;

extern t_changed changed;
extern uint8_t lang;
extern uint8_t modulesCount;
extern uint8_t mode;

extern int dstOffset[];
extern bool syncTime;
extern const char *str_lang[4];

#define LOW_BYTE(x)        	(x & 0xff)
#define HIGH_BYTE(x)       	((x >> 8) & 0xff)



#endif /* common_h */
