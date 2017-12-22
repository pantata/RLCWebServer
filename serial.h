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
void uartSendTime();
void uartGetConfig(String data);
void sendLedVal() ;
void uartSendTimeConfig();

void uartSendNetValues();
void setManual(String data);
void setVersionInfo(String data);
void uartGetVersionInfo();
void uartGetTemperatureInfo();
void saveManualLedValues(char chr);

void processIncomingSerial();

#endif /* serial_h */
