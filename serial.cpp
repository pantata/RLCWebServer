//
//  serial.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 15.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71

#include <Esp.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <MyTime.h>

extern "C" {
#include "user_interface.h"
}

#include "common.h"
#include "sampling.h"
#include "serial.h"

bool noSerError = true;

static ETSTimer commsTimeout;

static void serialCommsTimeout(void *){
	noSerError = false;
}

static void setTimeout(int t=1000){
  os_timer_disarm(&commsTimeout);
  os_timer_setfn(&commsTimeout, serialCommsTimeout, NULL);
  os_timer_arm(&commsTimeout, t, 0);
}

bool waitForRespond() {
	int incoming = 0;
	uint8 respond[8];

	setTimeout();
	while (noSerError) {
	    while (Serial.available()) {
	    	respond[incoming++] = (char)Serial.read();
			if (incoming >= 2) {
				os_timer_disarm(&commsTimeout);
				return (respond[0] == 0x14 && respond[1] == 0x10);
			}
	    }
	    delay(1);
	}
	DEBUG_MSG("No respond\n");
	os_timer_disarm(&commsTimeout);
	noSerError = true;
	return false;
}

uint16_t crc16_update(uint16_t crc, uint8_t a) {
  int i;

  crc ^= a;
  for (i = 0; i < 8; ++i)
  {
    if (crc & 1)
      crc = (crc >> 1) ^ 0xA001;
    else
      crc = (crc >> 1);
  }

  return crc;
}

