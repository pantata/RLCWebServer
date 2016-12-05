//
//  common.h
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-1-g519ac0c

#ifndef common_h
#define common_h

#include "tz.h"

#define DEBUG 1

#ifdef DEBUG
#define DEBUG_MSG(fmt, ...) Serial.printf(fmt, __VA_ARGS__)
//#define PRINT_CONFIG(c) for(;0;)
#define PRINT_CONFIG(c) Serial.printf("Config  ssid=%s,pwd=%s,hostname=%s,wifimode=%d,ntpServer=%s,localPort=%d,useNtp=%d,profileFileName=%s,wifidhcp=%d,wifiip=%s,wifimask=%s,wifigw=%s,wifidns1=%s,wifidns2=%s,appwd=%s,apchannel=%d,apip=%s,apmask=%s,apgw=%s,useDST=%d,tzRule.tzName=%s,tzRule.dstStart.day=%d, tzRule.dstStart.month=%d,tzRule.dstStart.hour=%d,tzRule.dstStart.offset=%d,tzRule.dstStart.week=%d,tzRule.dstEnd.day=%d,tzRule.dstEnd.month=%d,tzRule.dstEnd.hour=%d,tzRule.dstEnd.offset=%d,tzRule.dstEnd.week=%d, HEAP=%d\n",c.ssid.c_str(),c.pwd.c_str(),c.hostname.c_str(),c.wifimode,c.ntpServer.c_str(),c.localPort,c.useNtp,c.profileFileName.c_str(),c.wifidhcp,c.wifiip.c_str(),c.wifimask.c_str(),c.wifigw.c_str(),c.wifidns1.c_str(),c.wifidns2.c_str(),c.appwd.c_str(),c.apchannel,c.apip.c_str(),c.apmask.c_str(),c.apgw.c_str(),c.useDST,c.tzRule.tzName.c_str(),c.tzRule.dstStart.day,c.tzRule.dstStart.month,c.tzRule.dstStart.hour,c.tzRule.dstStart.offset,c.tzRule.dstStart.week,c.tzRule.dstEnd.day,c.tzRule.dstEnd.month,c.tzRule.dstEnd.hour,c.tzRule.dstEnd.offset,c.tzRule.dstEnd.week,ESP.getFreeHeap())
#else
#define DEBUG_MSG(fmt, ...) for(;0;)
#define PRINT_CONFIG(c) for(;0;)
#endif

#ifdef DEBUG

#define CODE255 '0'/*char(255) */
#define CODE1 '1' /*char(1) */
#define CODE2 '2'/* char(2) */
#define CODE3 '3'/* char(3) */
#define CODE4 '4'/* char(4) */
#define CODE5 '5'/* char(5) */
#define CODE6 '6'/* char(6) */
#define CODE61 '1'
#define CODE9 '9'/* char(9) */
#define BREAK '\n'

#define CODE255_RETURN_OK "OK\n"

#else

#define CODE255 char(255)
#define CODE1 char(1)
#define CODE2 char(2)
#define CODE3 char(3)
#define CODE4 char(4)
#define CODE5 char(5)
#define CODE6 char(6)
#define CODE61 char(1)
#define CODE9 char(9)
#define BREAK '\n'

#define CODE255_RETURN_OK char(0)
#endif

#define AP_IP   String("192.168.4.1")
#define AP_MASK String("255.255.255.0")
#define HOSTNAME String("ESP") + String(ESP.getChipId(), HEX);
#define DNS_PORT 53
#define TIMESERVER "pool.ntp.org"

#define WIFITIMEOUT  15
#define SAMPLING_MAX 896
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
};


struct Sampling {
    uint8_t modul;
    uint8_t channel;
    uint8_t timeSlot;
    uint16_t value;
    uint8_t efect;
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
extern byte modulecount;

extern const char* str_wifistatus[];
extern const char* str_wifimode[];
extern const char* str_wifiauth[];
extern const char* str_timestatus[];

extern uint8_t changed;
extern uint8_t lang;
extern uint8_t modulecount;
extern uint8_t mode;



#endif /* common_h */
