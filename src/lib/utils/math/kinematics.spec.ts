import test from 'ava';

import { f32 } from '../../../test-utils/mock-step';
import { Segment } from '../../models/segment';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';

import { KinematicsUtil } from './kinematics';

test('KinematicsUtil - Derivative (first order)', (t) => {
	t.throws(() => { KinematicsUtil.finiteDifference([1], 0); },           { message: 'Invalid value given for xStep (0).'});
	t.throws(() => { KinematicsUtil.finiteDifference([1, 2, 3], 1, 0); },  { message: 'Invalid value given for order (0).'});
	t.throws(() => { KinematicsUtil.finiteDifference([1, 2, 3], 1, 3); },  { message: 'Invalid value given for order (3).'});
	
	t.deepEqual(KinematicsUtil.finiteDifference([1], 1), Float32Array.from([0]));

	t.deepEqual(KinematicsUtil.finiteDifference([1, 2, 3, 4, 4, 4, 3, 1, 1], 1),    Float32Array.from([NaN, 1, 1, 0.5, 0, -0.5, -1.5, -1, NaN]));
	t.deepEqual(KinematicsUtil.finiteDifference([1, 2, 3, 4, 4, 4, 3, 1, 1], 1, 2), Float32Array.from([NaN, 0, 0, -1, 0, -1, -1, 2, NaN]));
});

test('KinematicsUtil - simpleDifference', (t) => {
	t.is(KinematicsUtil.simpleDifference([1]).length, 0);
	t.deepEqual(KinematicsUtil.simpleDifference([1, 2, 2.5, 1.5, 7]), [1, 0.5, -1, 5.5]);
	t.deepEqual(KinematicsUtil.simpleDifference(Float32Array.from([1, 2, 2.5])), Float32Array.from([1, 0.5]));
});

test('KinematicsUtil - distanceBetweenPoints', (t) => {
	// No data
	t.throws(() => KinematicsUtil.distanceBetweenPoints(undefined));

	// Different lengths
	t.throws(() => KinematicsUtil.distanceBetweenPoints(new VectorSequence(f32(1, 2), f32(1, 2), f32(1))));
	t.throws(() => KinematicsUtil.distanceBetweenPoints(new VectorSequence(f32(1, 2), f32(1), f32(1, 2))));
	t.throws(() => KinematicsUtil.distanceBetweenPoints(new VectorSequence(f32(1), f32(1, 2), f32(1, 2))));

	// Single point
	t.throws(() => KinematicsUtil.distanceBetweenPoints(new VectorSequence(f32(1), f32(1), f32(1))));

	// Vector sequence
	t.deepEqual(KinematicsUtil.distanceBetweenPoints(new VectorSequence(f32(1, 2, 3), f32(1, 1, 1), f32(1, 1, 1))), f32(1, 1));
	t.deepEqual(KinematicsUtil.distanceBetweenPoints(new VectorSequence(f32(-1, -2, -3), f32(1, 1, 1), f32(1, 1, 1))), f32(1, 1));

	// Segment
	t.deepEqual(KinematicsUtil.distanceBetweenPoints(new Segment('test', new VectorSequence(f32(1, 2), f32(1, 1), f32(1, 1)), new QuaternionSequence(f32(1, 2), f32(1, 2), f32(1, 2), f32(1, 2)))), f32(1));

});