//
//  arduinoUpdate.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 8.12.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71
//
// STK500 implementation
// read bin file from SPIFS and programming avr over serial
//


#include <FS.h>
#include "avrUpdate.h"

#include "common.h"
extern "C" {
#include "user_interface.h"
}

static uint8 rcvBuffer[ARDUINO_PAGE_SIZE + 20];
static uint8 rcvBufferCounter = 0;

uint8_t pageBuffer[ARDUINO_PAGE_SIZE];
arduinoUpdateState_t avrUpdateState;

static ETSTimer commsTimeout;

int errCount = 0;

void arduinoCommsTimeout(void *){
  avrUpdateState.state = TIMEOUT;
  rcvBufferCounter = 0;
  if (avrUpdateState.fwFile) avrUpdateState.fwFile.close();
  avrUpdateState.in_progress = false;
  DEBUG_MSG("handle IDLE, ERROR, TIMEOUT and other\n");
}

static void setTimeout(int t=5000){
  //Schedule disconnect/connect
  os_timer_disarm(&commsTimeout);
  os_timer_setfn(&commsTimeout, arduinoCommsTimeout, NULL);
  os_timer_arm(&commsTimeout, t, 0);
}

void  arduinoConnect(void *){
  if(avrUpdateState.state == CONNECT){
    // Send the "connect" command
    // '0 '
    DEBUG_MSG("Connecting...");
    Serial.write("0 ");

    //Schedule another attempt if it's not ready yet
    os_timer_disarm(&commsTimeout);
    os_timer_setfn(&commsTimeout, arduinoConnect, NULL);
    os_timer_arm(&commsTimeout, 300, 0);
  }else{
    os_timer_disarm(&commsTimeout);
  }
}

void  arduinoLoadAddress(int addr){
  // Send the "load address" command
  // U
  // addr >> 1 & 0xFF
  // (addr >> 9) & 0xFF
  // ' '
  uint8 temp[] = "U\0\0 ";
  temp[1] = (addr >> 1) & 0xFF;
  temp[2] = (addr >> 9) & 0xFF;
  Serial.write(temp, 4);
}

void arduinoProgramPage(uint8 * data, int len){
  // Send the "program page" command
  // d
  // len & 0xFF
  // (len >> 8) & 0xFF
  // 'F'
  // data
  // ' '
  uint8 temp[] = "d\0\0F";
  temp[1] = (len >> 8) & 0xFF;
  temp[2] = len & 0xFF;
  Serial.write(temp, 4);
  Serial.write(data, len);
  Serial.write(" ");
}

void arduinoReadPage(int len){
  // Send the "read page" command
  // t
  // len & 0xFF
  // (len >> 8) & 0xFF
  // 'F '
  uint8 temp[] = "t\0\0F ";
  temp[1] = (len >> 8) & 0xFF;
  temp[2] = len & 0xFF;
  Serial.write(temp, 5);
}

void avrReset(){
  // Causes a delay to reset the Arduino
  DEBUG_MSG("Reset");
  digitalWrite(ARDUINO_RESET_PIN,LOW);
  delay(50);
  digitalWrite(ARDUINO_RESET_PIN,HIGH);
  DEBUG_MSG("Reset OK\n");
}

void  arduinoUpdate(){
  int addr;
  switch (avrUpdateState.state){
  case CONNECT:
    //connect to the arduino
	DEBUG_MSG("CONNECT\n");
    arduinoConnect(NULL);
    break;
  case LOAD_PROG_ADDRESS:
    //load address
    addr = avrUpdateState.page * ARDUINO_PAGE_SIZE;
    DEBUG_MSG("LOAD_PROG_ADDRESS %d\n",addr);
    arduinoLoadAddress(addr);
    break;
  case PROGRAM_PAGE:
    //program page
	//clear buffer
	memset(pageBuffer,0xff,ARDUINO_PAGE_SIZE);
	//read page from firmware file
	avrUpdateState.fwFile.readBytes((char*)pageBuffer, ARDUINO_PAGE_SIZE );
	DEBUG_MSG("PROGRAM_PAGE:");
	for (int i = 0; i<ARDUINO_PAGE_SIZE; i++) {
		DEBUG_MSG("%02x ",pageBuffer[i]);
	}
	DEBUG_MSG("\nEND PROGRAM_PAGE\n");
    arduinoProgramPage(pageBuffer, ARDUINO_PAGE_SIZE);
    break;
  case LOAD_READ_ADDRESS:
    //load address
    addr = avrUpdateState.page * ARDUINO_PAGE_SIZE;
    DEBUG_MSG("LOAD_READ_ADDRESS %d\n", addr);
    arduinoLoadAddress(addr);
    break;
  case READ_PAGE:
    //read page
	DEBUG_MSG("READ_PAGE\n");
    arduinoReadPage(ARDUINO_PAGE_SIZE);
    break;
  case IDLE:
	  DEBUG_MSG("IDLE\n");
    return;
  }
}


bool  arduinoBeginUpdate(){


  //test firmware file

  avrUpdateState.fwFile = SPIFFS.open("/firmware.bin", "r");
  if (!avrUpdateState.fwFile) {
	  DEBUG_MSG("Failed to open fw file\n");
	  avrUpdateState.state = ERROR;
	  return false;
  }
  uint16_t x = avrUpdateState.fwFile.size();
  avrUpdateState.pagesmax = (x + ARDUINO_PAGE_SIZE - 1) / ARDUINO_PAGE_SIZE;
  //avrUpdateState.pagesmax = (x % ARDUINO_PAGE_SIZE) ? x / ARDUINO_PAGE_SIZE + 1 : x / ARDUINO_PAGE_SIZE;
  DEBUG_MSG("FW file open, size: %d, pages %d\n",avrUpdateState.fwFile.size(), avrUpdateState.pagesmax);

  if( avrUpdateState.state == IDLE ) {

	//DEBUG_MSG("Set serial 115200\n");
	Serial.flush();
	delay(5);
    Serial.end();
    delay(5);
	Serial.begin(BAUD_RATE_A);

	DEBUG_MSG("Last state IDLE\n");
    avrUpdateState.page = 0;
    avrUpdateState.state = CONNECT;
    avrUpdateState.in_progress = true;
    //toggle the reset pin
    avrReset();
    //start the update process
    arduinoUpdate();
    return true;
  } else {
	DEBUG_MSG("Last state: %d\n",avrUpdateState.state );
    return false;
  }
}

