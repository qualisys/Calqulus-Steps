import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { BaseStep } from './base-step';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));
const sNum1 = new Signal(f32(5));
const seg1 = new Segment('test 1', new VectorSequence(f32(1, 2), f32(1, 2), f32(1, 2)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2)));
const segment1 = new Signal(seg1);
const num1 = new Signal(5);


test('BaseStep - constructor', async(t) => {
	const step = mockStep(BaseStep, [s1, s2]);
	t.deepEqual(step.inputs, [s1, s2]);
	t.is(step.name, 'BaseStep');
});

test('BaseStep - getPropertySignalValue - input series', async(t) => {
	const step = mockStep(BaseStep, [], { test: [s1] });
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Number));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Boolean));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Duration));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Map));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.String));
	t.throws(() => step.getPropertySignalValue('test', [
		PropertyType.Number,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.String,
	]));

	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Array), [s1]);
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Any), [s1]);
	t.deepEqual(step.getPropertySignalValue('test', [
		PropertyType.Number,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.Array,
		PropertyType.String,
	]), [s1]);
});

test('BaseStep - getPropertySignalValue - input segment', async(t) => {
	const step = mockStep(BaseStep, [], { test: [segment1] });
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Number));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Boolean));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Duration));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Map));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.String));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Array));
	t.throws(() => step.getPropertySignalValue('test', [
		PropertyType.Number,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.String,
		PropertyType.Array,
	]));

	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Any), [segment1]);
});

test('BaseStep - getPropertySignalValue - input number', async(t) => {
	const step = mockStep(BaseStep, [], { test: [num1] });
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Array));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Boolean));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Duration));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Map));
	t.throws(() => step.getPropertySignalValue('test', PropertyType.String));
	t.throws(() => step.getPropertySignalValue('test', [
		PropertyType.Array,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.String,
	]));

	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Number), [num1]);
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Any), [num1]);
	t.deepEqual(step.getPropertySignalValue('test', [
		PropertyType.Number,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.Array,
		PropertyType.String,
	]), [num1]);
});

test('BaseStep - getPropertySignalValue - input series of length 1, expected number', async(t) => {
	const step = mockStep(BaseStep, [], { test: [sNum1] });

	// Only if we specifically ask for a number do we get it, otherwise we'll get an array.
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Number).map(s => s.getValue()), [5]);
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Array), [sNum1]);
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Any), [sNum1]);
	t.deepEqual(step.getPropertySignalValue('test', [
		PropertyType.Number,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.Array,
		PropertyType.String,
	]), [sNum1]);
});

test('BaseStep - getPropertySignalValue - input series of length > 1, expected number', async(t) => {
	const step = mockStep(BaseStep, [], { test: [s1] });

	// Only if we specifically ask for a number do we get it, otherwise we'll get an array.
	t.throws(() => step.getPropertySignalValue('test', PropertyType.Number));
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Array), [s1]);
	t.deepEqual(step.getPropertySignalValue('test', PropertyType.Any), [s1]);
	t.deepEqual(step.getPropertySignalValue('test', [
		PropertyType.Number,
		PropertyType.Boolean,
		PropertyType.Duration,
		PropertyType.Map,
		PropertyType.Array,
		PropertyType.String,
	]), [s1]);
});

test('BaseStep - getPropertyValue - from signal', async(t) => {
	t.is(mockStep(BaseStep, [], { test: [num1] }).getPropertyValue('test', PropertyType.Number), 5);
	t.deepEqual(mockStep(BaseStep, [], { test: [s1] }).getPropertyValue('test', PropertyType.Array), [f32(1, 2, 3)]);
	t.deepEqual(mockStep(BaseStep, [], { test: [s1] }).getPropertyValue('test', PropertyType.Any), f32(1, 2, 3));
	t.deepEqual(mockStep(BaseStep, [], { test: [num1] }).getPropertyValue('test', PropertyType.Any), 5);
	t.deepEqual(mockStep(BaseStep, [], { test: [segment1] }).getPropertyValue('test', PropertyType.Any), seg1);
	t.is(mockStep(BaseStep, [], { test: [sNum1] }).getPropertyValue('test', PropertyType.Number), 5);
	t.deepEqual(mockStep(BaseStep, [], { test: [sNum1] }).getPropertyValue('test', PropertyType.Array), [f32(5)]);

	t.is(mockStep(BaseStep, [], { test: [s1] }).getPropertyValue('test', PropertyType.Number), undefined);
	t.is(mockStep(BaseStep, [], { test: [num1] }).getPropertyValue('test', PropertyType.Array), undefined);
});

test('BaseStep - getPropertyValue - from property value', async(t) => {
	t.is(mockStep(BaseStep, [], { test: 5 }).getPropertyValue('test', PropertyType.Number), 5);
	t.deepEqual(mockStep(BaseStep, [], { test: [1, 2 ,3] }).getPropertyValue('test', PropertyType.Array), [f32(1, 2, 3)]);
	t.deepEqual(mockStep(BaseStep, [], { test: [1, 2 ,3] }).getPropertyValue('test', PropertyType.Any), f32(1, 2, 3));
	t.deepEqual(mockStep(BaseStep, [], { test: 5 }).getPropertyValue('test', PropertyType.Any), 5);
	t.deepEqual(mockStep(BaseStep, [], { test: [5] }).getPropertyValue('test', PropertyType.Array), [f32(5)]);
	t.is(mockStep(BaseStep, [], { test: [5] }).getPropertyValue('test', PropertyType.Number), 5);
});
