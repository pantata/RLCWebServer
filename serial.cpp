//
//  serial.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 15.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version    v0.1-4-gb551a72

#include <Esp.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <MyTime.h>

#include "common.h"
#include "sampling.h"
#include "serial.h"


void process255()
{
    Serial.print(CODE255_RETURN_OK);
}

void process1()
{
#ifdef DEBUG
    Serial.printf("%c\n",changed+48);
#else
    Serial.printf("%c",changed);
#endif
}

void process2()
{
    /*WiFi.softAP(ssid, password);*/
    if (/*ESP.eraseConfig()*/true)
    {
        WiFi.softAP(config.hostname.c_str(),config.pwd.c_str());
        DEBUG_MSG("%s","Wifi AP has been reset");
    }
    IPAddress myIP=WiFi.softAPIP();
    
#ifdef DEBUG
    Serial.println("Wifi AP set");
    Serial.print(WiFi.SSID());
    Serial.printf("0%d.%d.%d.%d\n",myIP[0],myIP[1],myIP[2],myIP[3]);
#else
    Serial.print(WiFi.SSID());
    Serial.printf("0%c%c%c%c",myIP[0],myIP[1],myIP[2],myIP[3]);
#endif
    
}

void process3()
{
#ifdef DEBUG
    Serial.printf("%c\n",lang+48);
#else
    Serial.printf("%c",lang);
#endif
    
}

void process4()
{
	unixtime.time=(uint32_t)hour()*3600+(uint32_t)minute()*60+(uint32_t)second();
    if (config.useDST)
    {
    	Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
    	time_t ct=tzlocal.toLocal(unixtime.time);
    	unixtime.time=ct;

    }

#ifdef DEBUG
    Serial.printf("%c%c%c%c\n",unixtime.btime[0]+48,unixtime.btime[1]+48,unixtime.btime[2]+48,unixtime.btime[3]+48);
#else
    Serial.printf("%c%c%c%c\n",unixtime.btime[0],unixtime.btime[1],unixtime.btime[2],unixtime.btime[3]);
#endif
    DEBUG_MSG("current time is %d.%d.%d %d:%d:%d\n","false",day(),month(),year(),hour(),minute(),second());
}

void process5(String data)
{
    modulecount=(byte) data.charAt(1);
    
#ifdef DEBUG
    modulecount-=48;
    Serial.printf("%c\n",modulecount+48);
#else
    Serial.printf("%c",modulecount);
#endif
    
}

void process6(String data)
{
    /* Serial.printf("data length=%d\n",data.length());*/
    if (data.length()<=3&&data.charAt(1)==BREAK)
    {
#ifdef DEBUG
        Serial.printf("%c\n",mode+48);
#else
        Serial.printf("%c",mode);
#endif
    }
    else
    {
        if (data.charAt(1)==CODE61)
        {
            mode=(byte) data.charAt(2);
            
#ifdef DEBUG
            Serial.printf("%c\n",mode+48);
#else
            Serial.printf("%c",mode);
#endif
            
        }
    }
}

void process9(String data)
{
    byte module=(byte) data.charAt(1);
    byte channel=(byte) data.charAt(2);
#ifdef DEBUG
    module-=48;
    channel-=48;
#endif
    
    union {
        uint16_t value16;
        uint8_t value8[2];
    } v;
    
    /*byte *out=getChannelValue(module,channel);*/
    
    v.value16=getSamplingValue(module,channel,TIMEDELAY);
#ifdef DEBUG
    
    Serial.printf("%c%c\n",v.value8[0]+48,v.value8[1]+48);
#else
    Serial.printf("%c%c",v.value8[0],v.value8[1]);
#endif
    
}
