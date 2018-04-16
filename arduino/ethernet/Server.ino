/*
A simple web server using an Arduino Wiznet Ethernet shield.
For Arduino IDE V1.0 only. Previous IDE versions require mods to this code.

Original code created 18 Dec 2009
by David A. Mellis
modified 4 Sep 2010
by Tom Igoe
modified 18 Jan 2012
by Tim Dicus
*/

#include <SPI.h>
#include <Ethernet.h>

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip( 155,69,160,100 );
IPAddress gateway( 155,69,160,1 );
IPAddress subnet( 255,255,0,0 );
IPAddress dnServer( 155,69,1,1 );

// Initialize the Ethernet server library
// with the IP address and port you want to use
// (port 80 is default for HTTP):
EthernetServer server(80);

void setup()
{
 Serial.begin(9600);

 // start the Ethernet connection and the server:
 Ethernet.begin(mac, ip, dnServer, gateway, subnet);
 // Ethernet.begin(mac);

 while (!Serial) {
   ; // wait for serial port to connect. Needed for native USB port only
 }
 Serial.print("client is at ");
 Serial.println(Ethernet.localIP());
}

void loop()
{
 // listen for incoming clients
 EthernetClient client = server.available();
 if (client) {
   Serial.println("Client");
   // an http request ends with a blank line
   boolean currentLineIsBlank = true;
   while (client.connected()) {
     while(client.available()) {
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
     }
   }
   Serial.println("Disconnected");
 }
}
