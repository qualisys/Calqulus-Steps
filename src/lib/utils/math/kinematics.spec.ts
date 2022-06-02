import test from 'ava';

import { Kinematics } from './kinematics';

test('Kinematics - Derivative (first order)', (t) => {
	t.throws(() => { Kinematics.finiteDifference([1], 0); },           { message: 'Invalid value given for xStep (0).'});
	t.throws(() => { Kinematics.finiteDifference([1, 2, 3], 1, 0); },  { message: 'Invalid value given for order (0).'});
	t.throws(() => { Kinematics.finiteDifference([1, 2, 3], 1, 3); },  { message: 'Invalid value given for order (3).'});
	
	t.deepEqual(Kinematics.finiteDifference([1], 1), Float32Array.from([0]));

	t.deepEqual(Kinematics.finiteDifference([1, 2, 3, 4, 4, 4, 3, 1, 1], 1),    Float32Array.from([NaN, 1, 1, 0.5, 0, -0.5, -1.5, -1, NaN]));
	t.deepEqual(Kinematics.finiteDifference([1, 2, 3, 4, 4, 4, 3, 1, 1], 1, 2), Float32Array.from([NaN, 0, 0, -1, 0, -1, -1, 2, NaN]));
});

test('Kinematics - simpleDifference', (t) => {
	t.is(Kinematics.simpleDifference([1]).length, 0);
	t.deepEqual(Kinematics.simpleDifference([1, 2, 2.5, 1.5, 7]), [1, 0.5, -1, 5.5]);
	t.deepEqual(Kinematics.simpleDifference(Float32Array.from([1, 2, 2.5])), Float32Array.from([1, 0.5]));
});