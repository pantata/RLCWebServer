//
//  webserver.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//  @version v0.2-1-g519ac0c

#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <FS.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <MyTimeLib.h>

#include "tz.h"
#include "common.h"
#include "RlcWebFw.h"
#include "sampling.h"
#include "webserver.h"

AsyncWebServer server(80);
time_t utc;

DstRule cest = { Mar, Second, Sun, 2, 120};  //UTC + 2 hours
DstRule cet =  { Oct, Last,   Sun, 3, 60};   //UTC + 1 hours
Tz tz(cest, cet);

class CaptiveRequestHandler : public AsyncWebHandler {
public:
    CaptiveRequestHandler() {
    }
    
    bool canHandle(AsyncWebServerRequest *request){
        // redirect if not in wifi client mode (through filter)
        // and request for different host (due to DNS * response)
        if (request->host() != WiFi.softAPIP().toString())
            return true;
        else
            return false;
    }
    
    void handleRequest(AsyncWebServerRequest *request) {
        DEBUG_MSG("captive request to %s\n", request->url().c_str());
        String location = "http://" + WiFi.softAPIP().toString();
        if (request->host() == config.hostname + ".local")
            location += request->url();
        location += "/?page=wifi";
        DEBUG_MSG("%s\n",location.c_str());
        request->redirect(location);
    }
};

void samplingRequest(AsyncWebServerRequest *request)
{
    AsyncResponseStream *response = request->beginResponseStream("text/html");
    
    
    
    response->print("<html><body>");
    response->print("<h1>Sampling Array</h1>");
    response->print("<table><tr><td align=\"right\">Index</td><td align=\"right\">Modul</td><td align=\"right\">Channel</td><td align=\"right\">TimeSlot</td><td align=\"right\">Value</td><td align=\"right\">Efect</td><td>Delete</td></tr>");
    for(int i=0;i<samplings.usedSamplingCount;i++)
    {
        response->printf("<tr><td align=\"right\">%d</td><td align=\"right\">%d</td><td align=\"right\">%d</td><td align=\"right\">%d</td><td align=\"right\">%d</td><td align=\"right\">%d</td><td><a href=\"/delsampl.cgi?modul=%d&channel=%d&timeSlot=%d\">Del</a></td></tr>",i,samplings.sampling[i].modul,samplings.sampling[i].channel,samplings.sampling[i].timeSlot,samplings.sampling[i].value,samplings.sampling[i].efect,samplings.sampling[i].modul,samplings.sampling[i].channel,samplings.sampling[i].timeSlot);
    }
    response->print("</table></body></html>");
    
    request->send(response);
    
}


void sendJsonResultResponse(AsyncWebServerRequest *request,bool cond,String okResultText,String errorResultText,uint32_t processedTime)
{
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    response->printf("{\"result\":\"%s\",\"time\":%d}",(cond)?okResultText.c_str():errorResultText.c_str(),processedTime);
    request->send(response);
}

void printDirectory(Dir dir, int numTabs,AsyncResponseStream *response) {
    bool isDirectory=false;
    response->print("<table><tr><td><i>File Name</i></td><td  align=\"right\"><i>Size</i></td></tr>");
    while(dir.next()) {
        
        File entry =  dir.openFile("r");
        if (! entry) {
            // no more files
            //Serial.println("**nomorefiles**");
            isDirectory=true;
        }
        else
        {
            isDirectory=false;
        }
        /*for (uint8_t i=0; i<numTabs; i++) {
         response->print('\t');
         }*/
        response->print("<tr><td><a href=\"");
        String e=String((const char *)entry.name());
        e.replace(".gz","");
        response->print(e.c_str());
        response->print("\">");
        response->print(entry.name());
        response->print("</a>");
        response->print("</td><td align=\"right\">");
        if (isDirectory) {
            Dir dir1=SPIFFS.openDir(dir.fileName()+"/"+entry.name());
            printDirectory(dir1, numTabs+1,response);
        } else {
            // files have sizes, directories do not
            
            response->println(entry.size(), DEC);
            response->print("</td>");
        }
        response->print("</tr>");
    }
    FSInfo info;
    SPIFFS.info(info);
    response->print("<tr><td></td></tr>");
    response->print("<tr><td>Bytes Total</td>");
    response->printf("<td align=\"right\">%d</td></tr>",info.totalBytes);
    response->print("<tr><td>Bytes Used</td>");
    response->printf("<td align=\"right\">%d</td></tr>",info.usedBytes);
    response->print("<tr><td>Bytes Free</td>");
    response->printf("<td align=\"right\">%d</td></tr>",(info.totalBytes-info.usedBytes));
    
    
    response->print("</table>");
}

