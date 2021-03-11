/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { send } from 'node:process';
import { formatPayloadSize, relayResponseFromAppToClient, sendPreflightCorsResponse, setCorsHeaders } from '../src/lib/utils';

interface SentReplyInterface {
    sentData: any[];
    sentHeaders: any[];

    header(name: string, value: string): void;
    send(data: any): void;
}

let sentReply: SentReplyInterface;

beforeEach(() => {
    sentReply = {
        sentData: [],
        sentHeaders: [],

        header(name: string, value: string) {
            this.sentHeaders.push({ name, value });
        },

        send(data: any) {
            this.sentData.push(data);
        },
    };
});

it('formats bytes to kb', () => {
    expect(formatPayloadSize(1024, 1)).toBe(1.0);
    expect(formatPayloadSize(512, 1)).toBe(0.5);
});

it('relays a response from the app to the client', () => {
    const sentData: any[] = [];
    const sentHeaders: any[] = [];
    let replyCode = 0;

    const sentReply = {
        sentData,
        sentHeaders,

        header(name: string, value: string) {
            this.sentHeaders.push({ name, value });
        },

        headers(obj: any) {
            for (const name in obj) {
                this.header(name, obj[name]);
            }
        },

        send(data: any) {
            this.sentData.push(data);
        },
    };

    const fastifyReply = {
        code(n: any) {
            replyCode = n;
            return sentReply;
        },
    };

    const appResponse = {
        headers: {
            one: 'header one',
            two: 'header two',
        },
        data: {
            abc: 123,
            def: 456,
        },
        status: 200,
    };

    relayResponseFromAppToClient(fastifyReply, appResponse);

    expect(replyCode).toBe(appResponse.status);
    expect(sentData).toMatchSnapshot();
    expect(sentHeaders).toMatchSnapshot();
});

it('sets CORS headers on a reply object', () => {
    setCorsHeaders(sentReply);

    expect(sentReply.sentHeaders).toMatchSnapshot();
});

it('sends preflight response headers', () => {
    let replyCode = 0;

    const fastifyReply = {
        code(n: any) {
            replyCode = n;
            return sentReply;
        },
    };

    sendPreflightCorsResponse(fastifyReply);

    expect(replyCode).toBe(204);
    expect(sentReply.sentHeaders).toMatchSnapshot();
});
