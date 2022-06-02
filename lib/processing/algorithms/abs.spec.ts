import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { AbsStep } from './abs';

test('AbsStep with single number', async(t) => {
	const inputSignal = new Signal(-77);

	const step = mockStep(AbsStep, [inputSignal]);
	const result = await step.process();
	const abs = result.getNumberValue();

	t.is(abs, 77);
});

test('AbsStep with Float32Array', async(t) => {
	const inputSignal = new Signal(f32(-5, 5, -5.0));

	const step = mockStep(AbsStep, [inputSignal]);
	const result = await step.process();
	const abs = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(abs), [5, 5, 5]);
});

test('AbsStep with multiple Float32Arrays', async(t) => {
	const inputSignal1 = new Signal(f32(-3, 5, -9.0));
	const inputSignal2 = new Signal([f32(-1, 2, -3.0), f32(-6)]);

	const step = mockStep(AbsStep, [inputSignal1, inputSignal2]);
	const result = await step.process();
	const abs = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(abs), [3, 5, 9]);
});

test('AbsStep with empty array', async(t) => {
	const inputSignal = new Signal(new Float32Array(0));

	const step = mockStep(AbsStep, [inputSignal]);
	const result = await step.process();

	t.is(result.getFloat32ArrayValue().length, 0);
});