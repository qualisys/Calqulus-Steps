import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { PlaneSequence } from '../models/sequence/plane-sequence';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { AngleStep, AngularVelocityStep, JointAngleStep } from './angle';
import { PlaneStep } from './plane';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));
const s3 = new Signal(f32(-1, -2, -3));
const s4 = new Signal(f32(-4, -7, -9));

const vs1 = new Signal(new VectorSequence(f32(1, 2, 3), f32(2, 3, 4), f32(3, 4, 5)));
const vs2 = new Signal(new VectorSequence(f32(4, 5, 6), f32(6, 6, 7), f32(3, 7, 1)));

const vs1x = new Signal(new VectorSequence(f32(1), f32(2), f32(3)));
const vs2x = new Signal(new VectorSequence(f32(4), f32(5), f32(6)));
const vs3x = new Signal(new VectorSequence(f32(-1), f32(-2), f32(-3)));

const q1 = new QuaternionSequence(f32(-0.076565), f32(0.030934), f32(-0.720501), f32(0.688520));
const q2 = new QuaternionSequence(f32(-0.134267), f32(0.126671), f32(-0.706593), f32(0.683120));

const seg1 = new Signal(
	new Segment(
		'test1',
		new VectorSequence(f32(1, 2, 3), f32(2, 3, 4), f32(3, 4, 5)),
		q1
	)
);

const seg2 = new Signal(
	new Segment(
		'test2',
		new VectorSequence(f32(4, 5, 6), f32(6, 6, 7), f32(3, 7, 1)),
		q2
	)
);

const seg3 = new Signal(
	new Segment(
		'test3',
		new VectorSequence(f32(8, 9, 2), f32(3, 6, 2), f32(4, 0, 9)),
		q2
	)
);

const sShort = new Signal(f32(4, 5));
const sLong = new Signal(f32(1, 2, 3, 4, 5));
const sString = new Signal('string value');

/***********************************
 * Variables for angular velocities *
 ***********************************/

const q4 = new QuaternionSequence(f32(0.031361, 0.002679, -0.024360), f32(-0.604990, -0.608184, -0.608368), f32(-0.414719, -0.376154, -0.337971), f32(0.678978, 0.699009, 0.717684));
const q5 = new QuaternionSequence(f32(-0.147944, -0.152840, -0.157840), f32(-0.027939, -0.028299, -0.028471), f32(-0.633024, -0.618536, -0.604843), f32(0.759350, 0.770229, 0.780026));
const q6 = new QuaternionSequence(f32(0.031361, 0.002679, -0.024360), f32(-0.604990, -0.608184, -0.608368), f32(-0.414719, -0.376154, -0.337971), f32(0.678978, 0.699009, 0.717684));
const q7 = new QuaternionSequence(f32(0.031361, 0.002679, -0.024360), f32(-0.604990, -0.608184, -0.608368), f32(-0.414719, -0.376154, -0.337971), f32(0.678978, 0.699009, 0.717684));

const seg4 = new Signal(
	new Segment(
		'test4',
		new VectorSequence(f32(1, 2, 3), f32(2, 3, 4), f32(3, 4, 5)),
		q4
	)
);

const seg5 = new Signal(
	new Segment(
		'test5',
		new VectorSequence(f32(4, 5, 6), f32(6, 6, 7), f32(3, 7, 1)),
		q5
	)
);

const seg6 = new Signal(
	new Segment(
		'test6',
		new VectorSequence(f32(4, 5, 6), f32(6, 6, 7), f32(3, 7, 1)),
		q6
	)
);

const seg7 = new Signal(
	new Segment(
		'test7',
		new VectorSequence(f32(4, 5, 6), f32(6, 6, 7), f32(3, 7, 1)),
		q7
	)
);

/********************
 * Angle step tests *
 ********************/

test('AngleStep - Input errors - No inputs', async (t) => {
	await t.throwsAsync(mockStep(AngleStep).process());
});

test('AngleStep - Input errors - One input', async (t) => {
	// One input, expected segment
	await t.throwsAsync(mockStep(AngleStep, [s1]).process());
	await t.throwsAsync(mockStep(AngleStep, [undefined]).process());
});

