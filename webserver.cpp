//
//  webserver.cpp
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//  @version v0.2-10-gf4a3c71

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <FS.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <MyTimeLib.h>

#include "tz.h"
#include "common.h"
#include "RlcWebFw.h"
#include "sampling.h"
#include "webserver.h"

#include "avrUpdate.h"

extern "C" void system_set_os_print(uint8 onoff);
extern "C" void ets_install_putc1(void* routine);

// Maximum number of simultaned clients connected (WebSocket)
#define MAX_WS_CLIENT 5

#define CLIENT_NONE     0
#define CLIENT_ACTIVE   1

#define HELP_TEXT "[[b;green;]WebSocket2Serial HELP]\n" \
                  "---------------------\n" \
                  "[[b;cyan;]?] or [[b;cyan;]help] show this help\n" \
                  "[[b;cyan;]swap]      swap serial UART pin to GPIO15/GPIO13\n" \
                  "[[b;cyan;]ping]      send ping command\n" \
                  "[[b;cyan;]heap]      show free RAM\n" \
                  "[[b;cyan;]whoami]    show client # we are\n" \
                  "[[b;cyan;]who]       show all clients connected\n" \
                  "[[b;cyan;]fw]        show firmware date/time\n"  \
                  "[[b;cyan;]baud n]    set serial baud rate to n\n" \
                  "[[b;cyan;]reset p]   reset gpio pin number p\n" \
                  "[[b;cyan;]ls]        list SPIFFS files\n" \
                  "[[b;cyan;]read file] send SPIFFS file to serial (read)"

bool serialSwapped = false;

// Web Socket client state
typedef struct {
  uint32_t  id;
  uint8_t   state;
} _ws_client;

//Use the internal hardware buffer
static void _u0_putc(char c){
  while(((U0S >> USTXC) & 0x7F) == 0x7F);
  U0F = c;
}

AsyncWebServer server(80);

#ifdef DEBUG
AsyncWebSocket ws("/ws");


// State Machine for WebSocket Client;
_ws_client ws_client[MAX_WS_CLIENT];
#endif

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

#ifdef DEBUG
void execCommand(AsyncWebSocketClient * client, char * msg) {
  uint16_t l = strlen(msg);
  uint8_t index=MAX_WS_CLIENT;

  // Search if w're known client
  if (client) {
    for (index=0; index<MAX_WS_CLIENT ; index++) {
      // Exit for loop if we are there
      if (ws_client[index].id == client->id() )
        break;
    } // for all clients
  }


}

void onEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
  if(type == WS_EVT_CONNECT){
    uint8_t index;
    os_printf("ws[%s][%u] connect\n", server->url(), client->id());

    for (index=0; index<MAX_WS_CLIENT ; index++) {
      if (ws_client[index].id == 0 ) {
        ws_client[index].id = client->id();
        ws_client[index].state = CLIENT_ACTIVE;
        os_printf("added #%u at index[%d]\n", client->id(), index);
        client->printf("[[b;green;]Hello Client #%u, added you at index %d]", client->id(), index);
        client->ping();
        break; // Exit for loop
      }
    }
    if (index>=MAX_WS_CLIENT) {
      os_printf("not added, table is full");
      client->printf("[[b;red;]Sorry client #%u, Max client limit %d reached]", client->id(), MAX_WS_CLIENT);
      client->ping();
    }

  } else if(type == WS_EVT_DISCONNECT){
    os_printf("ws[%s][%u] disconnect: %u\n", server->url(), client->id());
    for (uint8_t i=0; i<MAX_WS_CLIENT ; i++) {
      if (ws_client[i].id == client->id() ) {
        ws_client[i].id = 0;
        ws_client[i].state = CLIENT_NONE;
        os_printf("freed[%d]\n", i);
        break; // Exit for loop
      }
    }
  } else if(type == WS_EVT_ERROR){
    os_printf("ws[%s][%u] error(%u): %s\n", server->url(), client->id(), *((uint16_t*)arg), (char*)data);
  } else if(type == WS_EVT_PONG){
    os_printf("ws[%s][%u] pong[%u]: %s\n", server->url(), client->id(), len, (len)?(char*)data:"");
  } else if(type == WS_EVT_DATA){
    //data packet
    AwsFrameInfo * info = (AwsFrameInfo*) arg;
    char * msg = NULL;
    size_t n = info->len;
    uint8_t index;

    // Size of buffer needed
    // String same size +1 for \0
    // Hex size*3+1 for \0 (hex displayed as "FF AA BB ...")
    n = info->opcode == WS_TEXT ? n+1 : n*3+1;

    msg = (char*) calloc(n, sizeof(char));
    if (msg) {
      // Grab all data
      for(size_t i=0; i < info->len; i++) {
        if (info->opcode == WS_TEXT ) {
          msg[i] = (char) data[i];
        } else {
          sprintf_P(msg+i*3, PSTR("%02x "), (uint8_t) data[i]);
        }
      }
    }

    os_printf("ws[%s][%u] message %s\n", server->url(), client->id(), msg);

    // Search if it's a known client
    for (index=0; index<MAX_WS_CLIENT ; index++) {
      if (ws_client[index].id == client->id() ) {
        os_printf("known[%d] '%s'\n", index, msg);
        os_printf("client #%d info state=%d\n", client->id(), ws_client[index].state);

        // Received text message
        if (info->opcode == WS_TEXT) {
          execCommand(client, msg);
        } else {
          os_printf("Binary 0x:%s", msg);
        }
        // Exit for loop
        break;
      } // if known client
    } // for all clients

    // Free up allocated buffer
    if (msg)
      free(msg);

  } // EVT_DATA
}
#endif

