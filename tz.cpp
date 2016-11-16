//
//  tz.cpp
//  Timezone functions
//  calc local time <-> utc time

//  Created by Ludek Slouf on 15.11.16.
//
//  Licence: https://creativecommons.org/licenses/by-sa/3.0/
//  CC BY-SA
//  Remixed from:
//  Jack Christensen Mar 2012
//  https://github.com/JChristensen/Timezone
//  Arduino Timezone Library by Jack Christensen is licensed under
//  the Creative Commons Attribution-ShareAlike 3.0
//
//
//  @version
//

#include "tz.h"

Tz::Tz(DstRule dstStart, DstRule dstEnd) {
    _dst = dstStart;
    _std = dstEnd;
}

void Tz::setTzRule(DstRule dstStart, DstRule dstEnd) {
    _dst = dstStart;
    _std = dstEnd;
}

time_t Tz::toLocal(time_t utc) {
    if (year(utc) != year(_dstUTC)) calcTimeChanges(year(utc));
    
    if (utcIsDST(utc))
        return utc + _dst.offset * SECS_PER_MIN;
    else
        return utc + _std.offset * SECS_PER_MIN;
}

time_t Tz::toUTC(time_t local) {
    if (year(local) != year(_dstLoc)) calcTimeChanges(year(local));
    
    if (locIsDST(local))
        return local - _dst.offset * SECS_PER_MIN;
    else
        return local - _std.offset * SECS_PER_MIN;
}

boolean Tz::utcIsDST(time_t utc) {
    if (year(utc) != year(_dstUTC)) calcTimeChanges(year(utc));
    
    if (_stdUTC > _dstUTC)
        return (utc >= _dstUTC && utc < _stdUTC);
    else
        return !(utc >= _stdUTC && utc < _dstUTC);
}

boolean Tz::locIsDST(time_t local) {
    if (year(local) != year(_dstLoc)) calcTimeChanges(year(local));
    
    if (_stdLoc > _dstLoc)    //northern hemisphere
        return (local >= _dstLoc && local < _stdLoc);
    else                      //southern hemisphere
        return !(local >= _stdLoc && local < _dstLoc);
}

void Tz::calcTimeChanges(int yr) {
    _dstLoc = toTime_t(_dst, yr);
    _stdLoc = toTime_t(_std, yr);
    _dstUTC = _dstLoc - _std.offset * SECS_PER_MIN;
    _stdUTC = _stdLoc - _dst.offset * SECS_PER_MIN;
}

time_t Tz::toTime_t(DstRule r, int yr) {
    tmElements_t tm;
    time_t t;
    uint8_t m, w;
    
    m = r.month;
    w = r.week;
    if (w == 0) {            //Last week = 0
        if (++m > 12) {      //for "Last", go to the next month
            m = 1;
            yr++;
        }
        w = 1;               //and treat as first week of next month, subtract 7 days later
    }
    
    tm.Hour = r.hour;
    tm.Minute = 0;
    tm.Second = 0;
    tm.Day = 1;
    tm.Month = m;
    tm.Year = yr - 1970;
    t = makeTime(tm);        //first day of the month, or first day of next month for "Last" rules
    t += (7 * (w - 1) + (r.day - weekday(t) + 7) % 7) * SECS_PER_DAY;
    if (r.week == 0) t -= 7 * SECS_PER_DAY;    //back up a week if this is a "Last" rule
    return t;
}
