import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { PlaneSequence } from '../models/sequence/plane-sequence';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';

import { ProjectStep } from './project';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(5, 5, 5), f32(-6, -6, -6), f32(3, 3, 3)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));
const segment2 = new Signal(new Segment('test 2', new VectorSequence(f32(2, 3, 4), f32(2, 2, 3), f32(4, 5, 6)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));

const vs = new Signal(new VectorSequence(
	f32(5, 5, 5, 5, 5),
	f32(-6, -6, -6, -6, -6),
	f32(3, 3, 3, 3, 3),
));

const ps = new Signal(new PlaneSequence(
	f32(3, 3, 3, 3, 3),
	f32(-2, -2, -2, -2, -2),
	f32(1, 1, 1, 1, 1),
	f32(-2, -2, -2, -2, -2),
));

test('ProjectStep - Input errors', async(t) => {
	// No input
	const step1 = mockStep(ProjectStep);
	await t.throwsAsync(step1.process());

	// One input of wrong type
	const step2 = mockStep(ProjectStep, [s1]);
	await t.throwsAsync(step2.process());

	// Two inputs of wrong type
	const step3 = mockStep(ProjectStep, [s1, s2]);
	await t.throwsAsync(step3.process());

	// One segment input
	const step4 = mockStep(ProjectStep, [segment1]);
	await t.throwsAsync(step4.process());

	// Two segment inputs
	const step5 = mockStep(ProjectStep, [segment1, segment2]);
	await t.throwsAsync(step5.process());

	// One vector sequence input
	const step6 = mockStep(ProjectStep, [vs]);
	await t.throwsAsync(step6.process());

	// Two vector sequence inputs
	const step7 = mockStep(ProjectStep, [vs, vs]);
	await t.throwsAsync(step7.process());

	// Two positional inputs
	const step8 = mockStep(ProjectStep, [vs, segment2]);
	await t.throwsAsync(step8.process());

	// One plane input
	const step9 = mockStep(ProjectStep, [ps]);
	await t.throwsAsync(step9.process());

	// Two plane inputs
	const step10 = mockStep(ProjectStep, [ps]);
	await t.throwsAsync(step10.process());
});

test('DistanceStep - VectorSequence and Plane', async(t) => {
	const step = mockStep(ProjectStep, [vs, ps]);

	const res = await step.process();
	t.assert(res);
	t.is(res.type, SignalType.VectorSequence);
	t.like(res.getVectorSequenceValue().getVectorAtFrame(1), { x: -1, y: -2, z: 1 });
});


test('DistanceStep - Segment and Plane', async(t) => {
	const step = mockStep(ProjectStep, [segment1, ps]);

	const res = await step.process();
	t.assert(res);
	t.is(res.type, SignalType.Segment);
	t.like(res.getSegmentValue().position.getVectorAtFrame(1), { x: -1, y: -2, z: 1 });
});
