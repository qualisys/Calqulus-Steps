import test from 'ava';

import { f32 } from '../../../test-utils/mock-step';

import { Arithmetic, ArithmeticOp } from './arithmetic';

test('Arithmetic - Single values', (t) => {
	// Test all operations
	t.is(Arithmetic.applyOp(1, 2, ArithmeticOp.Add), 3);
	t.is(Arithmetic.applyOp(1, 2, ArithmeticOp.Subtract), -1);
	t.is(Arithmetic.applyOp(1, 2, ArithmeticOp.Divide), 0.5);
	t.is(Arithmetic.applyOp(1, 2, ArithmeticOp.Multiply), 2);

	// Invert argument order
	t.is(Arithmetic.applyOp(2, 1, ArithmeticOp.Add), 3);
	t.is(Arithmetic.applyOp(2, 1, ArithmeticOp.Subtract), 1);
	t.is(Arithmetic.applyOp(2, 1, ArithmeticOp.Divide), 2);
	t.is(Arithmetic.applyOp(2, 1, ArithmeticOp.Multiply), 2);
});

test('Arithmetic - Single value and array', (t) => {
	// Test first or second argument as array
	t.deepEqual(Arithmetic.applyOp(2, f32(1, 2, 3), ArithmeticOp.Add), f32(3, 4, 5));
	t.deepEqual(Arithmetic.applyOp(f32(1, 2, 3), 2, ArithmeticOp.Add), f32(3, 4, 5));
});

test('Arithmetic - Single value and array of length 1', (t) => {
	// An array of length 1 should be treated the same way as a single number
	// unless the first operand is an array.
	t.deepEqual(Arithmetic.applyOp(2, f32(3), ArithmeticOp.Add), 5);
	t.deepEqual(Arithmetic.applyOp(f32(3), 2, ArithmeticOp.Add), f32(5));
	t.deepEqual(Arithmetic.applyOp(f32(3), f32(2), ArithmeticOp.Add), f32(5));
});

test('Arithmetic - Array and array of length 1', (t) => {
	// An array of length 1 should be treated the same way as a single number
	t.deepEqual(Arithmetic.applyOp(f32(1, 2, 3), f32(3), ArithmeticOp.Add), f32(4, 5, 6));
	t.deepEqual(Arithmetic.applyOp(f32(3), f32(1, 2, 3), ArithmeticOp.Add), f32(4, 5, 6));
});

test('Arithmetic - Two same-length arrays', (t) => {
	t.deepEqual(Arithmetic.applyOp(f32(1, 2, 3), f32(4, 5, 6), ArithmeticOp.Add), f32(5, 7, 9));
	t.deepEqual(Arithmetic.applyOp(f32(4, 5, 6), f32(1, 2, 3), ArithmeticOp.Add), f32(5, 7, 9));
});

test('Arithmetic - Two different-length arrays', (t) => {
	t.deepEqual(Arithmetic.applyOp(f32(2, 3), f32(4, 5, 6), ArithmeticOp.Add), f32(6, 8));
	t.deepEqual(Arithmetic.applyOp(f32(4, 5, 6), f32(2, 3), ArithmeticOp.Add), f32(6, 8, NaN));
});

test('Arithmetic - Single value and multi-dimensional array', (t) => {
	// Test first or second argument as array of arrays
	t.deepEqual(Arithmetic.applyOp(2, [f32(1, 2, 3), f32(4, 5, 6)], ArithmeticOp.Add), [f32(3, 4, 5), f32(6, 7, 8)]);
	t.deepEqual(Arithmetic.applyOp([f32(1, 2, 3), f32(4, 5, 6)], 2, ArithmeticOp.Add), [f32(3, 4, 5), f32(6, 7, 8)]);
});

test('Arithmetic - Two same-length multi-dimensional arrays', (t) => {
	t.deepEqual(Arithmetic.applyOp([f32(0, 1, 2), f32(3, 4, 5)], [f32(1, 2, 3), f32(4, 5, 6)], ArithmeticOp.Add), [f32(1, 3, 5), f32(7, 9, 11)]);
	t.deepEqual(Arithmetic.applyOp([f32(1, 2, 3), f32(4, 5, 6)], [f32(0, 1, 2), f32(3, 4, 5)], ArithmeticOp.Add), [f32(1, 3, 5), f32(7, 9, 11)]);
});

test('Arithmetic - Two different-length multi-dimensional arrays', (t) => {
	t.deepEqual(Arithmetic.applyOp([f32(0, 1, 2), f32(3, 4, 5)], [f32(4, 5, 6)], ArithmeticOp.Add), [f32(4, 6, 8), f32(7, 9, 11)]);
	t.deepEqual(Arithmetic.applyOp([f32(4, 5, 6)], [f32(0, 1, 2), f32(3, 4, 5)], ArithmeticOp.Add), [f32(4, 6, 8), f32(7, 9, 11)]);
});

