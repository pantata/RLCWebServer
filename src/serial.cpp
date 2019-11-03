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
	Serial.flush();
	waitForRespond();
	memset(data,0,8);
	return 0;
}

void uartGetPing() {
	char tmpbuff[9] = PING_OK;
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    Serial.flush();
    waitForRespond();
}

void uartIsChanged() {
	char tmpbuff[9];
	sprintf(tmpbuff,CHANGE_OK,changed);
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    Serial.flush();
    waitForRespond();
}

void uartSendTime() {  // get time
	char tmpbuff[9];
	unixtime.time = now();

	if (config.useDST) {
		Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
		unixtime.time = tzlocal.toLocal(now());
	} else {
		unixtime.time = now() + (config.tzRule.dstEnd.offset*60);
	}
	sprintf(tmpbuff,TIME_OK,timeStatus(),unixtime.btime[0],unixtime.btime[1],unixtime.btime[2],unixtime.btime[3]);
	uint16_t crc = getCrc(tmpbuff);
	tmpbuff[6] = LOW_BYTE(crc);
	tmpbuff[7] = HIGH_BYTE(crc);
    Serial.write(tmpbuff,8);
    Serial.flush();
    waitForRespond();
	DEBUG_MSG("Time: %c %02x %02x %02x %02x 000\n",timeStatus()+48,unixtime.btime[0],unixtime.btime[1],unixtime.btime[2],unixtime.btime[3]);
}

void uartSendTimeConfig() {
	  char tmpbuff[8] =  {0,0,0,0,0,0,0,0};
	  char databuff[8] = {0,0,0,0,0,0,0,0};
	  //nejdrive hlavicka
	  tmpbuff[0] = 3; //typ odpovedi
	  tmpbuff[1] = 6; //delka dat, minimalni delka paketu dat je 6 byte
	  tmpbuff[2] = 0;
	  uint16_t crc = getCrc(tmpbuff);
	  tmpbuff[6] = LOW_BYTE(crc);
	  tmpbuff[7] = HIGH_BYTE(crc);
	  Serial.write(tmpbuff,8);
	  Serial.flush();
	  if (waitForRespond() == false) return;

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
	  Serial.flush();
	  waitForRespond();
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
  char tmpbuff[8] =  {0,0,0,0,0,0,0,0};
  char databuff[8] = {0,0,0,0,0,0,0,0};
  //nejdrive hlavicka
  tmpbuff[0] = 3; //typ odpovedi
  tmpbuff[1] = 6; //delka dat, minimalni delka paketu dat je 6 byte
  tmpbuff[2] = 0;
  uint16_t crc = getCrc(tmpbuff);
  tmpbuff[6] = LOW_BYTE(crc);
  tmpbuff[7] = HIGH_BYTE(crc);
  Serial.write(tmpbuff,8);
  Serial.flush();
  if (waitForRespond() == false) return;

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
  Serial.flush();
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
	  //prevod na UTC
		if (config.useDST) {
			Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
			unixtime.time = tzlocal.toUTC(unixtime.time);
		}
	  setTime(unixtime.time);
  }
}


