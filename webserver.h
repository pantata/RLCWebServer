//
//  webserver.h
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version    v0.1-4-gb551a72

#ifndef webserver_h
#define webserver_h

void webserver_begin();
void setTimeCgi(AsyncWebServerRequest *request);
void sendJsonResultResponse(AsyncWebServerRequest *request,bool cond,String okResultText,String errorResultText,uint32_t processedTime);
void samplingRequest(AsyncWebServerRequest *request);


const char upload_html[] PROGMEM = R"html(
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8">
<meta name="generator" content="PSPad editor, www.pspad.com">
<title></title>
</head>
<body>
<h1>File uploader</h1>
<form enctype="multipart/form-data" action="/uploader.html" method="POST">
<input type="file" name="datafile" />
<input type="submit" value="Upload"/>
</form>
</body>
</html>
)html";

const char update_html[] PROGMEM = R"html(
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta name="generator" content="PSPad editor, www.pspad.com">
<title></title>
</head>
<body>
<h1>Firmware updater</h1>
<form enctype="multipart/form-data" action="/updater.html" method="POST">
<input name="fwupdate" type="hidden">
<input name="datafile" type="file">
<input value="Firmware Upload" type="submit">
</form>
</body></html>
)html";



#endif /* webserver_h */
