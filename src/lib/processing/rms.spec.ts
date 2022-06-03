import test from 'ava';

import { f32, i32, mockStep } from '../../test-utils/mock-step';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { RmsStep } from './rms';

// Signals
const s1 = new Signal(f32(1, 2, 3));

const vs1 = new Signal(new VectorSequence(f32(3, 7), f32(1, 4), f32(5, 8)));
const vs2 = new Signal(new VectorSequence(f32(1, 5), f32(3, 2), f32(3, 6)));

// Event simulated signals
const s3Cycles = new Signal(f32(1, 2, 3, 4, 5, 6, 7, 8, 9));
s3Cycles.cycles = [{ start: 1, end: 3 }, { start: 6, end: 8 }]; 

const s4Cycles = new Signal(f32(3, 4, 5, 2, 3, 4, 5, 6, 7));
s4Cycles.cycles = [{ start: 1, end: 3 }, { start: 6, end: 8 }];

const s5Cycles = new Signal(f32(6, 3, 4, 4, 6, 1, 1, 5, 2));
s5Cycles.cycles = [{ start: 1, end: 3 }];

const s5Cycles2 = new Signal(i32(6, 3, 4, 4, 6, 1, 1, 5, 2));
s5Cycles2.cycles = [{ start: 1, end: 3 }];

test('RmsStep - Input errors ', async(t) => {
	// Only one input.
	const step1 = mockStep(RmsStep, [s1]);
	await t.throwsAsync(step1.process());

	// Different length signals (ignore cycles).
	const step2 = mockStep(RmsStep, [s1, s4Cycles], { useCycles: false });
	await t.throwsAsync(step2.process());

	// Different amount of cycles.
	const step3 = mockStep(RmsStep, [s3Cycles, s5Cycles]);
	await t.throwsAsync(step3.process());

	// Different types.
	const step4 = mockStep(RmsStep, [s5Cycles, s5Cycles2]);
	await t.throwsAsync(step4.process());
});

test('RmsStep - RMS with cycles ', async(t) => {
	const step = mockStep(RmsStep, [s3Cycles, s4Cycles]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(2, 2));
});

test('RmsStep - RMS without cycles ', async(t) => {
	const step = mockStep(RmsStep, [s3Cycles, s4Cycles], { useCycles: false });

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2));
});

test('RmsStep - RMS using vectors', async(t) => {
	const step = mockStep(RmsStep, [vs1, vs2]);
	const res = await step.process();

	t.deepEqual(res.components, vs1.components);

	for (const component of res.components) {
		t.deepEqual(res.getComponent(component), f32(2));
	}
});