//Handle upload file
void onUpload(AsyncWebServerRequest *request, String filename, size_t index,
              uint8_t *data, size_t len, bool final) {
    
    File f;
    String name="/"+filename;
    if(!index) {
        DEBUG_MSG("UploadStart: %s\n", filename.c_str());
        f=SPIFFS.open(name.c_str(),"w");
    }
    else
    {
        f=SPIFFS.open(name.c_str(),"a");
    }
    
    DEBUG_MSG("Upload: %d - %d\n", index, len);
    
    for(size_t i=0;i<len;i++)
        f.write(data[i]);
    
    if(final) {
        DEBUG_MSG("UploadEnd: %s (%u)\n", filename.c_str(), index+len);
        request->send_P(200, "text/html", "File was successfully uploaded");
    }
    f.close();
}

//Handle firmware file
void onUpdate(AsyncWebServerRequest *request, String filename, size_t index,
              uint8_t *data, size_t len, bool final) {
    if(!index){
        DEBUG_MSG("Update Start: %s\n", filename.c_str());
        Update.runAsync(true);
        if(!Update.begin((ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000)){
#ifdef DEBUG
            Update.printError(Serial);
#endif
        }
    }
    if(!Update.hasError()) {
        if(Update.write(data, len) != len){
#ifdef DEBUG
            Update.printError(Serial);
#endif
        }
    }
    if (final) {
        if(Update.end(true)){
            DEBUG_MSG("Update Success: %uB\n", index+len);
        } else {
#ifdef DEBUG
            Update.printError(Serial);
#endif
        }
    }
}

void setTimeCgi(AsyncWebServerRequest *request) {
    String useNtp=request->arg("use-ntp");
    String ntpip=request->arg("ntpip");
    String curtime=request->arg("curtime");
    
    DEBUG_MSG("setTime.cgi started with parameters use-ntp=%s, ntpip=%s ,curtime=%s \n",useNtp.c_str(),ntpip.c_str(),curtime.c_str());
    if (useNtp.toInt())
    {
        config.useNtp=true;
        config.ntpServer=String(ntpip);
        DEBUG_MSG("setTime.cgi saved config.useNtp=%s, config.ntpServer=%s \n","true",config.ntpServer.c_str());
    }
    else
    {
        config.useNtp=false;
        time_t ct=atoi(curtime.c_str());
        if (config.useDST)
        {
        	Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
        	time_t ct1=tzlocal.toUTC(ct);
        	ct=ct1;

        }

        setTime(ct);
        DEBUG_MSG("setTime.cgi saved config.useNtp=%s, time set to %s \n","false",String(ct).c_str());
        DEBUG_MSG("current time is %d.%d.%d %d:%d:%d\n",day(),month(),year(),hour(),minute(),second());
    }
    saveConfig();
    
    request->send_P(200, "text/html", "OK");
    
}

void webserver_begin() {
    server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);
    
    server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html").setCacheControl("no-cache, must-revalidate");
    
    server.onNotFound([](AsyncWebServerRequest *request){
#ifdef DEBUG
        Serial.printf("NOT_FOUND: ");
        if(request->method() == HTTP_GET)
            Serial.printf("GET");
        else if(request->method() == HTTP_POST)
            Serial.printf("POST");
        else if(request->method() == HTTP_DELETE)
            Serial.printf("DELETE");
        else if(request->method() == HTTP_PUT)
            Serial.printf("PUT");
        else if(request->method() == HTTP_PATCH)
            Serial.printf("PATCH");
        else if(request->method() == HTTP_HEAD)
            Serial.printf("HEAD");
        else if(request->method() == HTTP_OPTIONS)
            Serial.printf("OPTIONS");
        else
            Serial.printf("UNKNOWN");
        Serial.printf(" http://%s%s\n", request->host().c_str(), request->url().c_str());
        
        if(request->contentLength()){
            Serial.printf("_CONTENT_TYPE: %s\n", request->contentType().c_str());
            Serial.printf("_CONTENT_LENGTH: %u\n", request->contentLength());
        }
        
        int headers = request->headers();
        int i;
        for(i=0;i<headers;i++){
            AsyncWebHeader* h = request->getHeader(i);
            Serial.printf("_HEADER[%s]: %s\n", h->name().c_str(), h->value().c_str());
        }
        
        int params = request->params();
        for(i=0;i<params;i++){
            AsyncWebParameter* p = request->getParam(i);
            if(p->isFile()){
                Serial.printf("_FILE[%s]: %s, size: %u\n", p->name().c_str(), p->value().c_str(), p->size());
            } else if(p->isPost()){
                Serial.printf("_POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
            } else {
                Serial.printf("_GET[%s]: %s\n", p->name().c_str(), p->value().c_str());
            }
        }
#endif
        request->send(404);
    });
    
    server.on("/uploader.html", HTTP_POST, [](AsyncWebServerRequest *request){
        request->send(200);
    }, onUpload);
    
    server.on("/updater.html", HTTP_POST, [](AsyncWebServerRequest *request){
        shouldReboot = !Update.hasError();
        AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", shouldReboot?"OK - Wait 30 sec for restart":"FAIL");
        response->addHeader("refresh","30;url=/");
        request->send(response);
    }, onUpdate);
    
    
    
    server.onRequestBody([](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
#ifdef DEBUG
        if(!index) Serial.printf("BodyStart: %u\n", total);
        //Serial.printf("%s", (const char*)data);
        if(index + len == total) Serial.printf("BodyEnd: %u\n", total);
#endif
    });
    
    
    
    server.on("/list", HTTP_GET, [](AsyncWebServerRequest *request){
        
        
        AsyncResponseStream *response = request->beginResponseStream("text/html");
        response->print("<html><body>");
        response->print("<h1>Files List</h1>\n");
        
        Dir root = SPIFFS.openDir("/");
        printDirectory(root,0,response);
        response->print("</body></html>");
        PRINT_CONFIG(config);
        request->send(response);
    });
    
    server.on("/delete",HTTP_GET,[](AsyncWebServerRequest *request){
        AsyncResponseStream *response = request->beginResponseStream("text/html");
        response->print("<html><body>");
        response->print("<h1>Files deleting</h1>");
        response->print("<form  action=\"/remove\" method=\"POST\">");
        response->printf("<select name=\"%s\">","select");
        Dir root = SPIFFS.openDir("/");
        while(root.next()) {
            
            File entry =  root.openFile("r");
            /*for (uint8_t i=0; i<numTabs; i++) {
             response->print('\t');
             }*/
            response->print("<option>");
            response->print(entry.name());
            response->print("</option>");
        }
        response->print("</select>");
        response->print("<input type=\"submit\" value=\"Delete\"\>");
        response->print("</form></body></html>");
        PRINT_CONFIG(config);
        request->send(response);
        
    });
    
    server.on("/download",HTTP_GET,[](AsyncWebServerRequest *request){
        AsyncResponseStream *response = request->beginResponseStream("text/html");
        response->print("<html><body>");
        response->print("<h1>Files download</h1>");
        Dir root = SPIFFS.openDir("/");
        response->print("<table>");
        while(root.next()) {
            File entry =  root.openFile("r");
            response->print("<tr><td>");
            response->print("<a href=\"");
            response->print(entry.name());
            response->print("\" download>Download ");
            response->print(entry.name());
            response->print("</a></td></tr>");
        }
        response->print("</table></body></html>");
        PRINT_CONFIG(config);
        request->send(response);
    });
    
    server.on("/remove",HTTP_POST,[](AsyncWebServerRequest *request){
        PRINT_CONFIG(config);
        if(request->hasArg("select"))
        {
            String arg = request->arg("select");
            bool ok=SPIFFS.remove(arg);
            if (ok)
            {
                request->send_P(200, "text/html", "File was successfully deleted");
            }
            else
            {
                request->send_P(200, "text/html", "File was not deleted");
            }
        }
        else
        {
            request->send_P(200, "text/html", "Unknown parameter");
        }
    });
    
    /*
     *  WiFi scan handler
     */
    server.on("/wifiscan.cgi",HTTP_GET,[](AsyncWebServerRequest *request){
        static boolean wifiscanStarted = false;
        static int8_t scanInProgress = -1;
        static int wifiscanCount = 0;
        
        PRINT_CONFIG(config);
        if (!wifiscanStarted) {
            WiFi.scanDelete();
            WiFi.scanNetworksAsync([](int pocet) {
                for(int i=0;i<16;i++) wifinetworks[i].exist=false;
                for(int i=0;i<pocet&&i<16;i++)
                {
                    wifinetworks[i].essid=String(WiFi.SSID(i));
                    wifinetworks[i].rssi=WiFi.RSSI(i);
                    wifinetworks[i].enc=WiFi.encryptionType(i);
                    wifinetworks[i].channel=WiFi.channel(i);
                    wifinetworks[i].exist=true;
                }
                
                wifiscanCount = pocet;
                scanInProgress = WiFi.scanComplete();
            });
            
            wifiscanStarted=true;
            scanInProgress = WiFi.scanComplete();
        }
        
        //send result
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        response->print("{\n\"result\": {\n");
        response->printf("\"inProgress\": \"%d\",\n",(scanInProgress>=0)?0:scanInProgress);
        response->print("\"APs\": [\n");
        for(int i=0;i<wifiscanCount&&i<16;i++)
        {
            if (wifinetworks[i].exist)
            {
                response->printf("{\n\"essid\": \"%s\", \"rssi\": \"%d\", \"enc\": \"%d\", \"ch\": \"%d\"}",wifinetworks[i].essid.c_str(),wifinetworks[i].rssi,wifinetworks[i].enc,wifinetworks[i].channel);
                if (i<wifiscanCount-1&&i<15) response->printf(",\n"); else response->printf("\n");
            }
        }
        response->print("]\n");
        response->print("}\n}\n");
        request->send(response);
        
        //enable scan on next request
        if (WiFi.scanComplete() > 0) {
            wifiscanStarted = false;
        }
        
    });
    
    server.on("/wifistatus.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","WifiStatus started");
        
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        PRINT_CONFIG(config);
        DEBUG_MSG("%s\n","WifiStatus response stream created");
        
        response->print("{");
        DEBUG_MSG("%s\n","{");
        
        response->printf("\"mode\":\"%s\",\n",str_wifimode[WiFi.getMode()]);
        DEBUG_MSG("\"mode\":\"%d\",\n",WiFi.getMode());
        
        response->printf("\"chan\":\"%d\",\n",WiFi.channel());
        DEBUG_MSG("\"chan\":\"%d\",\n",WiFi.channel());
        
        response->printf("\"ssid\":\"%s\",\n",WiFi.SSID().c_str());
        DEBUG_MSG("\"ssid\":\"%s\",\n",WiFi.SSID().c_str());
        
        response->printf("\"status\":\"%s\",\n",str_wifistatus[WiFi.status()]);
        DEBUG_MSG("\"status\":\"%d\",\n",WiFi.status());
        
        response->printf("\"localIp\":\"%s\",\n",WiFi.localIP().toString().c_str());
        DEBUG_MSG("\"localIp\":\"%s\",\n",WiFi.localIP().toString().c_str());
        
        response->printf("\"localMask\":\"%s\",\n",WiFi.subnetMask().toString().c_str());
        DEBUG_MSG("\"localIp\":\"%s\",\n",WiFi.subnetMask().toString().c_str());
        
        response->printf("\"localGw\":\"%s\",\n",WiFi.gatewayIP().toString().c_str());
        DEBUG_MSG("\"localIp\":\"%s\",\n",WiFi.gatewayIP().toString().c_str());
        
        response->printf("\"apIp\":\"%s\",\n",WiFi.softAPIP().toString().c_str());
        DEBUG_MSG("\"apIp\":\"%s\",\n",WiFi.softAPIP().toString().c_str());
        
        response->printf("\"rssi\":\"%d\",\n",WiFi.RSSI());
        DEBUG_MSG("\"rssi\":\"%d\",\n",WiFi.RSSI());
        
        response->printf("\"phy\":\"%d\",\n",WiFi.getPhyMode());
        DEBUG_MSG("\"phy\":\"%d\",\n",WiFi.getPhyMode());
        
        response->printf("\"mac\":\"%s\",\n",WiFi.macAddress().c_str());
        DEBUG_MSG("\"mac\":\"%s\",\n",WiFi.macAddress().c_str());
        
        response->printf("\"psk\":\"%s\",\n",WiFi.psk().c_str());
        DEBUG_MSG("\"psk\":\"%s\",\n",WiFi.psk().c_str());
        
        response->printf("\"bssid\":\"%s\",\n",WiFi.BSSIDstr().c_str());
        DEBUG_MSG("\"bssid\":\"%s\",\n",WiFi.BSSIDstr().c_str());
        
        response->printf("\"host\":\"%s\",\n",WiFi.hostname().c_str());
        DEBUG_MSG("\"bssid\":\"%s\",\n",WiFi.BSSIDstr().c_str());
        
        response->printf("\"warn\":\"%s\"\n","");
        DEBUG_MSG("\"warn\":\"%s\"\n","");
        
        response->print("}\n");
        DEBUG_MSG("%s\n","}");
        
        request->send(response);
    });
    
    server.on("/wificonnect.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        
        
        config.wifimode=atoi(request->arg("apmode").c_str());
        
        if (config.wifimode == WIFI_AP) {
            config.hostname=request->arg("apname");
            config.appwd=request->arg("appwd");
            config.apchannel=atoi(request->arg("apchannel").c_str());
            config.apip=request->arg("apip");
            config.apmask=request->arg("apmask");
            config.apgw=request->arg("apgw");
        }
        
        if (config.wifimode == WIFI_STA) {
            config.ssid=request->arg("ssid");
            config.pwd=request->arg("pwd");
            config.wifidhcp=String(request->arg("dhcponoff")).equals("1");
            if (!config.wifidhcp) {
                config.wifiip=request->arg("ip");
                config.wifimask=request->arg("mask");
                config.wifigw=request->arg("gw");
                config.wifidns1=request->arg("dns1");
                config.wifidns2=request->arg("dns2");
            }
        }
        
        
        
        DEBUG_MSG("Wificonnect.cgi started , Params ssid=%s , pwd=%s\n",config.ssid.c_str(),config.pwd.c_str());
        shouldReconnect = true;
        
        AsyncWebServerResponse *response = request->beginResponse(200);
        response->addHeader("refresh","20;url=http://"+config.hostname+".local");
        PRINT_CONFIG(config);
        request->send(response);
    });
    
    
    
