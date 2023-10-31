import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { QbrtStep, RootStep, SqrtStep } from './root';

const s1 = new Signal(f32(0, 1, 2, 3, 4), 200);

test('RootStep - handle index input', async(t) => {
	t.is(mockStep(RootStep, [s1]).index, 2); 
	t.is(mockStep(RootStep, [s1], { index: 2 }).index, 2); 
	t.is(mockStep(RootStep, [s1], { index: 3 }).index, 3); 
	t.is(mockStep(RootStep, [s1], { index: 0.5 }).index, 0.5); 
});

test('RootStep - series, default exponent', async(t) => {
	const step = mockStep(RootStep, [new Signal(f32(0, 1, 4, 9, 16), 200)]);
	const result = await step.process();
	const root = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(root), [0, 1, 2, 3, 4]);
});

test('RootStep - series, index 3', async(t) => {
	const step = mockStep(RootStep, [new Signal(f32(0, 1, 8, 27, 64), 200)], { index: 3 });
	const result = await step.process();
	const root = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(root), [0, 1, 2, 3, 4]);
});

test('RootStep - series, index 4', async(t) => {
	const step = mockStep(RootStep, [new Signal(f32(0, 1, 16, 81, 256), 200)], { index: 4 });
	const result = await step.process();
	const root = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(root), [0, 1, 2, 3, 4]);
});

test('RootStep - single value, default index', async(t) => {
	const step = mockStep(RootStep, [new Signal(9)]);
	const result = await step.process();
	const root = result.getNumberValue();

	t.deepEqual(root, 3);
});

test('RootStep - single value, index 3', async(t) => {
	const step = mockStep(RootStep, [new Signal(64)], { index: 3 });
	const result = await step.process();
	const root = result.getNumberValue();

	t.deepEqual(root, 4);
});

test('RootStep - single value, index 6', async(t) => {
	const step = mockStep(RootStep, [new Signal(64)], { index: 6 });
	const result = await step.process();
	const root = result.getNumberValue();

	t.deepEqual(root, 2);
});

// SqrtStep tests
test('SqrtStep - check index', async(t) => {
	t.is(mockStep(SqrtStep, [s1]).index, 2); 
	t.is(mockStep(SqrtStep, [s1], { index: 2 }).index, 2); 
	t.is(mockStep(SqrtStep, [s1], { index: 3 }).index, 2); 
	t.is(mockStep(SqrtStep, [s1], { index: 0.5 }).index, 2); 
});

test('SqrtStep - series', async(t) => {
	const step = mockStep(SqrtStep, [new Signal(f32(0, 1, 4, 9, 16), 200)]);
	const result = await step.process();
	const root = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(root), [0, 1, 2, 3, 4]);
});

test('SqrtStep - single value, default index', async(t) => {
	const step = mockStep(SqrtStep, [new Signal(9)]);
	const result = await step.process();
	const root = result.getNumberValue();

	t.deepEqual(root, 3);
});


// QbrtStep tests
test('QbrtStep - check index', async(t) => {
	t.is(mockStep(QbrtStep, [s1]).index, 3); 
	t.is(mockStep(QbrtStep, [s1], { index: 2 }).index, 3); 
	t.is(mockStep(QbrtStep, [s1], { index: 3 }).index, 3); 
	t.is(mockStep(QbrtStep, [s1], { index: 0.5 }).index, 3); 
});

test('QbrtStep - series', async(t) => {
	const step = mockStep(QbrtStep, [new Signal(f32(0, 1, 8, 27, 64), 200)]);
	const result = await step.process();
	const root = result.getFloat32ArrayValue();

	t.deepEqual(Array.from(root), [0, 1, 2, 3, 4]);
});

test('QbrtStep - single value, default index', async(t) => {
	const step = mockStep(QbrtStep, [new Signal(27)]);
	const result = await step.process();
	const root = result.getNumberValue();

	t.deepEqual(root, 3);
});