test('Arithmetic - Two different value-length multi-dimensional arrays', (t) => {
	t.deepEqual(Arithmetic.applyOp([f32(0, 1, 2), f32(3, 4, 5)], [f32(4, 5, 6, 7)], ArithmeticOp.Add), [f32(4, 6, 8), f32(7, 9, 11)]);
	t.deepEqual(Arithmetic.applyOp([f32(4, 5, 6, 7)], [f32(0, 1, 2), f32(3, 4, 5)], ArithmeticOp.Add), [f32(4, 6, 8, NaN), f32(7, 9, 11, NaN)]);
});

test('Arithmetic - Array and multi-dimensional array', (t) => {
	t.deepEqual(Arithmetic.applyOp([f32(0, 1, 2), f32(3, 4, 5)], f32(4, 5), ArithmeticOp.Add), [f32(4, 5, 6), f32(8, 9, 10)]);
	t.deepEqual(Arithmetic.applyOp(f32(4, 5), [f32(0, 1, 2), f32(3, 4, 5)], ArithmeticOp.Add), [f32(4, 5, 6), f32(8, 9, 10)]);
});

test('Arithmetic - Array and multi-dimensional array with mis-matching length in array', (t) => {
	t.deepEqual(Arithmetic.applyOp([f32(0, 1, 2), f32(3, 4, 5)], f32(4, 5, 6), ArithmeticOp.Add), [f32(4, 5, 6), f32(8, 9, 10)]);
	t.deepEqual(Arithmetic.applyOp(f32(4, 5, 6), [f32(0, 1, 2), f32(3, 4, 5)], ArithmeticOp.Add), [f32(4, 5, 6), f32(8, 9, 10), NaN]);
});

test('Arithmetic - Array and multi-dimensional array with mis-matching number of dimensions', (t) => {
	t.deepEqual(Arithmetic.applyOp([f32(0, 1, 2), f32(3, 4, 5), f32(6, 7, 8)], f32(4, 5), ArithmeticOp.Add), [f32(4, 5, 6), f32(8, 9, 10), f32(NaN, NaN, NaN)]);
	t.deepEqual(Arithmetic.applyOp(f32(4, 5), [f32(0, 1, 2), f32(3, 4, 5), f32(6, 7, 8)], ArithmeticOp.Add), [f32(4, 5, 6), f32(8, 9, 10)]);
});

test('Arithmetic - Return types', (t) => {
	t.true(typeof Arithmetic.applyOp(1, 2, ArithmeticOp.Add) === 'number');
	t.true(Arithmetic.applyOp(f32(1, 2, 3), 2, ArithmeticOp.Add) instanceof Float32Array);
	t.true(Arithmetic.applyOp(2, f32(1, 2, 3), ArithmeticOp.Add) instanceof Float32Array);
	t.true(Arithmetic.applyOp(f32(1, 2, 3), f32(1, 2, 3), ArithmeticOp.Add) instanceof Float32Array);
	t.true(Array.isArray(Arithmetic.applyOp([f32(1, 2, 3), f32(1, 2, 3)], 2, ArithmeticOp.Add)));
	t.true(Array.isArray(Arithmetic.applyOp(2, [f32(1, 2, 3), f32(1, 2, 3)], ArithmeticOp.Add)));
	t.true(Array.isArray(Arithmetic.applyOp([f32(1, 2, 3), f32(1, 2, 3)], [f32(1, 2, 3), f32(1, 2, 3)], ArithmeticOp.Add)));
	t.true(Array.isArray(Arithmetic.applyOp([f32(1, 2, 3), f32(1, 2, 3)], [f32(1, 2, 3), f32(1, 2, 3)], ArithmeticOp.Add)));
	t.true(Array.isArray(Arithmetic.applyOp(f32(1, 2, 3), [f32(1, 2, 3), f32(1, 2, 3)], ArithmeticOp.Add)));
	t.true(Array.isArray(Arithmetic.applyOp([f32(1, 2, 3), f32(1, 2, 3)], f32(1, 2, 3), ArithmeticOp.Add)));

	// Integer arrays should be returned as Float32Array
	t.true(Arithmetic.applyOp(Int32Array.from([1, 2, 3]), 2, ArithmeticOp.Add) instanceof Float32Array);
	t.true(Arithmetic.applyOp(Uint32Array.from([1, 2, 3]), 2, ArithmeticOp.Add) instanceof Float32Array);
	t.true(Arithmetic.applyOp(Float32Array.from([1, 2, 3]), Uint32Array.from([1, 2, 3]), ArithmeticOp.Add) instanceof Float32Array);
	t.true(Arithmetic.applyOp(3, Uint32Array.from([1, 2, 3]), ArithmeticOp.Add) instanceof Float32Array);
});