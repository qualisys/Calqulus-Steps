import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { RefineEventStep } from './refine-event';

const framesA = f32(1, 5, 10, 15, 20);
const framesB = f32(2, 6, 11, 16);
const framesC = f32(3, 7, 12, 17, 22);
const framesX1 = f32(1.5, 16.5);

const vs = new VectorSequence(framesA, framesA, framesA);
const sVS = new Signal(vs);

const sA = new Signal(framesA);
const sB = new Signal(framesB);
const sC = new Signal(framesC);
const sX = new Signal(framesX1);

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

test('RefineEventStep - Options - sequence & exclude', async t => {
	const step = mockStep(RefineEventStep, [sA], { sequence: [sA, sVS, sC], exclude: [sX] });

	t.deepEqual(step.sequence, [sA, sVS, sC]);
	t.deepEqual(step.exclude, [sX]);
});

test('RefineEventStep - Result - sequence only', async t => {
	const res = await mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC] }).process();

	t.deepEqual(res.getValue(), f32(1, 5, 10, 15));
});

test('RefineEventStep - Result - sequence & exclude', async t => {
	const res = await mockStep(RefineEventStep, [sA], { sequence: [sA, sB, sC], exclude: [sX] }).process();

	t.deepEqual(res.getValue(), f32(5, 10));
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