test('AngleStep - Input errors - Two inputs', async (t) => {
	// Two inputs, expected segments or vectors
	await t.throwsAsync(mockStep(AngleStep, [s1, sShort]).process()); // A short vector
	await t.throwsAsync(mockStep(AngleStep, [s1, sLong]).process()); // A long vector
	await t.throwsAsync(mockStep(AngleStep, [s1, undefined]).process()); // A missing input
	await t.throwsAsync(mockStep(AngleStep, [s1, sString]).process()); // A wrong input type
});

test('AngleStep - Input errors - Three inputs', async (t) => {
	// Three inputs, expected segments or vectors or markers
	await t.throwsAsync(mockStep(AngleStep, [s1, s2, sShort]).process()); // A short vector
	await t.throwsAsync(mockStep(AngleStep, [s1, s2, sLong]).process()); // A Long vector
	await t.throwsAsync(mockStep(AngleStep, [s1, s2, undefined]).process()); // A missing input
	await t.throwsAsync(mockStep(AngleStep, [s1, s2, sString]).process()); // A wrong input type
});

test('AngleStep - Input errors - Too many inputs', async (t) => {
	await t.throwsAsync(mockStep(AngleStep, [s1, s2, s1, s2, s1]).process());
	await t.throwsAsync(mockStep(AngleStep, [s1, s2, s1, s2, s1, s2]).process());
});

test('AngleStep - Input errors - Invalid projection coordinate plane', async (t) => {
	t.throws(() => { mockStep(AngleStep, [s1, s2], { project: 'hello' }) });
});
test('AngleStep - Input errors - Invalid projection input type ', async (t) => {
	t.throws(() => {(mockStep(AngleStep, [s1, s2, s1], { project: [0,1] }).process())});
});

test('AngleStep - Input errors - Invalid rotation order', async (t) => {
	t.throws(() => { mockStep(AngleStep, [s1, s2], { rotationOrder: 'hello' }) });
});

// One segment
test('AngleStep - One segment (default XYZ)', async (t) => {
	const res = await mockStep(AngleStep, [seg1]).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [-3.5305919647216797]);
	t.deepEqual(Array.from(vs.y), [8.796627044677734])
	t.deepEqual(Array.from(vs.z), [-92.32886505126953])
});

test('AngleStep - One segment (ZXY)', async (t) => {
	const res = await mockStep(AngleStep, [seg1], { rotationOrder: 'ZXY' }).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [8.627449035644531]);
	t.deepEqual(Array.from(vs.y), [3.92830491065979])
	t.deepEqual(Array.from(vs.z), [92.89694213867188])
});

test('AngleStep - One segment (yxz)', async (t) => {
	// Also test that the rotation order option is case insensitive.
	const res = await mockStep(AngleStep, [seg1], { rotationOrder: 'yxz' }).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [-3.489011526107788]);
	t.deepEqual(Array.from(vs.y), [8.813092231750488])
	t.deepEqual(Array.from(vs.z), [-92.86946105957031])
});

// Two vectors
test('AngleStep - Two vectors', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2]).process();
	t.is(res.getValue(), 0.22572612762451172);
});

test('AngleStep - Two vectors - proj XY', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2], { project: 'xy' }).process();
	t.is(res.getValue(), 0.21109333634376526);
});

test('AngleStep - Two vectors - proj XZ', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2], { project: 'xz' }).process();
	t.is(res.getValue(), 0.2662520408630371);
});

test('AngleStep - Two vectors - proj YZ', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2], { project: 'yz' }).process();
	t.is(res.getValue(), 0.10673566907644272);
});

test('AngleStep - Two vectors - planar angle', async (t) => { 
	const plane = await mockStep(PlaneStep, [vs1x, vs2x, vs3x]).process();
	const res = await mockStep(AngleStep, [s1, s2], { project: [plane] }).process();

	const s1ProjectionSignal = new Signal(PlaneSequence.project(vs1x.getVectorSequenceValue(), plane.getPlaneSequenceValue(), true ));
	const s2ProjectionSignal = new Signal(PlaneSequence.project(vs2x.getVectorSequenceValue(), plane.getPlaneSequenceValue(), true ));
	const comparisonRes = await mockStep(AngleStep, [s1ProjectionSignal, s2ProjectionSignal]).process();

	t.deepEqual(res.getValue(), comparisonRes.getValue());
});

