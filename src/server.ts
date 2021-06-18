// Modified from the reference implementation available at 
// https://www.npmjs.com/package/check-proxy

// Import dependencies
import express from 'express';
import parseArgs from 'minimist';
import publicIp from 'public-ip';
import cookieParser from 'cookie-parser';
import { urlencoded, json } from 'body-parser';
import { ping as getProxyType } from 'check-proxy';

// Port to listen on
const argv: { _: Array<any> } = parseArgs(process.argv.slice(2));
const port: number = argv._[0] || 8080;

/**
 * Handler for GET and POST request to the server.
 * @param req Request object
 * @param res Response object
 */
function ping(req: express.Request, res: express.Response) {
    res.json(getProxyType(req.headers, req.query, req.body, req.cookies));
}

// Setup check-proxy server using express
const app = express();
// Setup middleware
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());
// Setup GET and POST request handler
app.get('/', ping);
app.post('/', ping);
// Start server
app.listen(port, function() {
    publicIp.v4().then((externalIP) => {
        console.log(`Check-proxy server started on ${externalIP}:${port}`);
    });
});