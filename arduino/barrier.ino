/**
 * Barrier Control System
 * 
 * This code controls a Servo motor representing a parking barrier.
 * It listens for commands over Serial:
 * 'O' -> Open the barrier
 * 'C' -> Close the barrier
 */

#include <Servo.h>

Servo barrierServo;
const int servoPin = 9;
const int openAngle = 90;
const int closedAngle = 0;

void setup() {
  Serial.begin(9600);
  barrierServo.attach(servoPin);
  barrierServo.write(closedAngle); // Initial state: Closed
  Serial.println("BARRIER_READY");
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();
    
    if (command == 'O') {
      openBarrier();
    } else if (command == 'C') {
      closeBarrier();
    }
  }
}

void openBarrier() {
  Serial.println("OPENING_BARRIER");
  for (int pos = closedAngle; pos <= openAngle; pos += 1) {
    barrierServo.write(pos);
    delay(15);
  }
  Serial.println("BARRIER_OPEN");
  
  // Auto-close after 5 seconds if needed, 
  // or wait for 'C' command from backend.
  // The backend in this project seems to handle the timing.
}

void closeBarrier() {
  Serial.println("CLOSING_BARRIER");
  for (int pos = openAngle; pos >= closedAngle; pos -= 1) {
    barrierServo.write(pos);
    delay(15);
  }
  Serial.println("BARRIER_CLOSED");
}
