import test from 'ava';

import { f32, mockStep } from '../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';
import { Units } from '../models/unit';

import { DistanceStep, MagnitudeStep } from './distance';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment2 = new Signal(new Segment('test 2', new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment3 = new Signal(new Segment('test 3', new VectorSequence(f32(2, 3), f32(2, 2), f32(4, 5)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2))));

const vs1 = new Signal(new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)));
const vs2 = new Signal(new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)));
const vs3 = new Signal(new VectorSequence(f32(1), f32(1), f32(2)));

test('DistanceStep - Input errors', async (t) => {
	const step1 = mockStep(DistanceStep);
	await t.throwsAsync(step1.process());

	const step2 = mockStep(DistanceStep, [s1]);
	await t.throwsAsync(step2.process());

	const step3 = mockStep(DistanceStep, [s1, s2]);
	await t.throwsAsync(step3.process());
});

test('DistanceStep - Segment and Segment', async (t) => {
	const step = mockStep(DistanceStep, [segment1, segment2]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1, 2.4494898319244385));
});

test('DistanceStep - VectorSequence and VectorSequence', async (t) => {
	const step = mockStep(DistanceStep, [vs1, vs2]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1, 2.4494898319244385));
});

test('DistanceStep - Segment and VectorSequence', async (t) => {
	const step = mockStep(DistanceStep, [segment1, vs2]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1, 2.4494898319244385));
});

test('DistanceStep - Segment and short Segment', async (t) => {
	const step = mockStep(DistanceStep, [segment1, segment3]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.2360680103302, 1));
});

test('MagnitudeStep - Input errors', async (t) => {
	t.throws(() => mockStep(MagnitudeStep));

	t.throws(() => mockStep(MagnitudeStep, [vs1, vs2]));

	const step3 = mockStep(MagnitudeStep, [s1]);
	await t.throwsAsync(step3.process());
});

test('MagnitudeStep - VectorSequence', async (t) => {
	const step = mockStep(MagnitudeStep, [vs3]);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(2.4494897427832));
});

test('DistanceStep - unit propagation (matching units propagate)', async (t) => {
	const a = new Signal(new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)));
	const b = new Signal(new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)));

	a.unit = Units.fromName('mm');
	b.unit = Units.fromName('mm');

	const res = await mockStep(DistanceStep, [a, b]).process();

	t.is(res.unit?.name, 'mm');
});

test('DistanceStep - unit propagation (mismatched units yield undefined)', async (t) => {
	const a = new Signal(new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)));
	const b = new Signal(new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)));

	a.unit = Units.fromName('mm');
	b.unit = Units.fromName('N');

	const res = await mockStep(DistanceStep, [a, b]).process();

	t.is(res.unit, undefined);
});

test('MagnitudeStep - unit propagation (preserves input unit)', async (t) => {
	const v = new Signal(new VectorSequence(f32(1), f32(1), f32(2)));
	v.unit = Units.fromName('N');

	const res = await mockStep(MagnitudeStep, [v]).process();

	t.is(res.unit?.name, 'N');
});