import test from 'ava';

import { f32 } from '../../../test-utils/mock-step';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Quaternion } from '../../models/spatial/quaternion';

import { AngleUtil } from './angle';
import { RotationOrder } from './euler';

const q1 = new QuaternionSequence(f32(-0.076565), f32(0.030934), f32(-0.720501), f32(0.688520));
const q2 = new QuaternionSequence(f32(-0.134267), f32(0.126671), f32(-0.706593), f32(0.683120));

// Check if numbers are almost equal, ie within a certain threshold.
const eqish = (a, b, threshold = 1 / 100) => {
	return Math.abs(a - b) < threshold;
};

test('AngleUtil - computeRelativeAngle - Default', (t) => {
	// This test also implicitly covers:
	// * computeRelativeAngleFrame
	// * computeRelativeAngleBetweenQuaternions

	const c1 = AngleUtil.computeRelativeAngle(q1, q2);

	t.like(c1, {
		x: f32(-0.10955127328634262),
		y: f32(0.023444663733243942),
		z: f32(0.011230398900806904),
		w: f32(0.9936413168907166)
	});

	const c2 = AngleUtil.computeRelativeAngle(q1, q1);

	t.like(c2, {
		x: f32(0),
		y: f32(0),
		z: f32(0),
	});

	const c3 = AngleUtil.computeRelativeAngle(q2, q2);

	t.like(c3, {
		x: f32(0),
		y: f32(0),
		z: f32(0),
	});
});

test('AngleUtil - computeRelativeEulerAngle - Cardan solution', (t) => {
	// Two quaternions to euler angles.
	// Each quaternion represent the pose (position and rotation) of a segment
	// like the thigh and the shank relative to the global coordinate system

	// This test also implicitly covers:
	// * computeRelativeAngleFrame
	// * computeRelativeAngleBetweenQuaternions
	// * computeEulerAnglesFromQuaternion

	// Case 1: Thigh and Shank are aligned: Quaternions are similar and the
	// Euler angles using XYZ sequence are 0, 0, 0.
	//
	// Seen from the side
	//  Z
	//  ?
	//  |   THIGH
	//  |
	//  o- - ? Y
	//  Z
	//  ?
	//  |   SHANK
	//  |
	//  o- - ? Y

	// Create a rotation matrix for the thigh and then transform it to a quaternion.
	const qa = new Quaternion(0, 0, 0, 1);
	const qb = new Quaternion(0, 0, 0, 1);
	const eulerAb = AngleUtil.computeRelativeEulerAngle(QuaternionSequence.fromQuaternion(qa), QuaternionSequence.fromQuaternion(qb), RotationOrder.XYZ);

	t.is(Math.abs(eulerAb.x[0]), 0);
	t.is(Math.abs(eulerAb.y[0]), 0);
	t.is(Math.abs(eulerAb.z[0]), 0);

	// Case 2: Shank is flexed 90 degrees: Quaternions are giving Euler angles
	// using XYZ sequence of -90, 0, 0. Create a rotation matrix for the thigh and
	// then transform it to a quaternion.
	//
	// Seen from the side
	//  Z
	//  ?
	//  |   THIGH
	//  |
	//  o- - ? Y
	//  o- - ? Z
	//  |
	//  |   SHANK
	//  ?
	//  Y

	const qc = new Quaternion(0, 0, 0, 1);
	const qd = new Quaternion(-0.7071, 0, 0, 0.7071);
	const eulerCd = AngleUtil.computeRelativeEulerAngle(QuaternionSequence.fromQuaternion(qc), QuaternionSequence.fromQuaternion(qd), RotationOrder.XYZ);

	t.true(eqish(eulerCd.x[0], -90));
	t.is(Math.abs(eulerCd.z[0]), 0);
	t.is(Math.abs(eulerCd.y[0]), 0);

	// Case 3: Shank is rotated flexed 90 degrees: Quaternions are giving Euler
	// angles using ZYX sequence of 0, 0, 45. Create a rotation matrix for the
	// thigh and then transform it to a quaternion.
	//
	// Seen from the top
	//  Y
	//  ?
	//  |   THIGH
	//  |
	//  o- - ? X
	//  
	// Y          X
	//   \      /   SHANK
	//     \  /
	//      o


	const qe = new Quaternion(0, 0, 0, 1);
	const qf = new Quaternion(0, 0, 0.3827, 0.9239);
	const eulerEf = AngleUtil.computeRelativeEulerAngle(QuaternionSequence.fromQuaternion(qe), QuaternionSequence.fromQuaternion(qf), RotationOrder.ZYX);

	t.is(Math.abs(eulerEf.x[0]), 0);
	t.is(Math.abs(eulerEf.y[0]), 0);
	t.true(eqish(eulerEf.z[0], 45));
});

