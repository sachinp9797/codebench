import { expect, test } from 'vitest';
import { VERSION } from './index.js';

test('core package loads', () => {
  expect(VERSION).toBe('0.1.0');
});
