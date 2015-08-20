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
* SmartVista weird transactions mishandling handling
* Lighweight, reliable, single thread, event based. Hundreds of concurrent connections/transactions at a time
 
## Installation
* Clone the repository  
    _git clone https://github.com/juks/SocketQueue_

* Install extra modules  
    _cd SocketQueue_  
    _npm install_

## Basing usage
To get the list of all command line and configuration file parameters available, run SocketQueue with _--help_ option:

    _nodejs socketQueue.js --help

To establish the gateway to remote ISO host on 10.0.0.1:5000, that accepts both binary and HTTP connections, run the module with the following parameters:  

    nodejs socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenHttpPort=8080 --listenPort=2014
    
To add verbosity and log data to log file use:  

    nodejs socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenHttpPort=8080 --listenPort=2014 --vv --logFile=log.txt
    
To make it silent in console, use _--silent_ option:  

    nodejs socketQueue.js --upstreamHost=10.0.0.1 --upstreamPort=5000 --listenHttpPort=8080 --listenPort=2014 --vv --logFile=log.txt --silent
    
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

You can find all available options example in config.json.dist file that comes with the module.
