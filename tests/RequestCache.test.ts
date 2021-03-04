/* eslint-disable no-undef */

import { RequestCache } from '../src/RequestCache';

let cache: RequestCache;

beforeEach(() => {
    cache = new RequestCache();
});

it('adds items to its cache', () => {
    cache.cache(1, 1614895352000);
    cache.cache(2, 1614895352000);

    expect(cache.countCache).toStrictEqual([1614895352, 1614895352]);
});

it('gets the number of requests per second', () => {
    cache.cache(1, 1614895352000, false);
    cache.cache(2, 1614895354000, false);

    expect(cache.requestsPerSec()).toBe(1);

    cache.countCache = [];

    cache.cache(1, 1614895352000, false);
    cache.cache(2, 1614895352000, false);
    expect(cache.requestsPerSec()).toBe(2);

    cache.countCache = [];

    cache.cache(1, 1614895352000, false);
    cache.cache(2, 1614895355000, false);
    cache.cache(3, 1614895358000, false);
    expect(cache.requestsPerSec()).toBe(0.5);
});
