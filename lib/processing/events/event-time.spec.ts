import test from 'ava';

import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { EventTimeStep } from './event-time';

const a1 = i32(1, 10, 100);
const frameRate = 300;
const s1 = new Signal(a1, frameRate);
const s2 = new Signal(a1); // No frameRate
const s3 = new Signal(new VectorSequence(a1, a1, a1)); // Wrong type
const s4 = new Signal(0.1); // Wrong type

test('EventTimeStep - Wrong input signals', async (t) => {
	const step1 = mockStep(EventTimeStep, [s2]);
	await t.throwsAsync(step1.process()); // No frameRate

	const step2 = mockStep(EventTimeStep, [s3]);
	await t.throwsAsync(step2.process()); // Wrong type

	const step3 = mockStep(EventTimeStep, [s4]);
	await t.throwsAsync(step3.process()); // Wrong type

	const step4 = mockStep(EventTimeStep);
	await t.throwsAsync(step4.process()); // No inputs
});

test('EventTimeStep', async (t) => {
	const step = mockStep(EventTimeStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1).map(f => f / frameRate))
});
