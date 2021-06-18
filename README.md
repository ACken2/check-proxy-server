# Check-Proxy Server Implementation

[Check-proxy](https://www.npmjs.com/package/check-proxy) is an advanced proxy checking library, but a server-side implementation is required for it to work.

This repository stores a functional and easily deployable server-side implementation for the check-proxy package.

## Running Automated Test

```
npm install
npm test
```

## Running the Server

You can also clone this repository and run the server at a specified port. If no port number was provided, it will default to 8080.

```
npm start [port_number]
```

The following message should show up once the server is started.
```
Check-proxy server started on [your_external_ip]:[port_number]
```