//
//  RlcWebFw.h
//  RlcWebFw
//
//  Created by Ludek Slouf on 21.10.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version    v0.1-4-gb551a72

#ifndef RlcWebFw_h
#define RlcWebFw_h

#include "common.h"

bool saveConfig();
void normalizeConfig();
bool loadConfig(Config *conf);
bool saveSamplingStruct(String filename);
bool loadSamplingStruct(String filename,Samplings *s );

time_t getNtpTime();


#endif /* RlcWebFw_h */