#ifdef DEBUG
    server.on("/ntp.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        String time = "" + String(getNtpTime()) + " - " + String(millis());
        request->send(200, "text/plain",time);
    });
    
    server.on("/time.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        time_t utc = now();    //current time from the Time Library        
        String time = String(str_timestatus[timeStatus()])+ ": " +  String(hour(tz.toLocal(utc))) + ":" + String(minute(tz.toLocal(utc))) + ":" + String(second(tz.toLocal(utc))) +" " + String(tz.utcIsDST(now())?"CEST":"CET");
        AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", time);
        response->addHeader("refresh","1;url=/time.cgi");
        request->send(response);
    });
    
    
    server.on("/insupdsampl.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        
        String modul=request->arg("modul");
        String channel=request->arg("channel");
        String timeSlot=request->arg("timeSlot");
        String value=request->arg("value");
        String efect=request->arg("efect");
        
        DEBUG_MSG("/ïnsupdsampl.cgi request started with parameters modul=%s , channel=%s, timeSlot=%s , value=%s, efect=%s\n",modul.c_str(),channel.c_str(),timeSlot.c_str(),value.c_str(),efect.c_str());
        PRINT_CONFIG(config);
        
        bool inOk=insertOrUpdateSampling(StringToUint8_t(modul)/*modul.toInt()*/,StringToUint8_t(channel)/*channel.toInt()*/,StringToUint8_t(timeSlot)/*timeSlot.toInt()*/,StringToUint16_t(value)/*value.toInt()*/,StringToUint8_t(efect)/*efect.toInt()*/);
        
        samplingRequest(request);
    });
    
    server.on("/delsampl.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        
        String modul=request->arg("modul");
        String channel=request->arg("channel");
        String timeSlot=request->arg("timeSlot");
        
        DEBUG_MSG("/delsampl.cgi request started with parameters modul=%s , channel=%s, timeSlot=%s \n",modul.c_str(),channel.c_str(),timeSlot.c_str());
        PRINT_CONFIG(config);
        
        bool delOk=deleteSampling(StringToUint8_t(modul)/*modul.toInt()*/,StringToUint8_t(channel)/*channel.toInt()*/,StringToUint8_t(timeSlot)/*timeSlot.toInt()*/);
        
        samplingRequest(request);
    });
    
    server.on("/savesampl.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        
        String filename="/"+request->arg("filename");
        
        DEBUG_MSG("/savesampl.cgi request started with parameters filename=%s  \n",filename.c_str());
        PRINT_CONFIG(config);
        
        if (saveSamplingStruct(filename))
        {
            request->send_P(200, "text/html", "File has been successfully saved");
        }
        else
        {
            request->send_P(200, "text/html", "Error on saving file");
        }
    });
    
    server.on("/loadsampl.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        
        String filename="/"+request->arg("filename");
        
        DEBUG_MSG("/loadsampl.cgi request started with parameters filename=%s  \n",filename.c_str());
        PRINT_CONFIG(config);
        
        if (loadSamplingStruct(filename,&samplings))
        {
            samplingRequest(request);
        }
        else
        {
            request->send_P(200, "text/html", "Error on loading file");
        }
    });
    
    server.on("/formatfs.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        
        uint32_t startTime=millis();
        
        DEBUG_MSG("%s\n","/formatfs.cgi request started ");
        PRINT_CONFIG(config);
        
        bool ok=SPIFFS.format();
        
        DEBUG_MSG("/formatfs.cgi request finished with result %s \n",(ok)?"OK":"ERROR");
        
        sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
        
        
    });
    
