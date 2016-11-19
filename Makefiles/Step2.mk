ifeq ($(OS),Windows_NT)
   FixPath = $(subst /,\,$1)
else
   FixPath = $1
endif

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

#Â ~
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
#Â ~~


# Clean if new BOARD_TAG
# ----------------------------------
#
include $(MAKEFILE_PATH)/ESP8266.mk

# List of sub-paths to be excluded
#
EXCLUDE_NAMES  = Example example Examples examples Archive archive Archives archives Documentation documentation Reference reference
EXCLUDE_NAMES += ArduinoTestSuite tests
EXCLUDE_NAMES += $(EXCLUDE_LIBS)
EXCLUDE_LIST   = $(addprefix %,$(EXCLUDE_NAMES))
EXCLUDE_LIST1   = $(addsuffix /,$(EXCLUDE_LIST))

# Functions
# ----------------------------------
#
ifeq ($(OS),Windows_NT)
SHOW  = @echo $(1) $(2)
else
SHOW  = @printf '%-24s\t%s\r\n' $(1) $(2)
endif
RWILDCARD = $(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call RWILDCARD,$d/,$2))

not-containing = $(foreach v,$2 ,$(if $(findstring $1,$v),,$v))
not-containing = $(foreach v,$2 ,$(if $(findstring $1,$v),,$v))

# ~
#QUIET = @
# ~~


