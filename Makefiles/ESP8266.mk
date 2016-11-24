# ESP8266 specifics
# ----------------------------------
#
BOARD_NAME       := Generic ESP8266 Module
MCU              := esp8266 
	 
PLATFORM         := esp8266

PLATFORM_TAG      = ARDUINO=10610 ARDUINO_ARCH_ESP8266 ESP8266 ARDUINO_BOARD=\"ESP8266_01\"
APPLICATION_PATH := $(ESP8266_PATH)
PLATFORM_VERSION := $(ESP8266_RELEASE) for Arduino $(ARDUINO_CC_RELEASE)

HARDWARE_PATH     = $(APPLICATION_PATH)/hardware/esp8266/$(ESP8266_RELEASE)
TOOL_CHAIN_PATH   = $(APPLICATION_PATH)/tools/xtensa-lx106-elf-gcc/$(EXTENSA_RELEASE)
OTHER_TOOLS_PATH  = $(APPLICATION_PATH)/tools

BOARDS_TXT      := $(HARDWARE_PATH)/boards.txt
BUILD_CORE       = esp8266
BUILD_BOARD      = ARDUINO_ESP8266_ESP01

ESP_POST_COMPILE   = $(APPLICATION_PATH)/tools/esptool/$(ESPTOOLS_RELEASE)/esptool
BOOTLOADER_ELF     = $(HARDWARE_PATH)/bootloaders/eboot/eboot.elf

# Complicated menu system for Arduino 1.5
# Another example of Arduino's quick and dirty job
#
BOARD_TAGS_LIST   = $(BOARD_TAG) $(BOARD_TAG1) $(BOARD_TAG2)

ifeq ($(UPLOADER),espota)
# ~
    UPLOADER_PATH       = $(HARDWARE_PATH)/tools
    UPLOADER_EXEC       = $(PYTHON) $(UPLOADER_PATH)/espota.py
    UPLOADER_OPTS       = -d -i $(IP_ADDRESS)
# ~~
else
    UPLOADER            = esptool
    UPLOADER_PATH       = $(OTHER_TOOLS_PATH)/esptool/$(ESPTOOLS_RELEASE)
    UPLOADER_EXEC       = $(UPLOADER_PATH)/esptool
    UPLOADER_OPTS       = -vv -cd $(RESET_MODE)
    UPLOADER_OPTS      += -cb $(SERIAL_BAUDRATE)
endif

APP_TOOLS_PATH      := $(TOOL_CHAIN_PATH)/bin
CORE_LIB_PATH       := $(HARDWARE_PATH)/cores/esp8266