// Two segments
test('AngleStep - Two segments (default XYZ)', async (t) => {
	const res = await mockStep(AngleStep, [seg1, seg2]).process();
	t.like(res.getValue(), {
		x: f32(-12.617937088012695),
		y: f32(2.5293166637420654),
		z: f32(1.5747742652893066),
	});
});

test('AngleStep - Two segments (ZYX)', async (t) => {
	const res = await mockStep(AngleStep, [seg1, seg2], { rotationOrder: 'ZYX' }).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [-12.558980941772461]);
	t.deepEqual(Array.from(vs.y), [2.8115885257720947])
	t.deepEqual(Array.from(vs.z), [0.9856448173522949])
});

// Three vectors
test('AngleStep - Three vectors', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2, s3]).process();
	t.deepEqual(res.getValue(), f32(0.22918584942817688));
});

test('AngleStep - Three vectors - proj XY', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2, s3], { project: 'xy' }).process();
	t.deepEqual(res.getValue(), f32(0.16514867544174194));
});

test('AngleStep - Three vectors - planar angle', async (t) => { 
	const plane = await mockStep(PlaneStep, [vs1x, vs2x, vs3x]).process();
	const res = await mockStep(AngleStep, [s1, s2, s3], { project: [plane] }).process();

	const s1ProjectionSignal = new Signal(PlaneSequence.project(vs1x.getVectorSequenceValue(), plane.getPlaneSequenceValue(), true ));
	const s2ProjectionSignal = new Signal(PlaneSequence.project(vs2x.getVectorSequenceValue(), plane.getPlaneSequenceValue(), true ));
	const s3ProjectionSignal = new Signal(PlaneSequence.project(vs3x.getVectorSequenceValue(), plane.getPlaneSequenceValue(), true ));
	const comparisonRes = await mockStep(AngleStep, [s1ProjectionSignal, s2ProjectionSignal, s3ProjectionSignal]).process();

	t.deepEqual(res.getValue(), comparisonRes.getValue());
});

// Three segments
test('AngleStep - Three segments (using positions)', async (t) => {
	const res = await mockStep(AngleStep, [seg1, seg2, seg3]).process();
	t.deepEqual(res.getValue(), f32(1.5707963705062866, 1.354274034500122, 0.1585557907819748));
});

test('AngleStep - Three inputs, mixed segment and vectors', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2, seg3]).process();
	t.deepEqual(res.getValue(), f32(1.5707963705062866, 1.5707963705062866, 1.3220562934875488));
});

// Four vectors
test('AngleStep - Four vectors', async (t) => {
	const res = await await mockStep(AngleStep, [s1, s2, s3, s4]).process();
	t.deepEqual(res.getFloat32ArrayValue(), f32(2.8804352283477783));
});

test('AngleStep - Four vectors - proj XY', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2, s3, s4], { project: 'xy' }).process();
	t.deepEqual(res.getFloat32ArrayValue(), f32(2.8966140747070312));
});

test('AngleStep - Four vectors - proj XZ', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2, s3, s4], { project: 'xz' }).process();
	t.deepEqual(res.getFloat32ArrayValue(), f32(2.8198421001434326));
});

test('AngleStep - Four vectors - proj YZ', async (t) => {
	const res = await mockStep(AngleStep, [s1, s2, s3, s4], { project: 'yz' }).process();
	t.deepEqual(res.getFloat32ArrayValue(), f32(3.0509328842163086));
});

test('AngleStep - Two vectors against x-axis', async (t) => {
	const res = await mockStep(AngleStep, [vs1, vs2, new Signal(f32(0, 0, 0)), new Signal(f32(1, 0, 0))]).process();
	t.deepEqual(res.getFloat32ArrayValue(), f32(0.9272952079772949, 0.9553166031837463, 1.0303767919540405));
});


// *************************
// * JointAngle step tests *
// *************************

test('JointAngleStep - Input errors - No inputs', async (t) => {
	await t.throwsAsync(mockStep(JointAngleStep).process());
});

test('JointAngleStep - Input errors - Too many inputs', async (t) => {
	await t.throwsAsync(mockStep(JointAngleStep, [s1, s2, s3]).process());
});

test('JointAngleStep - One segment (ZXY)', async (t) => {
	// Copied from AngleStep - One segment (ZXY) - should be same exact answer
	const res = await mockStep(JointAngleStep, [seg1], { rotationOrder: 'ZXY' }).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [8.627449035644531]);
	t.deepEqual(Array.from(vs.y), [3.92830491065979])
	t.deepEqual(Array.from(vs.z), [92.89694213867188])
});

