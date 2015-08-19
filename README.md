# SocketQueue
ISO 8583 gateway for bank POS systems communication

## The Idea
SocketQueue acts as a gateway between bank ISO 8583 system and web applications that want to communicate with them. It keeps one "host to host" connection with the bank that is used to pass data sent by many connections of the local clients.

                                +-------------+
                                |             |<-------> POS HTTP client
     [Bank POS ISO HOST]<------>| SocketQueue |<-------> POS device
                                |             |<-------> POS HTTP client
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
* SocketBank (virtual SW test host)
* Test clients (self test mode)
* Stats server
* SmartVista weird transactions mishandling handling
* Lighweight, reliable, single thread, event based. Hundreds of concurrent connections/transactions at a time