test('AngleUtil - computeEulerAnglesFromQuaternion - Cardan solution', (t) => {
	// The quaternion represents the pose (position and rotation) of a segment
	// like the thigh relative to the world.

	// Case 1: Thigh is aligned with world: Quaternion is giving Euler angles
	// using XYZ sequence of 0, 0, 0
	//
	// Seen from the side
	//  Z
	//  ?
	//  |   THIGH
	//  |
	//  o- - ? Y

	const qa = new Quaternion(0, 0, 0, 1);
	const eulerA = AngleUtil.computeEulerAnglesFromQuaternion(qa, RotationOrder.XYZ);

	t.is(Math.abs(eulerA.x), 0);
	t.is(Math.abs(eulerA.y), 0);
	t.is(Math.abs(eulerA.z), 0);

	const qb = new Quaternion(0.7071, 0, 0, 0.7071);
	const eulerB = AngleUtil.computeEulerAnglesFromQuaternion(qb, RotationOrder.XYZ);

	t.true(eqish(eulerB.x, 90));
	t.is(Math.abs(eulerB.y), 0);
	t.is(Math.abs(eulerB.z), 0);
});

test('AngleUtil - computeRelativeEulerAngle - Euler solution #2 auto', (t) => {
	// Two quaternions to euler angles.
	// Each quaternion represent the pose (position and rotation) of a segment
	// like the shoulder and the arm relative to the global coordinate system

	// This test also implicitly covers:
	// * computeRelativeAngleFrame
	// * computeRelativeAngleBetweenQuaternions
	// * computeEulerAnglesFromQuaternion

	// Create a quaternion for both segments.
	const qa = new Quaternion(0.016258, -0.023262, 0.994926, -0.096528);
	const qb = new Quaternion(0.093969, 0.000373, 0.971381, -0.218150);
	const eulerAb = AngleUtil.computeRelativeEulerAngle(QuaternionSequence.fromQuaternion(qb), QuaternionSequence.fromQuaternion(qa), RotationOrder.ZYZ);

	t.is(eulerAb.x[0], 4.915169715881348);
	t.is(eulerAb.y[0], 9.709190368652344);
	t.is(eulerAb.z[0], -18.875011444091797);
});

test('AngleUtil - computeAngleBetweenVectors', (t) => {
	const v1 = new VectorSequence(f32(1), f32(2), f32(3));
	const v2 = new VectorSequence(f32(4), f32(5), f32(6));
	const v3 = new VectorSequence(f32(4, 1), f32(5, 2), f32(6, 3));
	const v4 = new VectorSequence(f32(1, 4), f32(2, 5), f32(3, 6));

	const targetAngle = 0.22572612762451172;

	t.deepEqual(AngleUtil.computeAngleBetweenVectors(v1, v2), f32(targetAngle));
	t.deepEqual(AngleUtil.computeAngleBetweenVectors(v3, v4), f32(targetAngle, targetAngle));

	// Different length
	t.deepEqual(AngleUtil.computeAngleBetweenVectors(v1, v3), f32(targetAngle, 0));
});

test('AngleUtil - unwrapAngles invalid input', (t) => {	
	t.throws(() => { AngleUtil.unwrapAngles(undefined); });
	t.throws(() => { AngleUtil.unwrapAngles(f32()); });
});

test('AngleUtil - unwrapAngles single value', (t) => {
	const angles = f32(1);
	
	t.deepEqual(AngleUtil.unwrapAngles(angles), angles);
});

test('AngleUtil - unwrapAngles (growing)', (t) => {
	const range = { min: -5, max: 5 };
	const fullRange = range.max - range.min;
	const angles = new Float32Array(50).map((_, i) => i);
	const anglesWrapped = angles.map(v => (v - range.min) % fullRange + range.min);
	
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 0, fullRange, fullRange / 2), angles);
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 24, fullRange, fullRange / 2), f32(
		-20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10,
		 -9,  -8,  -7,  -6,  -5,  -4,  -3,  -2,  -1,   0,   1,
		  2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,
		 13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,
		 24,  25,  26,  27,  28,  29
	));
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 49, fullRange, fullRange / 2), f32(
		-50, -49, -48, -47, -46, -45, -44, -43, -42,
		-41, -40, -39, -38, -37, -36, -35, -34, -33,
		-32, -31, -30, -29, -28, -27, -26, -25, -24,
		-23, -22, -21, -20, -19, -18, -17, -16, -15,
		-14, -13, -12, -11, -10,  -9,  -8,  -7,  -6,
		 -5,  -4,  -3,  -2,  -1
	));
});

