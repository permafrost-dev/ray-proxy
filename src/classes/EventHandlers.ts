/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import { relayResponseFromAppToClient, sendPreflightCorsResponse } from '@/lib/utils';
import { Counters } from '@/classes/Counters';
import { Logger } from '@/classes/Logger';
import { ProxyConfig } from '@/classes/ProxyConfig';
import { RequestCache } from '@/classes/RequestCache';

export class EventHandlers {
    onHead(config: ProxyConfig, axios: any) {
        return async (req: any, reply: any) => {
            let response: any;

            try {
                response = await axios.head(`http://${config.hostName}:${config.hostPort}`);
            } catch (err: any) {
                response = err.response;
            }

            relayResponseFromAppToClient(reply, response);
        };
    }

    onGet(config: ProxyConfig, axios: any) {
        return async (req: any, reply: any) => {
            let response: any;

            try {
                response = await axios.get(`${req.url}`);
            } catch (err: any) {
                response = err.response;
            }

            relayResponseFromAppToClient(reply, response);
        };
    }

    onOptions(config: ProxyConfig, axios: any) {
        return async (req: any, reply: any) => {
            sendPreflightCorsResponse(reply);
        };
    }

    onPost(config: ProxyConfig, axios: any, requestCache: RequestCache, counters: Counters, logger: Logger) {
        return async (request: any, reply: any) => {
            let response: any;

            requestCache.cache(request.id, new Date().getTime());

            const payload = JSON.stringify(request.body).toString();

            try {
                response = await axios.post(`http://${config.hostName}:${config.hostPort}`, request.body);
            } catch (err: any) {
                response = err.response;
            }

            relayResponseFromAppToClient(reply, response);

            const requestTime = new Date().getTime() - (requestCache.times[request.id] ?? 0);

            counters.onRequestSent().onPayloadSent(payload)
                .onRequestTime(requestTime);

            logger.display(requestTime, payload);
        };
    }
}
