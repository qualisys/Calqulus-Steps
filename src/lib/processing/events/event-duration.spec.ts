import test from 'ava';

import { ArrayTestUtil } from '../../../test-utils/array-utils';
import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { EventDurationStep } from './event-duration';

const eventFrames1 = i32(1, 10, 100);
const eventFrames2 = i32(5, 50, 150);
const frameRate = 300;

const eventFrames1Shuffle = ArrayTestUtil.shuffle(eventFrames1);
const eventFrames2Shuffle = ArrayTestUtil.shuffle(eventFrames2);

const e1 = new Signal(eventFrames1, frameRate);
const e2 = new Signal(eventFrames2, frameRate);
const e1Shuffle = new Signal(eventFrames1Shuffle, frameRate);
const e2Shuffle = new Signal(eventFrames2Shuffle, frameRate);
const ef1 = new Signal(eventFrames1); // No frame rate
const ef2 = new Signal(eventFrames1); // No frame rate
const ef1Shuffle = new Signal(eventFrames1Shuffle); // No frame rate
const ef2Shuffle = new Signal(eventFrames2Shuffle); // No frame rate

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

	// Test random shuffle.
	const stepShuffle = mockStep(EventDurationStep, [e1Shuffle, e2Shuffle]);
	const resShuffle = await stepShuffle.process();

	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('EventDurationStep - exclude single', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const exclude = new Signal(i32(2, 3, 32), 100);

	const step = mockStep(EventDurationStep, [framesA, framesB], { exclude: [exclude] });
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0.09, 0.14, 0.24));

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const excludeShuffle = new Signal(ArrayTestUtil.shuffle(exclude.getUint32ArrayValue()), 100);

	const stepShuffle = mockStep(EventDurationStep, [framesAShuffle, framesBShuffle], { exclude: [excludeShuffle] });
	const resShuffle = await stepShuffle.process();

	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('EventDurationStep - exclude multiple', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const excludeA = new Signal(i32(2, 3, 32), 100);
	const excludeB = new Signal(i32(7, 33), 100);

	const step = mockStep(EventDurationStep, [framesA, framesB], { exclude: [excludeA, excludeB] });
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0.14, 0.24));

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const excludeAShuffle = new Signal(ArrayTestUtil.shuffle(excludeA.getUint32ArrayValue()), 100);
	const excludeBShuffle = new Signal(ArrayTestUtil.shuffle(excludeB.getUint32ArrayValue()), 100);

	const stepShuffle = mockStep(EventDurationStep, [framesAShuffle, framesBShuffle], { exclude: [excludeAShuffle, excludeBShuffle] });
	const resShuffle = await stepShuffle.process();

	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('EventDurationStep - include single', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const include = new Signal(i32(12, 24, 62), 100);
	
	const step = mockStep(EventDurationStep, [framesA, framesB], { include: [include] });
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0.09, 0.14, 0.24));

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const includeShuffle = new Signal(ArrayTestUtil.shuffle(include.getUint32ArrayValue()), 100);

	const stepShuffle = mockStep(EventDurationStep, [framesAShuffle, framesBShuffle], { include: [includeShuffle] });
	const resShuffle = await stepShuffle.process();

	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('EventDurationStep - include multiple', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const includeA = new Signal(i32(12, 24, 62), 100);
	const includeB = new Signal(i32(27, 72), 100);
	
	const step = mockStep(EventDurationStep, [framesA, framesB], { include: [includeA, includeB] });
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0.14, 0.24));

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const includeAShuffle = new Signal(ArrayTestUtil.shuffle(includeA.getUint32ArrayValue()), 100);
	const includeBShuffle = new Signal(ArrayTestUtil.shuffle(includeB.getUint32ArrayValue()), 100);

	const stepShuffle = mockStep(EventDurationStep, [framesAShuffle, framesBShuffle], { include: [includeAShuffle, includeBShuffle] });
	const resShuffle = await stepShuffle.process();

	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('EventMaskStep - include and exclude', async(t) => {
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const exclude = new Signal(i32(22, 32), 100);
	const include = new Signal(i32(12, 24, 62), 100);

	const step = mockStep(EventDurationStep, [framesA, framesB], { exclude: [exclude], include: [include] });
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0.09, 0.24));

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const excludeShuffle = new Signal(ArrayTestUtil.shuffle(exclude.getUint32ArrayValue()), 100);
	const includeShuffle = new Signal(ArrayTestUtil.shuffle(include.getUint32ArrayValue()), 100);

	const stepShuffle = mockStep(EventDurationStep, [framesAShuffle, framesBShuffle], { exclude: [excludeShuffle], include: [includeShuffle] });
	const resShuffle = await stepShuffle.process();

	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('EventMaskStep - incompatible include', async(t) => {
	await t.throwsAsync(mockStep(EventDurationStep, [e1, e2], { include: [new Signal('My string')]}).process());
	await t.throwsAsync(mockStep(EventDurationStep, [e1, e2], { include: [s1]}).process());
});

test('EventMaskStep - incompatible exclude', async(t) => {
	await t.throwsAsync(mockStep(EventDurationStep, [e1, e2], { exclude: [new Signal('My string')]}).process());
	await t.throwsAsync(mockStep(EventDurationStep, [e1, e2], { exclude: [s1]}).process());
});
