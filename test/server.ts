// Import dependencies
import { expect } from 'chai';
import express from 'express';
import getPort from 'get-port';
import publicIp from 'public-ip';
import { check } from 'check-proxy';
import { exec } from 'child_process';
import proxy from 'express-http-proxy';


describe('Check-Proxy Server', () => {

    /**
     * Start check-proxy server using `npm start ${port}`.
     * @param port Port number to start check-proxy server
     * @returns Initialized check-proxy server's child process
     */
    const startCheckProxyServer = async (port: number) => {
        try {
            // Use exec to launch check-proxy server
            const server = exec(`npm start ${port}`);
            // Ensure the check-proxy server has launched successfully
            await new Promise<void>((resolve, reject) => {
                if (server && server.stdout && server.stderr) {
                    // Monitor stdout for the 'Check-proxy server started on [your_external_ip]:[port_number]' message
                    // Resolve if found
                    server.stdout.on('data', async (data) => {
                        const output: string = data.toString();
                        const externalIP = await publicIp.v4();
                        if (output.includes(`Check-proxy server started on ${externalIP}:${port}`)) {
                            resolve();
                        }
                    });
                    // Monitor stderr for any error message
                    server.stderr.on('data', (data) => {
                        reject(data.toString());
                    });
                }
            });
            // Return the initialized check-proxy server's child process if it has launched successfully
            return server;
        }
        catch (err) {
            // Return null if any error occurred
            return null;
        }
    }

    it("should start the server at the specified port", async () => {
        // Get an available port number for the check-proxy server
        const port = await getPort();
        // Start check-proxy server
        const server = await startCheckProxyServer(port);
        // Expect the server to have launched without error
        expect(server).to.not.be.null;
        // Kill the check-proxy server
        if (server) { server.kill() };
    });

    it('should work correctly with the check-proxy package', async () => {
        // Get 2 available port numbers for the check-proxy server and the local proxy server
        const checkProxyServerPort = await getPort();
        const localProxyServerPort = await getPort();
        // Start check-proxy server
        const server = await startCheckProxyServer(checkProxyServerPort);
        // Throw if the check-proxy server did not launch correctly
        if (!server) { throw new Error('Check-proxy server initialization failed.') }
        // Start a local HTTP proxy server that redirects all traffic
        const app = express();
        app.use('/', proxy((req) => req.url));
        const proxyServer = app.listen(localProxyServerPort);
        // Use check-proxy on the local proxy server
        const result: Array<{ ip: string, port: number}> = await check({
            testHost: `localhost:${checkProxyServerPort}`,
            proxyIP: 'localhost',
            proxyPort: localProxyServerPort,
            localIP: await publicIp.v4(),
            connectTimeout: 10,
            timeout: 60
        });
        // Expect check-proxy to return IP and port number of the local proxy
        expect(result[0].ip).to.equal('localhost');
        expect(result[0].port).to.equal(localProxyServerPort);
        // Shutdown local proxy server
        proxyServer.close();
        // Kill the check-proxy server
        server.kill();
    });

});