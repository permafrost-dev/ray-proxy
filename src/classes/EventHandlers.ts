/* eslint-disable no-unused-vars */

import { relayResponseFromAppToClient, sendPreflightCorsResponse } from '../lib/utils';
import { Counters } from './Counters';
import { Logger } from './Logger';
import { ProxyConfig } from './ProxyConfig';
import { RequestCache } from './RequestCache';

export class EventHandlers {
    onHead(config: ProxyConfig, axios: any) {
        return async (req: any, reply: any) => {
            let response: any;

            try {
                response = await axios.head(`http://${config.hostName}:${config.hostPort}`);
            } catch (err) {
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
            } catch (err) {
                response = err.response;
            }

            relayResponseFromAppToClient(reply, response);
        };
    }

    onOptions(config: ProxyConfig, axios: any) {
        return async (req: any, reply: any) => {
            //const response = await axios.options(`http://${config.hostName}:${config.hostPort}`);
            //relayResponseFromAppToClient(reply, response);
            sendPreflightCorsResponse(reply);
        };
    }

    onPost(config: ProxyConfig, axios: any, requestCache: RequestCache, counters: Counters, logger: Logger) {
        return async (request: any, reply: any) => {
            requestCache.cache(request.id, new Date().getTime());

            const payload = JSON.stringify(request.body).toString();

            const response = await axios.post(`http://${config.hostName}:${config.hostPort}`, request.body);

            relayResponseFromAppToClient(reply, response);

            const requestTime = new Date().getTime() - (requestCache.times[request.id] ?? 0);

            counters.onRequestSent().onPayloadSent(payload).onRequestTime(requestTime);
            logger.display(requestTime, payload);
        };
    }
}
