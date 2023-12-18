import test from 'ava';

import { ISegment, Segment } from './segment';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Quaternion } from './spatial/quaternion';
import { Vector } from './spatial/vector';

const fakeArray = Float32Array.from([1, 2, 3]);

test('Segment - constructor', (t) => {
	const s1 = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	t.like(s1, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		rx: fakeArray,
		ry: fakeArray,
		rz: fakeArray,
		rw: fakeArray,
		length: 3,
		frameRate: 300,
	});

	s1.position = undefined;
	t.is(s1.length, 0);

	const s2 = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300,
	);

	t.like(s2, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		rx: fakeArray,
		ry: fakeArray,
		rz: fakeArray,
		rw: fakeArray,
		length: 3,
		frameRate: 300,
	});
});

test('Segment - fromArray', (t) => {
	const segment = Segment.fromArray(
		'test',
		[fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray]
	);

	t.like(segment, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		rx: fakeArray,
		ry: fakeArray,
		rz: fakeArray,
		rw: fakeArray,
		length: 3,
	});
});

test('Segment - getComponent', (t) => {
	const segment1 = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	const components = {
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		rx: fakeArray,
		ry: fakeArray,
		rz: fakeArray,
		rw: fakeArray
	};

	for (const i in components) {
		t.deepEqual(Array.from(segment1.getComponent(i)), Array.from(components[i] as TypedArray));
	}

	t.is(segment1.getComponent('wrongComponent'), undefined);
});

test('Segment - getTransformationAtFrame', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	t.like(segment.getTransformationAtFrame(2), {
		position: { x: 2, y: 2, z: 2, },
		rotation: { x: 2, y: 2, z: 2, w: 2, }
	});

	const segmentComp: ISegment = {
		position: new Vector(1, 2, 3),
		rotation: new Quaternion(1, 2, 3, 4),
	};

	t.like(segment.getTransformationAtFrame(2, segmentComp), {
		position: { x: 2, y: 2, z: 2, },
		rotation: { x: 2, y: 2, z: 2, w: 2, }
	});

	t.like(segmentComp, {
		position: { x: 2, y: 2, z: 2, },
		rotation: { x: 2, y: 2, z: 2, w: 2, }
	});

	segment.rotation = undefined;
	t.is(segment.getTransformationAtFrame(2), undefined);
});