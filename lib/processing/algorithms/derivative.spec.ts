import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { AccelerationStep, DerivativeStep, VelocityStep } from './derivative';

test('DerivativeStep - signal with missing frame rate', async (t) => {
	const inputSignal = new Signal(7, undefined);

	const step = mockStep(DerivativeStep, [inputSignal]);
	await t.throwsAsync(step.process());
});

test('DerivativeStep with single number', async (t) => {
	const inputSignal = new Signal(7, 1);

	const step = mockStep(DerivativeStep, [inputSignal]);
	const result = await step.process();

	t.is(result.getNumberValue(), 0);
});

test('DerivativeStep with Float32Array, order = 1', async (t) => {
	const inputSignal = new Signal(f32(1, 2, 3, 4, 5, 6, 8, 10, 14, 18, 22, 30), 1);

	const step = mockStep(DerivativeStep, [inputSignal]);
	const result = await step.process();
	const derivative = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(derivative), [NaN, 1, 1, 1, 1, 1.5, 2, 3, 4, 4, 6, NaN]);
});

test('DerivativeStep with Float32Array, order = 2', async (t) => {
	const inputSignal = new Signal(f32(1, 2, 3, 4, 5, 6, 8, 10, 14, 18, 22, 30), 1);
	const inputSignal2 = new Signal(2);

	const step = mockStep(DerivativeStep, [inputSignal, inputSignal2]);
	const result = await step.process();
	const derivative = result.getFloat32ArrayValue();

	t.deepEqual(derivative, Float32Array.from([NaN, 0, 0, 0, 0, 1, 0, 2, 0, 0, 4, NaN]));
});

test('DerivativeStep with empty array', async (t) => {
	const inputSignal = new Signal(new Float32Array(0), 1);

	const step = mockStep(DerivativeStep, [inputSignal]);
	const result = await step.process();

	t.is(result.getFloat32ArrayValue().length, 0);
});

test('VelocityStep (order = 1)', async (t) => {
	const inputSignal = new Signal(f32(1, 2, 3, 4, 5, 6, 8, 10, 14, 18, 22, 30), 1);

	const step = mockStep(VelocityStep, [inputSignal]);
	t.is(step.orderOverride, 1);

	const result = await step.process();
	const derivative = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(derivative), [NaN, 1, 1, 1, 1, 1.5, 2, 3, 4, 4, 6, NaN]);
});

test('AccelerationStep (order = 2)', async (t) => {
	const inputSignal = new Signal(f32(1, 2, 3, 4, 5, 6, 8, 10, 14, 18, 22, 30), 1);

	const step = mockStep(AccelerationStep, [inputSignal]);
	t.is(step.orderOverride, 2);

	const result = await step.process();
	const derivative = result.getFloat32ArrayValue();

	t.deepEqual(derivative, Float32Array.from([NaN, 0, 0, 0, 0, 1, 0, 2, 0, 0, 4, NaN]));
});