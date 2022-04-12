import test from 'ava';

import { f32, i32, mockStep } from '../../test-utils/mock-step';
import { Signal } from '../models/signal';

import { IfStep } from './logic';

/**
 * This test is testing the input parsing of the mockStep function.
 * YAML parsing is tested in the corresponding test in the engine lib.
 */

const s0 = new Signal(0);
const s1 = new Signal(1);
const s2 = new Signal(2);
const s10 = new Signal(10);
const sArray = new Signal(f32(3, 4, 5));
const sArray2 = new Signal(f32(3));
const sArray3 = new Signal(i32(1));

test('IfStep (mock) - Missing then ', async (t) => {
	const step = mockStep(IfStep, [s1, s2], {
		else: [s10],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Missing else ', async (t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s10],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Bad parentheses', async (t) => {
	const step = mockStep(IfStep, [s2, s1], {
		then: [s10],
		else: [s10, s0],
	}, '(2 > 1))');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Unsupported type', async (t) => {
	const step = mockStep(IfStep, [sArray, s1], {
		then: [s10],
		else: [s0],
	}, 'MyArray > 1');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Not enough input signals', async (t) => {
	const step = mockStep(IfStep, [], {
		then: [s10],
		else: [s0],
	}, '');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Array of length 1 support', async (t) => {
	const step1 = mockStep(IfStep, [sArray2, s1], {
		then: [s10],
		else: [s0],
	}, 'MyShortArray != 1');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	const step2 = mockStep(IfStep, [sArray3, s1], {
		then: [s10],
		else: [s0],
	}, 'MyShortArray != 1');

	const res2 = await step2.process();
	t.is(res2.getValue(), 0);
});

test('IfStep (mock) - Numeric input, simple - then', async (t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [s0],
	}, '1 < 2');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Numeric input, simple - else', async (t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [s0],
	}, '1 == 2');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Numeric input, advanced - then', async (t) => {
	const step = mockStep(IfStep, [s1, s2, s10], {
		then: [s10],
		else: [s0],
	}, '(1 > 2 && 2 > 1) || 10 > 2');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Numeric input, advanced - else', async (t) => {
	const step = mockStep(IfStep, [s1, s2, s10], {
		then: [s10],
		else: [s0],
	}, '(1 > 2 && 2 > 1) || 10 < 2');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Mixed input, simple - then', async (t) => {
	const step = mockStep(IfStep, [s1, s1], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue');

	const res = await step.process();
	t.is(res.getValue(), 10);
});