import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { DiffStep } from './diff';

const a1 = f32(1, 2, 3, 1, 7);
const s1 = new Signal(a1);

// The calculation is mainly tested by the Kinematics utility.
test('DiffStep', async(t) => {
	const step = mockStep(DiffStep, [s1]);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1, 1, -2, 6));
});