uint16_t checkCrc(char *data) {
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


bool sendSerialPacket(char *data) {
	uint16_t crc = getCrc(data);
    data[6] = LOW_BYTE(crc);
	data[7] = HIGH_BYTE(crc);
	Serial.write(data,8);
	if (waitForRespond() == false) {
	    Serial.flush();
	    return 1;
	}
	memset(data,0,8);
	return 0;
}

void uartGetPing() {
	char tmpbuff[9] = PING_OK;
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    waitForRespond();
    Serial.flush();
}

void uartIsChanged() {
	char tmpbuff[9];
	sprintf(tmpbuff,CHANGE_OK,changed);
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    waitForRespond();
    Serial.flush();
}

void uartGetTime() {  // get time
	char tmpbuff[9];
	unixtime.time = now();

	if (config.useDST) {
		Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
		unixtime.time = tzlocal.toLocal(now());
	}
	sprintf(tmpbuff,TIME_OK,timeStatus(),unixtime.btime[0],unixtime.btime[1],unixtime.btime[2],unixtime.btime[3]);
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    waitForRespond();
    Serial.flush();
	DEBUG_MSG("Time: %c %02x %02x %02x %02x 000\n",timeStatus()+48,unixtime.btime[0],unixtime.btime[1],unixtime.btime[2],unixtime.btime[3]);
}

void uartGetConfig(String data) {
 // prvni char je command
 //	druhy char je pocet modulu
 // 3 .. 6 je unixtime z RTC
 //
 // jako odpoved vratime nastaveni z config file
 // timeout Displeje 1 byte
 // timeout	menu  1 byte
 // index formatu data a casu 1 byte
 // dst 1 byte
 //
 /* Format odpovedi:
  *      hlavicka: command, delka, kontrolni soucet
  *      nasleduji data paketech
  *      8 byte paket, 7 byte data, 1 byte kontrolni soucet
  *      vse doplneno na delku 8 char
  *  napr:
  *  3 0 4 0 0 0 0 X
  *  255 255 6 1 0 0 0 X
  *
  */
  char tmpbuff[9] =  {0,0,0,0,0,0,0,0};
  char databuff[8] = {0,0,0,0,0,0,0,0};
  //nejdrive hlavicka
  tmpbuff[0] = 3; //typ odpovedi
  tmpbuff[1] = 6; //delka dat, minimalni delka paketu dat je 6 byte
  tmpbuff[2] = 0;
  uint16_t crc = getCrc(tmpbuff);
  tmpbuff[6] = LOW_BYTE(crc);
  tmpbuff[7] = HIGH_BYTE(crc);
  Serial.write(tmpbuff,8);
  if (waitForRespond() == false) {
	  Serial.flush();
	  return;
  }
  //vlastni data
  databuff[0] = config.lcdTimeout; //timeout lcd
  databuff[1] = config.menuTimeout; //timeout menu
  databuff[2] = config.dtFormat; //format date
  databuff[3] = config.tmFormat; //format time
  databuff[4] = config.useDST; //useDST
  crc = getCrc(databuff);
  databuff[6] = LOW_BYTE(crc);
  databuff[7] = HIGH_BYTE(crc);

  Serial.write(databuff,8);
  waitForRespond();

  //nactena data zpracujeme
  timeStatus_t ts = timeStatus();
  modulesCount=(byte) data.charAt(1);

  if ((ts == timeNotSet) || (ts == timeNeedsSync)) {
	  //set time from AVR RTC
	  unixtime.btime[0] = data.charAt(2);
	  unixtime.btime[1] = data.charAt(3);
	  unixtime.btime[2] = data.charAt(4);
	  unixtime.btime[3] = data.charAt(5);
	  setTime(unixtime.time);
  }
}


void sendLedVal() {
	unsigned long startTime = millis();

	char tmpbuff[9] =  {0,0,0,0,0,0,0,0};
	char databuff[8] = {0,0,0,0,0,0,0,0};

	uint8_t b = 0;
	int c = 0;
	int LEN = MAX_MODULES * 7 * sizeof(uint16_t);
	//224 byte
	tmpbuff[0] = config.manual?12:10; //typ odpovedi
	tmpbuff[1] = LOW_BYTE(LEN); //delka dat
	tmpbuff[2] = HIGH_BYTE(LEN);
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
	Serial.write(tmpbuff,8);
	if (waitForRespond() == false) {
	  Serial.flush();
	  return;
	}
	for (int x=0;x<MAX_MODULES;x++) {
		for (int i=0;i<7;i++) {
			if (b > 5) { //calc crc, send
				crc = getCrc(databuff);
				databuff[6] = LOW_BYTE(crc);
				databuff[7] = HIGH_BYTE(crc);
				Serial.write(databuff,8);
				if (waitForRespond() == false) {
				  Serial.flush();
				  return;
				}
				memset(databuff,0,8);
				b = 0;
				c++;
			}
			if (config.manual) {
				databuff[b] = LOW_BYTE(config.manualValues[x][i]);
				databuff[b+1] = HIGH_BYTE(config.manualValues[x][i]);
			} else {
				int v = getSamplingValue(x+1,i+1);
				//DEBUG_MSG("%02x%02x ",LOW_BYTE(v), HIGH_BYTE(v));
				databuff[b] = LOW_BYTE(v);
				databuff[b+1] = HIGH_BYTE(v);
			}
			b=b+2;
		}
		//DEBUG_MSG("\n");
	}
	c++;
	crc = getCrc(databuff);
	databuff[6] = LOW_BYTE(crc);
	databuff[7] = HIGH_BYTE(crc);
	Serial.write(databuff,8);
	waitForRespond();
	Serial.flush();
	startTime =  millis() - startTime;
	DEBUG_MSG("\nTIME:%ld\n",startTime);
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
    DEBUG_MSG("current time is %d.%d.%d %d:%d:%d\n",day(),month(),year(),hour(),minute(),second());
}

void getNetValues(String data) {
	  char tmpbuff[9] =  {0,0,0,0,0,0,0,0};
	  char databuff[8] = {0,0,0,0,0,0,0,0};
	  //nejdrive hlavicka
	  tmpbuff[0] = 14; //typ odpovedi
	  //4 byte IP + delka ssid + delka pwd ...
	  uint8_t LEN = (4 + 1) + (config.appwd.length +1) + (config.appwd.length + 1);
	  tmpbuff[1] = LOW_BYTE(LEN); //delka dat
	  tmpbuff[2] = HIGH_BYTE(LEN);

	  if (sendSerialPacket(tmpbuff)) return;

	  //vlastni data
	  databuff[0] = 0; //ip1
	  databuff[1] = 0; //ip2
	  databuff[2] = 0; //ip3
	  databuff[3] = 0; //ip4
	  databuff[4] = 0; //reserved
	  if (sendSerialPacket(databuff)) return;

	  uint8_t b = 0;
	  //ssid
	  for ( uint8_t i = 0; i<config.ssid.length; i++) {
		  if (b > 5) {
			  if (sendSerialPacket(databuff)) return;
			  b = 0;
		  }
		  databuff[b] = config.ssid.charAt(i);
		  b = b + 1;
	  }
	  databuff[b] = 0; //oddelovac
	  b++;
	  //pwd
	  for ( uint8_t i = 0; i<config.pwd.length; i++) {
		  if (b > 5) {
			  //send paket
			  if (sendSerialPacket(databuff)) return;
			  b = 0;
		  }
		  databuff[b] = config.pwd.charAt(i);
		  b = b + 1;
	  }


	  //zbytek, na konci je vzdy 0
	  if (b > 5) {
		  if (sendSerialPacket(databuff)) return;
		  databuff[0] = 0;
		  if (sendSerialPacket(databuff)) return;
	  } else {
		  databuff[b] = 0;
		  if (sendSerialPacket(databuff)) return;
	  }

}

void setManual(String data) {
	config.manual = (byte) data.charAt(1);
	changed = MANUAL;
	//receive 16*7*2 bytes from serial
	char inChar[2];
	if (config.manual) {
		incomingLedValues = true;
	} else {
		incomingLedValues = false;
	}
	char tmpbuff[9] = PING_OK;
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    Serial.flush();
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
    
    v.value16=getSamplingValue(module,channel);
#ifdef DEBUG
    
    Serial.printf("%c%c\n",v.value8[0]+48,v.value8[1]+48);
#else
    Serial.printf("%c%c",v.value8[0],v.value8[1]);
#endif
    
}

void saveManualLedValues(char chr) {
	static uint8_t count = 0, b = 0;
	uint8_t x=0, y=0;

	static union Lv {
		char c[2];
		uint16_t l;
	} lv;

	lv.c[b] = chr;

	count++;
	b++;

	if (b >= 1) {
		x = count%16;
		y = count - (x*16);
		config.manualValues[x][y] = lv.l;
		b = 0;
		lv.l = 0;
	}

	if (count >= (16*7*2)) {
		count = 0; b = 0; lv.l = 0;
		incomingLedValues = false;
	}
}
