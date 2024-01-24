import test from 'ava';
import sinon from 'sinon';

import { BodySegmentParameterResult, BodySegmentParameters } from './body-segment-parameters';
import { Segment } from './segment';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Matrix } from './spatial/matrix';
import { Vector } from './spatial/vector';

const fakeArray = Float32Array.from([1, 2, 3]);

test('BodySegmentParameters - addToSegments', (t) => {
	const segments = [
		new Segment(
			'LeftFoot',
			new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([3, 3, 5]), 100),
			new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
			100
		),
		new Segment(
			'LeftLeg',
			new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([4, 4, 6]), 100),
			new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
			100
		)
	];
	const bsp: Map<string, BodySegmentParameterResult> = new Map([
		[
			'LeftFoot',
			{
				segment: 'LeftFoot',
				centerOfMass: new Vector(0, 0, 1),
				mass: 2,
				inertia: Matrix.identity()
			},
		],
		[
			'LeftLeg',
			{
				segment: 'LeftFoot',
				centerOfMass: new Vector(0, 1, 0),
				mass: 3.5,
				inertia: new Matrix()
			}
		]
	]);

	BodySegmentParameters.addToSegments(segments, bsp);

	t.deepEqual(segments[0].centerOfMass, new Vector(0, 0, 1));
	t.deepEqual(segments[0].mass, 2);
	t.deepEqual(segments[0].inertia._m, Matrix.identity()._m);

	t.deepEqual(segments[1].centerOfMass, new Vector(0, 1, 0));
	t.deepEqual(segments[1].mass, 3.5);
	t.deepEqual(segments[1].inertia._m, new Matrix()._m);
});

test('BodySegmentParameters - calculate', (t) => {
	const segments = [
		new Segment(
			'LeftFoot',
			new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([3, 3, 5]), 100),
			new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
			100
		),
		new Segment(
			'LeftLeg',
			new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([4, 4, 6]), 100),
			new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
			100
		)
	];

	segments[0].parent = segments[1];

	const result = BodySegmentParameters.calculate(segments, 75);
	t.is(result.get('LeftFoot').segment, 'LeftFoot');
	t.is(result.get('LeftFoot').centerOfMass.x, NaN);
	t.is(result.get('LeftFoot').centerOfMass.y, NaN);
	t.is(result.get('LeftFoot').centerOfMass.z, NaN);
	t.deepEqual(Array.from(result.get('LeftFoot').inertia._m), Array(16).fill(NaN));
	t.is(result.get('LeftFoot').mass, 1.0875000000000001);

	t.is(result.get('LeftLeg').segment, 'LeftLeg');
	t.is(result.get('LeftLeg').centerOfMass.x, 0);
	t.is(result.get('LeftLeg').centerOfMass.y, 0);
	t.is(result.get('LeftLeg').centerOfMass.z, -0.000433);
	t.is(result.get('LeftLeg').mass, 4.875);
});

test('BodySegmentParameters - calculateAndAddToSegments', (t) => {
	const calculateStub = sinon.stub(BodySegmentParameters, 'calculate');
	const addToSegmentStub = sinon.stub(BodySegmentParameters, 'addToSegments');

	BodySegmentParameters.calculateAndAddToSegments([], 75);

	t.is(calculateStub.callCount, 1);
	t.is(addToSegmentStub.callCount, 1);

	calculateStub.restore();
	addToSegmentStub.restore();
});

test('BodySegmentParameters - calculateCenterOfMass', (t) => {
	 const segment = new Segment(
		'LeftFoot',
		new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([3, 3, 5]), 100),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		100
	);

	const com = BodySegmentParameters.calculateCenterOfMass(segment, 1);

	t.is(com.x, -0.034);
	t.is(com.y, 0.502);
	t.is(com.z, -0.199);
});

test('BodySegmentParameters - calculateSegmentLength', (t) => {
	const segments = [
		new Segment(
			'LeftFoot',
			new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([3, 3, 5]), 100),
			new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
			100
		),
		new Segment(
			'LeftLeg',
			new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([4, 4, 6]), 100),
			new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
			100
		)
	];

	segments[0].parent = segments[1];
	const footLength = BodySegmentParameters.calculateSegmentLength(segments[0], segments);
	const legLength = BodySegmentParameters.calculateSegmentLength(segments[1], segments);
	
	t.is(footLength, undefined);
	t.is(legLength, 1);
});

test('BodySegmentParameters - calculateSegmentMass', (t) => {
	const leg = new Segment(
		'LeftLeg',
		new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([4, 4, 6]), 100),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		100
	);

	const mass = BodySegmentParameters.calculateSegmentMass(leg, 75);
	t.is(mass, 4.875);

});

test('BodySegmentParameters - calculateInertia', (t) => {
	const leg = new Segment(
		'LeftLeg',
		new VectorSequence(Float32Array.from([1, 1, 3]), Float32Array.from([2, 2, 4]), Float32Array.from([4, 4, 6]), 100),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		100
	);

	const inertia = BodySegmentParameters.calculateInertia(leg, 4.875, 0.394);
	t.deepEqual(Array.from(inertia._m), [
		0.069020952702, 0, 0, 0,
		0, 0.069020952702, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0
	]);
});