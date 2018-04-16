// Sample Arduino Json Web Client
// This program downloads JSON from jsonplaceholder.typicode.com and parse it
//
// Copyright Benoit Blanchon 2014-2016
// MIT License
//
// Arduino JSON library
// https://github.com/bblanchon/ArduinoJson
// If you like this project, please add a star!

#include <ArduinoJson.h>
#include <SPI.h>
#include <Ethernet.h>

byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
const char* server = "d1wt7yy3y78u4b.cloudfront.net";
const char* resource = "";

// Compute optimal size of the JSON buffer according to what we need to parse.
// This is only required if you use StaticJsonBuffer.
#define JSONBUFFER_SIZE_FOR_COMPANY JSON_OBJECT_SIZE(3)
#define JSONBUFFER_SIZE_FOR_GEO JSON_OBJECT_SIZE(2)
#define JSONBUFFER_SIZE_FOR_ADDRESS JSON_OBJECT_SIZE(5)
#define JSONBUFFER_SIZE_FOR_USER JSON_OBJECT_SIZE(8)
#define JSONBUFFER_SIZE                                     \
  (JSONBUFFER_SIZE_FOR_USER + JSONBUFFER_SIZE_FOR_COMPANY + \
   JSONBUFFER_SIZE_FOR_GEO + JSONBUFFER_SIZE_FOR_ADDRESS)

struct UserData {
  char name[32];
  char company[32];
};

EthernetClient client;

void initSerial() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ;  // wait for serial port to conect. Needed for native USB port only
  }
  Serial.println("Serial ready");
}

void initEthernet() {
  if (!Ethernet.begin(mac)) {
    Serial.println("Failed to configure Ethernet");
    return;
  }
  Serial.print("Ethernet ready at");
  Serial.println(Ethernet.localIP());
  delay(1000);
}

bool connect(const char* hostName) {
  Serial.print("Connect to ");
  Serial.println(hostName);

  bool ok = client.connect(hostName, 80);

  Serial.println(ok ? "Connected" : "Connection Failed!");
  return ok;
}

bool sendRequest(const char* host, const char* resource) {
  Serial.print("GET ");
  Serial.println(resource);

  client.print("GET ");
  client.print(resource);
  client.println(" HTTP/1.1");
  client.print("Host: ");
  client.println(server);
  client.println("Connection: close");
  client.println();

  return true;
}

bool skipResponseHeaders() {
  char endOfHeaders[] = "\r\n\r\n";
  client.setTimeout(10000);

  bool ok = client.find(endOfHeaders);  // HTTP headers end with an empty line

  if (!ok) {
    Serial.println("No response or invalid response!");
  }

  return ok;
}

void readReponseContent(char* content, size_t maxSize) {
  size_t length = client.readBytes(content, maxSize);
  content[length] = 0;
  Serial.println(content);
}

bool parseUserData(char* content, UserData* userData) {
  StaticJsonBuffer<JSONBUFFER_SIZE> jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(content);

  if (!root.success()) {
    Serial.println("JSON parsing failed!");
    return false;
  }

  strcpy(userData->name, root["name"]);
  strcpy(userData->company, root["company"]["name"]);
  return true;
}

void printUserData(const UserData* userData) {
  Serial.print("Name = ");
  Serial.println(userData->name);
  Serial.print("Company = ");
  Serial.println(userData->company);
}

void disconnect() {
  Serial.println("Disconnect");
  client.stop();
}

void wait() {
  Serial.println("Wait 60 seconds");
  delay(60000);
}

void setup() {
  initSerial();
  initEthernet();
}

void loop() {
  boolean currentLineIsBlank = true;
  if (connect(server)) {
    // if (sendRequest(server, resource) && skipResponseHeaders()) {
    //   char response[512];
    //   readReponseContent(response, sizeof(response));
    //
    //   UserData userData;
    //   if (parseUserData(response, &userData)) {
    //     printUserData(&userData);
    //   }
    // }
    char c = client.read();
    // if you've gotten to the end of the line (received a newline
    // character) and the line is blank, the http request has ended,
    // so you can send a reply
    if (c == '\n' && currentLineIsBlank) {

     // Here is where the POST data is.
      while(client.available())
      {
         Serial.write(client.read());
      }
      Serial.println();

      Serial.println("Sending response");
      // send a standard http response header
      client.println("HTTP/1.0 200 OK");
      client.println("Content-Type: text/html");
      client.println();
      client.println("<HTML><BODY>TEST OK!</BODY></HTML>");
      client.stop();
    }
    else if (c == '\n') {
      // you're starting a new line
      currentLineIsBlank = true;
    }
    else if (c != '\r') {
      // you've gotten a character on the current line
      currentLineIsBlank = false;
    }
    Serial.println("Disconnected");
    disconnect();
  }
  wait();
}
