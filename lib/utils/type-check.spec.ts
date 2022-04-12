import test from 'ava';

import { TypeCheck } from './type-check';

test('TypeCheck.isArray', t => {
	t.is(TypeCheck.isArray([]), true);
	t.is(TypeCheck.isArray([1, 2, 3]), true);
	t.is(TypeCheck.isArray('test'), false);
	t.is(TypeCheck.isArray(1), false);
});

test('TypeCheck.isTypedArray', t => {
	t.is(TypeCheck.isTypedArray([]), false);
	t.is(TypeCheck.isTypedArray([1, 2, 3]), false);
	t.is(TypeCheck.isTypedArray('test'), false);
	t.is(TypeCheck.isTypedArray(1), false);
	t.is(TypeCheck.isTypedArray(Int32Array.from([1, 2, 3])), true);
});

test('TypeCheck.isArrayLike', t => {
	t.is(TypeCheck.isArrayLike([]), true);
	t.is(TypeCheck.isArrayLike([1, 2, 3]), true);
	t.is(TypeCheck.isArrayLike(Int32Array.from([1, 2, 3])), true);
	t.is(TypeCheck.isArrayLike('test'), false);
	t.is(TypeCheck.isArrayLike(1), false);
});