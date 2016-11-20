//
//  sampling.hpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-1-g519ac0c

#ifndef sampling_h
#define sampling_h

void initSamplingValues();
void copySamplingUp(int x);
void copySamplingDown(int x);
bool insertOrUpdateSampling(uint8_t modul,uint8_t channel,uint8_t timeSlot,uint16_t value,uint8_t efect);
bool deleteSampling(uint8_t modul,uint8_t channel,uint8_t timeSlot);

uint8_t StringToUint8_t(String s);
uint16_t StringToUint16_t(String s);
uint16_t getSamplingValue(uint8_t modul,uint8_t channel,uint32_t timedelay);
bool saveSamplingStruct(String filename);
bool loadSamplingStruct(String filename,Samplings *s );


#endif /* sampling_h */
