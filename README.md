# SocketQueue
ISO 8583 gateway for bank POS systems communication

## The Idea
SocketQueue acts as a gateway between bank ISO 8583 system and web applications that want to communicate with them. It keeps one "host to host" connection with the bank that is used to pass data sent by many connections of the local clients.

                                  +-------------+
                                  |             | <-------> POS HTTP client
     [Bank POS ISO HOST] <------> | SocketQueue | <-------> POS device
                                  |             | <-------> POS HTTP client
                                  +-------------+
                          
## Features
* Connection manager
* Host-to-Host on the left hand (one permanent TCP connection for everything), Host‑to‑POS (many TCP connections) on the right
* Supports both binary ISO8583 and JSON over HTTP operation modes at the same time
* ISO8583 validation, ISO8583 values padding
* Safe data/events logger (console, files, LogStash)
* Transactions queue
* Auto-reversal implementation
* TID queueing (wait for busy TID)
* SocketBank (virtual SV test host)
* Test clients (self test mode)
* Stats server (current transactions amount, MTI stats)
* Solves the SmartVista weird transactions mishandling
* Lighweight, reliable, single thread, event based. Hundreds of concurrent connections/transactions at a time
 
## Installation
* Clone the repository  
    _git clone https://github.com/juks/SocketQueue_

* Install extra modules  
    _cd SocketQueue_  
    _npm install_

  Done!

## Basic Usage
To get familiar with all the command line and configuration file parameters available, run SocketQueue with _--help_ option:

    nodejs socketQueue.js --help

To establish the gateway to remote ISO host on 10.0.0.1:5000, that accepts binary ISO 8583 messages, run the module as following:  

    nodejs socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenPort=2014
    
To add verbosity and log data to log file use:  

    nodejs socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenPort=2014 --vv --logFile=log.txt
    
To make it silent in console, use _--silent_ option:  

    nodejs socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenPort=2014 --vv --logFile=log.txt --silent
    
You may keep all the options inside the configuration file, and run the SocketQueue just like that:

    nodejs socketQueue.js --c=config.json
    
Where config.json contains:

```javascript
{
    "upstreamHost":    "10.0.0.1",
    "upstreamPort":    5000,
    "listenPort":      2014,
    "listenHttpPort":  8080,
    "vv":              true,
    "logFile":         "log.txt"
}
```
## Binary ISO 8583 service
SocketQueue provides the service for the POS transactions, sent as ISO 8583 messages. To run ISO 8583 gateway on certain port, use the _--listenPort_ parameter.

Each message consists of three parts: the MTI (Message Type Indicator), Binary Mask (lists the fields, being sent) and the fields values. You may find more detailed sytax description on Wiki page https://en.wikipedia.org/wiki/ISO_8583

## HTTP JSON Service
SocketQueue understands the ISO 8583 transactions, sent as JSON arrays. It converts them to ISO 8583 string, pads the values where necessary and sends to upstream. The ISO host responses are converted back to JSON and returned to client.

To run the HTTP server use _--listenHttpPort_ option with the port number to listen on.

When it is runnig on port 8080, you can test it like this with the "Purschase" EMV transcation data:

```bash
curl -H "Content-Type: application/json" -X POST -d '{ "0": "0200",  "3": "0",  "4": 1000,  "7": "0818160933",  "11": 618160,  "12": "150820130600",  "22": "056",  "24": "200",  "25": "00",  "35": "4850781234567891=19082012232800000037",  "41": 992468,  "42": 124642124643,  "49": "810",  "55": "9f2608571f1e10d4fa4aac9f2701809f100706010a03a4b8029f37045bb074729f3602000c950500800010009a031508189c01009f02060000000010005f2a02064382023c009f1a0206439f03060000000000009f3303e0f0c89f34034403029f3501229f1e0835313230323831358407a00000000310109f41030000565f340101" }' http://localhost:8080
```

In case of success you will get the following resonse

```javascript
{
   "result":{
      "0":"0210",
      "1":"723005802ec08200",
      "2":"4850780000478123",
      "3":0,
      "4":1000,
      "7":"0820130546",
      "11":"618160",
      "12":"150820130600",
      "22":"056",
      "24":200,
      "25":0,
      "35":"4850781234567891=19082012232800000037",
      "37":"708981921851",
      "38":"VaHYUU",
      "39":0,
      "41":"00992468",
      "42":"000124642124643",
      "49":810,
      "55":"9f2608571f1e10d4fa4aac9f2701809f100706010a03a4b8029f37045bb074729f3602000c950500800010009a031508189c01009f02060000000010005f2a02064382023c009f1a0206439f03060000000000009f3303e0f0c89f34034403029f3501229f1e0835313230323831358407a00000000310109f41030000565f340101"
   },
   "errors":[]
}
```

## ISO Host Emulation and Self Test Clients
Using _--echoServerPort_ parameter, you can run the local ISO host emulator that supports basic operations like 800 (echo), 200 (purchase) and 400 (reversal). To emulate the real client connections/requests process you can add the _--testClients_ option. Do not forget to supply it with _--testTargetHost_ and _--testTargetPort_.

The following example shows two separate instances of SocketQueue running, but you can also stack all parameters in one line and start only one copy.

The upstream and echo servers two in one:

    nodejs socketQueue.js --upstreamHost=localhost --upstreamPort=5000 --listenPort=2014 --vv --echoServerPort=5000
    
Emulate 10 clients:

    nodejs socketQueue.js --testTargetHost=localhost --testTargetPort=2014 --testClients=10 --vv
     
Or you can run only the echo server with so called "Socket Bank" onboard:

    nodejs socketQueue.js --vv --echoServerPort=5000

## Gathering the Statistics
The option _--statServerPort_ enables the statistics module and starts the stat server on given port number, that collects the following statistics of while SocketQueue accepts ISO 8583 transactions:

Parameter | Meaninng 
--- | ---
*securedAmount* | sucessful transactions amount minus refund and reversal amount
*processedAmount* | total transactions amount, including failed transactions
*refundAmount* | total amount of refund transactions
*reversalAmount* | total amount of reversal transactions
*faultStat* | error codes statistics
*packetCount* | packet count, total and by each MTI type that was handled during the operation

So, if stats server is running on port 4000, _telnet 4000_ will give json stats, that may look like this:

```javascript
{
   "securedAmount":1383554.49,
   "processedAmount":1876911.69,
   "refundAmount":0,
   "reversalAmount":3460,
   "faultStat":{
      "5":2,
      "100":7,
      "103":1,
      "116":3,
      "117":1,
      "120":10
   },
   "packetCount":{
      "total":2265,
      "0800":730,
      "0810":724,
      "0200":367,
      "0210":364,
      "0400":48,
      "0410":32
   }
}
```
This is just fine to use with Zabbix, Kibana or other monitoring tools.

## Signals
SocketQueue treats well the TERM, INT and HUP signals. It gracefully quits on TERM/INT and resets the stats on HUP signal. To force process exit give it a KILL signal.
