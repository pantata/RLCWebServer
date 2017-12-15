//
//  serial.hpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 15.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71

#ifndef serial_h
#define serial_h

uint16_t checkCrc(char *data);

void uartGetPing();
void uartIsChanged();
void uartGetTime();
void uartGetConfig(String data);
void sendLedVal() ;
void sendTimeConfig();

void sendNetValues();
void setManual(String data);
void process9(String data);

void saveManualLedValues(char chr);

void processIncomingSerial();

#endif /* serial_h */
