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
}

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
	t.is(eulerAb.y[0], 9.709197998046875);
	t.is(eulerAb.z[0], -18.87501335144043);
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