# Take assembler file as first
#
APP_LIB_PATH        := $(HARDWARE_PATH)/libraries
CORE_AS_SRCS         = $(wildcard $(CORE_LIB_PATH)/*.S) # */
esp001               = $(patsubst %.S,%.S.o,$(filter %S, $(CORE_AS_SRCS)))
FIRST_O_IN_A         = $(patsubst $(APPLICATION_PATH)/%,$(OBJDIR)/%,$(esp001))

L_FLAGS         = -lm -lgcc -lhal -lphy -lpp -lnet80211 -lwpa -lcrypto -lmain -lwps -laxtls -lsmartconfig -lmesh -lwpa2 -llwip_gcc -lstdc++
ADDRESS_BIN1     = 00000

# Sketchbook/Libraries path
# wildcard required for ~ management
# ?ibraries required for libraries and Libraries
#
VARIANT      = generic
VARIANT_PATH = $(HARDWARE_PATH)/variants/$(VARIANT)

VARIANT_CPP_SRCS  = $(wildcard $(VARIANT_PATH)/*.cpp) # */
VARIANT_OBJ_FILES = $(VARIANT_CPP_SRCS:.cpp=.cpp.o)
VARIANT_OBJS      = $(patsubst $(VARIANT_PATH)/%,$(OBJDIR)/%,$(VARIANT_OBJ_FILES))

# Rules for making a c++ file from the main sketch (.pde)
#
PDEHEADER      = \\\#include \"WProgram.h\"  


# Tool-chain names
#
CC      = $(APP_TOOLS_PATH)/xtensa-lx106-elf-gcc
CXX     = $(APP_TOOLS_PATH)/xtensa-lx106-elf-g++
AR      = $(APP_TOOLS_PATH)/xtensa-lx106-elf-ar
OBJDUMP = $(APP_TOOLS_PATH)/xtensa-lx106-elf-objdump
OBJCOPY = $(APP_TOOLS_PATH)/xtensa-lx106-elf-objcopy
SIZE    = $(APP_TOOLS_PATH)/xtensa-lx106-elf-size
NM      = $(APP_TOOLS_PATH)/xtensa-lx106-elf-nm

MCU_FLAG_NAME    = # mmcu
OPTIMISATION    ?= -Os -g

OBJCOPYFLAGS     = $(FLASH_MODE)

INCLUDE_PATH     = $(HARDWARE_PATH)/tools/sdk/include
INCLUDE_PATH    += $(HARDWARE_PATH)/tools/sdk/lwip/include
INCLUDE_PATH    += $(CORE_LIB_PATH)
INCLUDE_PATH    += $(VARIANT_PATH)



# Flags for gcc, g++ and linker
# ----------------------------------
#
# Common CPPFLAGS for gcc, g++, assembler and linker
#
CPPFLAGS    += -g $(OPTIMISATION) $(WARNING_FLAGS)
CPPFLAGS    += -D__ets__ -DICACHE_FLASH -U__STRICT_ANSI__ -DLWIP_OPEN_SRC
CPPFLAGS    += -mlongcalls -mtext-section-literals -falign-functions=4 -MMD
CPPFLAGS    +=  -ffunction-sections -fdata-sections
CPPFLAGS    += -DF_CPU=$(F_CPU)
CPPFLAGS    += $(addprefix -D, $(PLATFORM_TAG) $(BUILD_BOARD))
CPPFLAGS    += $(addprefix -I, $(INCLUDE_PATH))

# Specific CFLAGS for gcc only
# gcc uses CPPFLAGS and CFLAGS
#
CFLAGS       = -Wpointer-arith -Wno-implicit-function-declaration -Wl,-EL -fno-inline-functions -nostdlib -std=gnu99
# was -std=c99

# Specific CXXFLAGS for g++ only
# g++ uses CPPFLAGS and CXXFLAGS
#
CXXFLAGS     = -fno-exceptions -fno-rtti -std=c++11

# Specific ASFLAGS for gcc assembler only
# gcc assembler uses CPPFLAGS and ASFLAGS
#
ASFLAGS      = -x assembler-with-cpp

# Specific LDFLAGS for linker only
# linker uses CPPFLAGS and LDFLAGS
#
LDFLAGS      = $(OPTIMISATION) $(WARNING_FLAGS)
#-Wl,--gc-sections
LDFLAGS     += -nostdlib -Wl,--no-check-sections -u call_user_start -Wl,-static
LDFLAGS     += -L$(HARDWARE_PATH)/tools/sdk/lib
LDFLAGS     += -L$(HARDWARE_PATH)/tools/sdk/ld
LDFLAGS     += -T $(LDSCRIPT)
LDFLAGS     += -Wl,--gc-sections -Wl,-wrap,system_restart_local -Wl,-wrap,register_chipv6_phy

# Target
#
TARGET_HEXBIN = $(TARGET_BIN2)


# Commands
# ----------------------------------
# Link command
#
COMMAND_LINK    = $(CC) $(LDFLAGS) $(OUT_PREPOSITION)$@ -Wl,--start-group $(LOCAL_OBJS) $(LOCAL_ARCHIVES) $(TARGET_A) $(L_FLAGS) -Wl,--end-group -LBuilds

ifeq ($(UPLOADER),espota)
    COMMAND_UPLOAD  = $(UPLOADER_EXEC) -i $(IP_ADDRESS) -f Builds/$(TARGET)_$(ADDRESS_BIN1).bin $(UPLOADER_OPTS)
else
    COMMAND_UPLOAD  = $(UPLOADER_EXEC) $(UPLOADER_OPTS) -cp $(USED_SERIAL_PORT) -ca 0x$(ADDRESS_BIN1) -cf Builds/$(TARGET)_$(ADDRESS_BIN1).bin
endif
