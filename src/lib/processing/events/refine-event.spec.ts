import test from 'ava';

import { ArrayTestUtil } from '../../../test-utils/array-utils';
import { f32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { RefineEventStep } from './refine-event';

const framesA = f32(1, 5, 10, 15, 20);
const framesB = f32(2, 6, 11, 16);
const framesC = f32(3, 7, 12, 17, 22);
const framesX1 = f32(1.5, 16.5);

const framesAShuffle = ArrayTestUtil.shuffle(framesA);
const framesBShuffle = ArrayTestUtil.shuffle(framesB);
const framesCShuffle = ArrayTestUtil.shuffle(framesC);
const framesX1Shuffle = ArrayTestUtil.shuffle(framesX1);

const vs = new VectorSequence(framesA, framesA, framesA);
const sVS = new Signal(vs);

const sA = new Signal(framesA);
const sB = new Signal(framesB);
const sC = new Signal(framesC);
const sX = new Signal(framesX1);

const sAShuffle = new Signal(framesAShuffle);
const sBShuffle = new Signal(framesBShuffle);
const sCShuffle = new Signal(framesCShuffle);
const sXShuffle = new Signal(framesX1Shuffle);

/** 
 * The following tests verify the *input handling*. The pattern handling is
 * tested in lib/utils/events.spec.ts
 */

test('RefineEventStep - Wrong input signals', async t => {
	await t.throws(() => mockStep(RefineEventStep, [sA])); // No sequence
	await t.throwsAsync(mockStep(RefineEventStep, undefined, { sequence: [sA, sB, sC] }).process()); // No inputs
	await t.throwsAsync(mockStep(RefineEventStep, [sA], { sequence: [] }).process()); // No sequence
	await t.throwsAsync(mockStep(RefineEventStep, [sVS], { sequence: [sA, sB, sC] }).process()); // Wrong input type
	await t.throwsAsync(mockStep(RefineEventStep, [sA], { sequence: [sA, sVS, sC] }).process()); // Wrong input type in sequence
	await t.throwsAsync(mockStep(RefineEventStep, [sA, sB], { sequence: [sA, sB, sC] }).process()); // Multiple inputs
	await t.throwsAsync(mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC], exclude: [sVS] }).process()); // Wrong input type in exclude
	await t.throwsAsync(mockStep(RefineEventStep, [sA], { sequence: [sB, sC], exclude: [sX] }).process()); // Input not found in sequence
	await t.throwsAsync(mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC], exclude: [sB] }).process()); // Sequence signal found in exclude
});

test('RefineEventStep - Options - sequence, exclude & cyclic', async t => {
	const step1 = mockStep(RefineEventStep, [sA], { sequence: [sA, sVS, sC], exclude: [sX] });

	t.deepEqual(step1.sequence, [sA, sVS, sC]);
	t.deepEqual(step1.exclude, [sX]);
	// Cyclic is true by default
	t.is(step1.cyclic, true);

	const step2 = mockStep(RefineEventStep, [sA], { sequence: [sA, sVS, sC], cyclic: false });

	t.is(step2.cyclic, false);
});

test('RefineEventStep - Result - sequence only', async t => {
	const res = await mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC] }).process();
	t.deepEqual(res.getValue(), f32(1, 5, 10, 15));

	// Test random shuffle.
	const resShuffle = await mockStep(RefineEventStep, [sAShuffle], { sequence: [sAShuffle, sBShuffle, sCShuffle] }).process();
	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('RefineEventStep - Result - sequence & exclude', async t => {
	const res = await mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC], exclude: [sX] }).process();
	t.deepEqual(res.getValue(), f32(5, 10));

	// Test random shuffle.
	const resShuffle = await mockStep(RefineEventStep, [sAShuffle], { sequence: [sAShuffle, sBShuffle, sCShuffle], exclude: [sXShuffle] }).process();
	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('RefineEventStep - Result - cyclic true', async t => {
	const res = await mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC, sA], exclude: [sX], cyclic: true }).process();
	t.deepEqual(res.getValue(), f32(5, 10, 15));

	// Test random shuffle.
	const resShuffle = await mockStep(RefineEventStep, [sAShuffle], { sequence: [sAShuffle, sBShuffle, sCShuffle, sAShuffle], exclude: [sXShuffle], cyclic: true }).process();
	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('RefineEventStep - Result - cyclic false', async t => {
	const res = await mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC, sA], exclude: [sX], cyclic: false }).process();
	t.deepEqual(res.getValue(), f32(5, 10));

	// Test random shuffle.
	const resShuffle = await mockStep(RefineEventStep, [sAShuffle], { sequence: [sAShuffle, sBShuffle, sCShuffle, sAShuffle], exclude: [sXShuffle], cyclic: false }).process();
	t.deepEqual(resShuffle.getValue(), res.getValue());
});

test('RefineEventStep - makeArray', async t => {
	const farr = f32(1, 2, 3);
	const arr = [1, 2, 3];
	t.is(RefineEventStep.makeArray(farr), farr);
	t.is(RefineEventStep.makeArray(arr), arr);
	t.deepEqual(RefineEventStep.makeArray(1), f32(1));
	t.deepEqual(RefineEventStep.makeArray(NaN), f32(NaN));

	t.throws(() => RefineEventStep.makeArray('test'));
	t.throws(() => RefineEventStep.makeArray({ hello: 'world' }));
	t.throws(() => RefineEventStep.makeArray(undefined));
	t.throws(() => RefineEventStep.makeArray(null));
});