void sendJsonResultResponse(AsyncWebServerRequest *request, bool cond, String okResultText, String errorResultText,uint32_t processedTime) {
    AsyncResponseStream *response = request->beginResponseStream("text/json");
    DynamicJsonBuffer jsonBuffer;
    JsonObject &root = jsonBuffer.createObject();
    root["result"] = (cond)?okResultText:errorResultText;
    root["time"] = processedTime;
    root.printTo(*response);
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
//Handle upload sampling file
void onSaveSampling(AsyncWebServerRequest *request, String filename, size_t index,
              uint8_t *data, size_t len, bool final) {

    File f;
    String name="/"+filename;

    DEBUG_MSG("File: %s, Size: %d\n",name.c_str(), index);

    if(!index) {
        DEBUG_MSG("UploadStart: %s\n", filename.c_str());
        f=SPIFFS.open(name.c_str(),"w");
    } else {
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
        request->send_P(200, "text/html", "File was successfully uploaded\n");
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

size_t findIndex( const char *a[], size_t size, const char *value ) {
    size_t index = 0;
    while ( index < size && (strcmp(a[index], value) != 0)) {
    	DEBUG_MSG("F: %s - %s\n", a[index], value);
    	++index;
    }
    return ( index == size ? -1 : index );
}


void setLang (AsyncWebServerRequest *request)  {
	String lang=request->arg("lang");
	int size = sizeof(str_lang) / sizeof(str_lang[0]);
	DEBUG_MSG("Lang: %s - LANG ID: %d  SIZE: %d\n",lang.c_str(), findIndex(str_lang,4,lang.c_str() ), size);
	config.lang = findIndex(str_lang,size,lang.c_str());
	request->send_P(200, "text/html", "OK");
	saveConfig();
}

void setTimeCgi(AsyncWebServerRequest *request) {
    String useNtp=request->arg("use-ntp");
    String ntpip=request->arg("ntpip");
    String useDST=request->arg("use-dst");
    String dstStartMonth=request->arg("dstStartMonth");
    String dstStartDay=request->arg("dstStartDay");
    String dstStartWeek=request->arg("dstStartWeek");
    String dstStartOffset=request->arg("dstStartOffset");
    String dstEndMonth=request->arg("dstEndMonth");
    String dstEndDay=request->arg("dstEndDay");
    String dstEndWeek=request->arg("dstEndWeek");
    String dstEndOffset=request->arg("dstEndOffset");
    String timezone=request->arg("timezone");
    String yy=request->arg("yy");
    String mm=request->arg("mm");
    String dd=request->arg("dd");
    String hh=request->arg("hh");
    String mi=request->arg("mi");
    String dateFormat=request->arg("dateFormat");
    String timeFormat=request->arg("timeFormat");
    
    DEBUG_MSG("setTime.cgi started with parameters use-ntp=%s, ntpip=%s  \n",useNtp.c_str(),ntpip.c_str());

    if (useDST.toInt()) {
    		config.useDST = true;
		config.tzRule.dstStart.day = atoi(dstStartDay.c_str());
		config.tzRule.dstStart.month = atoi(dstStartMonth.c_str());
		config.tzRule.dstStart.week = atoi(dstStartWeek.c_str());
		config.tzRule.dstStart.offset = dstOffset[atoi(dstStartOffset.c_str())];

		config.tzRule.dstEnd.day = atoi(dstEndDay.c_str());
		config.tzRule.dstEnd.month = atoi(dstEndMonth.c_str());
		config.tzRule.dstEnd.week = atoi(dstEndWeek.c_str());
		config.tzRule.dstEnd.offset = dstOffset[atoi(dstEndOffset.c_str())];
    } else {
    		config.tzRule.dstEnd.offset = dstOffset[atoi(timezone.c_str())];
    }

    if (useNtp.toInt()) {
        config.useNtp=true;
        config.ntpServer=String(ntpip);
        syncTime = true;
    } else {
        config.useNtp=false;

        tmElements_t t;
        t.Day = atoi(dd.c_str());
        t.Month = atoi(mm.c_str());
        t.Year = atoi(yy.c_str()+2000);
        t.Hour = atoi(hh.c_str());
        t.Minute = atoi(mi.c_str());
        t.Second = 0;
        time_t tt = makeTime(t);
        if (config.useDST == true) {
        		Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
        		setTime(tzlocal.toUTC(tt));
        } else {
        		setTime(tt+(config.tzRule.dstEnd.offset*60));
        }
    }

    DEBUG_MSG("Time set\n");

    config.tmFormat = atoi(timeFormat.c_str());
    config.dtFormat = atoi(dateFormat.c_str());
    DEBUG_MSG("Format set\n");

    normalizeConfig();
    saveConfig();
    
    request->send_P(200, "text/html", "OK");
    
}

void webserver_begin() {

    server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER);
    server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html").setCacheControl("no-cache, must-revalidate");
    
    server.onNotFound([](AsyncWebServerRequest *request){
#ifdef DEBUG
    	DEBUG_MSG("NOT_FOUND: ");
        if(request->method() == HTTP_GET)
        	DEBUG_MSG("GET");
        else if(request->method() == HTTP_POST)
        	DEBUG_MSG("POST");
        else if(request->method() == HTTP_DELETE)
        	DEBUG_MSG("DELETE");
        else if(request->method() == HTTP_PUT)
        	DEBUG_MSG("PUT");
        else if(request->method() == HTTP_PATCH)
        	DEBUG_MSG("PATCH");
        else if(request->method() == HTTP_HEAD)
        	DEBUG_MSG("HEAD");
        else if(request->method() == HTTP_OPTIONS)
        	DEBUG_MSG("OPTIONS");
        else
            Serial.printf("UNKNOWN");
        DEBUG_MSG(" http://%s%s\n", request->host().c_str(), request->url().c_str());
        
        if(request->contentLength()){
        	DEBUG_MSG("_CONTENT_TYPE: %s\n", request->contentType().c_str());
        	DEBUG_MSG("_CONTENT_LENGTH: %u\n", request->contentLength());
        }
        
        int headers = request->headers();
        int i;
        for(i=0;i<headers;i++){
            AsyncWebHeader* h = request->getHeader(i);
            DEBUG_MSG("_HEADER[%s]: %s\n", h->name().c_str(), h->value().c_str());
        }
        
        int params = request->params();
        for(i=0;i<params;i++){
            AsyncWebParameter* p = request->getParam(i);
            if(p->isFile()){
            	DEBUG_MSG("_FILE[%s]: %s, size: %u\n", p->name().c_str(), p->value().c_str(), p->size());
            } else if(p->isPost()){
            	DEBUG_MSG("_POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
            } else {
            	DEBUG_MSG("_GET[%s]: %s\n", p->name().c_str(), p->value().c_str());
            }
        }
#endif
        request->send(404);
    });
    
    server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request){
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
        if(!index) DEBUG_MSG("BodyStart: %u\n", total);
        if(index + len == total) DEBUG_MSG("BodyEnd: %u\n", total);
#endif
    });
    
    server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    	AsyncResponseStream *response = request->beginResponseStream("text/html");
    	        response->print("<html><body>");
    	        response->print("<h1>Restarting ...</h1>\n");
    	        response->print("</body></html>");
    	        request->send(response);
    		ESP.restart();
    });
    
    server.on("/meminfo", HTTP_GET, [](AsyncWebServerRequest *request){
    		uint32_t startTime = millis();
        AsyncJsonResponse * response = new AsyncJsonResponse();
      	JsonObject& root = response->getRoot();
        FlashMode_t ideMode = ESP.getFlashChipMode();
 	    root["heap"] = ESP.getFreeHeap();
    	    root["flashid"] = ESP.getFlashChipId();
    	    root["realSize"] = ESP.getFlashChipRealSize();
    	    root["ideSize"] =  ESP.getFlashChipSize();
    	    root["byIdSize"] =  ESP.getFlashChipSizeByChipId();
    	    root["ideSpeed"] = ESP.getFlashChipSpeed();
    	    root["ideMode"] = (ideMode == FM_QIO ? "QIO" : ideMode == FM_QOUT ? "QOUT" : ideMode == FM_DIO ? "DIO" : ideMode == FM_DOUT ? "DOUT" : "UNKNOWN");
    	    root["sdkVersion"] = ESP.getSdkVersion();
    	    root["coreVersion"] = ESP.getCoreVersion();
    	    root["cpuFreq"] = ESP.getCpuFreqMHz();
    	    root["lastReset"] = ESP.getResetReason();
    	    root["lastResetInfo"] = ESP.getResetInfo();
    	    root["fwMD5"] = ESP.getSketchMD5();
    	    root["time"] = millis()-startTime;
    	    response->setLength();
    	    request->send(response);

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
            if (ok) {
                request->send_P(200, "text/html", "File was successfully deleted");
            } else {
                request->send_P(200, "text/html", "File was not deleted");
            }
        } else {
            request->send_P(200, "text/html", "Unknown parameter");
        }
    });
    
    server.on("/upload",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","/upload started");
        AsyncWebServerResponse *response = request->beginResponse_P(200, "text/html", upload_html);
        request->send(response);
    });

    server.on("/update",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","/update started");
        request->send(200,"text/html",update_html);
    });

    server.on("/formatfs",HTTP_GET,[](AsyncWebServerRequest *request) {

        uint32_t startTime=millis();

        DEBUG_MSG("%s\n","/formatfs.cgi request started ");
        PRINT_CONFIG(config);

        bool ok=SPIFFS.format();

        DEBUG_MSG("/formatfs.cgi request finished with result %s \n",(ok)?"OK":"ERROR");

        sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
    });

    /*
     *  WiFi scan handler
     */
    server.on("/wifiscan.cgi",HTTP_GET,[](AsyncWebServerRequest *request){

        PRINT_CONFIG(config);
        int count = WiFi.scanComplete();
        //send result
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        response->print("{\"result\": {\n");
        response->printf("\"inProgress\": \"%d\",\n",count>=0?0:-1);
        response->print("\"APs\": [\n");

        for(int i=0;i<count;i++) {
        	if (i>0) response->printf(",\n");
        	response->printf("{\"essid\": \"%s\", \"rssi\": \"%d\", \"enc\": \"%d\", \"ch\": \"%d\"}",WiFi.SSID(i).c_str(),WiFi.RSSI(i),WiFi.encryptionType(i),WiFi.channel(i));
        }
		response->printf("\n");

        response->print("]\n");
        response->print("}\n}\n");
        request->send(response);

        if ( WiFi.scanComplete() != WIFI_SCAN_RUNNING ) {
            WiFi.scanDelete();
            WiFi.scanNetworks(true);
        }
    });
    
    server.on("/wifistatus.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","WifiStatus started");
        
        AsyncResponseStream *response = request->beginResponseStream("text/json");
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
        changed = WIFI;
        AsyncWebServerResponse *response = request->beginResponse(200);
        response->addHeader("refresh","20;url=http://"+config.hostname+".local");
        PRINT_CONFIG(config);
        request->send(response);
    });
    

    server.on("/settime.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        setTimeCgi(request);
        changed = TIME;
    });
    
    server.on("/setlang.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        setLang(request);
        changed = LANG;
    });

