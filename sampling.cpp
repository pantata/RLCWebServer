//
//  sampling.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71

#include <Arduino.h>
#include <MyTime.h>
#include "tz.h"
#include "common.h"
#include "sampling.h"

void initSamplingValues() {
    for (int x=0; x<SAMPLING_MAX;x++) {
        samplings.sampling[x].modul=SAMPLING_UINT8_MAX_VALUE;
        samplings.sampling[x].channel=SAMPLING_UINT8_MAX_VALUE;
        samplings.sampling[x].timeSlot=SAMPLING_UINT8_MAX_VALUE;
    }
    samplings.usedSamplingCount=0;
    DEBUG_MSG("Sampling structure initialised\n");
}

void copySamplingUp(int x)
{
    for(int i=samplings.usedSamplingCount-1;i>=x;i--)
    {
        if (i<SAMPLING_MAX)
        {
            samplings.sampling[i+1].modul=samplings.sampling[i].modul;
            samplings.sampling[i+1].channel=samplings.sampling[i].channel;
            samplings.sampling[i+1].timeSlot=samplings.sampling[i].timeSlot;
            samplings.sampling[i+1].value=samplings.sampling[i].value;
            samplings.sampling[i+1].efect=samplings.sampling[i].efect;
        }
    }
    
}

void copySamplingDown(int x)
{
    for(int i=x;i<samplings.usedSamplingCount;i++)
    {
        if (i<SAMPLING_MAX)
        {
            samplings.sampling[i].modul=samplings.sampling[i+1].modul;
            samplings.sampling[i].channel=samplings.sampling[i+1].channel;
            samplings.sampling[i].timeSlot=samplings.sampling[i+1].timeSlot;
            samplings.sampling[i].value=samplings.sampling[i+1].value;
            samplings.sampling[i].efect=samplings.sampling[i+1].efect;
        }
    }
}


