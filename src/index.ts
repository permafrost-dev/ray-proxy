/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios';
import { RequestCache } from './RequestCache';
import { formatPayloadSize } from './utils';

const fastify = require('fastify')({
    logger: true,
});

let totalDataSizeSent = 0;
let requestCounter = 0;
let totalResponseTimeMs = 0;
const requestCache = new RequestCache();

fastify.post('/', async (request: any, reply: any) => {
    const payload = JSON.stringify(request.body).toString();

    requestCache.cache(request.id, new Date().getTime());

    axios
        .post('http://localhost:23516', request.body)
        .then(resp => {
            requestCounter++;
            totalDataSizeSent += payload.length;

            const requestTime = new Date().getTime() - (requestCache.times[request.id] ?? 0);

            totalResponseTimeMs += requestTime;

            // log the payload
            console.log('\n' + payload);

            console.log('---');
            console.log(`[Ray App] response time from Ray (last): ${requestTime} ms`);
            console.log(`[Ray App] response time from Ray (avg): ${(totalResponseTimeMs / requestCounter).toFixed(1)} ms`);
            console.log(`[project] requests sent to Ray (total): ${requestCounter}`);
            console.log(`[project] requests/sec to Ray app: ${requestCache.requestsPerSec().toFixed(2)}`);
            console.log(`[payload] data sent (total): ${formatPayloadSize(totalDataSizeSent)} kb`);
            console.log(`[payload] data sent (last payload): ${formatPayloadSize(payload.length)} kb`);
            console.log(`[payload] data sent (avg/request): ${formatPayloadSize(totalDataSizeSent / requestCounter)} kb`);
            console.log('---');
        })
        .catch(err => {
            //
        });

    reply
        .code(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Expose-Headers', '*')
        .send('ok');
});

fastify.options('/', async (req: any, reply: any) => {
    reply
        .code(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Headers', '*')
        .header('Access-Control-Expose-Headers', '*')
        .header('Allow', 'GET,HEAD,POST,PUT')
        .header('Vary', 'Access-Control-Request-Method')
        .header('Cache-Control', 'no-cache, private')
        .send();
});

const start = async () => {
    try {
        await fastify.listen(23517);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
