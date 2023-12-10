import test from 'ava';

import { ISegment, Segment } from './segment';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Quaternion } from './spatial/quaternion';
import { Vector } from './spatial/vector';

const fakeArray = Float32Array.from([1, 2, 3]);

test('Segment - constructor', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
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
		frameRate: 300,
	});

	segment.positions = undefined;
	t.is(segment.length, 0);
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

test('Segment - array', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	t.deepEqual(segment.array, [
		fakeArray,
		fakeArray,
		fakeArray,
		fakeArray,
		fakeArray,
		fakeArray,
		fakeArray,
	]);

	t.is(segment.array.length, 7);
});

test('Segment - getComponent', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	for (const comp of segment.components) {
		t.is(segment.getComponent(comp), fakeArray);
	}

	t.is(segment.getComponent('wrongComponent'), undefined);
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

	segment.rotations = undefined;
	t.is(segment.getTransformationAtFrame(2), undefined);
});