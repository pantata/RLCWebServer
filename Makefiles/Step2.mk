# Functions
# ----------------------------------
#
SHOW  = @printf '%-24s\t%s\r\n' $(1) $(2)

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
#	USER_LIBS        = $(realpath $(sort $(dir $(foreach dir,$(s203),$(wildcard $(dir)/*.h $(dir)/*/*.h $(dir)/*/*/*.h)))))
#    USER_LIBS        = $(sort $(foreach dir,$(s203),$(shell find $(dir) -type d  | grep -v [eE]xample)))
    EXCLUDE_LIST     = $(shell echo $(strip $(EXCLUDE_NAMES)) | sed "s/ /|/g" )
    USER_LIBS       := $(sort $(foreach dir,$(s203),$(shell find $(dir) -type d | egrep -v '$(EXCLUDE_LIST)' )))

    USER_LIB_CPP_SRC = $(foreach dir,$(USER_LIBS),$(wildcard $(dir)/*.cpp)) # */
    USER_LIB_C_SRC   = $(foreach dir,$(USER_LIBS),$(wildcard $(dir)/*.c)) # */
    USER_LIB_H_SRC   = $(foreach dir,$(USER_LIBS),$(wildcard $(dir)/*.h)) # */

#    USER_LIB_CPP_SRC = $(wildcard $(patsubst %,%/*.cpp,$(USER_LIBS))) # */
#    USER_LIB_C_SRC   = $(wildcard $(patsubst %,%/*.c,$(USER_LIBS))) # */
#    USER_LIB_H_SRC   = $(wildcard $(patsubst %,%/*.h,$(USER_LIBS))) # */

    USER_OBJS        = $(patsubst $(USER_LIB_PATH)/%.cpp,$(OBJDIR)/user/%.cpp.o,$(USER_LIB_CPP_SRC))
    USER_OBJS       += $(patsubst $(USER_LIB_PATH)/%.c,$(OBJDIR)/user/%.c.o,$(USER_LIB_C_SRC))
endif
endif
endif


# LOCAL sources
#
LOCAL_LIB_PATH  = .
#LOCAL_LIB_PATH  = $(CURRENT_DIR)

ifndef LOCAL_LIBS_LIST
    s206            = $(sort $(dir $(wildcard $(LOCAL_LIB_PATH)/*/*.h))) # */
    s212            = $(subst $(LOCAL_LIB_PATH)/,,$(filter-out $(EXCLUDE_LIST)/,$(s206))) # */
    LOCAL_LIBS_LIST = $(shell echo $(s212)' ' | sed 's://:/:g' | sed 's:/ : :g')
endif

ifneq ($(LOCAL_LIBS_LIST),0)
    s207          = $(patsubst %,$(LOCAL_LIB_PATH)/%,$(LOCAL_LIBS_LIST))
    s208          = $(sort $(dir $(foreach dir,$(s207),$(wildcard $(dir)/*.h $(dir)/*/*.h $(dir)/*/*/*.h))))
    LOCAL_LIBS    = $(shell echo $(s208)' ' | sed 's://:/:g' | sed 's:/ : :g')
endif

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


# Local archives
#
LOCAL_ARCHIVES  = $(wildcard $(patsubst %,%/*.a,$(LOCAL_LIBS))) $(wildcard $(LOCAL_LIB_PATH)/*.a) # */

# Check against .board
#
ifneq ($(trim $(LOCAL_LIBS)),)
ifneq ($(MAKECMDGOALS),archive)
ifneq ($(MAKECMDGOALS),unarchive)
    LOCAL_TARGETS   := $(shell find $(LOCAL_LIBS) -name \*.board -exec basename {} .board \;)
    LOCAL_RESULT    := $(filter-out $(BOARD_TAG),$(LOCAL_TARGETS))

    ifneq ($(trim $(LOCAL_ARCHIVES)),)
    ifeq ($(LOCAL_TARGETS),)
        $(info ---- Pre-compiled libraries ----)
        $(error Missing .board file for one or more pre-compiled libraries)
    endif
    endif
    ifneq ($(LOCAL_RESULT),)
        $(info ---- Pre-compiled libraries ----)
        $(info Found    $(LOCAL_RESULT))
        $(info Expected $(BOARD_TAG))
        $(error One or more pre-compiled libraries are not compatible with $(BOARD_TAG))
    endif
endif
endif
endif

# All the objects
# ??? Does order matter?
#
ifeq ($(REMOTE_OBJS),)
    REMOTE_OBJS = $(sort $(CORE_OBJS) $(BUILD_CORE_OBJS) $(APP_LIB_OBJS) $(BUILD_APP_LIB_OBJS) $(VARIANT_OBJS) $(USER_OBJS))
endif
OBJS        = $(REMOTE_OBJS) $(LOCAL_OBJS)

# Dependency files
#
DEPS   = $(OBJS:.o=.d)


# Processor model and frequency
# ----------------------------------
#
#ifndef MCU
#    MCU   = $(call PARSE_BOARD,$(BOARD_TAG),build.mcu)
#endif

#ifndef F_CPU
#    F_CPU = $(call PARSE_BOARD,$(BOARD_TAG),build.f_cpu)
#endif

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

# Executables
#
REMOVE  = rm -r
MV      = mv -f
CAT     = cat
ECHO    = echo

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

# ~
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

# ~
ifeq (true,true)
    SCOPE_FLAG  := +$(PLATFORM):$(BUILD_CORE)
else
    SCOPE_FLAG  := -$(PLATFORM)
endif
# ~~

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
	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.c.o: $(APPLICATION_PATH)/%.c
	$(call SHOW,"1.2-APPLICATION C",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.s.o: $(APPLICATION_PATH)/%.s
	$(call SHOW,"1.3-APPLICATION AS",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.S.o: $(APPLICATION_PATH)/%.S
	$(call SHOW,"1.4-APPLICATION AS",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.c
	$(call SHOW,"1.5-APPLICATION D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.cpp
	$(call SHOW,"1.6-APPLICATION D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.S
	$(call SHOW,"1.7-APPLICATION D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.S.o)

$(OBJDIR)/%.d: $(APPLICATION_PATH)/%.s
	$(call SHOW,"1.8-APPLICATION D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.s.o)


# 2- Build
# ----------------------------------
#
# Following rules manages APP and BUILD_APP, CORE and VARIANT libraries
#
$(OBJDIR)/%.cpp.o: $(HARDWARE_PATH)/%.cpp
	$(call SHOW,"2.1-HARDWARE CPP",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.c.o: $(HARDWARE_PATH)/%.c
	$(call SHOW,"2.2-HARDWARE C",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.s.o: $(HARDWARE_PATH)/%.s
	$(call SHOW,"2.3-HARDWARE AS",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.S.o: $(HARDWARE_PATH)/%.S
	$(call SHOW,"2.4-HARDWARE AS",$@,$<)
	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.c
	$(call SHOW,"2.5-HARDWARE D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.cpp
	$(call SHOW,"2.6-HARDWARE D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.S
	$(call SHOW,"2.7-HARDWARE D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.S.o)

$(OBJDIR)/%.d: $(HARDWARE_PATH)/%.s
	$(call SHOW,"2.8-HARDWARE D",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.s.o)

# 3- USER library sources
#
$(OBJDIR)/user/%.cpp.o: $(USER_LIB_PATH)/%.cpp
	$(call SHOW,"3.1-USER CPP",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/user/%.c.o: $(USER_LIB_PATH)/%.c
	$(call SHOW,"3.2-USER C",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/user/%.d: $(USER_LIB_PATH)/%.cpp
	$(call SHOW,"3.3-USER CPP",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/user/%.d: $(USER_LIB_PATH)/%.c
	$(call SHOW,"3.4-USER C",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

    
# 4- LOCAL sources
# .o rules are for objects, .d for dependency tracking
# 
$(OBJDIR)/%.c.o: %.c
	$(call SHOW,"4.1-LOCAL C",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(CFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.cc.o: %.cc
	$(call SHOW,"4.2-LOCAL CC",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.cpp.o: 	%.cpp
	$(call SHOW,"4.3-LOCAL CPP",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.S.o: %.S
	$(call SHOW,"4.4-LOCAL AS",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.s.o: %.s
	$(call SHOW,"4.5-LOCAL AS",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -c $(CPPFLAGS) $(ASFLAGS) $< $(OUT_PREPOSITION)$@

$(OBJDIR)/%.d: %.c
	$(call SHOW,"4.6-LOCAL C",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(CFLAGS) $< -MF $@ -MT $(@:.d=.c.o)

$(OBJDIR)/%.d: %.cpp
	$(call SHOW,"4.7-LOCAL CPP",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CXX) -MM $(CPPFLAGS) $(CXXFLAGS) $< -MF $@ -MT $(@:.d=.cpp.o)

$(OBJDIR)/%.d: %.S
	$(call SHOW,"4.8-LOCAL AS",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.S.o)

$(OBJDIR)/%.d: %.s
	$(call SHOW,"4.9-LOCAL AS",$@,$<)

	@mkdir -p $(dir $@)
	$(QUIET)$(CC) -MM $(CPPFLAGS) $(ASFLAGS) $< -MF $@ -MT $(@:.d=.s.o)


# 5- Link
# ----------------------------------
#
$(TARGET_ELF): 	$(OBJS)
		@echo "---- Link ---- "
		$(call SHOW,"5.1-ARCHIVE",$@,.)

ifneq ($(FIRST_O_IN_A),)
		$(QUIET)$(AR) rcs $(TARGET_A) $(FIRST_O_IN_A)
endif

# ~
ifeq ($(PLATFORM),IntelYocto)
    ifneq ($(REMOTE_OBJS),)
		$(QUIET)$(AR) rcs $(TARGET_A) $(REMOTE_OBJS)
    endif
else
	$(QUIET)$(AR) rcs $(TARGET_A) $(REMOTE_OBJS)
endif
# ~~

ifneq ($(EXTRA_COMMAND),)
		$(call SHOW,"5.2-COPY",$@,.)

		$(EXTRA_COMMAND)
endif

ifneq ($(COMMAND_LINK),)
		$(call SHOW,"5.3-LINK",$@,.)

		$(QUIET)$(COMMAND_LINK)

else
		$(call SHOW,"5.4-LINK default",$@,.)

		$(QUIET)$(CXX) $(OUT_PREPOSITION)$@ $(LOCAL_OBJS) $(LOCAL_ARCHIVES) $(TARGET_A) $(LDFLAGS)
endif


$(TARGET_OUT): 	$(OBJS)
# ~
ifeq ($(BUILD_CORE),c2000)
		$(call SHOW,"5.5-ARCHIVE",$@,.)

		$(QUIET)$(AR) r $(TARGET_A) $(FIRST_O_IN_A)
		$(QUIET)$(AR) r $(TARGET_A) $(REMOTE_OBJS)

		$(call SHOW,"5.6-LINK",$@,.)

		$(QUIET)$(CC) $(CPPFLAGS) $(LDFLAGS) $(OUT_PREPOSITION)$@ $(LOCAL_OBJS) $(TARGET_A) $(COMMAND_FILES) -l$(LDSCRIPT)

else
		$(call SHOW,"5.7-LINK",$@,.)

endif
# ~~


# 6- Final conversions
# ----------------------------------
#
$(OBJDIR)/%.hex: $(OBJDIR)/%.elf
	$(call SHOW,"6.1-COPY HEX",$@,$<)

	$(QUIET)$(OBJCOPY) -Oihex -R .eeprom $< $@
# ~
ifneq ($(SOFTDEVICE),)
	$(call SHOW,"6.2-COPY HEX",$@,$<)

	$(QUIET)$(MERGE_PATH)/$(MERGE_EXEC) $(SOFTDEVICE_HEX) -intel $(CURRENT_DIR)/$@ -intel $(OUT_PREPOSITION)$(CURRENT_DIR)/combined.hex $(MERGE_OPTS)
	$(QUIET)mv $(CURRENT_DIR)/combined.hex $(CURRENT_DIR)/$@
endif
# ~~

$(OBJDIR)/%.bin: $(OBJDIR)/%.elf
	$(call SHOW,"6.3-COPY BIN",$@,$<)
  ifneq ($(COMMAND_COPY),)
	$(QUIET)$(COMMAND_COPY)
  else
	$(QUIET)$(OBJCOPY) -Obinary $< $@
  endif

$(OBJDIR)/%.bin2: $(OBJDIR)/%.elf
	$(call SHOW,"6.4-COPY BIN",$@,$<)

	$(QUIET)$(ESP_POST_COMPILE) -eo $(BOOTLOADER_ELF) -bo Builds/$(TARGET)_$(ADDRESS_BIN1).bin -bm $(OBJCOPYFLAGS) -bf $(BUILD_FLASH_FREQ) -bz $(BUILD_FLASH_SIZE) -bs .text -bp 4096 -ec -eo $< -bs .irom0.text -bs .text -bs .data -bs .rodata -bc -ec
	$(QUIET)cp Builds/$(TARGET)_$(ADDRESS_BIN1).bin Builds/$(TARGET).bin

$(OBJDIR)/%.eep: $(OBJDIR)/%.elf
	$(call SHOW,"6.5-COPY EEP",$@,$<)

	-$(QUIET)$(OBJCOPY) -Oihex -j .eeprom --set-section-flags=.eeprom=alloc,load --no-change-warnings --change-section-lma .eeprom=0 $< $@

$(OBJDIR)/%.lss: $(OBJDIR)/%.elf
	$(call SHOW,"6.6-COPY LSS",$@,$<)

	$(QUIET)$(OBJDUMP) -h -S $< > $@

$(OBJDIR)/%.sym: $(OBJDIR)/%.elf
	$(call SHOW,"6.7-COPY SYM",$@,$<)

	$(QUIET)$(NM) -n $< > $@

#$(OBJDIR)/%.txt: $(OBJDIR)/%.out
#	$(call SHOW,"6.8-COPY",$@,$<)
#
#	echo ' -boot -sci8 -a $< -o $@'
#	$(QUIET)$(OBJCOPY) -boot -sci8 -a $< -o $@

$(OBJDIR)/%.mcu: $(OBJDIR)/%.elf
	$(call SHOW,"6.9-COPY MCU",$@,$<)

	@rm -f $(OBJDIR)/intel_mcu.*
	@cp $(OBJDIR)/embeddedcomputing.elf $(OBJDIR)/intel_mcu.elf
	@cd $(OBJDIR) ; export TOOLCHAIN_PATH=$(APP_TOOLS_PATH) ; $(UTILITIES_PATH)/generate_mcu.sh

# ~
$(OBJDIR)/%.vxp: $(OBJDIR)/%.elf
	$(call SHOW,"6.10-COPY VXP",$@,$<)

	$(QUIET)cp $(OBJDIR)/embeddedcomputing.elf $(OBJDIR)/embeddedcomputing2.elf
	$(QUIET)$(OBJCOPY) -i $<
	$(QUIET)mv $(OBJDIR)/embeddedcomputing2.elf $(OBJDIR)/embeddedcomputing.elf
# ~~

$(OBJDIR)/%: $(OBJDIR)/%.elf
	$(call SHOW,"6.11-COPY",$@,$<)

	$(QUIET)cp $< $@


# Size of file
# ----------------------------------
#
ifeq ($(TARGET_HEXBIN),$(TARGET_HEX))
#    FLASH_SIZE = $(SIZE) --target=ihex --totals $(CURRENT_DIR)/$(TARGET_HEX) | grep TOTALS | tr '\t' . | cut -d. -f2 | tr -d ' '
    FLASH_SIZE = $(SIZE) --target=ihex --totals $(CURRENT_DIR)/$(TARGET_HEX) | grep TOTALS | awk '{t=$$3 + $$2} END {print t}'
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$3 + $$2} END {print t}'

# ~
else ifeq ($(TARGET_HEXBIN),$(TARGET_VXP))
    FLASH_SIZE = $(SIZE) $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$1 + $$2} END {print t}'
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$3} END {print t}'
# ~~

else ifeq ($(TARGET_HEXBIN),$(TARGET_BIN))
    FLASH_SIZE = $(SIZE) --target=binary --totals $(CURRENT_DIR)/$(TARGET_BIN) | grep TOTALS | tr '\t' . | cut -d. -f2 | tr -d ' '
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$3 + $$2} END {print t}'

else ifeq ($(TARGET_HEXBIN),$(TARGET_BIN2))

    FLASH_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$1 + $$2} END {print t}'
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$3 + $$2} END {print t}'

else ifeq ($(TARGET_HEXBIN),$(TARGET_OUT))
    FLASH_SIZE = cat Builds/embeddedcomputing.map | grep '^.text' | awk 'BEGIN { OFS = "" } {print "0x",$$4}' | xargs printf '%d'
    RAM_SIZE = cat Builds/embeddedcomputing.map | grep '^.ebss' | awk 'BEGIN { OFS = "" } {print "0x",$$4}' | xargs printf '%d'

else ifeq ($(TARGET_HEXBIN),$(TARGET_DOT))
    FLASH_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$1} END {print t}'
#    FLASH_SIZE = ls -all $(CURRENT_DIR)/$(TARGET_DOT) | awk '{print $$5}'
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$3 + $$2} END {print t}'

else ifeq ($(TARGET_HEXBIN),$(TARGET_ELF))
    FLASH_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$1} END {print t}'
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$3 + $$2} END {print t}'

else ifeq ($(TARGET_HEXBIN),$(TARGET_MCU))
    FLASH_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$4} END {print t}'
    RAM_SIZE = $(SIZE) --totals $(CURRENT_DIR)/$(TARGET_ELF) | sed '1d' | awk '{t=$$4} END {print t}'
endif

#ifeq ($(MAX_FLASH_SIZE),)
#    MAX_FLASH_SIZE = $(firstword $(call PARSE_BOARD,$(BOARD_TAG),upload.maximum_size))
#endif
#ifeq ($(MAX_RAM_SIZE),)
#    MAX_RAM_SIZE = $(call PARSE_BOARD,$(BOARD_TAG),upload.maximum_data_size)
#endif
#ifeq ($(MAX_RAM_SIZE),)
#    MAX_RAM_SIZE = $(call PARSE_BOARD,$(BOARD_TAG),upload.maximum_ram_size)
#endif

ifneq ($(MAX_FLASH_SIZE),)
#     MAX_FLASH_BYTES   = 'bytes (of a '$(MAX_FLASH_SIZE)' byte maximum)'
# ~
    MAX_FLASH_BYTES   = 'bytes used ('$(shell echo "scale=1; (100.0* $(shell $(FLASH_SIZE)))/$(MAX_FLASH_SIZE)" | bc)'% of '$(MAX_FLASH_SIZE)' maximum), '$(shell echo "$(MAX_FLASH_SIZE) - $(shell $(FLASH_SIZE))"|bc) 'bytes free ('$(shell echo "scale=1; 100-(100.0* $(shell $(FLASH_SIZE)))/$(MAX_FLASH_SIZE)"|bc)'%)'
# ~~
else
    MAX_FLASH_BYTES   = bytes used
endif

ifneq ($(MAX_RAM_SIZE),)
#    MAX_RAM_BYTES   = 'bytes (of a '$(MAX_RAM_SIZE)' byte maximum)'
# ~
    MAX_RAM_BYTES   = 'bytes used ('$(shell echo "scale=1; (100.0* $(shell $(RAM_SIZE)))/$(MAX_RAM_SIZE)" | bc)'% of '$(MAX_RAM_SIZE)' maximum), '$(shell echo "$(MAX_RAM_SIZE) - $(shell $(RAM_SIZE))"|bc) 'bytes free ('$(shell echo "scale=1; 100-(100.0* $(shell $(RAM_SIZE)))/$(MAX_RAM_SIZE)"|bc)'%)'
# ~~
else
    MAX_RAM_BYTES   = bytes used
endif




# Info for debugging
# ----------------------------------
#
# 0- Info
#
info:
#		@if [ -f $(CURRENT_DIR)/About/About.txt ]; then $(CAT) $(CURRENT_DIR)/About/About.txt | head -6; fi;
		#@if [ -f $(UTILITIES_PATH)/embedXcode_check ]; then $(UTILITIES_PATH)/embedXcode_check; fi
		#@echo $(STARTCHRONO)
ifeq ($(UNKNOWN_BOARD),1)
		@echo .
		@echo ==== Info ====
		@echo 'ERROR	$(BOARD_TAG) board is unknown'
		@echo ==== Info done ====
		exit 2
endif

ifneq ($(MAKECMDGOALS),boards)
  ifneq ($(MAKECMDGOALS),clean)
		@echo .
		@echo ==== Info ====
		@echo ---- Project ----
		@echo 'Target		'$(MAKECMDGOALS)
		@echo 'Name		'$(PROJECT_NAME)' ('$(SKETCH_EXTENSION)')'
		@echo 'Tag			'$(BOARD_TAG)
		@echo 'VARIANT			'$(VARIANT)
				

#    ifneq ($(PLATFORM),Wiring)
    ifneq ($PLATFORM_VERSION),)
		@echo ---- Platform ----
		@echo 'IDE			'$(PLATFORM)' version '$(PLATFORM_VERSION)
    endif
    
    ifneq ($(BUILD_CORE),)
		@echo 'Platform		'$(BUILD_CORE)
    endif

    ifneq ($(VARIANT),)
		@echo 'Variant		'$(VARIANT)
    endif

    ifneq ($(USB_VID),)
		@echo 'USB			VID = '$(USB_VID)', PID = '$(USB_PID)
    endif

		@echo ---- Board ----
		@echo 'Name		''$(BOARD_NAME)' ' ('$(BOARD_TAG)')'
		@echo 'MCU			'$(MCU)' at '$(F_CPU)
		@echo 'Memory		Flash = '$(MAX_FLASH_SIZE)' bytes, RAM = '$(MAX_RAM_SIZE)' bytes'

		@echo ---- Port ----
		@echo 'Uploader		'$(UPLOADER)

		@echo ---- Libraries ----
		@echo Application libraries from $(basename $(APP_LIB_PATH)) # | cut -d. -f1,2
		@echo $(APP_LIBS_LIST)
		@echo User libraries from $(SKETCHBOOK_DIR)
		@echo $(USER_LIBS_LIST)
		@echo Local libraries from $(CURRENT_DIR)

    ifneq ($(wildcard $(LOCAL_LIB_PATH)/*.h),) # */
		@echo $(subst .h,,$(notdir $(wildcard $(LOCAL_LIB_PATH)/*.h))) # */
    endif
    ifneq ($(strip $(LOCAL_LIBS_LIST)),)
		@echo '$(LOCAL_LIBS_LIST) ' | sed 's/\/ / /g'
    endif
    ifeq ($(wildcard $(LOCAL_LIB_PATH)/*.h),) # */
        ifeq ($(strip $(LOCAL_LIBS_LIST)),)
			@echo 0
        endif
    endif

		@echo ---- Tools ----
		@echo $(PLATFORM) $(PLATFORM_VERSION)	
		@$(CC) --version | head -1

		@echo ==== Info done ====
  endif
endif


# ~
# Additional features
# ----------------------------------
#
ifeq ($(MAKECMDGOALS),document)
    include $(MAKEFILE_PATH)/Doxygen.mk
endif

ifeq ($(MAKECMDGOALS),distribute)
    include $(MAKEFILE_PATH)/Doxygen.mk
endif

ifeq ($(MAKECMDGOALS),debug)
    include $(MAKEFILE_PATH)/Debug.mk
endif

ifeq ($(MAKECMDGOALS),style)
    include $(MAKEFILE_PATH)/Doxygen.mk
endif
# ~~


# Rules
# ----------------------------------
#
all: 		info message_all clean compile  raw_upload serial end_all


build: 		info message_build clean compile end_build


compile:	info message_compile $(OBJDIR) $(TARGET_HEXBIN) $(TARGET_EEP) size
		@echo $(BOARD_TAG) > $(NEW_TAG)


$(OBJDIR):
		@echo "---- Build ---- "
		@mkdir $(OBJDIR)


$(DEP_FILE):	$(OBJDIR) $(DEPS)
		@echo "9-" $<
		@cat $(DEPS) > $(DEP_FILE)


upload:		message_upload  raw_upload
		@echo "==== upload done ==== "

raw_upload:
		@echo "---- Upload ---- "
		
ifeq ($(UPLOADER),esptool)
	$(call SHOW,"10.25-UPLOAD",$(UPLOADER))
	echo 'USED_SERIAL_PORT = '$(USED_SERIAL_PORT)
	$(UPLOADER_EXEC) $(UPLOADER_OPTS) -cp $(USED_SERIAL_PORT) -ca 0x$(ADDRESS_BIN1) -cf Builds/$(TARGET)_$(ADDRESS_BIN1).bin
else ifeq ($(UPLOADER),espota)
	$(call SHOW,"10.26-UPLOAD",$(UPLOADER))	
	echo 'USED_SERIAL_PORT = '$(USED_SERIAL_PORT)
	$(UPLOADER_EXEC) $(UPLOADER_OPTS) -f Builds/$(TARGET).bin
endif

serial:		
		@echo "---- Serial ---- "
		$(call SHOW,"11.8-SERIAL",$(UPLOADER))
		#osascript -e 'tell application "Terminal" to do script "$(SERIAL_COMMAND) $(USED_SERIAL_PORT) $(SERIAL_BAUDRATE)"'  -e 'tell application "Terminal" to activate'

size:
		@echo '---- Size ----'
		@echo 'Estimated Flash: ' $(shell $(FLASH_SIZE)) $(MAX_FLASH_BYTES); echo;
		@echo 'Estimated SRAM:  ' $(shell $(RAM_SIZE)) $(MAX_RAM_BYTES); echo;		
clean:
		@if [ ! -d $(OBJDIR) ]; then mkdir $(OBJDIR); fi
		@echo "nil" > $(OBJDIR)/nil
		@echo "---- Clean ----"
		-@rm -r $(OBJDIR)/* # */

changed:
		@echo "---- Clean changed ----"
ifeq ($(CHANGE_FLAG),1)
		@if [ ! -d $(OBJDIR) ]; then mkdir $(OBJDIR); fi
		@echo "nil" > $(OBJDIR)/nil
		@$(REMOVE) $(OBJDIR)/* # */
		@echo "Remove all"
else
#		$(REMOVE) $(LOCAL_OBJS)
		@for f in $(LOCAL_OBJS); do if [ -f $$f ] ; then rm $$f; fi; done
		@for d in $(LOCAL_LIBS_LIST) ; do if [ -d Builds/$$d ] ; then rm -R Builds/$$d; fi; done
		@echo "Remove local only"
		@if [ -f $(OBJDIR)/$(TARGET).elf ] ; then rm $(OBJDIR)/$(TARGET).* ; fi ;
endif

depends:	$(DEPS)
		@echo "---- Depends ---- "
		@cat $(DEPS) > $(DEP_FILE)

# ~
# Archive rules
# ----------------------------------
#
do_archive:
		@echo .
		@echo "==== Archive ==== "
		@echo "---- Generate ---- "
		for f in $(LOCAL_LIBS_LIST) ; do if [ -d Builds/$$f ] ; then $(QUIET)$(AR) rcs $$f/$$f.a $$(find Builds/$$f/ -name *.o) ; echo $$f/$$f.a ; echo $(BOARD_TAG) > $$f/$(BOARD_TAG).board ; fi ; done ; # */
		@echo "---- Rename ---- "
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f -name '*.cpp' -exec sh -c 'echo "$$0" to "$${0%.cpp}._cpp"' {} \; ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f -name '*.cpp' -exec sh -c 'mv "$$0" "$${0%.cpp}._cpp"' {} \; ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f/ -name '*.c' -exec sh -c 'echo "$$0" to "$${0%.c}._c"' {} \; ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f/ -name '*.c' -exec sh -c 'mv "$$0" "$${0%.c}._c"' {} \; ; done ;
		@echo "==== Archive done ==== "

unarchive:
		@echo .
		@echo "==== Unarchive ==== "
		@echo "---- Remove ---- "
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f -name "*.a" -exec echo '{}' \; -delete ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f/ -name '*.board' -delete ; done ;
		@echo "---- Rename ---- "
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f -name '*._cpp' -exec sh -c 'echo "$$0" to "$${0%._cpp}.cpp"' {} \; ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f -name '*._cpp' -exec sh -c 'mv "$$0" "$${0%._cpp}.cpp"' {} \; ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f/ -name '*._c' -exec sh -c 'echo "$$0" to "$${0%._c}.c"' {} \; ; done ;
		@for f in $(LOCAL_LIBS_LIST) ; do find $$f/ -name '*._c' -exec sh -c 'mv "$$0" "$${0%._c}.c"' {} \; ; done ;
		@echo "==== Unarchive done ==== "
# ~~

boards:
		@echo .
		@echo "==== Boards ===="
		@ls -1 Configurations/ | sed 's/\(.*\)\..*/\1/'
		@echo "==== Boards done ==== "

message_all:
		@echo .
		@echo "==== All ===="

message_build:
		@echo .
		@echo "==== Build ===="

message_compile:
		@echo "---- Compile ----"

message_upload:
		@echo .
		@echo "==== Upload ===="

end_all:
		@echo "==== All done ==== "

end_build:
		@echo "==== Build done ==== "

# ~
fast: 		info message_fast changed compile raw_upload end_fast

make:		info message_make changed compile end_make

archive:	info message_make changed compile end_make do_archive

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

# cat Step2.mk | grep -e "^[A-z]\+:" | cut -d: -f1
.PHONY:	info all build compile upload raw_upload serial size clean changed depends do_archive unarchive boards message_all message_build message_compile message_upload end_all end_build fast make archive message_fast message_make end_make end_fast
