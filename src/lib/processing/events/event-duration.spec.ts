import test from 'ava';

import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { EventDurationStep } from './event-duration';

const eventFrames1 = i32(1, 10, 100);
const eventFrames2 = i32(5, 50, 150);
const frameRate = 300;

const e1 = new Signal(eventFrames1, frameRate);
const e2 = new Signal(eventFrames2, frameRate);
const ef1 = new Signal(eventFrames1); // No frame rate
const ef2 = new Signal(eventFrames1); // No frame rate
const s1 = new Signal(new VectorSequence(eventFrames1, eventFrames1, eventFrames1)); // Wrong type
const s2 = new Signal(0.1); // Wrong type

test('EventDurationStep - Wrong input signals', async(t) => {
	await t.throwsAsync(mockStep(EventDurationStep, [ef1, ef2, ef2]).process()); // Too many inputs
	await t.throwsAsync(mockStep(EventDurationStep, [ef1, ef2]).process()); // No frame rate
	await t.throwsAsync(mockStep(EventDurationStep, [s1, s2]).process()); // Wrong type
	await t.throwsAsync(mockStep(EventDurationStep, [e1, s1]).process()); // Wrong type
	await t.throwsAsync(mockStep(EventDurationStep).process()); // No inputs
});

test('EventDurationStep', async(t) => {
	const step = mockStep(EventDurationStep, [e1, e2]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...eventFrames1).map((f, i) => (eventFrames2[i] - f) / frameRate));
});

test('EventDurationStep - exclude single', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const exclude = new Signal(i32(2, 3, 32), 100);

	const step = mockStep(EventDurationStep, [framesA, framesB], { exclude: [exclude] });
	const res = await step.process();

	console.log(res.getValue());

	t.deepEqual(res.getValue(), f32(0.09, 0.14, 0.24));
});

test('EventDurationStep - exclude multiple', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const excludeA = new Signal(i32(2, 3, 32), 100);
	const excludeB = new Signal(i32(7, 33), 100);

	const step = mockStep(EventDurationStep, [framesA, framesB], { exclude: [excludeA, excludeB] });
	const res = await step.process();

	console.log(res.getValue());

	t.deepEqual(res.getValue(), f32(0.14, 0.24));
});

test('EventDurationStep - include single', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const include = new Signal(i32(12, 24, 62), 100);
	
	const step = mockStep(EventDurationStep, [framesA, framesB], { include: [include] });
	const res = await step.process();

	console.log(res.getValue());

	t.deepEqual(res.getValue(), f32(0.09, 0.14, 0.24));
});

test('EventDurationStep - include multiple', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const includeA = new Signal(i32(12, 24, 62), 100);
	const includeB = new Signal(i32(27, 72), 100);
	
	const step = mockStep(EventDurationStep, [framesA, framesB], { include: [includeA, includeB] });
	const res = await step.process();

	console.log(res.getValue());

	t.deepEqual(res.getValue(), f32(0.14, 0.24));
});
