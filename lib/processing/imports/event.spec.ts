import test from 'ava';

import { i32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { EventStep } from './event';

/**
 * This test is testing the input parsing of the mockStep function.
 * YAML parsing is tested in the corresponding test in the engine lib.
 */

const a1 = i32(1, 10, 100);
const s1 = new Signal(a1);

test('EventStep (mock) - prepare node (single input)', async (t) => {
	const node = mockStep(EventStep, { myEvent1: s1 }).node;
	t.deepEqual(node.in, ['event://myEvent1']);
});

test('EventStep (mock) - prepare node (multiple inputs)', async (t) => {
	const node = mockStep(EventStep, { myEvent1: s1, myEvent2: s1 }).node;
	t.deepEqual(node.in, ['event://myEvent1', 'event://myEvent2']);
});

test('EventStep (mock) - prepare node (already prepared input)', async (t) => {
	const node = mockStep(EventStep, { 'event://myEvent1': s1 }).node;
	t.deepEqual(node.in, ['event://myEvent1']);
});