void sendLedVal() {
	unsigned long startTime = millis();

	char tmpbuff[8] =  {0,0,0,0,0,0,0,0};
	char databuff[8] = {0,0,0,0,0,0,0,0};

	uint8_t b = 0;
	int c = 0;
	int LEN = MAX_MODULES * 7 * sizeof(uint16_t);
	//224 byte
	tmpbuff[0] = config.manual?12:10; //typ odpovedi
	tmpbuff[1] = LOW_BYTE(LEN); //delka dat
	tmpbuff[2] = HIGH_BYTE(LEN);
	sendSerialPacket(tmpbuff);
	//uint16_t crc = getCrc(tmpbuff);
	//tmpbuff[6] = LOW_BYTE(crc);
	//tmpbuff[7] = HIGH_BYTE(crc);
	//Serial.write(tmpbuff,8);
	//Serial.flush();
	//if (waitForRespond() == false) {
	  //return;
	//}
	for (int x=0;x<MAX_MODULES;x++) {
		for (int i=0;i<7;i++) {
			if (b > 5) { //calc crc, send

				sendSerialPacket(databuff);
				//crc = getCrc(databuff);
				//databuff[6] = LOW_BYTE(crc);
				//databuff[7] = HIGH_BYTE(crc);
				//Serial.write(databuff,8);
				//Serial.flush();
				//if (waitForRespond() == false) {
				  //return;
				//}
				//memset(databuff,0,8);
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
	sendSerialPacket(databuff);
	//crc = getCrc(databuff);
	//databuff[6] = LOW_BYTE(crc);
	//databuff[7] = HIGH_BYTE(crc);
	//Serial.write(databuff,8);
	//Serial.flush();
	//waitForRespond();

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

void uartGetVersionInfo() {
	char tmpbuff[8] =  {0,0,0,0,0,0,0,0};
	tmpbuff[0] = 25; //typ zpravy
	sendSerialPacket(tmpbuff);
}

void uartGetTemperatureInfo() {
	char tmpbuff[8] =  {0,0,0,0,0,0,0,0};
	tmpbuff[0] = 22; //typ zpravy
	sendSerialPacket(tmpbuff);
}

void uartSendNetValues() {
	  char tmpbuff[8] =  {0,0,0,0,0,0,0,0};
	  char databuff[8] = {0,0,0,0,0,0,0,0};
	  //nejdrive hlavicka
	  tmpbuff[0] = 14; //typ odpovedi
	  //4 byte IP + delka ssid + delka pwd ...
	  uint8_t dt_len = 4 + 2 + config.ssid.length() + 1 +config.hostname.length() + 1 + config.appwd.length() + 1;
	  tmpbuff[1] = LOW_BYTE(dt_len); //delka dat
	  tmpbuff[2] = HIGH_BYTE(dt_len);

	  sendSerialPacket(tmpbuff);

	  //vlastni data
	  //nejdrive IP adresa, 6byte +kontrolni soucet
	  IPAddress addr;
	  if (WiFi.getMode() == WIFI_AP)
		  addr = WiFi.softAPIP();
	  else
		  addr = WiFi.localIP();
	  databuff[0] = addr[0];
	  databuff[1] = addr[1]; //ip2
	  databuff[2] = addr[2]; //ip3
	  databuff[3] = addr[3]; //ip4
	  databuff[4] = 0xff; //reserved
	  databuff[5] = 0xff; //reserved
	  sendSerialPacket(databuff);

	  //ssid a pwd
	  uint8_t b = 0;
	  for ( uint8_t i = 0; i<WiFi.hostname().length(); i++) {
	  		  if (b > 5) {
	  			  if (sendSerialPacket(databuff)) return;
	  			  b = 0;
	  		  }
	  		  databuff[b] = WiFi.hostname().charAt(i);
	  		  b = b + 1;
	  }
	  databuff[b] = 0xff; //oddelovac
	  b++;
	  for ( uint8_t i = 0; i<WiFi.psk().length(); i++) {
		  if (b > 5) {
			  if (sendSerialPacket(databuff)) return;
			  b = 0;
		  }
		  databuff[b] = WiFi.psk().charAt(i);
		  b = b + 1;
	  }
	  databuff[b] = 0xff; //oddelovac
	  b++;
	  for ( uint8_t i = 0; i<WiFi.SSID().length(); i++) {
		  if (b > 5) {
			  if (sendSerialPacket(databuff)) return;
			  b = 0;
		  }
		  databuff[b] = WiFi.SSID().charAt(i);
		  b = b + 1;
	  }


	  //zbytek, na konci je vzdy 0
	  if (b > 5) {
		  sendSerialPacket(databuff);
		  databuff[0] = 0;
		  sendSerialPacket(databuff);
	  } else {
		  databuff[b] = 0;
		  sendSerialPacket(databuff);
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
	waitForRespond();

}

/*
 * Precte verze slave modulu a master modulu
 */
void setVersionInfo(String data) {
    static uint8_t i = 0;

    if (i == 0) {
    		versionInfo.mainModule = (data.charAt(1) << 8) |  data.charAt(2);
    		i++;
    		return;
    }

    versionInfo.slaveModules[i-1] = (data.charAt(1) << 8) |  data.charAt(2);
    versionInfo.slaveModules[i] = (data.charAt(3) << 8) |  data.charAt(4);
    i=i+2;

    if (i > 15) i = 0;
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

//TODO:info o teplote
void processTemperature(String data) {
	 static uint8_t i = 0;
	 modulesTemperature[i] = data.charAt(1);
	 modulesTemperature[i+1] = data.charAt(2);
	 modulesTemperature[i+2] = data.charAt(3);
	 modulesTemperature[i+3] = data.charAt(4);
	 i = i + 4;

	 if (i > 15) i = 0;
}

void processIncomingSerial() {

        switch(inputString.charAt(0)) {
            case PING: uartGetPing(); break;
            case GETCHANGE:   uartIsChanged(); break;
            case GETTIME:   uartSendTime(); break;
            case GETCONFIG:   uartGetConfig(inputString); break;
            case GETLEDVALUES:   sendLedVal(); break;
            case GETNETVALUES:   uartSendNetValues(); break;
            case SETMANUAL:   setManual(inputString); break;
            case GETVERSION:   setVersionInfo(inputString); break;
            case TEMPERATURE: processTemperature(inputString); break;
            default:
            	DEBUG_MSG("default -%x-\n",inputString.charAt(0));
            break;

        }
        DEBUG_MSG("String input : %s\n",inputString.c_str());
        //Serial.flush();
}
