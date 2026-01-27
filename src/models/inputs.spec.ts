import test from 'ava';

import { Inputs } from './inputs';
import { Signal } from './signal';

const oneTwoThree = Float32Array.from([1, 2, 3]);
const s1 = new Signal(oneTwoThree);

test('Inputs - constructor', (t) => {
	const i1 = new Inputs([s1]);

	t.deepEqual(Array.from(i1.main[0].getFloat32ArrayValue()), [1, 2, 3]);
	t.is(i1.options, undefined);

	const m1 = new Map();
	m1.set('myOption', [s1]);

	const i2 = new Inputs([], m1);
	t.deepEqual(i2.main, []);
	t.deepEqual(Array.from(i2.options.get('myOption')[0].getFloat32ArrayValue()), [1, 2, 3]);
});