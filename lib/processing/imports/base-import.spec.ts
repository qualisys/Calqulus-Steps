import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Segment } from '../../models/segment';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { BaseImportStep } from './base-import';

const s1 = new Signal(f32(1, 2, 3));
const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));

test('BaseImportStep - Simple test', async (t) => {
	// Simply test that it returns the first signal input
	const step1 = mockStep(BaseImportStep, [segment1]);
	t.is((await step1.process()).getValue(), segment1.getValue());

	const step2 = mockStep(BaseImportStep, [segment1, s1]);
	t.is((await step2.process()).getValue(), segment1.getValue());
});
