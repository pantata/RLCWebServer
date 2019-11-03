//
//  tz.hpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 15.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71
//

#ifndef tz_hpp
#define tz_hpp

#include <Arduino.h>
#include <MyTime.h>

enum week_t {Last, First, Second, Third, Fourth};
enum dow_t {Sun=1, Mon, Tue, Wed, Thu, Fri, Sat};
enum month_t {Jan=1, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec};

struct DstRule {
    uint8_t month;     //1=Jan, 2=Feb, ... 12=Dec
    uint8_t week;      //First, Second, Third, Fourth, Last week
    uint8_t day;       //1=Sun, 2=Mon, ... 7=Sat
    uint8_t hour;      //0-23
    int offset;        //offset from UTC in minutes
};

struct TzRule {
    String tzName = "";
    DstRule dstStart;
    DstRule dstEnd;
};

class Tz {
    public:
        Tz();
        Tz(DstRule dstStart, DstRule dstEnd);
        time_t toLocal(time_t utc);
        time_t toUTC(time_t local);
        boolean utcIsDST(time_t utc);
        boolean locIsDST(time_t local);
        void setTzRule(DstRule dstStart, DstRule dstEnd);
    private:
        void calcTimeChanges(int yr);
        time_t toTime_t(DstRule r, int yr);
        DstRule _dst;
        DstRule _std;    //rule for start of standard time for any year
        time_t _dstUTC; //dst start for given/current year, given in UTC
        time_t _stdUTC; //dst end time for given/current year, given in UTC
        time_t _dstLoc; //dst start for given/current year, given in local time
        time_t _stdLoc; //dst end time for given/current year, given in local time
};

#endif /* tz_h */
