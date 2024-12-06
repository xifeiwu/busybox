## Intro

A Tcp gate way can direct request to any protocol logic based on tcp connection, or http connection.

## Three way to run tcp-gateway

1. Run in debug mode, run testStartTcpGatewayByOptions in server.test.ts
2. Run Local, run command: tcp-gateway(make sure this command already on global PATH)
3. Run on child process, run command: daemon run tcp-gateway