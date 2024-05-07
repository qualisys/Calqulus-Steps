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
		p: undefined,
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
		[fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray, fakeArray]
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
		p: fakeArray,
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

test('Joint - getter / setter - force', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		undefined,
		300
	);
	
	const fakeArray2 = Float32Array.from([4, 5, 6]);
	const force = new VectorSequence(fakeArray2, fakeArray2, fakeArray2, 300);
	joint.force = force;

	t.is(joint.force, force);
	t.is(joint.fx, fakeArray2);
	t.is(joint.fy, fakeArray2);
	t.is(joint.fz, fakeArray2);
	t.is(joint.array[3], fakeArray2);
	t.is(joint.array[4], fakeArray2);
	t.is(joint.array[5], fakeArray2);
});

test('Joint - getter / setter - moment', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		undefined,
		300
	);
	
	const fakeArray2 = Float32Array.from([4, 5, 6]);
	const moment = new VectorSequence(fakeArray2, fakeArray2, fakeArray2, 300);
	joint.moment = moment;

	t.is(joint.moment, moment);
	t.is(joint.mx, fakeArray2);
	t.is(joint.my, fakeArray2);
	t.is(joint.mz, fakeArray2);
	t.is(joint.array[6], fakeArray2);
	t.is(joint.array[7], fakeArray2);
	t.is(joint.array[8], fakeArray2);
});

test('Joint - getter / setter - power', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		undefined,
		300
	);
	
	const fakeArray2 = Float32Array.from([4, 5, 6]);
	joint.power = fakeArray2;

	t.is(joint.power, fakeArray2);
	t.is(joint.p, fakeArray2);
	t.is(joint.array[9], fakeArray2);
});

test('Joint - getter / setter - position', (t) => {
	const joint = new Joint(
		'test',
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
		undefined,
		300
	);
	
	const fakeArray2 = Float32Array.from([4, 5, 6]);
	const position = new VectorSequence(fakeArray2, fakeArray2, fakeArray2, 300);
	joint.position = position;

	t.is(joint.position, position);
	t.is(joint.x, fakeArray2);
	t.is(joint.y, fakeArray2);
	t.is(joint.z, fakeArray2);
	t.is(joint.array[0], fakeArray2);
	t.is(joint.array[1], fakeArray2);
	t.is(joint.array[2], fakeArray2);
});
