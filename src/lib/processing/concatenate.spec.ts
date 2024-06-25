import test from 'ava';

import { ArrayTestUtil } from '../../test-utils/array-utils';
import { f32, i32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { ConcatenateStep } from './concatenate';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));
const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2), f32(1, 2), f32(1, 2)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2))));
const segment2 = new Signal(new Segment('test 2', new VectorSequence(f32(3, 4), f32(3, 4), f32(3, 4)), new QuaternionSequence(f32(3, 4), f32(3, 4), f32(3, 4), f32(3, 4))));

test('ConcatenateStep - Invalid inputs', async(t) => {
	await t.throwsAsync(mockStep(ConcatenateStep).process());
	await t.throwsAsync(mockStep(ConcatenateStep, [s1]).process());
	await t.throwsAsync(mockStep(ConcatenateStep, [s1, segment1]).process());
});

test('ConcatenateStep - 1D array', async(t) => {
	const step = mockStep(ConcatenateStep, [s1, s2]);

	t.is(step.name, 'ConcatenateStep');

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - 1D array x 6', async(t) => {
	const step = mockStep(ConcatenateStep, [s1, s2, s1, s2, s1, s2]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - Scalar inputs', async(t) => {
	const step = mockStep(ConcatenateStep, [
		new Signal(1),
		new Signal(2),
		new Signal(3),
		new Signal(4),
		new Signal(5),
		new Signal(6),
	]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - Mixed scalar and array inputs', async(t) => {
	const res1 = await mockStep(ConcatenateStep, [
		s1,
		new Signal(4),
		new Signal(5),
		s2,
		new Signal(6),
	]).process();

	t.deepEqual(res1.getValue(), f32(1, 2, 3, 4, 5, 4, 5, 6, 6));

	const res2 = await mockStep(ConcatenateStep, [
		new Signal(4),
		new Signal(5),
		s1,
		new Signal(6),
		s2,
	]).process();

	t.deepEqual(res2.getValue(), f32(4, 5, 1, 2, 3, 6, 4, 5, 6));
});

test('ConcatenateStep - Integer array inputs', async(t) => {
	// Two integer arrays
	const res1 = await mockStep(ConcatenateStep, [
		new Signal(i32(1, 2, 3)),
		new Signal(i32(4, 5, 6)),
	]).process();

	// Return integer array
	t.deepEqual(res1.getValue(), i32(1, 2, 3, 4, 5, 6));

	// One float array, one integer array
	const res2 = await mockStep(ConcatenateStep, [
		new Signal(f32(1, 2, 3)),
		new Signal(i32(4, 5, 6)),
	]).process();

	// Return float array
	t.deepEqual(res2.getValue(), f32(1, 2, 3, 4, 5, 6));

	// One integer array, one float array
	const res3 = await mockStep(ConcatenateStep, [
		new Signal(i32(1, 2, 3)),
		new Signal(f32(4, 5, 6)),
	]).process();

	// Return float array
	t.deepEqual(res3.getValue(), f32(1, 2, 3, 4, 5, 6));

	// One integer array, some numbers
	const res4 = await mockStep(ConcatenateStep, [
		new Signal(i32(1, 2, 3)),
		new Signal(4),
		new Signal(5),
		new Signal(6),
	]).process();

	// Return float array
	t.deepEqual(res4.getValue(), f32(1, 2, 3, 4, 5, 6));

	// Some numbers, one integer array
	const res5 = await mockStep(ConcatenateStep, [
		new Signal(1),
		new Signal(2),
		new Signal(3),
		new Signal(i32(4, 5, 6)),
	]).process();

	// Return float array
	t.deepEqual(res5.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - Multi-components (Segment)', async(t) => {
	const step = mockStep(ConcatenateStep, [segment1, segment2]);
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (let i = 0; i < res.components.length; i++) {
		if (i < 7) {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [1, 2, 3, 4]);
		}
		else {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [NaN, NaN, NaN, NaN]);
		}
	}
});

test('ConcatenateStep - 1D array (sort asc) A', async(t) => {
	const step = mockStep(ConcatenateStep, [s1, s2], { sort: 'asc' });
	const res = await step.process();
	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - 1D array (sort asc) B', async(t) => {
	const step = mockStep(ConcatenateStep, [s2, s1], { sort: 'asc' });
	const res = await step.process();
	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - 1D array (sort asc) C', async(t) => {
	const shuffled1 = new Signal(ArrayTestUtil.shuffle(f32(1, 2, 3)));
	const shuffled2 = new Signal(ArrayTestUtil.shuffle(f32(4, 5, 6)));
	
	const step = mockStep(ConcatenateStep, [shuffled1, shuffled2], { sort: 'asc' });
	const res = await step.process();
	t.deepEqual(res.getValue(), f32(1, 2, 3, 4, 5, 6));
});

test('ConcatenateStep - 1D array (sort desc) A', async(t) => {
	const step = mockStep(ConcatenateStep, [s1, s2], { sort: 'desc' });
	const res = await step.process();
	t.deepEqual(res.getValue(), f32(6, 5, 4, 3, 2, 1));
});

test('ConcatenateStep - 1D array (sort desc) B', async(t) => {
	const step = mockStep(ConcatenateStep, [s2, s1], { sort: 'desc' });
	const res = await step.process();
	t.deepEqual(res.getValue(), f32(6, 5, 4, 3, 2, 1));
});

test('ConcatenateStep - 1D array (sort desc) C', async(t) => {
	const shuffled1 = new Signal(ArrayTestUtil.shuffle(f32(1, 2, 3)));
	const shuffled2 = new Signal(ArrayTestUtil.shuffle(f32(4, 5, 6)));
	
	const step = mockStep(ConcatenateStep, [shuffled1, shuffled2], { sort: 'desc' });
	const res = await step.process();
	t.deepEqual(res.getValue(), f32(6, 5, 4, 3, 2, 1));
});

test('ConcatenateStep - Multi-components (Segment) (sort asc)', async(t) => {
	const step = mockStep(ConcatenateStep, [segment2, segment1], { sort: 'asc' });
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (let i = 0; i < res.components.length; i++) {
		if (i < 7) {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [1, 2, 3, 4]);
		}
		else {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [NaN, NaN, NaN, NaN]);
		}
	}
});

test('ConcatenateStep - Multi-components (Segment) (sort desc)', async(t) => {
	const step = mockStep(ConcatenateStep, [segment2, segment1], { sort: 'desc' });
	const res = await step.process();

	t.deepEqual(res.components, segment1.components);

	for (let i = 0; i < res.components.length; i++) {
		if (i < 7) {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [4, 3, 2, 1]);
		}
		else {
			t.deepEqual(Array.from(res.getComponent(res.components[i])), [NaN, NaN, NaN, NaN]);
		}
	}
});
