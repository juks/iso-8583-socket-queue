# SocketQueue
This is a free ISO 8583 gateway (bridge) implementation for banking/fintech POS systems communication. The project is powered by Node.js (https://nodejs.org/).

## The Idea
SocketQueue acts as a gateway between bank ISO 8583 system and customer applications/processes that need to talk to it. The service keeps one "host-to-host" connection with the bank processing host, that is used to transfer data, sent by multiple local clients in various representations. In terms of POS processing systems "host-to-host" connection means all the data is sent and received via single full-duplex socket asynchronously. 

The recieved data is assigned to appropriate sender using the TID (Terminal Id) and STAN (System Trace Audit Number). If there are two clients sending payments transactions using the same TID, the second packet will be queued until the first one is processed or timed out. This is not normal/legal operation mode in terms of International Payments Systems, but some small fintech startups may have to accept it due to the greediness of some of the acquiring banks.

<pre>
                                        +----------------+
   +-------------------+                |                | <--JSON 8583--> POS HTTP client
   | Bank POS ISO HOST | <--ISO 8583--> |  SocketQueue <img src="https://cloud.githubusercontent.com/assets/147685/21545760/260c1468-cdeb-11e6-97cb-8016a96b6d65.gif" align="absmiddle"> | <--ISO 8583---> POS binary client
   +-------------------+                |                | <--HTTP HEX---> POS HTTP client
                                        +----------------+
</pre>
                          
## Features
* Multiplexing connection manager;
* Modern and friendly JSON interface to aged or unfriendly ISO 8583 processing hosts;
* Host-to-Host on the left hand (one permanent TCP connection), Host‑to‑POS (many TCP connections) on the right;
* Supports both binary ISO 8583 and JSON over HTTP operation modes at the same time;
* ISO 8583 validation, ISO 8583 values padding;
* Customizable ISO 8583 syntax;
* Safe data/events logger (console, files, LogStash);
* Message queue;
* TID queueing (wait for busy TID);
* Auto-reversal implementation;
* Socket Bank (emulates the ISO host);
* Test clients (self test mode);
* Stats Server (current transactions amount, MTI stats);
* Solves the SmartVista weird transactions mishandling;
* Lighweight, PCI-DSS friendly, reliable, event based. Hundreds of concurrent connections/transactions at a time;
* Bonus: prevents remote ISO hosts crashes caused by PCI-DSS automated security scanning procedures.
 
## Installation (works both for Linux and Windows)
* In case you do not have node.js installed, follow the installation instructions at https://nodejs.org/en/download/

* Install git client and clone the repository:  
    _git clone https://github.com/juks/iso-8583-socket-queue_

* Install extra modules:  
    _cd iso-8583-socket-queue_  
    _npm install_

  Done!
  
SocketQueue is tested in production to work for months, processing thousands of transactions a day without crashes or memory leaks. I recommend running it under the Supervisor utility https://github.com/Supervisor/supervisor.
Sample supervisor config may look like:

    [program:socketqueue]
    command=node ./socketQueue.js -c config.json
    directory=/path/to/socketqueue
    autostart=true
    autorestart=true
    startsecs=5
    startretries=3
    stopsignal=TERM
    stopwaitsecs=10

## Basic Usage
To get familiar with all the command line and configuration file parameters available, run SocketQueue with _--help_ option:

    $ node socketQueue.js --help

To establish the gateway to remote ISO host on 10.0.0.1:5000, that accepts binary ISO 8583 messages, run the module as following:  

    $ node socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenPort=2014
    
To add verbosity and log data into a file use:  

    $ node socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenPort=2014 --vv --logFile=log.txt
    
To make it silent in console, use _--silent_ option:  

    $ node socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenPort=2014 --vv --logFile=log.txt --silent
    
You may keep all the options inside the configuration file, and run the SocketQueue just like that:

    $ node socketQueue.js --c=config.json
    
Where config.json contains:

```json
{
    "upstreamHost":    "10.0.0.1",
    "upstreamPort":    5000,
    "listenPort":      2014,
    "vv":              true,
    "logFile":         "log.txt"
}
```
## Binary ISO 8583 service
SocketQueue provides the service for the POS transactions, sent as ISO 8583 messages. Each valid ISO 8583 message, sent by client is sent to ISO host. Each ISO host response is sent back to the client as ISO 8583 message. To run ISO 8583 gateway on certain port, use the _--listenPort_ parameter.

Each message consists of three parts: the MTI (Message Type Indicator), Binary Mask (lists the fields, being sent) and the fields values. You may find more detailed sytax description on Wiki page https://en.wikipedia.org/wiki/ISO_8583

## HTTP JSON Service
SocketQueue understands the ISO 8583 transactions, sent as JSON object. Each valid message is converted to ISO 8583 string, values are padded where necessary. The message then goes to ISO host. The ISO host responses are converted back to JSON object and sent back to clients.

To run the HTTP server use _--listenHttpPort_ option with the port number to listen on.

    $ node socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenHttpPort=8080 --vv --logFile=log.txt

When it is running on port 8080, you can test it like this with the "purchase" EMV transcation data:

```bash
$ curl -H "Content-Type: application/json" -X POST -d '{ "0": "0200",  "3": "0",  "4": 1000,  "7": "0818160933",  "11": 618160,  "12": "150820130600",  "22": "056",  "24": "200",  "25": "00",  "35": "4850781234567891=19082012232800000037",  "41": 992468,  "42": 124642124643,  "49": "810",  "55": "9f2608571f1e10d4fa4aac9f2701809f100706010a03a4b8029f37045bb074729f3602000c950500800010009a031508189c01009f02060000000010005f2a02064382023c009f1a0206439f03060000000000009f3303e0f0c89f34034403029f3501229f1e0835313230323831358407a00000000310109f41030000565f340101" }' http://localhost:8080
```

In case of success you will get the following response

```json
{
   "result":{
      "0": "0210",
      "1": "723005802ec08200",
      "2": "4850780000478123",
      "3": 0,
      "4": 1000,
      "7": "0820130546",
      "11": "618160",
      "12": "150820130600",
      "22": "056",
      "24": 200,
      "25": 0,
      "35": "4850781234567891=19082012232800000037",
      "37": "708981921851",
      "38": "VaHYUU",
      "39": 0,
      "41": "00992468",
      "42": "000124642124643",
      "49": 643,
      "55": "9f2608571f1e10d4fa4aac9f2701809f100706010a03a4b8029f37045bb074729f3602000c950500800010009a031508189c01009f02060000000010005f2a02064382023c009f1a0206439f03060000000000009f3303e0f0c89f34034403029f3501229f1e0835313230323831358407a00000000310109f41030000565f340101"
   },
   "errors":[]
}
```

In case you have verbose output or logging enabled, the following messages will be logged (test performed using the local echo server):

```
2015-08-31 18:22:57 - info: New HTTP socket                         
2015-08-31 18:22:57 - info: Client http:127.0.0.1:53578 connected                         
2015-08-31 18:22:57 - info: Client http:127.0.0.1:53578 sent data                         
2015-08-31 18:22:57 - verbose: 

http:127.0.0.1:53578
================================================================================================

     [Purchase Request]

     Message Type Indicator [0].......................0200
     Bitmap [1].......................................3230058020c08200
     Processing Code [3]..............................0
     Amount, Transaction [4]..........................1000
     Transmission Date and Time [7]...................0818160933
     System Trace Audit Number [11]...................618160
     Time, Local Transaction [12].....................150831182300
     Pos Entry Mode [22]..............................056 (Card Data Input Mode: <Integrated circuit card read; CVV data reliable>; Cardholder Auth Method: <Signature Based>)
     Function Code [24]...............................200
     Pos Condition Code [25]..........................00
     Track 2 Data [35]................................485078******7891=19082012232800000037
     Card Acceptor Terminal Identification [41].......00992468
     Merchant Id [42].................................000124642124643
     Currency code, transaction [49]..................643
     EMV Data [55]....................................9f2608571f1e10d4fa4aac9f2701809f100706010a03a4b8029f37045bb074729f3602000c950500800010009a031508189c01009f02060000000010005f2a02064382023c009f1a0206439f03060000000000009f3303e0f0c89f34034403029f3501229f1e0835313230323831358407a00000000310109f41030000565f340101

================================================================================================

                         
2015-08-31 18:22:57 - info: Writing to queue http:127.0.0.1:53578 [0]                         
2015-08-31 18:22:57 - info: New queue item 1                         
2015-08-31 18:22:57 - info: Processing queue [pending 1 / total 1]                         
2015-08-31 18:22:57 - info: Upstreaming data for http:127.0.0.1:53578                         
2015-08-31 18:22:57 - verbose: [02630200...]                         
2015-08-31 18:22:57 - info: Echo server got data                         
2015-08-31 18:22:57 - info: Replying to client 00992468                         
2015-08-31 18:22:57 - info: Echo server sent response                         
2015-08-31 18:22:57 - info: Got data from ISO-host (306b)                         
2015-08-31 18:22:57 - verbose: [03020210...]                         
2015-08-31 18:22:57 - info: Parsed data for http:127.0.0.1:53578                         
2015-08-31 18:22:57 - verbose: 

ISO host to http:127.0.0.1:53578
================================================================================================

     [Purchase Response]

     Message Type Indicator [0].......................0210
     Bitmap [1].......................................723005802ec08200
     Primary Account Number [2].......................485078******7891
     Processing Code [3]..............................0
     Amount, Transaction [4]..........................1000
     Transmission Date and Time [7]...................0831182257
     System Trace Audit Number [11]...................618160
     Time, Local Transaction [12].....................150831182300
     Pos Entry Mode [22]..............................056 (Card Data Input Mode: <Integrated circuit card read; CVV data reliable>; Cardholder Auth Method: <Signature Based>)
     Function Code [24]...............................200
     Pos Condition Code [25]..........................0
     Track 2 Data [35]................................485078******7891=19082012232800000037
     Retrieval Reference Number [37]..................347408919250
     Approval code [38]...............................2Ttb0c
     Response code [39]...............................0 (Successful Transaction)
     Card Acceptor Terminal Identification [41].......00992468
     Merchant Id [42].................................000124642124643
     Currency code, transaction [49]..................643
     EMV Data [55]....................................9f2608571f1e10d4fa4aac9f2701809f100706010a03a4b8029f37045bb074729f3602000c950500800010009a031508189c01009f02060000000010005f2a02064382023c009f1a0206439f03060000000000009f3303e0f0c89f34034403029f3501229f1e0835313230323831358407a00000000310109f41030000565f340101

================================================================================================
```

Also, there is a /raw URL that accepts HEX-encoded data.

Here goes an example for the following message:
```
08002220010000800000990000083020354500000183100000001
```

That can get transmitted over HTTP as:
```bash
$ curl -H "Content-Type: text/plain" -X POST -d '303830302220010000c00000303030303030303630373136313730303132333435363030303030313233343536313233353637383930313234353637' http://localhost:8080/raw
```

## ISO Host Emulation and “Self Test” Clients
Using _--echoServerPort_ parameter, you can run the local ISO host emulator that supports basic operations like 800 (echo), 200 (purchase) and 400 (reversal). To emulate the real client connections/requests process you can add the _--testClients_ option. Do not forget to supply it with _--testTargetHost_ and _--testTargetPort_.

The following example shows two separate instances of SocketQueue running, but you can also stack all parameters in one line and start only one copy.

The upstream and echo servers two in one:

    $ node socketQueue.js --upstreamHost=localhost --upstreamPort=5000 --listenPort=2014 --vv --echoServerPort=5000
    
Emulate 10 clients:

    $ node socketQueue.js --testTargetHost=localhost --testTargetPort=2014 --testClients=10 --vv
     
Or you can run only the echo server with so called "Socket Bank" onboard:

    $ node socketQueue.js --vv --echoServerPort=5000

## Collecting the Statistics
The option _--statServerPort_ enables the statistics module and starts the stat server on given port number, that collects the following statistics of while SocketQueue accepts ISO 8583 transactions:

Parameter | Meaning 
--- | ---
*securedAmount* | sucessful transactions amount minus refund and reversal amount
*processedAmount* | total transactions amount, including failed transactions
*refundAmount* | total amount of refund transactions
*reversalAmount* | total amount of reversal transactions
*faultStat* | error codes statistics
*packetCount* | packet count, both total and by each MTI type that was handled during the operation

So, if stats server is running on port 4000, _telnet 4000_ will give json stats, that may look like this:

```javascript
{
   "securedAmount":1383554.49,
   "processedAmount":1876911.69,
   "refundAmount":0,
   "reversalAmount":3460,
   "faultStat":{
      "5": 2,
      "100": 7,
      "103": 1,
      "116": 3,
      "117": 1,
      "120": 10
   },
   "packetCount":{
      "total": 2265,
      "0800": 730,
      "0810": 724,
      "0200": 367,
      "0210": 364,
      "0400": 48,
      "0410": 32
   }
}
```
This is just fine to use with Zabbix, Kibana or other monitoring tools.

## Compatibility
One can consider SocketQueue to work with SmartVista and OpenWay processing systems.

## Signals
SocketQueue treats just fine the TERM, INT and HUP signals. It gracefully quits on TERM/INT and resets the stats/reopens log file on HUP signal.

“Graceful quit” means that before quitting:
* there will be no new connections from POS clients accepted
* active transactions responses will be delivered
* given amount of auto-reversal requests (if enabled) will be performed.

To force process termination at any time, give it a KILL signal.

## ISO 8583 echo host
There is a public demo instance of SocketQueue running on the following address:
* askarov.com:12345 - raw upstream
* askarov.com:12346 - HTTP JSON upstream

You can use sample payload to talk to echo host in raw mode:
```bash
$ cat ./sample_payloads/sv_800_echo.txt - | nc askarov.com 12345
```

For HTTP JSON:
```bash
$ curl -H "Content-Type: application/json" -X POST -d '{ "0": "800", "3": "0", "7": "0607161700", "11": "123456", "24": "0", "41": "00123456", "42": "123567890124567" }' http://askarov.com:12346
```

## Running on Docker

#### Config 

Create a dummy config like so

```bash
echo '{
    "upstreamHost":    "10.0.0.1",
    "upstreamPort":    5000,
    "listenPort":      2014,
    "vv":              true,
    "logFile":         "log.txt"
}
' > sample-config.json
```

#### Build image 
```bash
docker build -t socket-queue:latest .
```

#### Run it

```bash
docker run -v `pwd`/sample-config.json:/etc/socket-queue/config.json -t socket-queue:latest -c /etc/socket-queue/config.json
```

#### Docker Compose

This will create a docker container and run it in three different configurations:

1. SocketQueue Server listening on 2014
2. SocketQueue Echo Server listening on port 5000
3. SocketQueue Test Client emulating 10 clients

```bash
docker-compose up
```
## Commercial collaboration
Feel free to send your inquiries about commercial collaboration (such as payment systems integration, POS Android/iOS applications development and other payment solutions) to juks@juks.ru.

## Reporting Bugs
Please report bugs in the Github issue tracker: https://github.com/juks/SocketQueue/issues

## Copyright
Copyright (c) 2015–2020 Igor Askarov (juks@juks.ru). See License file for details.