test('AngleUtil - unwrapAngles (falling, from zero into negative)', (t) => {
	const range = { min: -5, max: 5 };
	const fullRange = range.max - range.min;
	const angles = new Float32Array(50).map((_, i) => i > 0 ? -i : i);
	const anglesWrapped = angles.map(v => (v + range.min) % fullRange - range.min);
	
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 0, fullRange, fullRange / 2), angles);
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 24, fullRange, fullRange / 2), f32(
		20,  19,  18,  17,  16,  15,  14,  13,  12,  11,  10,
		 9,   8,   7,   6,   5,   4,   3,   2,   1,   0,  -1,
	    -2,  -3,  -4,  -5,  -6,  -7,  -8,  -9, -10, -11, -12,
	   -13, -14, -15, -16, -17, -18, -19, -20, -21, -22, -23,
	   -24, -25, -26, -27, -28, -29
	));
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 49, fullRange, fullRange / 2), new Float32Array(50).map((_, i) => 50 - i));
});

test('AngleUtil - unwrapAngles (upwards pointing arrow)', (t) => {
	const range = { min: -5, max: 5 };
	const fullRange = range.max - range.min;
	const angles = new Float32Array(50).map((_, i) => (i < 25) ? i : 50 - i);
	const anglesWrapped = angles.map(v => (v - range.min) % fullRange + range.min);
	
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 0, fullRange, fullRange / 2), angles);
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 24, fullRange, fullRange / 2), f32(
		-20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10,
		 -9,  -8,  -7,  -6,  -5,  -4,  -3,  -2,  -1,   0,   1,
		  2,   3,   4,   5,   4,   3,   2,   1,   0,  -1,  -2,
		 -3,  -4,  -5,  -6,  -7,  -8,  -9, -10, -11, -12, -13,
	    -14, -15, -16, -17, -18, -19
	));
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 49, fullRange, fullRange / 2), angles);

	// Test alignment index out-of-bounds
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 50, fullRange, fullRange / 2), angles);
});

test('AngleUtil - unwrapAngles (downwards pointing arrow, from positive offset into negative)', (t) => {
	const range = { min: -5, max: 5 };
	const fullRange = range.max - range.min;
	const offsetY = 10;
	const angles = new Float32Array(50).map((_, i) => offsetY - ((i < 25) ? i : 50 - i));
	const anglesWrapped = angles.map(v => {
		if (v > range.max) return (v - range.min) % fullRange + range.min;
		if (v < range.min) return (v + range.min) % fullRange - range.min;

		return v;
	});
	
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 0, fullRange, fullRange / 2), angles.map(v => v - offsetY));
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 24, fullRange, fullRange / 2), f32(
		20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,
		 9,  8,  7,  6,  5,  4,  3,  2,  1,  0, -1,
	    -2, -3, -4, -5, -4, -3, -2, -1,  0,  1,  2,
		 3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13,
	    14, 15, 16, 17, 18, 19
	));
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 49, fullRange, fullRange / 2), angles.map(v => v - offsetY));
});

test('AngleUtil - unwrapAngles (sine wave) (default thresholds and range)', (t) => {
	const range = { min: -Math.PI, max: Math.PI };
	const fullRange = range.max - range.min;

	// Sine wave with amplitude of 2pi
	const amplitude = Math.PI * 2;
	const angles = new Float32Array(50).map((_, i) => Math.sin(i / 50 * 2 * Math.PI) * amplitude);
	const anglesWrapped = angles.map(v => {
		if (v > range.max) return (v - range.min) % fullRange + range.min;
		if (v < range.min) return (v + range.min) % fullRange - range.min;

		return v;
	});
	
	// All the following points are within the original range and 
	// should return the original signal.
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped), angles);
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 25), angles);
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 49), angles);
	
	// The following point is outside of the original range, and 
	// the curve should be re-aligned.
	t.deepEqual(AngleUtil.unwrapAngles(anglesWrapped, 12), f32(
		-6.2831854820251465,    -5.495693206787109,   -4.720620632171631,
		-3.9701905250549316,    -3.256237745285034,  -2.5900216102600098,
		-1.9820488691329956,   -1.4419077634811401,  -0.9781163334846497,
		-0.5979893803596497,  -0.30752116441726685, -0.11129266023635864,
	  -0.012398544698953629, -0.012398544698953629, -0.11129266023635864,
	   -0.30752116441726685,   -0.5979893803596497,  -0.9781163334846497,
		-1.4419077634811401,   -1.9820488691329956,  -2.5900216102600098,
		 -3.256237745285034,   -3.9701905250549316,   -4.720620632171631,
		 -5.495693206787109,   -6.2831854820251465,   -7.070677280426025,
		 -7.845749855041504,    -8.596179962158203,    -9.31013298034668,
		 -9.976348876953125,   -10.584321975708008,  -11.124463081359863,
		 -11.58825397491455,    -11.96838092803955,  -12.258849143981934,
			  -12.455078125,   -12.553972244262695,  -12.553972244262695,
			  -12.455078125,   -12.258849143981934,   -11.96838092803955,
		 -11.58825397491455,   -11.124463081359863,  -10.584321975708008,
		 -9.976348876953125,     -9.31013298034668,   -8.596179962158203,
		 -7.845749855041504,    -7.070677280426025
	));
});
