//
//  webserver.h
//  RlcWebFw
//
//  Created by Ludek Slouf on 14.11.16.
//  Copyright © 2016 Ludek Slouf. All rights reserved.
//
//  @version v0.2-10-gf4a3c71

#ifndef webserver_h
#define webserver_h

void webserver_begin();
void setTimeCgi(AsyncWebServerRequest *request);
void sendJsonResultResponse(AsyncWebServerRequest *request,bool cond = true,String okResultText = "OK",String errorResultText = "Error",uint32_t processedTime = 0);
//void samplingRequest(AsyncWebServerRequest *request);
//void printSampligs(AsyncResponseStream *response, Samplings *p_s, int mc);

const char update_html[] PROGMEM = R"html(
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
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

const char upload_html[] PROGMEM = R"html(
<h1>File uploader</h1>
<form enctype="multipart/form-data" action="/upload" method="POST">
<input name="datafile" type="file">
<input value="File Upload" type="submit">
</form>
)html";

const char list_header_table[] PROGMEM = "<table><tr><td><i>File Name</i></td><td  align=\"right\"><i>Size</i></td></tr>";
const char list_footer_html[] PROGMEM = R"html(
<tr><td></td></tr>
<tr><td>Bytes Total</td>
<td align="right">%d</td></tr>
<tr><td>Bytes Used</td>
<td align="right">%d</td></tr>
<tr><td>Bytes Free</td>
<td align="right">%d</td></tr>
</table>
)html";

const char HTMLERROR[] PROGMEM = "Error";
const char HTMLOK[] PROGMEM = "Success";


#endif /* webserver_h */
