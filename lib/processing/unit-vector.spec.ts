import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { UnitVectorStep } from './unit-vector';

const s1 = new Signal(f32(1, 2, 3));
const vs1 = new Signal(new VectorSequence(f32(1, 1, 0), f32(1, 1, 0), f32(2, 1, 0.5)));
const vs2 = new Signal(new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)));
const vs1unit = new VectorSequence(f32(0.40824830532073975, 0.5773502588272095, 0), f32(0.40824830532073975, 0.5773502588272095, 0), f32(0.8164966106414795, 0.5773502588272095, 1));

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 1, 0), f32(1, 1, 0), f32(2, 1, 0.5)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment1unit = new VectorSequence(f32(0.40824830532073975, 0.5773502588272095, 0), f32(0.40824830532073975, 0.5773502588272095, 0), f32(0.8164966106414795, 0.5773502588272095, 1));

test('UnitVectorStep - Input errors', async (t) => {
	const step1 = mockStep(UnitVectorStep);
	await t.throwsAsync(step1.process());

	const step2 = mockStep(UnitVectorStep, [vs1, vs2]);
	await t.throwsAsync(step2.process());

	const step3 = mockStep(UnitVectorStep, [s1]);
	await t.throwsAsync(step3.process());
});

test('UnitvectorStep - VectorSequence', async (t) => {
	const step = mockStep(UnitVectorStep, [vs1]);
	const res = await step.process();
	t.deepEqual(res.getValue(), vs1unit);
});

test('UnitvectorStep - Segment', async (t) => {
	const step = mockStep(UnitVectorStep, [segment1]);
	const res = await step.process();
	t.deepEqual(res.getValue(), segment1unit);
});