import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { PowStep } from './power';

const s1 = new Signal(f32(0, 1, 2, 3, 4), 200);

test('PowStep - handle exponent input', async(t) => {
	t.is(mockStep(PowStep, [s1]).exponent, 2); 
	t.is(mockStep(PowStep, [s1], { exponent: 2 }).exponent, 2); 
	t.is(mockStep(PowStep, [s1], { exponent: 3 }).exponent, 3); 
	t.is(mockStep(PowStep, [s1], { exponent: 0.5 }).exponent, 0.5); 
});

test('PowStep - series, default exponent', async(t) => {
	const step = mockStep(PowStep, [s1]);
	const result = await step.process();
	const pow = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(pow), [0, 1, 4, 9, 16]);
});

test('PowStep - series, exponent 3', async(t) => {
	const step = mockStep(PowStep, [s1], { exponent: 3 });
	const result = await step.process();
	const pow = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(pow), [0, 1, 8, 27, 64]);
});

test('PowStep - single value, default exponent', async(t) => {
	const step = mockStep(PowStep, [new Signal(3)]);
	const result = await step.process();
	const pow = result.getNumberValue();

	t.deepEqual(pow, 9);
});

test('PowStep - single value, exponent 4', async(t) => {
	const step = mockStep(PowStep, [new Signal(3)], { exponent: 4 });
	const result = await step.process();
	const pow = result.getNumberValue();

	t.deepEqual(pow, 81);
});