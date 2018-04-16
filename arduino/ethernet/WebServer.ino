/*
  Web Server

 A simple web server that shows the value of the analog input pins.
 using an Arduino Wiznet Ethernet shield.

 Circuit:
 * Ethernet shield attached to pins 10, 11, 12, 13
 * Analog inputs attached to pins A0 through A5 (optional)

 created 18 Dec 2009
 by David A. Mellis
 modified 9 Apr 2012
 by Tom Igoe
 modified 02 Sept 2015
 by Arturo Guadalupi

 */

#include <SPI.h>
#include <Ethernet.h>

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED
};
char host[] = "d1wt7yy3y78u4b.cloudfront.net";
// Use DHCP instead of manual ip assignment
// IPAddress ip(192, 168, 0, 177);

// Initialize the Ethernet server library
// with the IP address and port you want to use
// (port 80 is default for HTTP):
EthernetClient client;

void setup() {
  IPAddress dnServer(192, 168, 3, 5);     // the dns server ip
  IPAddress gateway(192, 168, 3, 5);      // the router's gateway address
  IPAddress subnet(255, 255, 255, 0);     // the subnet
  IPAddress ip(192, 168, 3, 251);         //the IP address of our ethernet shield
  Ethernet.begin(mac, ip, dnServer, gateway, subnet);
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  Serial.print("client is at ");
  Serial.println(Ethernet.localIP());
}


void loop() {
  uint32_t len;
  int inChar;
  String response = "POST /prod/smartcamIdentifyPerson HTTP/1.1\r\n";
  response += "Host: d35xafoveji7v.cloudfront.net\r\n";
  response += "Content-Type: image/jpeg\r\n";
  response += "Content-Length: " + String(len) + "\r\n";
  Serial.println("connected to the server");
  client.println(response);
  int connectLoop=0;
  while(client.connected())                               // Sending complete, now read response from host and forward to serial monitor
   {
     while(client.available())
      {
        inChar = client.read();
        Serial.write(inChar);
        connectLoop = 0;                             // set connectLoop to zero if a packet arrives
      }
     connectLoop++;
     if(connectLoop > 2000)                         // if more than 1000 milliseconds since the last packet
     {
       Serial.println();
       client.stop();                                // then close the connection from this end.
     }
     delay(1);
   }
}
