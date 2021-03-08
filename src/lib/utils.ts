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
export const relayResponseFromAppToClient = (fastifyReply: any, appResponse: any | AxiosResponse): void => {
    const sentReply = fastifyReply.code(appResponse.status);

    for (const headerName in appResponse.headers) {
        sentReply.header(headerName, appResponse.headers[headerName]);
    }

    sentReply.send(appResponse.data);
};
