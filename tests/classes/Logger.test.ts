/* eslint-disable no-undef */

import { Counters } from '../../src/classes/Counters';
import { Logger } from '../../src/classes/Logger';
import { RequestCache } from '../../src/classes/RequestCache';

class FakeConsole {
    public loggedData: any[] = [];

    public log(...args: any[]) {
        this.loggedData.push(...args);
    }
}

it('displays the statistics', () => {
    const counters = new Counters();
    counters.totalBytesSent = 1024;
    counters.totalRequestCounter = 1;
    counters.totalResponseTimeMs = 100;

    const cache = new RequestCache();
    cache.cache('req-1', 100000000, false);

    const fakeConsole = new FakeConsole();

    const logger = new Logger(counters, cache, fakeConsole);

    logger.display(100, 'test payload');

    expect(fakeConsole.loggedData).toMatchSnapshot();
});
