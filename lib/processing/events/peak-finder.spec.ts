import test from 'ava';

import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { PeakFinderStep } from './peak-finder';

const comp = f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
const comp2 = f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0);
const vs = new VectorSequence(comp, comp, comp);
const s1 = new Signal(comp2);
const s2 = new Signal(vs);

/** 
 * The following tests verify the *input handling*. The peak finding algorithm 
 * is tested in lib/utils/math/peak-finder.spec.ts
 */

test('PeakFinderStep - Wrong input signals', async(t) => {
	await t.throwsAsync(mockStep(PeakFinderStep).process()); // No inputs
	await t.throwsAsync(mockStep(PeakFinderStep, [s2]).process()); // Wrong input type
});

test('PeakFinderStep - Options - height', async(t) => {
	t.like(mockStep(PeakFinderStep, [], { height: 10 }).height, { min: 10, max: undefined });
	t.like(mockStep(PeakFinderStep, [], { height: [10, 20] }).height, { min: 10, max: 20 });
	t.like(mockStep(PeakFinderStep, [], { height: [10] }).height, { min: 10, max: undefined });
});

test('PeakFinderStep - Options - width', async(t) => {
	t.like(mockStep(PeakFinderStep, [], { width: 10 }).width, { min: 10, max: undefined });
	t.like(mockStep(PeakFinderStep, [], { width: [10, 20] }).width, { min: 10, max: 20 });
});

test('PeakFinderStep - Options - prominence', async(t) => {
	t.like(mockStep(PeakFinderStep, [], { prominence: 10 }).prominence, { min: 10, max: undefined });
	t.like(mockStep(PeakFinderStep, [], { prominence: [10, 20] }).prominence, { min: 10, max: 20 });
});

test('PeakFinderStep - Options - distance', async(t) => {
	t.is(mockStep(PeakFinderStep, [], { distance: 10 }).distance, 10);
});

test('PeakFinderStep - Options - relHeight', async(t) => {
	t.is(mockStep(PeakFinderStep, [], { relHeight: 10 }).relHeight, 10);
});

test('PeakFinderStep - Options - window', async(t) => {
	t.is(mockStep(PeakFinderStep, [], { window: 10 }).window, 10);
});

test('PeakFinderStep - Options - sequence', async(t) => {
	t.like(mockStep(PeakFinderStep, [], {
		sequence: {
			sequence: 'L 50 H',
			pattern: 'LLH',
			keep: [1, 2],
		}
	}).sequence, {
		sequence: 'L 50 H',
		pattern: 'LLH',
		keep: [1, 2],
	});
});

test('PeakFinderStep - simple test', async(t) => {
	const res = await mockStep(PeakFinderStep, [s1]).process();
	t.deepEqual(res.getValue(), i32(9));
});
