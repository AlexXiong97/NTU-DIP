#include <Wire.h>
#include <Adafruit_MotorShield.h>

Adafruit_MotorShield AFMS = Adafruit_MotorShield();

Adafruit_DCMotor *motors[4];

int sensor0 = 0;
int sensor1 = 0;
int sensor2 = 0;

int minValue[4] = {267, 343, 312, 0};
int maxValue[4] = {638, 788, 880, 0};

int initialPos[3] = {437, 423, 600};

int table[9][3] = {{607, 399, 423}, {558, 551, 596}, {526, 739, 863},
                   {436, 296, 338}, {437, 507, 548}, {437, 704, 811},
                   {278, 395, 416}, {324, 526, 572}, {348, 726, 853}};

int startingPos = 0;
int endingPos = 0;
int x0 = 0;
int x1 = 0;
int x2 = 0;
int x3 = 0;
int y0 = 0;
int y1 = 0;
int y2 = 0;
int y3 = 0;
int enable = 10;
int available = 11;
///////////////////////////////////////////////////////////////////
void grab(){
  motors[3]->setSpeed(200);
  motors[3]->run(BACKWARD);
  delay(1200);
  motors[3]->setSpeed(0);
}

void drop(){
  motors[3]->setSpeed(200);
  motors[3]->run(FORWARD);
  delay(1125);
  motors[3]->setSpeed(0);
}

///////////////////////////////////////////////////////////////////
void stepMotor(int motorId, int dir, int motorSpeed, int timeStep){
  motors[motorId]->setSpeed(motorSpeed);
  motors[motorId]->run(dir);
  delay(timeStep);
  motors[motorId]->setSpeed(0);
}

// move the joint to specific position
void moveJoint(int motorId, int pos){
  int current = analogRead(motorId);
  int timeStep = 75;
  int delayTime = 10;

  if (motorId == 0){
    timeStep = 25;
    delayTime = 20;
  }

  while (!(current >= pos-1 && current <= pos+1)){
    if (current < pos){
      stepMotor(motorId, FORWARD, 200, timeStep);
    }
    else {
      stepMotor(motorId, BACKWARD, 200, timeStep);
    }
    delay(10);
    current = analogRead(motorId);
  }
}

// move the arm to specific position
void moveP2P(int pos1, int pos2, int pos3){
  moveJoint(2, pos3);
  moveJoint(1, pos2);
  moveJoint(0, pos1);
}

void moveToCell(int cell){
  if (cell < 6){
    moveJoint(0, table[cell][0]);
    moveJoint(0, table[cell][0]);
    moveJoint(2, table[cell][2]);
    moveJoint(1, table[cell][1]);
  }
  else {
    moveJoint(0, table[cell][0]);
    moveJoint(0, table[cell][0]);
    moveJoint(1, table[cell][1]);
    moveJoint(2, table[cell][2]);
  }
}

void moveToInit(int cell){
  if (cell < 6){
    moveJoint(1, initialPos[1]);
    moveJoint(2, initialPos[2]);
    moveJoint(0, initialPos[0]);
  }
  else {
    moveJoint(2, initialPos[2]);
    moveJoint(1, initialPos[1]);
    moveJoint(0, initialPos[0]);
  }
}

void slide(int startCell, int endCell){
  moveToInit(startCell);

  moveToCell(startCell);
  grab();

  moveToInit(startCell);

  moveToCell(endCell);
  drop();

  moveToInit(endCell);
}

///////////////////////////////////////////////////////////////////

void run_motor(int motorId, int dir){
  motors[motorId - 1]->setSpeed(200);
  motors[motorId - 1]->run(dir);
  delay(100);

  motors[motorId - 1]->setSpeed(0);
}

///////////////////////////////////////////////////////////////////

int binary_to_decimal(int a3, int a2, int a1, int a0){
  return (8*a3 + 4*a2 + 2*a1 + 1*a0);
}

///////////////////////////////////////////////////////////////////
void setup() {
  // set up serial ports
  Serial.begin(9600);

  // Set up Motors
  for (int i=1; i<=4; i++){
    motors[i-1] =  AFMS.getMotor(i);
  }
  AFMS.begin();

  // set up digital pin
  // Pin 2~5 are startingPos in binary, ranging from 0000 to 1000
  // Pin 6~9 are endingPos in binary, ranging from 0000 to 1000
  // Pin 10 is enable/indication pin to signify digitalRead();
  // Pin 11 is outputing as an indicator of availability of the robotic arm.
  for (int i=2; i<=11; i++){
    pinMode(i, INPUT);
  }
  pinMode(available, OUTPUT);
  // By default, the arm is available for move instruction when starting up.
  digitalWrite(available, HIGH);
}

void loop() {
  // check enable pin for new next move
  enable = digitalRead(10);
  if (enable==HIGH){
    digitalWrite(available, LOW);
    x0 = digitalRead(2);
    x1 = digitalRead(3);
    x2 = digitalRead(4);
    x3 = digitalRead(5);
    y0 = digitalRead(6);
    y1 = digitalRead(7);
    y2 = digitalRead(8);
    y3 = digitalRead(9);
    startingPos = binary_to_decimal(x3, x2, x1, x0);
    endingPos = binary_to_decimal(y3, y2, y1, y0);
    slide(startingPos, endingPos);
  }
  sensor0 = analogRead(0);
  sensor1 = analogRead(1);
  sensor2 = analogRead(2);

  Serial.print("Sensor 0: ");
  Serial.print(sensor0);

  Serial.print("  Sensor 1: ");
  Serial.print(sensor1);

  Serial.print("  Sensor 2: ");
  Serial.println(sensor2);
}