/*  OBSOLETE
    server.on("/saveTimeSlotValues.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
        
        uint32_t startTime=millis();
        
        String filename= request->arg("filename")+".pjs";
        
        
        DEBUG_MSG("/saveTimeSlotValues.cgi request started with parameters filename=%s  \n",filename.c_str());
        PRINT_CONFIG(config);
        bool ok=saveSamplingStruct(filename);
        sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
        changed = LED;
    });
*/
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

    /*    OBSOLETE
    server.on("/setTimeSlotProfile.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {

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
        changed = LED;
    });
*/
    
    server.on("/getinfo.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {

    	PRINT_CONFIG();
    	DEBUG_MSG("%s\n","getinfo.cgi");

    	uint32_t startTime=millis();

    	 AsyncJsonResponse * response = new AsyncJsonResponse();
    	 JsonObject& root = response->getRoot();
    	 root["mode"] = mode;
    	 root["modulescount"] = modulesCount;

    	  time_t localtime = now();
    	  if (config.useDST) {
    			Tz tzlocal=Tz(config.tzRule.dstStart,config.tzRule.dstEnd);
    			localtime = tzlocal.toLocal(now());
    	  }

    	 root["timeslot"] = (uint32_t)hour(localtime)*3600+(uint32_t)minute(localtime)*60+(uint32_t)second(localtime)%900;
    	 JsonArray& tsv = root.createNestedArray("timeSlotValues");


		 for(uint8_t i=1;i<modulesCount+1;i++) {
			 JsonArray& led = tsv.createNestedArray();
			 for(uint8_t j=1;j<8;j++) {
				 if (config.manual == true) {
					 led.add((int)config.manualValues[i-1][j-1]);
				 } else {
					 led.add((int)getSamplingValue(i,j));
				 }
			 }

		 }

    	 root["time"] = millis()-startTime;
    	 response->setLength();
    	 request->send(response);
         PRINT_CONFIG();
    });
    

    server.on("/getconfig.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
         uint32_t startTime=millis();
         DEBUG_MSG("%s\n","getconfig.cgi");
         AsyncJsonResponse * response = new AsyncJsonResponse();

    	 JsonObject& root = response->getRoot();
    	 root["modulescount"] = modulesCount;
    	 root["lang"]         = str_lang[config.lang];
    	 root["dst"]          = config.useDST;
    	 root["useNTP"]       = config.useNtp;
    	 root["ntpServer"]    = config.ntpServer.c_str();
    	 root["timeZone"]     = config.tzRule.tzName.c_str();
    	 root["dtFormat"]     = config.dtFormat;
    	 root["tmFormat"]     = config.tmFormat;
    	 root["dstStartDay"]  = config.tzRule.dstStart.day;
    	 root["dstStartWeek"] = config.tzRule.dstStart.week;
    	 root["dstStartMonth"]= config.tzRule.dstStart.month;
    	 root["dstStartHour"] = config.tzRule.dstStart.hour;
    	 root["dstStartOffset"]= config.tzRule.dstStart.offset;
    	 root["dstEndDay"]    = config.tzRule.dstEnd.day;
    	 root["dstEndWeek"]    = config.tzRule.dstEnd.week;
    	 root["dstEndMonth"]    = config.tzRule.dstEnd.month;
    	 root["dstEndHour"]    = config.tzRule.dstEnd.hour;
    	 root["dstEndOffset"]    = config.tzRule.dstEnd.offset;
    	 root["isManual"]  = config.manual;
    	 root["profileFileName"]  = config.profileFileName.c_str();
    	 root["lcdTimeout"] = config.lcdTimeout;
    	 root["menuTimeout"] = config.menuTimeout;
    	 root["time"] = millis()-startTime;
    	 response->setLength();
    	 request->send(response);
    });

    server.on("/gettime.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        time_t utc = now();    //current time from the Time Library
        AsyncResponseStream *response = request->beginResponseStream("text/json");
        DynamicJsonBuffer jsonBuffer;
        JsonObject &root = jsonBuffer.createObject();
        root["utc"] = utc;
        root.printTo(*response);
        request->send(response);
    });

    server.on("/avr.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        DEBUG_MSG("%s\n","CGI Flashing Arduino\n");
        arduinoFlash = true;
        sendJsonResultResponse(request,true);
    });

    server.on("/avrstatus.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
        AsyncResponseStream *response = request->beginResponseStream("text/json");
        DynamicJsonBuffer jsonBuffer;
        JsonObject &root = jsonBuffer.createObject();
        root["status"] = arduinoGetStatus();
        root["pages"] = arduinoPages();
        root["pagesFlashed"] = arduinoPagesFlashed();
        root.printTo(*response);
        request->send(response);
    });

    server.on("/saveSampling.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {}, onSaveSampling);

    server.on("/setprofile.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
    			uint32_t startTime=millis();
    	        String profileName=request->arg("profileName");
    	        String nfilename;
    	        if (!profileName.endsWith(".pjs")) {
    	            nfilename=String(profileName+".pjs");
    	        } else {
    	            nfilename=String(profileName);
    	        }

    	        bool ok=loadSamplingStruct(nfilename,&samplings);
    	        if (ok) {
    	            config.profileFileName=String(nfilename);
    	            ok=saveConfig();
    	        }
    	        sendJsonResultResponse(request,ok,"OK","ERROR",millis()-startTime);
    	        changed = LED;
    });

    server.on("/setmanual.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
    	 DEBUG_MSG("%s\n","setmanual.cgi");
    	 int m = StringToInt((String)request->arg("m"));
    	 config.manual = m==0?false:true;
    	 sendJsonResultResponse(request,true);
    	 saveConfig();
    	 changed = MANUAL;
    });

    server.on("/getversions.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
    	 sendJsonResultResponse(request,true);
    	 changed = VERSIONINFO;
    });

    server.on("/resetavr.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
    	 sendJsonResultResponse(request,true);
    	 changed = RESETAVR;
    });

    server.on("/showversions.cgi",HTTP_GET,[](AsyncWebServerRequest *request) {
    	    uint32_t startTime = millis();
        AsyncResponseStream *response = request->beginResponseStream("text/json");
        DynamicJsonBuffer jsonBuffer;
        JsonObject &root = jsonBuffer.createObject();
        root["coreVersion"] = coreVersion;
        root["masterVersion"] = versionInfo.mainModule;
        JsonArray& mv = root.createNestedArray("modulesVersion");
		 for(uint8_t i=0;i<modulesCount;i++) {
			 mv.add(versionInfo.slaveModules[i]);
		 }
        JsonArray& mt = root.createNestedArray("modulesTemperature");
			 for(uint8_t i=0;i<modulesCount;i++) {
				 mt.add( modulesTemperature[i]);
   	   }

         root["time"] = millis()-startTime;

         root.printTo(*response);
         request->send(response);
    });

    server.on("/setled.cgi",HTTP_POST,[](AsyncWebServerRequest *request) {
    	 DEBUG_MSG("%s\n","setled.cgi");

    	 String json = (String)request->arg("body");
    	 DEBUG_MSG("\n%s\n", json.c_str());
    	 DynamicJsonBuffer jsonBuffer;
    	 JsonObject& root = jsonBuffer.parseObject(json);

    	 if (!root.success()) {
    	   Serial.println("parseObject() failed");
    	   sendJsonResultResponse(request,false);
    	   return;
    	 }


    	 int m = root["0"];

		 for (uint8_t i=(m>0?m-1:0); i < (m==0?MAX_MODULES:m); i++) {
			 config.manualValues[i][0] = (uint16_t)root["1"];
			 config.manualValues[i][1] = (uint16_t)root["2"];
			 config.manualValues[i][2] = (uint16_t)root["3"];
			 config.manualValues[i][3] = (uint16_t)root["4"];
			 config.manualValues[i][4] = (uint16_t)root["5"];
			 config.manualValues[i][5] = (uint16_t)root["6"];
			 config.manualValues[i][6] = (uint16_t)root["7"];
		 }
		 saveConfig();
    	 sendJsonResultResponse(request,true);
    	 changed = MANUAL;
    });

#ifdef DEBUG
     ws.onEvent(onEvent);
     server.addHandler(&ws);
#endif



    server.begin();
    DEBUG_MSG("%s\n","HTTP server started");

}