bool insertOrUpdateSampling(uint8_t modul,uint8_t channel,uint8_t timeSlot,uint16_t value,uint8_t efect)
{
    bool ok=false;
    for (int x=0; x<SAMPLING_MAX;x++) {
        if (samplings.sampling[x].modul==SAMPLING_UINT8_MAX_VALUE||
            samplings.sampling[x].channel==SAMPLING_UINT8_MAX_VALUE||
            samplings.sampling[x].timeSlot==SAMPLING_UINT8_MAX_VALUE)
        {
            if (x<=SAMPLING_MAX-1)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling FIRST EMPTY modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                samplings.sampling[x].modul=modul;
                samplings.sampling[x].channel=channel;
                samplings.sampling[x].timeSlot=timeSlot;
                samplings.sampling[x].value=value;
                samplings.sampling[x].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            else
            {
                ok=false;
                break;
            }
        }
        
        if (samplings.sampling[x].modul==modul&&
            samplings.sampling[x].channel==channel&&
            samplings.sampling[x].timeSlot==timeSlot)
        {
            DEBUG_MSG("\n\ninsertOrUpdateSampling EQUALS modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
            samplings.sampling[x].value=value;
            samplings.sampling[x].efect=efect;
            ok=true;
            break;
        }
        
        
        if (x+1<SAMPLING_MAX)
        {
            if (samplings.sampling[x].modul==modul&&samplings.sampling[x].channel==channel&&samplings.sampling[x+1].modul==modul&&samplings.sampling[x+1].channel==channel&&
                samplings.sampling[x].timeSlot<=timeSlot&&samplings.sampling[x+1].timeSlot>timeSlot)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling BETWEEN TIMESLOTS modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                copySamplingUp(x+1);
                samplings.sampling[x+1].modul=modul;
                samplings.sampling[x+1].channel=channel;
                samplings.sampling[x+1].timeSlot=timeSlot;
                samplings.sampling[x+1].value=value;
                samplings.sampling[x+1].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            
            if (samplings.sampling[x].modul==modul&&samplings.sampling[x].channel==channel&&
                samplings.sampling[x].timeSlot>timeSlot)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling LAST TIMESLOT modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                copySamplingUp(x);
                samplings.sampling[x].modul=modul;
                samplings.sampling[x].channel=channel;
                samplings.sampling[x].timeSlot=timeSlot;
                samplings.sampling[x].value=value;
                samplings.sampling[x].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            
            
            if (samplings.sampling[x].modul==modul&&samplings.sampling[x+1].modul==modul&&samplings.sampling[x].channel<=channel&&samplings.sampling[x+1].channel>channel)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling BETWEEN CHANNELS modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                copySamplingUp(x+1);
                samplings.sampling[x+1].modul=modul;
                samplings.sampling[x+1].channel=channel;
                samplings.sampling[x+1].timeSlot=timeSlot;
                samplings.sampling[x+1].value=value;
                samplings.sampling[x+1].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            
            if (samplings.sampling[x].modul==modul&&samplings.sampling[x].channel>channel)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling LAST CHANNEL modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                copySamplingUp(x);
                samplings.sampling[x].modul=modul;
                samplings.sampling[x].channel=channel;
                samplings.sampling[x].timeSlot=timeSlot;
                samplings.sampling[x].value=value;
                samplings.sampling[x].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            
            
            if (samplings.sampling[x].modul<=modul&&samplings.sampling[x+1].modul>modul)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling BETWEEN MODULS modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                copySamplingUp(x+1);
                samplings.sampling[x+1].modul=modul;
                samplings.sampling[x+1].channel=channel;
                samplings.sampling[x+1].timeSlot=timeSlot;
                samplings.sampling[x+1].value=value;
                samplings.sampling[x+1].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            
            if (samplings.sampling[x].modul>modul)
            {
                DEBUG_MSG("\n\ninsertOrUpdateSampling LAST MODUL modul=%d,channel=%d,timeSlot=%d\n\n",modul,channel,timeSlot);
                copySamplingUp(x);
                samplings.sampling[x].modul=modul;
                samplings.sampling[x].channel=channel;
                samplings.sampling[x].timeSlot=timeSlot;
                samplings.sampling[x].value=value;
                samplings.sampling[x].efect=efect;
                samplings.usedSamplingCount++;
                ok=true;
                break;
            }
            
            
            
            
        }
    }
    return ok;
}


bool deleteSampling(uint8_t modul,uint8_t channel,uint8_t timeSlot)
{
    for (int x=0; x<SAMPLING_MAX;x++) {
        if (samplings.sampling[x].modul==SAMPLING_UINT8_MAX_VALUE||
            samplings.sampling[x].channel==SAMPLING_UINT8_MAX_VALUE||
            samplings.sampling[x].timeSlot==SAMPLING_UINT8_MAX_VALUE)
        {
            return false;
        }
        
        if (samplings.sampling[x].modul==modul&&
            samplings.sampling[x].channel==channel&&
            samplings.sampling[x].timeSlot==timeSlot)
        {
            copySamplingDown(x);
            samplings.sampling[samplings.usedSamplingCount].modul=SAMPLING_UINT8_MAX_VALUE;
            samplings.sampling[samplings.usedSamplingCount].channel=SAMPLING_UINT8_MAX_VALUE;
            samplings.sampling[samplings.usedSamplingCount].timeSlot=SAMPLING_UINT8_MAX_VALUE;
            
            samplings.usedSamplingCount--;
            return true;
            
        }
    }
    return false;
}

uint16_t getSamplingValue(uint8_t modul,uint8_t channel)
{
    uint16_t ret = 0;
    time_t localtime = now();
	if (config.useDST) {
		Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
		localtime = tzlocal.toLocal(now());
	}

	uint32_t currentTime = (uint32_t)hour(localtime)*3600+(uint32_t)minute(localtime)*60+(uint32_t)second(localtime);

    uint32_t startTime = 0;
    uint32_t endTime = 0;
    uint16_t startval = 0;
    uint16_t endval = 0;
    
    /*
     * for modul and channel find min, max and compute curr val
     */

    for (int i=0; i<SAMPLING_MAX;i++) {
        if (samplings.sampling[i].modul==SAMPLING_UINT8_MAX_VALUE) {
            endval = 0;
            endTime = 0;
            break;
        }
        
        //find start val
        if ( (samplings.sampling[i].modul==modul) &&
        	 (samplings.sampling[i].channel==channel) &&
			 (currentTime >= (uint32_t)(samplings.sampling[i].timeSlot*900))
		   ) {

            startTime=(uint32_t)(samplings.sampling[i].timeSlot*900);
            startval=samplings.sampling[i].value;
        }
        
        //find end val
        if ( (samplings.sampling[i].modul==modul) &&
        	 (samplings.sampling[i].channel==channel) &&
			 (currentTime<=(uint32_t)(samplings.sampling[i].timeSlot*900))
		   ) {

            endTime=(uint32_t)(samplings.sampling[i].timeSlot*900);
            endval=samplings.sampling[i].value;
            break;
        }
    }
    
    //TODO: revize
    if (startTime != endTime) {
        ret = map(currentTime, startTime , endTime, startval ,endval);
    }    else {
        return startval;
    }

    return constrain(ret, 0, MAX_PWM);

}

uint8_t StringToUint8_t(String s)
{
    return (uint8_t)atoi(s.c_str());
}

int16_t StringToInt(String s)
{
    return (int16_t)atoi(s.c_str());
}

uint16_t StringToUint16_t(String s)
{
    return (uint16_t)atoi(s.c_str());


}



