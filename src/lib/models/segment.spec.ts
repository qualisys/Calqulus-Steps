import test from 'ava';

import { ISegment, Segment } from './segment';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Quaternion } from './spatial/quaternion';
import { Vector } from './spatial/vector';

const fakeArray = Float32Array.from([1, 2, 3]);
const fakeArray2 = Float32Array.from([4, 5, 6]);
const fakeArray3 = Float32Array.from([7, 8, 9]);
const fakeArray4 = Float32Array.from([10, 11, 12]);
const fakeArray5 = Float32Array.from([13, 14, 15]);

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

test('Segment - clone', (t) => {
	const positionSeq = new VectorSequence(fakeArray2, fakeArray3, fakeArray4, 300);
	const rotationSeq = new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray);
	const segment = new Segment(
		'original',
		positionSeq,
		rotationSeq,
		300
	);

	// Add additional properties.
	segment.centerOfMass = new Vector(1, 2, 3);
	segment.inertia = { clone: () => ({ cloned: true }) } as any;
	segment.mass = 42;
	segment.kinematics = {
		angularAcceleration: { clone: () => 'aa' } as any,
		angularVelocity: { clone: () => 'av' } as any,
		linearAcceleration: { clone: () => 'la' } as any,
		linearVelocity: { clone: () => 'lv' } as any,
	};
	segment.parent = new Segment('parent', positionSeq, rotationSeq, 300);
	segment.contactJoint = { name: 'contact' } as any;
	segment.distalJoint = { name: 'distal' } as any;
	segment.proximalJoint = { name: 'proximal' } as any;

	const cloned = segment.clone();

	t.not(cloned, segment);
	t.is(cloned.name, segment.name);
	t.deepEqual(cloned.components, segment.components);
	t.not(cloned.position, segment.position);
	t.not(cloned.rotation, segment.rotation);
	t.deepEqual(cloned.position, segment.position);
	t.deepEqual(cloned.rotation, segment.rotation);
	t.is(cloned.frameRate, segment.frameRate);

	// Check kinematics are cloned.
	t.deepEqual(cloned.kinematics.angularAcceleration as unknown as string, 'aa');
	t.deepEqual(cloned.kinematics.angularVelocity as unknown as string, 'av');
	t.deepEqual(cloned.kinematics.linearAcceleration as unknown as string, 'la');
	t.deepEqual(cloned.kinematics.linearVelocity as unknown as string, 'lv');

	// Check centerOfMass, inertia, mass, parent, joints.
	t.not(cloned.centerOfMass, undefined);
	t.deepEqual(cloned.centerOfMass, segment.centerOfMass);
	t.deepEqual(cloned.inertia as unknown as { cloned: boolean }, { cloned: true });
	t.is(cloned.mass, 42);
	t.is(cloned.parent, segment.parent);
	t.is(cloned.contactJoint, segment.contactJoint);
	t.is(cloned.distalJoint, segment.distalJoint);
	t.is(cloned.proximalJoint, segment.proximalJoint);
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

test('Segment - length', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	t.is(segment.length, 3);

	segment.position = undefined;
	t.is(segment.length, 0);
});

test('Segment - position', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray2, fakeArray3, fakeArray4, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	t.deepEqual(segment.position.x, fakeArray2);
	t.deepEqual(segment.position.y, fakeArray3);
	t.deepEqual(segment.position.z, fakeArray4);
});

test('Segment - rotation', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new QuaternionSequence(fakeArray2, fakeArray3, fakeArray4, fakeArray5),
		300
	);

	t.deepEqual(segment.rotation.x, fakeArray2);
	t.deepEqual(segment.rotation.y, fakeArray3);
	t.deepEqual(segment.rotation.z, fakeArray4);
	t.deepEqual(segment.rotation.w, fakeArray5);
});

test('Segment - components', (t) => {
	const segment = new Segment(
		'test',
		new VectorSequence(fakeArray2, fakeArray3, fakeArray4, 300),
		new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
		300
	);

	t.deepEqual(segment.x, fakeArray2);
});