#endif
    
    server.on("/setTime.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        setTimeCgi(request);
    });
    
    
    server.on("/allTimeSlotValues.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        uint32_t startTime=millis();
        DEBUG_MSG("/allTimeSlotValues.cgi request started%s\n","");
        response->print("{\n\"timeSlotValues\":[");
        for(int i=0;i<samplings.usedSamplingCount;i++)
        {
            response->printf("{\"modul\":%d,\"channel\":%d,\"timeSlot\":%d,\"value\":%d,\"efect\":%d}%s",samplings.sampling[i].modul,samplings.sampling[i].channel,samplings.sampling[i].timeSlot,samplings.sampling[i].value,samplings.sampling[i].efect,(i<samplings.usedSamplingCount-1)?",\n":"");
        };
        response->printf("],\n\"time\":%d\n}",millis()-startTime);
        PRINT_CONFIG(config);
        request->send(response);
    });
    
    server.on("/allTimeSlotValuesFromFile.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        uint32_t startTime=millis();
        
        String filename="/"+request->arg("filename")+".pjs";
        DEBUG_MSG("/allTimeSlotValuesFromFile.cgi request started with parameters filename=%s  \n",filename.c_str());
        Samplings s;
        if (loadSamplingStruct(filename,&s)) {
            AsyncResponseStream *response = request->beginResponseStream("application/json");
            
            response->print("{\n\"timeSlotValues\":[");
            for(int i=0;i<s.usedSamplingCount;i++)
            {
                response->printf("{\"modul\":%d,\"channel\":%d,\"timeSlot\":%d,\"value\":%d,\"efect\":%d}%s",s.sampling[i].modul,s.sampling[i].channel,s.sampling[i].timeSlot,s.sampling[i].value,s.sampling[i].efect,(i<s.usedSamplingCount-1)?",\n":"");
            };
            response->printf("],\n\"time\":%d\n}",millis()-startTime);
            request->send(response);
        }
        else
        {
            sendJsonResultResponse(request,false,"OK","ERROR",millis()-startTime);
        }
        
        
    });
    
    server.on("/saveTimeSlotValues.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        
        uint32_t startTime=millis();
        
        String filename="/"+request->arg("filename")+".pjs";
        
        
        DEBUG_MSG("/saveTimeSlotValues.cgi request started with parameters filename=%s  \n",filename.c_str());
        PRINT_CONFIG(config);
        bool ok=saveSamplingStruct(filename);
        sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
        
    });
    
    server.on("/getTimeSlotValues.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        uint32_t startTime=millis();
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        DEBUG_MSG("/getTimeSlotValues.cgi request started modulecount=%d  \n",modulecount);
        response->print("{\"timeSlotValues\":[");
        
        for(int i=1;i<modulecount+1;i++)
        {
            for(int j=1;j<8;j++)
            {
                uint16_t value=getSamplingValue(i,j,0);
                DEBUG_MSG("modul=%d, channel=%d, value=%d\n",i,j,value);
                response->printf("{\"modul\":%d,\"\channel\":%d,\"value\":%d}%s",i,j,value,(i<modulecount||j<7)?",\n":"");
                
            }
        }
        response->printf("],\n\"time\":%d}",millis()-startTime);
        PRINT_CONFIG(config);
        request->send(response);
        
        
    });
    
    server.on("/getTimeSlotProfiles.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        uint32_t startTime=millis();
        
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        
        Dir root = SPIFFS.openDir("/");
        response->print("{\"profileList\": [");
        bool started=false;
        while(root.next()) {
            
            String filename=root.fileName();
            
            if (filename.endsWith(".pjs"))
            {
                String ps=(started)?",\n":"";
                response->printf("%s{\"filename\":\"%s\"}",ps.c_str(),filename.c_str());
                started=true;
            }
            
        }
        PRINT_CONFIG(config);
        response->printf("],\n\"time\":%d}",millis()-startTime);
        request->send(response);
        
    });
    
    server.on("/setTimeSlotProfile.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        // TO DO - vybrany profil natahnout do pameti a ulozit do centr konfigurace
        uint32_t startTime=millis();
        String filename=request->arg("filename");
        String nfilename;
        if (!filename.endsWith(".pjs"))
        {
            nfilename=String(filename+".pjs");
        } 
        else
        {
            nfilename=String(filename); 
        }
        
        bool ok=loadSamplingStruct(nfilename,&samplings);   
        if (ok)
        {
            config.profileFileName=String(nfilename);
            ok=saveConfig();
            
        }
        PRINT_CONFIG(config);
        sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
    });
    
    server.on("/upload",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","/upload started");
        AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", upload_html);
        response->addHeader("Server","ESP Async Web Server");
        request->send(response);
    });
    
    server.on("/update",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","/update started");
        request->send(200,"text/html",update_html);    
    });
    
    server.on("/getinfo.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
         uint32_t startTime=millis();
         DEBUG_MSG("%s\n","getinfo.cgi");
         AsyncResponseStream *response = request->beginResponseStream("application/json");
         response->printf("{\"mode\":%d,\n",mode);
         response->printf("\"modulescount\":%d,\n",modulecount);
         if (mode == LEDAUTO) { //auto
             response->print("\"timeSlotValues\":[");

             for(int i=1;i<modulecount+1;i++)
             {
            	 response->printf("{\"id\":%d,", i-1);
            	 response->printf("\"name\":\"%c\",", char(65+i-1));
            	 response->printf("\"ch\":[");
                 for(int j=1;j<8;j++)
                 {
                     uint16_t value=getSamplingValue(i,j,0);
                     response->printf("{\"v\":%d}%s", value, j==7?"\n":",");
                 }
                 response->printf("]}%s",i==modulecount?"\n":",");
             }
         } else {    //manual

         }
         response->printf("],\"time\":%d}",millis()-startTime);
         request->send(response);
        //TODO: timezone, letni cas, aktualni cas, vybrany profil, timeserver, manual/auto
        
    });
    
    server.on("/getconfig.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
         uint32_t startTime=millis();
         DEBUG_MSG("%s\n","getconfig.cgi");
         AsyncResponseStream *response = request->beginResponseStream("application/json");
         response->printf("{\"dst\":%d,\n",config.useDST);
         response->printf("\"profileFileName\":\"%s\",\n",config.profileFileName.c_str());
         response->printf("\"time\":%d}",millis()-startTime);
         request->send(response);
        //TODO: timezone, letni cas, aktualni cas, vybrany profil, timeserver, manual/auto

    });

    server.on("/gettime.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        time_t utc = now();    //current time from the Time Library
        //String time = String(str_timestatus[timeStatus()])+ ": " +  String(hour(tz.toLocal(utc))) + ":" + String(minute(tz.toLocal(utc))) + ":" + String(second(tz.toLocal(utc))) +" " + String(tz.utcIsDST(now())?"CEST":"CET");
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        response->printf("{\"utc\":%d }\n",utc);
        //AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", String(utc));
        //response->addHeader("refresh","1;url=/time.cgi");
        request->send(response);
    });


    server.begin();
    DEBUG_MSG("%s\n","HTTP server started");

}