void avrEndUpdate() {
	// Send the "leave programming mode" command
	  // q
	  // ' '
	  uint8 temp[] = "\x51\x20";
	  Serial.write(temp, 2);
}

arduinoState_t  arduinoGetStatus(){
  arduinoState_t ret;
  ret = avrUpdateState.state;
  if ((avrUpdateState.state == SUCCESS) || (avrUpdateState.state == ERROR) || (avrUpdateState.state == TIMEOUT)) avrUpdateState.state = IDLE;
  return ret;
}

bool  arduinoUpdating() {
  return avrUpdateState.in_progress;
}

int  arduinoPagesFlashed(){
  return avrUpdateState.page;
}

int  arduinoPages(){
  return avrUpdateState.pagesmax;
}

bool  okMsg(){
  return (rcvBufferCounter >= 2 && rcvBuffer[0] == 0x14 && rcvBuffer[1] == 0x10);
}

void  arduinoHandleData(uint8 incoming){
  rcvBuffer[rcvBufferCounter++] = incoming;
  // check if we have an appropriate response
  switch (avrUpdateState.state){
  case CONNECT:
	DEBUG_MSG("handle CONNECT\n");
	//timeout
	setTimeout(2000);
    if(okMsg()){
      DEBUG_MSG("handle CONNECT OK\n");
      avrUpdateState.state = LOAD_PROG_ADDRESS;
      rcvBufferCounter = 0;
      arduinoUpdate();
    }
    break;
  case LOAD_PROG_ADDRESS:
	  setTimeout();
	  DEBUG_MSG("handle LOAD_PROG_ADDRESS\n");
    if(okMsg()){
      errCount = 0;
      avrUpdateState.state = PROGRAM_PAGE;
      rcvBufferCounter = 0;
      arduinoUpdate();
    }
    break;
  case PROGRAM_PAGE:
	  setTimeout();
	  DEBUG_MSG("handle PROGRAM_PAGE\n");
    if(okMsg()){
      errCount = 0;
      avrUpdateState.state = LOAD_READ_ADDRESS;
      rcvBufferCounter = 0;
      arduinoUpdate();
    }
    break;
  case LOAD_READ_ADDRESS:
	  setTimeout();
    if(okMsg()){
      errCount = 0;
      DEBUG_MSG("handle LOAD_READ_ADDRESS OK\n");
      avrUpdateState.state = READ_PAGE;
      rcvBufferCounter = 0;
      arduinoUpdate();
    }
    break;
  case READ_PAGE:
	setTimeout();
    if (rcvBufferCounter >= (2 + ARDUINO_PAGE_SIZE) && rcvBuffer[0] == 20 && rcvBuffer[1 + ARDUINO_PAGE_SIZE] == 16) {
      //it's a full packet with a page worth of data, let's check it matches what's in the buffer we sent
      DEBUG_MSG("handle FULL READ_PAGE\n");
      if(memcmp(&rcvBuffer[1], &pageBuffer, ARDUINO_PAGE_SIZE) == 0){
        // it is correct
    	// its last page?
    	avrUpdateState.page++;
    	if(avrUpdateState.page >= avrUpdateState.pagesmax){
    		DEBUG_MSG("END\n");
    		rcvBufferCounter = 0;
    		avrUpdateState.state = END;
    		avrEndUpdate();
    	} else {
          avrUpdateState.state = LOAD_PROG_ADDRESS;
          rcvBufferCounter = 0;
          arduinoUpdate();
        }
      } else {
    	//ERROR
    	DEBUG_MSG("\nERROR\n");
        os_timer_disarm(&commsTimeout);
        avrUpdateState.fwFile.close();
        avrUpdateState.state = ERROR;
        rcvBufferCounter = 0;
        delay(500);
        avrReset();
      }
    }
    break;
  case END:
	  if (avrUpdateState.fwFile) avrUpdateState.fwFile.close();
	  if (okMsg()) {
		DEBUG_MSG("handle END success\n");
		rcvBufferCounter = 0;
	    avrUpdateState.state = SUCCESS;
		os_timer_disarm(&commsTimeout);
		avrUpdateState.in_progress = false;
		delay(500);
		//DEBUG_MSG("Set serial 115200\n");
		Serial.flush();
		delay(5);
	    Serial.end();
	    delay(5);
		Serial.begin(BAUD_RATE);
		avrReset();
	  } else {
		 //TODO: error
	    	if (rcvBufferCounter >= 2) {
	    		DEBUG_MSG("handle END error\n");
	    		rcvBufferCounter = 0;
	    	    avrUpdateState.state = ERROR;
	    		os_timer_disarm(&commsTimeout);
	    		avrUpdateState.in_progress = false;
	    		delay(500);
	    		avrReset();
	    	}
	  }
	  break;
  default:
	  if (avrUpdateState.fwFile) avrUpdateState.fwFile.close();
	  avrUpdateState.in_progress = false;
	  DEBUG_MSG("handle IDLE, ERROR, TIMEOUT and other\n");
    return;
  }
}
