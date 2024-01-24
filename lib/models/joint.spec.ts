import test from 'ava';

import { Joint } from './joint';
import { VectorSequence } from './sequence/vector-sequence';

const fakeArray = Float32Array.from([1, 2, 3]);

test('Joint - constructor', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		undefined,
		300
	);

	t.like(joint, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		fx: fakeArray,
		fy: fakeArray,
		fz: fakeArray,
		mx: fakeArray,
		my: fakeArray,
		mz: fakeArray,
		px: undefined,
		py: undefined,
		pz: undefined,
		length: 3,
		frameRate: 300,
	});

	t.is(joint.position.length, 3);
	t.is(joint.force.length, 3);
	t.is(joint.moment.length, 3);
	t.is(joint.power?.length, undefined);
});

test('Joint - fromArray', (t) => {
	const joint = Joint.fromArray(
		'test',
		[fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray]
	);

	t.like(joint, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		fx: fakeArray,
		fy: fakeArray,
		fz: fakeArray,
		mx: fakeArray,
		my: fakeArray,
		mz: fakeArray,
		px: fakeArray,
		py: fakeArray,
		pz: fakeArray,
		length: 3
	});
});

test('Joint - getComponent', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		fakeArray,
		300
	);

	const components = {
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		fx: fakeArray,
		fy: fakeArray,
		fz: fakeArray,
		mx: fakeArray,
		my: fakeArray,
		mz: fakeArray,
		p: fakeArray,
	};

	for (const i in components) {
		t.deepEqual(Array.from(joint.getComponent(i)), Array.from(components[i] as TypedArray));
	}

	t.is(joint.getComponent('wrongComponent'), undefined);
});

test('Joint - length', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		undefined,
		300
	);

	t.is(joint.length, 3);

	const fourElements = Float32Array.from([1, 2, 3, 4]);
	const fiveElements = Float32Array.from([1, 2, 3, 4, 5]);

	t.is(joint.length, 3);

	joint.force = new VectorSequence(fourElements, fourElements, fourElements, 300),
	t.is(joint.length, 4);

	joint.force = new VectorSequence(fiveElements, fiveElements, fiveElements, 300),
	t.is(joint.length, 5);

	joint.force = undefined;
	t.is(joint.length, 3);

	joint.moment = undefined;
	t.is(joint.length, 3);

	joint.position = undefined;
	t.is(joint.length, 0);
});