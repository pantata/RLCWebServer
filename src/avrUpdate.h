/*
 * arduinoUpdate.h
 *
 *  Created on: 8. 12. 2016
 *      Author: slouf
 */

#ifndef AVRUPDATE_H_
#define AVRUPDATE_H_
#define ARDUINO_RESET_PIN 13
#define ARDUINO_PAGE_SIZE 128
#define ARDUINO_MAX_PAGE  240
#define ARDUINO_FW_NAME   "firmware.bin"
#define ARDUINO_MAX_SIZE  30720

typedef enum {
  IDLE,
  CONNECT,
  LOAD_PROG_ADDRESS,
  PROGRAM_PAGE,
  LOAD_READ_ADDRESS,
  READ_PAGE,
  END,
  SUCCESS,
  ERROR,
  TIMEOUT
} arduinoState_t;

typedef struct {
  File fwFile;
  unsigned int pagesmax = 0;
  arduinoState_t state = IDLE;
  unsigned int page = 0;
  boolean in_progress = false;
} arduinoUpdateState_t;


void avrReset();
bool arduinoBeginUpdate();
arduinoState_t arduinoGetStatus();
void arduinoHandleData(uint8 incoming);
bool arduinoUpdating();
int arduinoPagesFlashed();
int  arduinoPages();

#endif /* AVRUPDATE_H_ */
