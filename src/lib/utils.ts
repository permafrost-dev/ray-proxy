import { AxiosResponse } from 'axios';

/**
 * Formats bytes to kilobytes.
 *
 * @param bytes number
 * @param decimals number
 * @returns number
 */
export const formatPayloadSize = (bytes: number, decimals = 3): number => {
    return Number((bytes / 1024.0).toFixed(decimals));
};

/**
 * Sends the response from the Ray app to the proxy client, including headers.
 *  The request flow is as follows:
 *
 *  client --> proxy --> Ray
 *    client <-- proxy <--'
 *
 * @param fastifyReply `any` - reply param from a fastify event handler
 * @param appResponse `any|AxiosResponse` - response from axios request to Ray app
 */
export const relayResponseFromAppToClient = (fastifyReply: any, appResponse: any | AxiosResponse, reflectHeaders = true): void => {
    if (typeof appResponse === 'undefined') {
        const sentReply = fastifyReply.code(404);
        sentReply.header('Access-Control-Allow-Origin', '*');
        sentReply.send('not found');

        return;
    }

    const sentReply = fastifyReply.code(appResponse?.status ?? 404);

    if (reflectHeaders) {
        sentReply.headers(appResponse.headers);
    }

    sentReply.header('connection', 'keep-alive');
    setCorsHeaders(sentReply);

    sentReply.send(appResponse.data);
};

export const setCorsHeaders = (reply: any) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');
    reply.header('Access-Control-Expose-Headers', 'Content-Length,Content-Range');
};

export const sendPreflightCorsResponse = (fastifyReply: any) => {
    const sentReply = fastifyReply.code(204);

    setCorsHeaders(sentReply);

    sentReply.header('Access-Control-Max-Age', 3600 * 24);
    sentReply.header('Content-Type', 'text/plain; charset=utf-8');

    sentReply.send('');
};
