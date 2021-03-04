/* eslint-disable no-undef */

import { formatPayloadSize } from '../src/utils';

it('formats bytes to kb', () => {
    expect(formatPayloadSize(1024, 1)).toBe(1.0);
    expect(formatPayloadSize(512, 1)).toBe(0.5);
});