# List of sources
# ----------------------------------
#
# CORE sources
#
ifeq ($(CORE_LIBS_LOCK),)
ifdef CORE_LIB_PATH
    CORE_C_SRCS     = $(wildcard $(CORE_LIB_PATH)/*.c $(CORE_LIB_PATH)/*/*.c) # */
    
    s210              = $(filter-out %main.cpp, $(wildcard $(CORE_LIB_PATH)/*.cpp $(CORE_LIB_PATH)/*/*.cpp $(CORE_LIB_PATH)/*/*/*.cpp $(CORE_LIB_PATH)/*/*/*/*.cpp)) # */
    CORE_CPP_SRCS     = $(filter-out %/$(EXCLUDE_LIST),$(s210))
    CORE_AS1_SRCS_OBJ = $(patsubst %.S,%.S.o,$(filter %S, $(CORE_AS_SRCS)))
    CORE_AS2_SRCS_OBJ = $(patsubst %.s,%.s.o,$(filter %s, $(CORE_AS_SRCS)))

    CORE_OBJ_FILES  += $(CORE_C_SRCS:.c=.c.o) $(CORE_CPP_SRCS:.cpp=.cpp.o) $(CORE_AS1_SRCS_OBJ) $(CORE_AS2_SRCS_OBJ)
#    CORE_OBJS       += $(patsubst $(CORE_LIB_PATH)/%,$(OBJDIR)/%,$(CORE_OBJ_FILES))
    CORE_OBJS       += $(patsubst $(APPLICATION_PATH)/%,$(OBJDIR)/%,$(CORE_OBJ_FILES))
#    CORE_OBJS       += $(patsubst $(HARDWARE_PATH)/%,$(OBJDIR)/%,$(CORE_OBJ_FILES))
endif
endif

# APPlication Arduino/chipKIT/Digistump/Energia/Maple/Microduino/Teensy/Wiring sources
#
ifndef APP_LIB_PATH
    APP_LIB_PATH  = $(APPLICATION_PATH)/libraries
endif

ifeq ($(APP_LIBS_LIST),)
    s201         = $(realpath $(sort $(dir $(wildcard $(APP_LIB_PATH)/*/*.h $(APP_LIB_PATH)/*/*/*.h)))) # */
    APP_LIBS_LIST = $(subst $(APP_LIB_PATH)/,,$(filter-out $(EXCLUDE_LIST),$(s201)))
endif

ifeq ($(APP_LIBS_LOCK),)
    ifndef APP_LIBS
    ifneq ($(APP_LIBS_LIST),0)
        s204       = $(patsubst %,$(APP_LIB_PATH)/%,$(APP_LIBS_LIST))
        APP_LIBS   = $(realpath $(sort $(dir $(foreach dir,$(s204),$(wildcard $(dir)/*.h $(dir)/*/*.h $(dir)/*/*/*.h)))))
    endif
    endif
endif

ifndef APP_LIB_OBJS
    FLAG = 1
    APP_LIB_C_SRC     = $(wildcard $(patsubst %,%/*.c,$(APP_LIBS))) # */
    APP_LIB_CPP_SRC   = $(wildcard $(patsubst %,%/*.cpp,$(APP_LIBS))) # */
    APP_LIB_AS1_SRC   = $(wildcard $(patsubst %,%/*.s,$(APP_LIBS))) # */
    APP_LIB_AS2_SRC   = $(wildcard $(patsubst %,%/*.S,$(APP_LIBS))) # */
    APP_LIB_OBJ_FILES = $(APP_LIB_C_SRC:.c=.c.o) $(APP_LIB_CPP_SRC:.cpp=.cpp.o) $(APP_LIB_AS1_SRC:.s=.s.o) $(APP_LIB_AS2_SRC:.S=.S.o)
    APP_LIB_OBJS      = $(patsubst $(APPLICATION_PATH)/%,$(OBJDIR)/%,$(APP_LIB_OBJ_FILES))
else
    FLAG = 0
endif

# USER sources
# wildcard required for ~ management
# ?ibraries required for libraries and Libraries
#
ifndef USER_LIB_PATH
    USER_LIB_PATH    = $(wildcard $(SKETCHBOOK_DIR)/?ibraries)
endif

ifndef USER_LIBS_LIST
	s202             = $(realpath $(sort $(dir $(wildcard $(USER_LIB_PATH)/*/*.h)))) # */
    USER_LIBS_LIST   = $(subst $(USER_LIB_PATH)/,,$(filter-out $(EXCLUDE_LIST),$(s202)))
endif

ifneq ($(MAKECMDGOALS),clean)
ifeq ($(USER_LIBS_LOCK),)
ifneq ($(USER_LIBS_LIST),0)
    s203             = $(patsubst %,$(USER_LIB_PATH)/%,$(USER_LIBS_LIST))
    
    USER_LIBS1       := $(sort $(foreach dir,$(s203),$(sort $(dir $(wildcard $(dir)/**/* $(dir)/*)))))	         
    USER_LIBS 		:=  $(filter-out $(EXCLUDE_LIST1),$(USER_LIBS1))
        
    USER_LIB_CPP_SRC = $(foreach dir,$(USER_LIBS),$(wildcard $(dir)/*.cpp)) # */    
    USER_LIB_C_SRC   = $(foreach dir,$(USER_LIBS),$(wildcard $(dir)/*.c)) # *
    USER_LIB_H_SRC   = $(foreach dir,$(USER_LIBS),$(wildcard $(dir)/*.h)) # */
  
    USER_OBJS        = $(patsubst $(USER_LIB_PATH)/%.cpp,$(OBJDIR)/user/%.cpp.o,$(USER_LIB_CPP_SRC))
    USER_OBJS       += $(patsubst $(USER_LIB_PATH)/%.c,$(OBJDIR)/user/%.c.o,$(USER_LIB_C_SRC))    
endif
endif
endif


# LOCAL sources
#
LOCAL_LIB_PATH  = .
#LOCAL_LIB_PATH  = $(CURRENT_DIR)

#ifndef LOCAL_LIBS_LIST
#    s206            = $(sort $(dir $(wildcard $(LOCAL_LIB_PATH)/*/*.h))) # */
#    s212            = $(subst $(LOCAL_LIB_PATH)/,,$(filter-out $(EXCLUDE_LIST)/,$(s206))) # */
#    LOCAL_LIBS_LIST = $(shell echo $(s212)' ' | sed 's://:/:g' | sed 's:/ : :g')
#endif

#ifneq ($(LOCAL_LIBS_LIST),0)
#    s207          = $(patsubst %,$(LOCAL_LIB_PATH)/%,$(LOCAL_LIBS_LIST))
#    s208          = $(sort $(dir $(foreach dir,$(s207),$(wildcard $(dir)/*.h $(dir)/*/*.h $(dir)/*/*/*.h))))
#    LOCAL_LIBS    = $(shell echo $(s208)' ' | sed 's://:/:g' | sed 's:/ : :g')
#endif

# Core main function check
s209             = $(wildcard $(patsubst %,%/*.cpp,$(LOCAL_LIBS))) $(wildcard $(LOCAL_LIB_PATH)/*.cpp) # */
LOCAL_CPP_SRCS   = $(filter-out %$(PROJECT_NAME_AS_IDENTIFIER).cpp, $(s209))

LOCAL_CC_SRCS    = $(wildcard $(patsubst %,%/*.cc,$(LOCAL_LIBS))) $(wildcard $(LOCAL_LIB_PATH)/*.cc) # */
LOCAL_C_SRCS     = $(wildcard $(patsubst %,%/*.c,$(LOCAL_LIBS))) $(wildcard $(LOCAL_LIB_PATH)/*.c) # */

# Use of implicit rule for LOCAL_PDE_SRCS
#
#LOCAL_PDE_SRCS  = $(wildcard *.$(SKETCH_EXTENSION))
LOCAL_AS1_SRCS   = $(wildcard $(patsubst %,%/*.S,$(LOCAL_LIBS))) $(wildcard $(LOCAL_LIB_PATH)/*.S) # */
LOCAL_AS2_SRCS   = $(wildcard $(patsubst %,%/*.s,$(LOCAL_LIBS))) $(wildcard $(LOCAL_LIB_PATH)/*.s) # */

LOCAL_OBJ_FILES = $(LOCAL_C_SRCS:.c=.c.o) $(LOCAL_CPP_SRCS:.cpp=.cpp.o) $(LOCAL_PDE_SRCS:.$(SKETCH_EXTENSION)=.$(SKETCH_EXTENSION).o) $(LOCAL_CC_SRCS:.cc=.cc.o) $(LOCAL_AS1_SRCS:.S=.S.o) $(LOCAL_AS2_SRCS:.s=.s.o)
LOCAL_OBJS      = $(patsubst $(LOCAL_LIB_PATH)/%,$(OBJDIR)/%,$(filter-out %/$(PROJECT_NAME_AS_IDENTIFIER).o,$(LOCAL_OBJ_FILES)))


# All the objects
#
ifeq ($(REMOTE_OBJS),)
    REMOTE_OBJS = $(sort $(CORE_OBJS) $(BUILD_CORE_OBJS) $(APP_LIB_OBJS) $(BUILD_APP_LIB_OBJS) $(VARIANT_OBJS) $(USER_OBJS))
endif
OBJS        = $(REMOTE_OBJS) $(LOCAL_OBJS)

# Dependency files
#
DEPS   = $(OBJS:.o=.d)


ifeq ($(OUT_PREPOSITION),)
    OUT_PREPOSITION = -o # end of line
endif


# Rules
# ----------------------------------
#
# Main targets
#
TARGET_A   = $(OBJDIR)/$(TARGET).a
TARGET_HEX = $(OBJDIR)/$(TARGET).hex
TARGET_ELF = $(OBJDIR)/$(TARGET).elf
TARGET_BIN = $(OBJDIR)/$(TARGET).bin
TARGET_BIN2 = $(OBJDIR)/$(TARGET).bin2
TARGET_OUT = $(OBJDIR)/$(TARGET).out
TARGET_DOT = $(OBJDIR)/$(TARGET)
TARGET_TXT = $(OBJDIR)/$(TARGET).txt
TARGETS    = $(OBJDIR)/$(TARGET).*
TARGET_MCU = $(OBJDIR)/$(TARGET).mcu
# ~
TARGET_VXP = $(OBJDIR)/$(TARGET).vxp
# ~~

ifndef TARGET_HEXBIN
    TARGET_HEXBIN = $(TARGET_HEX)
endif

ifndef TARGET_EEP
    TARGET_EEP    =
endif

# List of dependencies
#
DEP_FILE   = $(OBJDIR)/depends.mk

# General arguments
#
#ifeq ($(APP_LIBS_LOCK),)
    SYS_INCLUDES  = $(patsubst %,-I%,$(APP_LIBS))
    SYS_INCLUDES += $(patsubst %,-I%,$(BUILD_APP_LIBS))
    SYS_INCLUDES += $(patsubst %,-I%,$(USER_LIBS))
    SYS_INCLUDES += $(patsubst %,-I%,$(LOCAL_LIBS))
#endif

SYS_OBJS      = $(wildcard $(patsubst %,%/*.o,$(APP_LIBS))) # */
SYS_OBJS     += $(wildcard $(patsubst %,%/*.o,$(BUILD_APP_LIBS))) # */
SYS_OBJS     += $(wildcard $(patsubst %,%/*.o,$(USER_LIBS))) # */

#Â ~
ifeq ($(WARNING_OPTIONS),)
    WARNING_FLAGS = -Wall
else
    ifeq ($(WARNING_OPTIONS),0)
        WARNING_FLAGS = -w
    else
        WARNING_FLAGS = $(addprefix -W, $(WARNING_OPTIONS))
    endif
endif
#Â ~~

ifeq ($(OPTIMISATION),)
    OPTIMISATION = -Os -g
endif

ifeq ($(CPPFLAGS),)
    CPPFLAGS      = -$(MCU_FLAG_NAME)=$(MCU) -DF_CPU=$(F_CPU)
    CPPFLAGS     += $(SYS_INCLUDES) -g $(OPTIMISATION) $(WARNING_FLAGS) -ffunction-sections -fdata-sections
    CPPFLAGS     += $(EXTRA_CPPFLAGS) -I$(CORE_LIB_PATH)
else
    CPPFLAGS     += $(SYS_INCLUDES)
endif

ifdef USB_FLAGS
    CPPFLAGS += $(USB_FLAGS)
endif    

ifdef USE_GNU99
    CFLAGS       += -std=gnu99
endif

#Â ~
ifeq (true,true)
    SCOPE_FLAG  := +$(PLATFORM):$(BUILD_CORE)
else
    SCOPE_FLAG  := -$(PLATFORM)
endif
#Â ~~

# CXX = flags for C++ only
# CPP = flags for both C and C++
#
ifeq ($(CXXFLAGS),)
    CXXFLAGS      = -fno-exceptions
else
    CXXFLAGS     += $(EXTRA_CXXFLAGS)
endif

ifeq ($(ASFLAGS),)
    ASFLAGS       = -$(MCU_FLAG_NAME)=$(MCU) -x assembler-with-cpp
endif

ifeq ($(LDFLAGS),)
    LDFLAGS       = -$(MCU_FLAG_NAME)=$(MCU) -Wl,--gc-sections $(OPTIMISATION) $(EXTRA_LDFLAGS)
endif

ifndef OBJCOPYFLAGS
    OBJCOPYFLAGS  = -Oihex -R .eeprom
endif

# Implicit rules for building everything (needed to get everything in
# the right directory)
#
# Rather than mess around with VPATH there are quasi-duplicate rules
# here for building e.g. a system C++ file and a local C++
# file. Besides making things simpler now, this would also make it
# easy to change the build options in future


# 1- Build
# ----------------------------------
#
# Following rules manages APP and BUILD_APP, CORE and VARIANT libraries
#
$(OBJDIR)/%.cpp.o: $(APPLICATION_PATH)/%.cpp
	$(call SHOW,"1.1-APPLICATION CPP",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.c.o: $(APPLICATION_PATH)/%.c
	$(call SHOW,"1.2-APPLICATION C",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

#$(OBJDIR)/%.s.o: $(APPLICATION_PATH)/%.s
#	$(call SHOW,"1.3-APPLICATION AS",$@,$<)
#	$(call mkdir, $(dir $@) )
#	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.S.o: $(APPLICATION_PATH)/%.S
	$(call SHOW,"1.4-APPLICATION AS",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.c
	$(call SHOW,"1.5-APPLICATION D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.cpp
	$(call SHOW,"1.6-APPLICATION D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.S
	$(call SHOW,"1.7-APPLICATION D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.S.o)

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.s
	$(call SHOW,"1.8-APPLICATION D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.s.o)


# 2- Build
# ----------------------------------
#
# Following rules manages APP and BUILD_APP, CORE and VARIANT libraries
#
$(OBJDIR)/%.cpp.o: $(HARDWARE_PATH)/%.cpp
	$(call SHOW,"2.1-HARDWARE CPP",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.c.o: $(HARDWARE_PATH)/%.c
	$(call SHOW,"2.2-HARDWARE C",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.s.o: $(HARDWARE_PATH)/%.s
	$(call SHOW,"2.3-HARDWARE AS",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.S.o: $(HARDWARE_PATH)/%.S
	$(call SHOW,"2.4-HARDWARE AS",$@,$<)
	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.c
	$(call SHOW,"2.5-HARDWARE D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.cpp
	$(call SHOW,"2.6-HARDWARE D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.S
	$(call SHOW,"2.7-HARDWARE D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.S.o)

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.s
	$(call SHOW,"2.8-HARDWARE D",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.s.o)

# 3- USER library sources
#
$(OBJDIR)/user/%.cpp.o: $(USER_LIB_PATH)/%.cpp
	$(call SHOW,"3.1-USER CPP",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/user/%.c.o: $(USER_LIB_PATH)/%.c
	$(call SHOW,"3.2-USER C",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/user/%.d: $(USER_LIB_PATH)/%.cpp
	$(call SHOW,"3.3-USER CPP",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/user/%.d: $(USER_LIB_PATH)/%.c
	$(call SHOW,"3.4-USER C",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

    
# 4- LOCAL sources
# .o rules are for objects, .d for dependency tracking
# 
$(OBJDIR)/%.c.o: %.c
	$(call SHOW,"4.1-LOCAL C",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.cc.o: %.cc
	$(call SHOW,"4.2-LOCAL CC",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.cpp.o: 	%.cpp
	$(call SHOW,"4.3-LOCAL CPP",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.S.o: %.S
	$(call SHOW,"4.4-LOCAL AS",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.s.o: %.s
	$(call SHOW,"4.5-LOCAL AS",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.d: %.c
	$(call SHOW,"4.6-LOCAL C",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

$(OBJDIR)/%.d: %.cpp
	$(call SHOW,"4.7-LOCAL CPP",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/%.d: %.S
	$(call SHOW,"4.8-LOCAL AS",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.S.o)

$(OBJDIR)/%.d: %.s
	$(call SHOW,"4.9-LOCAL AS",$@,$<)

	$(call mkdir, $(dir $@) )
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.s.o)


# 5- Link
# ----------------------------------
#
$(TARGET_ELF): 	$(OBJS)
		@echo "---- Link ---- "
		$(call SHOW,"5.1-ARCHIVE",$@,.)
		$(call SHOW,"5.1.1-ARCHIVE",$@,.)
		$(QUIET)$(AR) rcs $(TARGET_A) $(FIRST_O_IN_A)
		$(call SHOW,"5.1.3-ARCHIVE",$@,.)
		$(QUIET)$(AR) rcs $(TARGET_A) $(REMOTE_OBJS)
		$(call SHOW,"5.3-LINK",$@,.)
		$(QUIET)$(COMMAND_LINK)

# 6- Final conversions
# ----------------------------------
#

$(OBJDIR)/%.bin2: $(OBJDIR)/%.elf
	$(call SHOW,"6.4-COPY BIN",$@,$<)

	$(QUIET)$(ESP_POST_COMPILE) -eo $(BOOTLOADER_ELF) -bo Builds/$(TARGET)_$(ADDRESS_BIN1).bin -bm $(OBJCOPYFLAGS) -bf $(BUILD_FLASH_FREQ) -bz $(BUILD_FLASH_SIZE) -bs .text -bp 4096 -ec -eo $< -bs .irom0.text -bs .text -bs .data -bs .rodata -bc -ec
	@echo $(call FixPath, Builds/$(TARGET)_$(ADDRESS_BIN1).bin) $(call FixPath,Builds/$(TARGET).bin)
	$(QUIET)$(COPY) $(call FixPath, Builds/$(TARGET)_$(ADDRESS_BIN1).bin) $(call FixPath,Builds/$(TARGET).bin)

# Size of file
# ----------------------------------

FLASH_SIZE = $(SIZE) --target=binary --totals $(CURRENT_DIR)/$(TARGET_BIN)
RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF)

# Info for debugging
# ----------------------------------
#
# 0- Info
#
info:
ifeq ($(UNKNOWN_BOARD),1)
		@echo .
		@echo ==== Info ====
		@echo 'ERROR	$(BOARD_TAG) board is unknown'
		@echo ==== Info done ====
		exit 2
endif

ifneq ($(MAKECMDGOALS),boards)
  ifneq ($(MAKECMDGOALS),clean)
		@echo ==== Info ====
		@echo ---- Project ----
		@echo 'Target:  '$(MAKECMDGOALS)
		@echo 'Name  :  '$(PROJECT_NAME)' ('$(SKETCH_EXTENSION)')'
		@echo 'Tag   :  '$(BOARD_TAG)
				
#    ifneq ($(PLATFORM),Wiring)
    ifneq ($PLATFORM_VERSION),)
		@echo ---- Platform ----
		@echo 'IDE		'$(PLATFORM)' version '$(PLATFORM_VERSION)
    endif
    
    ifneq ($(BUILD_CORE),)
		@echo 'Platform	 '$(BUILD_CORE)
    endif
    
		@echo ---- Board ----
		@echo 'Name		''$(BOARD_NAME)' ' ('$(BOARD_TAG)')'
		@echo 'MCU		'$(MCU)' at '$(F_CPU)
		@echo 'Memory	Flash = '$(MAX_FLASH_SIZE)' bytes, RAM = '$(MAX_RAM_SIZE)' bytes'

		@echo ---- Port ----
		@echo 'Uploader		'$(UPLOADER)

		@echo ---- Libraries ----
		@echo Application libraries from $(basename $(APP_LIB_PATH)) 
		@echo $(APP_LIBS_LIST)
		@echo User libraries from $(SKETCHBOOK_DIR)
		@echo $(USER_LIBS_LIST)
		@echo Local libraries from $(CURRENT_DIR)

    ifneq ($(wildcard $(LOCAL_LIB_PATH)/*.h),) # */
		@echo $(subst .h,,$(notdir $(wildcard $(LOCAL_LIB_PATH)/*.h))) # */
    endif
    ifneq ($(strip $(LOCAL_LIBS_LIST)),)
		@echo '$(LOCAL_LIBS_LIST) '
    endif
    ifeq ($(wildcard $(LOCAL_LIB_PATH)/*.h),) # */
        ifeq ($(strip $(LOCAL_LIBS_LIST)),)
			@echo 0
        endif
    endif

		@echo ---- Tools ----
		@echo $(PLATFORM) $(PLATFORM_VERSION)	
		@$(CC) --version

		@echo ==== Info done ====
  endif
endif


# Rules
# ----------------------------------
#
all: 		info message_all clean compile  raw_upload  end_all


build: 		info message_build clean compile end_build


compile:	info message_compile $(OBJDIR) $(TARGET_HEXBIN) $(TARGET_EEP) size		


$(OBJDIR):
		@echo "---- Build ---- "
		$(call mkdir,$(OBJDIR))


$(DEP_FILE):	$(OBJDIR) $(DEPS)
		@echo "9-" $<
		@cat $(DEPS) > $(DEP_FILE)


upload:	
		@echo "==== Upload ===="				
		$(call SHOW,"10.25-UPLOAD",$(UPLOADER))
		@$(COMMAND_UPLOAD)
		@echo "==== upload done ==== "
				
size:
		@echo '---- Size ----'
		@echo 'Estimated Flash:'
		$(FLASH_SIZE)
		@echo
		@echo 'Estimated SRAM:'
		$(RAM_SIZE)
		@echo		

clean:
		@echo "---- Clean ----"	
ifeq ($(OS),Windows_NT)	
		$(rmdir) $(call FixPath,$(OBJDIR))
else
		@if [ ! -d $(OBJDIR) ]; then $(MKDIR) $(call FixPath,$(OBJDIR)); fi
		@echo "nil" > $(OBJDIR)/nil	
		$(REMOVE) $(OBJDIR)/*
endif		

depends:	$(DEPS)
		@echo "---- Depends ---- "
		@cat $(DEPS) > $(DEP_FILE)

message_all:
		@echo .
		@echo "==== All ===="

message_build:
		@echo .
		@echo "==== Build ===="

message_compile:
		@echo "==== Compile ===="
		
end_all:
		@echo "==== All done ==== "

end_build:
		@echo "==== Build done ==== "

# ~
fast: 		info message_fast compile end_fast

make:		info message_make clean compile end_make

message_fast:
		@echo .
		@echo "==== Fast ===="
		@echo $(ESP8266_RELEASE)		

message_make:
		@echo .
		@echo "==== Make ===="

end_make:
		@echo "==== Make done ==== "

end_fast:
		@echo "==== Fast done ==== "
# ~~

.PHONY:	info all build compile upload size clean depends  message_all message_build message_compile end_all end_build fast make archive message_fast message_make end_make end_fast
