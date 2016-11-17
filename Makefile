
SKETCHBOOK_DIR := /Users/ludek/Dropbox/Arduino-xcode
USER_LIB_PATH  = $(wildcard $(SKETCHBOOK_DIR)/?ibraries)

APP_LIBS_LIST = ArduinoOTA esp8266 ESP8266mDNS ESP8266WiFi Hash DNSServer
USER_LIBS_LIST =  ArduinoJson NTPClient MyTime ESPAsyncTCP ESPAsyncWebServer
LOCAL_LIBS_LIST = 
#EXCLUDE_LIBS = Firmata WiFi Esplora OneWire Robot_Control Robot_Control/utility Robot_Motor
WARNING_OPTIONS = 0

BOARD_PORT = /dev/cu.usb*
SERIAL_BAUDRATE = 115200

#OPTIMISATION    = -Os -g3

# Miscellaneous
# ----------------------------------
# Manage path with space in the name
#
CURRENT_DIR   := $(shell pwd)
CURRENT_DIR   := $(shell echo '$(CURRENT_DIR)' | sed 's/ /\\\ /g')

# C-compliant project name
#
PROJECT_NAME_AS_IDENTIFIER = RlcWebFw
SKETCH_EXTENSION = cpp

MAKEFILE_PATH  = $(CURRENT_DIR)/Makefiles

MAX_FLASH_SIZE = 761840

UPLOADER = espota
IP_ADDRESS = 192.168.168.105
#SSH_ADDRESS = 172.16.1.16
#SSH_ADDRESS = 192.168.4.1

#add version number to header

VER  = $(shell sed -i '' -e "s/\@version.*/\@version    `git describe --tags --always`/g" $(CURRENT_DIR)/$(1))

#$(call VER,"RlcWebFw.ino")
#$(call VER,"RlcWebFw.h")
#$(call VER,"common.h")
#$(call VER,"sampling.cpp")
#$(call VER,"sampling.h")
#$(call VER,"serial.cpp")
#$(call VER,"serial.h")
#$(call VER,"webserver.cpp")
#$(call VER,"webserver.h")


BUILD_NUMBER_FILE=build-number.txt

# Build number file.  Increment if any object file changes.

$(shell if ! test -f $(BUILD_NUMBER_FILE); then echo 0 > $(BUILD_NUMBER_FILE);fi )
$(shell echo $$(($$(cat $(BUILD_NUMBER_FILE)) + 1)) > $(BUILD_NUMBER_FILE) )

BUILD_NUMBER := $(shell echo $$(($$(cat $(BUILD_NUMBER_FILE)) + 1)))
GIT_VERSION := $(shell git describe --tags --always)_$(shell date "+%y%m%d")_$(BUILD_NUMBER)

#EXTRA_CFLAGS += -DVERSION=\"$(GIT_VERSION)\"

CPPFLAGS += -DVERSION=\"$(GIT_VERSION)\"

BOARD_TAG  = generic
BOARD_TAG1 = generic.menu.FlashSize.1M256
BOARD_TAG2 = generic.menu.FlashFreq.40
GCC_PREPROCESSOR_DEFINITIONS = ESP8266 ARDUINO 

#HEADER_SEARCH_PATHS = /Applications/Arduino.app/Contents/Resources/Java/** /Applications/Arduino.app/Contents/Java/** /Applications/Espressif.app/Contents/Java/**

ARDUINO_CC_RELEASE              = 1.6.12
ESP8266_RELEASE                 = 2.3.0
ESPTOOLS_RELEASE                = 0.4.9
EXTENSA_RELEASE                 = 1.20.0-26-gb404fb9-2

ESP8266_PACKAGES = /Users/ludek/Library/Arduino15/packages/esp8266

include $(MAKEFILE_PATH)/Step1.mk


