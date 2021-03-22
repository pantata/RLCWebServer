//
//  sampling.hpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71

#ifndef sampling_h
#define sampling_h

void initSamplingValues();
void copySamplingUp(int x);
void copySamplingDown(int x);
bool insertOrUpdateSampling(uint8_t channel,uint8_t timeSlot,uint16_t value,uint8_t efect);
bool deleteSampling(uint8_t channel,uint8_t timeSlot);

uint8_t StringToUint8_t(String s);
uint16_t StringToUint16_t(String s);
int16_t StringToInt(String s);
uint16_t getSamplingValue(uint8_t channel);

#endif /* sampling_h */
