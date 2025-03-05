import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { DistanceStep, MagnitudeStep } from './distance';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment2 = new Signal(new Segment('test 2', new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment3 = new Signal(new Segment('test 3', new VectorSequence(f32(2, 3), f32(2, 2), f32(4, 5)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2))));

const vs1 = new Signal(new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)));
const vs2 = new Signal(new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)));
const vs3 = new Signal(new VectorSequence(f32(1), f32(1), f32(2)));

test('DistanceStep - Input errors', async(t) => {
	const step1 = mockStep(DistanceStep);
	await t.throwsAsync(step1.process());

	const step2 = mockStep(DistanceStep, [s1]);
	await t.throwsAsync(step2.process());

	const step3 = mockStep(DistanceStep, [s1, s2]);
	await t.throwsAsync(step3.process());
});

test('DistanceStep - Segment and Segment', async(t) => {
	const step = mockStep(DistanceStep, [segment1, segment2]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1, 2.4494898319244385));
});

test('DistanceStep - VectorSequence and VectorSequence', async(t) => {
	const step = mockStep(DistanceStep, [vs1, vs2]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1, 2.4494898319244385));
});

test('DistanceStep - Segment and VectorSequence', async(t) => {
	const step = mockStep(DistanceStep, [segment1, vs2]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1, 2.4494898319244385));
});

test('DistanceStep - Segment and short Segment', async(t) => {
	const step = mockStep(DistanceStep, [segment1, segment3]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1));
});

test('MagnitudeStep - Input errors', async(t) => {
	t.throws(() => mockStep(MagnitudeStep));

	t.throws(() => mockStep(MagnitudeStep, [vs1, vs2]));

	const step3 = mockStep(MagnitudeStep, [s1]);
	await t.throwsAsync(step3.process());
});

test('MagnitudeStep - VectorSequence', async(t) => {
	const step = mockStep(MagnitudeStep, [vs3]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.4494897427832));
});

test('DistanceStep - 1 input sequence', async(t) => {
	const testSignal1 = new Signal(new VectorSequence(f32(0,3,6), f32(0,4,8), f32(0,0,0)));
	const testSignal2 = new Signal(new VectorSequence(f32(1,2,3,4,5), f32(0,0,0,0,0), f32(0,0,0,0,0)));
	const step1 = mockStep(DistanceStep, [testSignal1]);
	const step2 = mockStep(DistanceStep, [testSignal2]);
	
	const res1 = await step1.process();
	const res2 = await step2.process();

	t.deepEqual(res1.getValue(), f32(5,5));
	t.deepEqual(res2.getValue(), f32(1,1,1,1));
});