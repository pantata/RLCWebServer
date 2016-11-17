# ----------------------------------
# Board specifics defined in .xconfig file
# BOARD_TAG and AVRDUDE_PORT 
#
ifneq ($(MAKECMDGOALS),boards)
    ifneq ($(MAKECMDGOALS),clean)
        ifndef BOARD_TAG
            $(error BOARD_TAG not defined)
        endif
    endif
endif



# Path to applications folder
#
#USER_PATH      := $(HOME)

# ~

#ifndef APPLICATIONS_PATH
#    APPLICATIONS_PATH = /Applications
#endif


# APPlications full paths
# ----------------------------------

#ARDUINO_APP   := $(APPLICATIONS_PATH)/ArduinoCC.app


# Arduino.app or ArduinoCC.app or Genuino.app by Arduino.CC or Genuino
#

#ifeq ($(ARDUINO_CC_APP),)
#    ifneq ($(wildcard $(APPLICATIONS_PATH)/ArduinoCC.app),)
#        ifneq ($(shell grep -e '$(ARDUINO_CC_RELEASE)' $(APPLICATIONS_PATH)/ArduinoCC.app/Contents/Java/lib/version.txt),)
#            ARDUINO_CC_APP = $(APPLICATIONS_PATH)/ArduinoCC.app
#        endif
#    endif
#endif


# Arduino.CC and Arduino.ORG
#
#ARDUINO_PATH        := $(ARDUINO_APP)/Contents/Java
#ARDUINO_CC_PATH     := $(ARDUINO_CC_APP)/Contents/Java

# Additional boards for ArduinoCC 1.6.5 Boards Manager
# ----------------------------------
# Arduino.app or ArduinoCC.app or Genuino.app by Arduino.CC or Genuino
# Only if ARDUINO_CC_APP exists
#


#ARDUINO_CC_PACKAGES_PATH = $(HOME)/Library/Arduino15/packages

# ESP8266 NodeMCU.app path for ArduinoCC 1.6.5
#
ESP8266_APP     = $(ESP8266_PACKAGES)
ESP8266_PATH    = $(ESP8266_APP)
ESP8266_BOARDS  = $(ESP8266_PACKAGES)/hardware/esp8266/$(ESP8266_RELEASE)/boards.txt

# Miscellaneous
# ----------------------------------
# Variables
#
TARGET      := $(PROJECT_NAME_AS_IDENTIFIER)
USER_FLAG   := true

# Builds directory
#
OBJDIR  = Builds

# Function PARSE_BOARD data retrieval from boards.txt
# result = $(call PARSE_BOARD 'boardname','parameter')
#
#PARSE_BOARD = $(shell if [ -f $(BOARDS_TXT) ]; then grep ^$(1).$(2)= $(BOARDS_TXT) | cut -d = -f 2-; fi; )

# Function PARSE_FILE data retrieval from specified file
# result = $(call PARSE_FILE 'boardname','parameter','filename')
#
#PARSE_FILE = $(shell if [ -f $(3) ]; then grep ^$(1).$(2) $(3) | cut -d = -f 2-; fi; )

# ~
# Warnings flags
#
ifeq ($(WARNING_OPTIONS),)
    WARNING_FLAGS = -Wall
else
    ifeq ($(WARNING_OPTIONS),0)
        WARNING_FLAGS = -w
    else
        WARNING_FLAGS = $(addprefix -W, $(WARNING_OPTIONS))
    endif
endif
# ~~


# Clean if new BOARD_TAG
# ----------------------------------
#
NEW_TAG := $(strip $(OBJDIR)/$(BOARD_TAG).board) #
OLD_TAG := $(strip $(wildcard $(OBJDIR)/*.board)) # */

ifneq ($(OLD_TAG),$(NEW_TAG))
    CHANGE_FLAG := 1
else
    CHANGE_FLAG := 0
endif

include $(MAKEFILE_PATH)/ESP8266.mk

# List of sub-paths to be excluded
#
EXCLUDE_NAMES  = Example example Examples examples Archive archive Archives archives Documentation documentation Reference reference
EXCLUDE_NAMES += ArduinoTestSuite tests
EXCLUDE_NAMES += $(EXCLUDE_LIBS)
EXCLUDE_LIST   = $(addprefix %,$(EXCLUDE_NAMES))

# Step 2
#
include $(MAKEFILE_PATH)/Step2.mk

