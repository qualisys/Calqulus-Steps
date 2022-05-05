import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { DotProductStep } from './dot-product';

// input signals
const vs1 = new Signal(new VectorSequence(f32(1, 1), f32(2, 2), f32(3, 3)));
const vs2 = new Signal(new VectorSequence(f32(1, 2), f32(3, 4), f32(5, 6)));
const vs3 = new Signal(new VectorSequence(f32(1), f32(2), f32(3)));
const vs4 = new Signal(new VectorSequence(f32(1,1,1), f32(2,2,2), f32(3,3,3)));
const vs5 = new Signal(new VectorSequence(f32(1), f32(2), f32(3)));
const s = new Signal([1,2,3])


test('dotProductStep - Input errors ', async (t) => {
	// No input
	const step1 = mockStep(DotProductStep, []);
	await t.throwsAsync(step1.process());

	// Inputs not all vectors
	const step2 = mockStep(DotProductStep, [vs1, s]);
	await t.throwsAsync(step2.process());

	// Length of second input argument is larger than the first (n vs m>n)
	const step3 = mockStep(DotProductStep, [vs3, vs1]);
	await  t.throwsAsync(step3.process());

	// Length of second input argument is larger than the first (n>1 vs m>1 AND n!=m)
	const step4 = mockStep(DotProductStep, [vs4, vs1]);
	await  t.throwsAsync(step4.process());
})

test('dotProductStep - length 1 vs length 1', async (t) => {
	const step = mockStep(DotProductStep, [vs3, vs5]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(14));
})
test('dotProductStep - length n vs length n', async (t) => {
	const step = mockStep(DotProductStep, [vs1, vs2]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(22,28));
})
test('dotProductStep - length n vs length 1', async (t) => {
	const step = mockStep(DotProductStep, [vs1, vs3]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(14,14));
})
