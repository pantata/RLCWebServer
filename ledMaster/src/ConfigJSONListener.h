
#ifndef CONFIG_JSON_LISTENER_H
#define CONFIG_JSON_LISTENER_H

#include <JsonListener.h>
#include "JsonStreamingParser.h"
#include "common.h"

struct Config; 

class ConfigJsonListener : public JsonListener {
  Config *config;
  String currentKey;
  bool inManualValuesArray = false;
  int arrayIndex = 0;  // Index pro ukládání hodnot do pole

public:
  ConfigJsonListener(Config *config) : config(config) {}

  virtual void key(String key) {
    currentKey = key;
     if (key == "manualValues") {
            inManualValuesArray = true;  // Začínáme zpracovávat array
            arrayIndex = 0;  // Reset indexu na začátek
      }
  }

  virtual void value(String value) {
    if (currentKey == "version") {
      config->version = value.toInt();
    } else if (currentKey == "ssid") {
      config->ssid = value;
    } else if (currentKey == "pwd") {
      config->pwd = value;
    } else if (currentKey == "hostname") {
      config->hostname = value;
    } else if (currentKey == "localPort") {
      config->localPort = value.toInt();      
    } else if (currentKey == "ntpServer") {
      config->ntpServer = value;
    } else if (currentKey == "useNtp") {
      config->useNtp = value.equals("true") ? true : false;
    } else if (currentKey == "profileFileName") {
      config->profileFileName = value;
    } else if (currentKey == "wifidhcp") {
      config->wifidhcp = value.equals("true") ? true : false;      
    } else if (currentKey == "wifiip") {      
      config->wifiip = value;
    } else if (currentKey == "wifimask") {      
      config->wifimask = value;
    } else if (currentKey == "wifigw") {      
      config->wifigw = value;      
    } else if (currentKey == "wifidns1") {
      config->wifidns1 = value;
    } else if (currentKey == "wifidns2") {
      config->wifidns2 = value;
    } else if (currentKey == "appwd") {
      config->appwd = value;
    } else if (currentKey == "apchannel") {
      config->apchannel = value.toInt();
    } else if (currentKey == "apip") {
      config->apip = value;
    } else if (currentKey == "apmask") {
      config->apmask = value;
    } else if (currentKey == "apgw") {
      config->apgw = value;
    } else if (currentKey == "useDST") {
      config->useDST = value == "true";
    } else if (currentKey == "tzRule.tzName") {
      config->tzRule.tzName = value;			
    } else if (currentKey == "tzRule.dstStart.day") {
      config->tzRule.dstStart.day = value.toInt();			
    } else if (currentKey == "tzRule.dstStart.hour") {
      config->tzRule.dstStart.hour = value.toInt();			
    } else if (currentKey == "tzRule.dstStart.month") {
      config->tzRule.dstStart.month = value.toInt();			
    } else if (currentKey == "tzRule.dstStart.offset") {
      config->tzRule.dstStart.offset = value.toInt();			
    } else if (currentKey == "tzRule.dstStart.weeek") {
      config->tzRule.dstStart.week = value.toInt();			
    } else if (currentKey == "tzRule.dstEnd.day") {
      config->tzRule.dstEnd.day = value.toInt();			
    } else if (currentKey == "tzRule.dstEnd.hour") {
      config->tzRule.dstEnd.hour = value.toInt();			
    } else if (currentKey == "tzRule.dstEnd.month") {
      config->tzRule.dstEnd.month = value.toInt();			
    } else if (currentKey == "tzRule.dstEnd.offset") {
      config->tzRule.dstEnd.offset = value.toInt();			
    } else if (currentKey == "tzRule.dstEnd.week") {
      config->tzRule.dstEnd.week = value.toInt();			
    } else if (currentKey == "dtFormat") {
      config->dtFormat = value.toInt();
    } else if (currentKey == "tmFormat") {
      config->tmFormat = value.toInt();
    } else if (currentKey == "lang") {
      config->lang = value.toInt();
    } else if (currentKey == "manual") {
      config->manual = value == "true";
    } else if (currentKey == "startUpdate") {
      config->startUpdate = value == "true";
    } else if (inManualValuesArray && arrayIndex < 7 ) {
      int tmp = value.toInt();  // Převod String na int
      if (tmp >= 0 && tmp <= 65535) {
        config->manualValues[arrayIndex++] = static_cast<uint16_t>(tmp);
      }
    } else if (currentKey == "peersCount") {
      config->peersCount = value.toInt();
    } 

    //TODO: mozna bude lepsi najit vzdy po startu vsechny peers
    /*
    else if (inManualValuesArray && arrayIndex < 7 ) {
      int tmp = value.toInt();  // Převod String na int
      if (tmp >= 0 && tmp <= 65535) {
        config->manualValues[arrayIndex++] = static_cast<uint16_t>(tmp);
      }
    }
    if (json.containsKey("peers")) {
			for (int i = 0; i < conf->peersCount; i++) {
				for (int ii = 0; ii < 6; ii++) {
					conf->peers[i].mac[ii] = json["peers"][i][ii];
				}
			}
		}
    */
  }

   virtual void whitespace(char c) {
    // Zde lze přidat kód pro zpracování bílých znaků, pokud je to potřeba
  }

  virtual void startDocument() {
    // Zde lze přidat kód na začátku dokumentu
    config->tzRule = TzRule();
  }

  virtual void endDocument() {
    // Zde lze přidat kód na konci dokumentu
  }

  virtual void startObject() {
    // Zde lze přidat kód na začátku objektu
  }

  virtual void endObject() {
    // Zde lze přidat kód na konci objektu
  }

  virtual void startArray() {
    // Zde lze přidat kód na začátku pole
  }

  virtual void endArray() {
    // Zde lze přidat kód na konci pole
    if (inManualValuesArray) {
      inManualValuesArray = false;  // Konec zpracování array
    } 
  }

};

#endif // CONFIG_JSON_LISTENER_H