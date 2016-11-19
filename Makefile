# TODO: upravit mazani pro Windows 


#identifikace
PROJECT_NAME_AS_IDENTIFIER = RlcWebFw
SKETCH_EXTENSION = cpp

#cesty
ifeq ($(OS),Windows_NT)
CURRENT_DIR      := .
SKETCHBOOK_DIR   := C:/Users/ludek/Documents/Arduino
USER_LIB_PATH    := $(wildcard $(SKETCHBOOK_DIR)/?ibraries)
ESP8266_PACKAGES := C:/Users/ludek/AppData/Local/Arduino15/packages/esp8266
else
CURRENT_DIR      := .
SKETCHBOOK_DIR   := /Users/ludek/Dropbox/Arduino-xcode
USER_LIB_PATH    := $(wildcard $(SKETCHBOOK_DIR)/?ibraries)
ESP8266_PACKAGES := /Users/ludek/Library/Arduino15/packages/esp8266
endif
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

#
# Executables
#
ifeq ($(OS),Windows_NT)
   GIT     = git
   REMOVE  = del /F /Q /S
   MV      = move
   COPY    = copy
   CAT     = cat
   ECHO    = echo
   PYTHON  = python.exe
   FixPath = $(subst /,\,$1)
   mkdir = @mkdir $(subst /,\,$(1)) > nul 2>&1 || (exit 0)
#   rm = $(wordlist 2,65535,$(foreach FILE,$(subst /,\,$(1)),& del $(FILE) > nul 2>&1)) || (exit 0)
   rmdir = rmdir $(1) > nul 2>&1 || (exit 0)
#   echo = echo $(1)  
else
   GIT     = git
   REMOVE  = rm -rf
   MV      = mv -f
   COPY    = cp
   CAT     = cat
   ECHO    = echo
   PYTHON  = /usr/bin/python
   FixPath = $1
   mkdir = mkdir -p $(1)
#   rm = rm $(1) > /dev/null 2>&1 || true
#   rmdir = rmdir $(1) > /dev/null 2>&1 || true
#   echo = echo "$(1)"  
endif


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
GIT_VERSION := $(shell $(GIT) describe --tags --always) #_$(shell date "+%y%m%d")_$(BUILD_NUMBER)
CPPFLAGS += -DVERSION=\"$(GIT_VERSION)\"


# Miscellaneous
# ----------------------------------
# Manage path with space in the name
#
#CURRENT_DIR   := $(shell pwd)
#CURRENT_DIR   := $(shell echo '$(CURRENT_DIR)' | sed 's/ /\\\ /g')


PROJECT_NAME = $(PROJECT_NAME_AS_IDENTIFIER)
MAKEFILE_PATH  = Makefiles
#OPTIMISATION    = -Os -g3
ARDUINO_CC_RELEASE = 1.6.12

include $(MAKEFILE_PATH)/Step2.mk