// Two segments
test('JointAngleStep - Two segments (ZYX)', async (t) => {
	// Copied from AngleStep - Two segments (ZYX) - should be same exact answer
	const res = await mockStep(JointAngleStep, [seg1, seg2], { rotationOrder: 'ZYX' }).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [-12.558980941772461]);
	t.deepEqual(Array.from(vs.y), [2.8115885257720947])
	t.deepEqual(Array.from(vs.z), [0.9856448173522949])
});

// Two vectors
test('JointAngleStep - Two vectors', async (t) => {
	// Copied from AngleStep - Two vectors - should be same exact answer
	const res = await mockStep(JointAngleStep, [s1, s2]).process();
	t.is(res.getValue(), 0.22572612762451172);
});

test('JointAngleStep - Two vectors - proj XY', async (t) => {
	// Copied from AngleStep - Two vectors - proj XY - should be same exact answer
	const res = await mockStep(JointAngleStep, [s1, s2], { project: 'xy' }).process();
	t.is(res.getValue(), 0.21109333634376526);
});


// *****************************
//  AngularVelocity step tests *
// *****************************

test('AngularVelocityStep - Input errors - No frame rate', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = undefined;
	await t.throwsAsync(mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7]).process());
});

test('AngularVelocityStep - Input errors - Wrong type', async (t) => {
	s1.frameRate = s2.frameRate = s3.frameRate = s4.frameRate = 300;
	await t.throwsAsync(mockStep(AngularVelocityStep, [s1, s2, s3, s4]).process());
});

test('AngularVelocityStep - Input errors - Less than 4 inputs', async (t) => {
	seg4.frameRate = seg5.frameRate = 300;
	await t.throwsAsync(mockStep(AngularVelocityStep, [seg4, seg5]).process());
});

test('AngularVelocityStep - Option errors - wrong useRotationOrder', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = 300;
	await t.throws(() => mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7], {
		useRotationOrder: 'trues',
		rotationOrder: 'xyz',
	}));
});

test('AngularVelocityStep - Option errors - useRotationOrder set to false and rotationOrder is set to something else than true or false', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = 300;
	await t.throws(() => mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7], {
		useRotationOrder: false,
		rotationOrder: 'xyz',
	}));
});

test('AngularVelocityStep - No option', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = 300;
	const res = await mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7], {
		useRotationOrder: false,
	}).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [NaN, 252.96937561035156, NaN]);
	t.deepEqual(Array.from(vs.y), [NaN, 344.2754821777344, NaN]);
	t.deepEqual(Array.from(vs.z), [NaN, -1434.84765625, NaN]);
});

test('AngularVelocityStep - useRotationOrder: true, rotationOrder: xyz', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = 300;
	const res = await mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7], {
		useRotationOrder: true,
		rotationOrder: 'xyz',
	}).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [NaN, 252.96937561035156, NaN]);
	t.deepEqual(Array.from(vs.y), [NaN, 1468.3487548828125, NaN]);
	t.deepEqual(Array.from(vs.z), [NaN, 57.72679901123047, NaN]);
});

test('AngularVelocityStep - useRotationOrder: true', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = 300;
	const res = await mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7], {
		useRotationOrder: true,
	}).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [NaN, 252.96937561035156, NaN]);
	t.deepEqual(Array.from(vs.y), [NaN, 1468.3487548828125, NaN]);
	t.deepEqual(Array.from(vs.z), [NaN, 57.72679901123047, NaN]);
});

test('AngularVelocityStep - useRotationOrder: true, rotationOrder: zyz', async (t) => {
	seg4.frameRate = seg5.frameRate = seg6.frameRate = seg7.frameRate = 300;
	const res = await mockStep(AngularVelocityStep, [seg4, seg5, seg6, seg7], {
		useRotationOrder: true,
		rotationOrder: 'zyz',
	}).process();
	const vs = res.getVectorSequenceValue();

	t.deepEqual(Array.from(vs.x), [NaN, -1434.84765625, NaN]);
	t.deepEqual(Array.from(vs.y), [NaN, -49.70024871826172, NaN]);
	t.deepEqual(Array.from(vs.z), [NaN, 57.72679901123047, NaN]);
});