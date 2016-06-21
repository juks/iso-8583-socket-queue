## What are these payloads for?

This folder contains some basic ISO-8583 messages payloads. They can be used to check if
the binary echo server is running and receives your messages in a proper way.

Some ISO-8583 hosts only respond to the messages they understand. This is why one has to be
sure that the messages being sent are correct. If you get no response from other party there
might be is no way to know whether or not there is syntax problem, wrong data is being sent
or there is no ISO-8583 host behind remote port at all.

Important: mind the fied 12 value that has to represent current transaction date. The field
format is YYMMDDHHmmss. Otherwise the transaction might get discarded as expired. For the
purchase payload data you should replace the value of 160607173800 with the proper value.

## Using payloads

To use payload data from sample files simply execute the following pipelined command:

    $ cat payload_filename - | ncat host port

Press CTRL+D to terminate.

For live example:

    $ cat ./sv_800_echo.txt - | nc askarov.com 12345
