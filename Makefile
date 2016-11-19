# Executables
#

ifeq ($(OS),Windows_NT)
   GIT     = git
   REMOVE  = del /F /Q 
   MV      = move
   COPY    = copy
   CAT     = cat
   ECHO    = echo
   PYTHON  = python.exe
   FixPath = $(subst /,\,$1)
else
   GIT     = git
   REMOVE  = rm -rf
   MV      = mv -f
   COPY    = cp
   CAT     = cat
   ECHO    = echo
   PYTHON  = /usr/bin/python
   FixPath = $1
endif

#identifikace
PROJECT_NAME_AS_IDENTIFIER = RlcWebFw
SKETCH_EXTENSION = cpp

#cesty
CURRENT_DIR      := .
SKETCHBOOK_DIR   := /Users/ludek/Dropbox/Arduino-xcode
USER_LIB_PATH    := $(wildcard $(SKETCHBOOK_DIR)/?ibraries)
ESP8266_PACKAGES := /Users/ludek/Library/Arduino15/packages/esp8266

#knihovny
APP_LIBS_LIST    = ArduinoOTA esp8266 ESP8266mDNS ESP8266WiFi Hash DNSServer
USER_LIBS_LIST   = ArduinoJson NTPClient MyTime ESPAsyncTCP ESPAsyncWebServer
LOCAL_LIBS_LIST  = 

WARNING_OPTIONS = 0

#upload
BOARD_PORT = /dev/cu.usb*
SERIAL_BAUDRATE = 115200
UPLOADER = espota
IP_ADDRESS = 192.168.168.105

#ESP CHIP
ESP8266_RELEASE  = 2.3.0
ESPTOOLS_RELEASE = 0.4.9
EXTENSA_RELEASE  = 1.20.0-26-gb404fb9-2

MAX_FLASH_SIZE    := 761840
MAX_RAM_SIZE      := 81920
F_CPU		      := 80000000L
BUILD_FLASH_SIZE  := 1M
BUILD_FLASH_FREQ  := 40
LDSCRIPT 		  := eagle.flash.1m256.ld
FLASH_MODE        := qio
RESET_MODE        := ck 

BOARD_TAG  = generic
BOARD_TAG1 = generic.menu.FlashSize.1M256
BOARD_TAG2 = generic.menu.FlashFreq.40
GCC_PREPROCESSOR_DEFINITIONS = ESP8266 ARDUINO

#verzovani souboru
#VER  = $(shell sed -i '' -e "s/\@version.*/\@version    `git describe --tags --always`/g" $(CURRENT_DIR)/$(1))

#$(call VER,"RlcWebFw.ino")
#$(call VER,"RlcWebFw.h")
#$(call VER,"common.h")
#$(call VER,"sampling.cpp")
#$(call VER,"sampling.h")
#$(call VER,"serial.cpp")
#$(call VER,"serial.h")
#$(call VER,"webserver.cpp")
#$(call VER,"webserver.h")

#BUILD_NUMBER_FILE=build-number.txt

# Build number file.  Increment if any object file changes.

#$(shell if ! test -f $(BUILD_NUMBER_FILE); then echo 0 > $(BUILD_NUMBER_FILE);fi )
#$(shell echo $$(($$(cat $(BUILD_NUMBER_FILE)) + 1)) > $(BUILD_NUMBER_FILE) )

#BUILD_NUMBER := $(shell echo $$(($$(cat $(BUILD_NUMBER_FILE)) + 1)))
GIT_VERSION := $(shell $(GIT) describe --tags --always)#_$(shell date "+%y%m%d")_$(BUILD_NUMBER)
CPPFLAGS += -DVERSION=\"$(GIT_VERSION)\"


# Miscellaneous
# ----------------------------------
# Manage path with space in the name
#
#CURRENT_DIR   := $(shell pwd)
#CURRENT_DIR   := $(shell echo '$(CURRENT_DIR)' | sed 's/ /\\\ /g')



MAKEFILE_PATH  = Makefiles
#OPTIMISATION    = -Os -g3
ARDUINO_CC_RELEASE = 1.6.12

include $(MAKEFILE_PATH)/Step2.mk


