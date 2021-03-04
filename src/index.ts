/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios';

const fastify = require('fastify')({
    logger: true,
});

let totalDataSizeSent = 0;
let requestCounter = 0;
let totalResponseTimeMs = 0;
let requestCountCache: number[] = [];
let requestCountCacheLastTs = 0;
const requestTimes: Record<number, number> = {};

const cacheRequest = () => {
    const currentTs = Number((new Date().getTime() / 1000).toFixed(0));

    requestCountCacheLastTs = currentTs;

    requestCountCache.push(currentTs);

    if (requestCountCache.length > 3000) {
        requestCountCache.splice(0, requestCountCache.length - 3000);
    }

    // purge entries older than 5 sec
    requestCountCache = requestCountCache.filter(ts => currentTs - ts <= 5);
};

const getRequestsPerSec = () => {
    const currentTs = Number((new Date().getTime() / 1000).toFixed(0));

    if (!requestCountCache.length) {
        return 0.0;
    }

    const firstTs = requestCountCache[0];
    const lastTs = requestCountCache[requestCountCache.length - 1];

    const time = lastTs - firstTs;

    return requestCountCache.length / (time + 1);
};

fastify.post('/', async (request: any, reply: any) => {
    cacheRequest();

    const payload = JSON.stringify(request.body).toString();

    const startRequestAt = new Date().getTime();

    requestTimes[request.id] = startRequestAt;

    axios
        .post('http://localhost:23516', request.body)
        .then(resp => {
            requestCounter++;
            totalDataSizeSent += payload.length;

            const requestTime = new Date().getTime() - (requestTimes[request.id] ?? 0);

            totalResponseTimeMs += requestTime;

            // log the payload
            console.log('\n' + payload);

            console.log('---');
            console.log(`[Ray App] response time from Ray (last): ${requestTime} ms`);
            console.log(`[Ray App] response time from Ray (avg): ${(totalResponseTimeMs / requestCounter).toFixed(1)} ms`);
            console.log(`[project] requests sent to Ray (total): ${requestCounter}`);
            console.log(`[project] requests/sec to Ray app: ${getRequestsPerSec().toFixed(2)}`);
            console.log(`[payload] data sent (total): ${(totalDataSizeSent / 1024.0).toFixed(3)} kb`);
            console.log(`[payload] data sent (last payload): ${(payload.length / 1024.0).toFixed(3)} kb`);
            console.log(`[payload] data sent (avg/request): ${(totalDataSizeSent / requestCounter / 1024.0).toFixed(3)} kb`);
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
