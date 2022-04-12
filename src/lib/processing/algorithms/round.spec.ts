import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { RoundStep } from './round';

const veryNear = (valueA, valueB) => valueA - valueB < 0.00001;

test('RoundStep - no precision', async (t) => {
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123)]).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)]).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.56789)]).process()).getValue(), 124));
	t.deepEqual((await mockStep(RoundStep, [new Signal(f32(123.4567, 1234.5678, 12345.6789))]).process()).getValue(), f32(123, 1235, 12346));
});

test('RoundStep - precision 0', async (t) => {
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123)], { precision: 0 }).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)], { precision: 0 }).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.56789)], { precision: 0 }).process()).getValue(), 124));
	t.deepEqual((await mockStep(RoundStep, [new Signal(f32(123.4567, 1234.5678, 12345.6789))], { precision: 0 }).process()).getValue(), f32(123, 1235, 12346));
});

test('RoundStep - precision 1', async (t) => {
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123)], { precision: 1 }).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)], { precision: 1 }).process()).getValue(), 123.5));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.56789)], { precision: 1 }).process()).getNumberValue(), 123.6));
	t.deepEqual((await mockStep(RoundStep, [new Signal(f32(123.4567, 1234.5678, 12345.6789))], { precision: 1 }).process()).getValue(), f32(123.5, 1234.6, 12345.7));
});

test('RoundStep - precision 2', async (t) => {
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123)], { precision: 2 }).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)], { precision: 2 }).process()).getValue(), 123.46));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.56789)], { precision: 2 }).process()).getNumberValue(), 123.57));
	t.deepEqual((await mockStep(RoundStep, [new Signal(f32(123.4567, 1234.5678, 12345.6789))], { precision: 2 }).process()).getValue(), f32(123.46, 1234.57, 12345.68));
});

test('RoundStep - negative precision', async (t) => {
	// Should be treated as precision: 0
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123)], { precision: -1 }).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)], { precision: -2 }).process()).getValue(), 123));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.56789)], { precision: -3 }).process()).getValue(), 124));
	t.deepEqual((await mockStep(RoundStep, [new Signal(f32(123.4567, 1234.5678, 12345.6789))], { precision: -4 }).process()).getValue(), f32(123, 1235, 12346));
});

test('RoundStep - fractional precision', async (t) => {
	// Precision uses the floor of the input value
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)], { precision: 1.3 }).process()).getValue(), 123.5));
	t.assert(veryNear((await mockStep(RoundStep, [new Signal(123.456789)], { precision: 2.8 }).process()).getValue(), 123.46));
});
