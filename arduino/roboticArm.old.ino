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

int table[9][3] = {{526, 739, 863}, {437, 704, 811}, {348, 726, 853},
                   {558, 551, 596}, {437, 507, 548}, {324, 526, 572},
                   {607, 399, 423}, {436, 296, 338}, {278, 395, 416}};

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
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  for (int i=1; i<=4; i++){
    motors[i-1] =  AFMS.getMotor(i);
  }

  AFMS.begin();
}

void loop() {
  // put your main code here, to run repeatedly:
  char inKey = 0;

  if (Serial.available() > 0){
    inKey = Serial.read();

    switch(inKey){
      case '1':
        run_motor(1, FORWARD);
        break;
      case '2':
        run_motor(1, BACKWARD);
        break;

      case 'q':
        run_motor(2, FORWARD);
        break;
      case 'w':
        run_motor(2, BACKWARD);
        break;

      case 'a':
        run_motor(3, FORWARD);
        break;
      case 's':
        run_motor(3, BACKWARD);
        break;

      case 'z':
        run_motor(4, FORWARD);
//        grab();
        break;
      case 'x':
        run_motor(4, BACKWARD);
//        drop();
        break;

      case 'c':
        grab();
        break;
      case 'v':
        drop();
        break;
      case 'b':
//        int cell;
//        cell = Serial.read() - 48;
//        if (!(cell >=0 && cell <= 8)){
//          break;
//        }
        for(int i=0; i<=7; i++){
          slide(i, i+1);
        }
        break;
      case 'n':
        moveToInit(0);
        break;
    }
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
