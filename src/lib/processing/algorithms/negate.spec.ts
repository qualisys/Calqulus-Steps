import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { NegateStep } from './negate';

test('NegateStep with single number', async(t) => {
	const step = mockStep(NegateStep, [new Signal(7)]);
	const result = await step.process();
	const negated = result.getNumberValue();

	t.is(negated, -7);
});

test('NegateStep with Float32Array', async(t) => {
	const step = mockStep(NegateStep, [new Signal(f32(-5, 5, -5.0))]);
	const result = await step.process();
	const negated = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(negated), [5, -5, 5]);
});

test('NegateStep with multiple Float32Arrays', async(t) => {
	const inputSignal1 = new Signal(f32(-3, 5, -9.0));
	const inputSignal2 = new Signal([f32(-1, 2, -3.0), f32(-6)]);

	const step = mockStep(NegateStep, [inputSignal1, inputSignal2]);
	const result = await step.process();
	const negated = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(negated), [3, -5, 9]);
});

test('NegateStep with empty array', async(t) => {
	const step = mockStep(NegateStep, [new Signal(new Float32Array(0))]);
	const result = await step.process();

	t.is(result.getFloat32ArrayValue().length, 0);
});