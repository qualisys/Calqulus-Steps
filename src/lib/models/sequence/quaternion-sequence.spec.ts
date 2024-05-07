import test from 'ava';

import { Quaternion } from '../spatial/quaternion';

import { QuaternionSequence } from './quaternion-sequence';

const fakeArray = Float32Array.from([1, 2, 3]);


test('QuaternionSequence - constructor', (t) => {
	const qSeq = new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray, 300);

	t.like(qSeq, {
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		w: fakeArray,
		length: 3,
		frameRate: 300,
	});
});

test('QuaternionSequence - fromArray', (t) => {
	const qSeq = QuaternionSequence.fromArray([fakeArray, fakeArray, fakeArray, fakeArray]);

	t.like(qSeq, {
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		w: fakeArray,
		length: 3,
	});
});

test('QuaternionSequence - getComponent', (t) => {
	const qSeq = new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray, 300);

	for (const comp of qSeq.components) {
		t.is(qSeq.getComponent(comp), fakeArray);
	}

	t.is(qSeq.getComponent('wrongComponent'), undefined);
});

test('QuaternionSequence - getQuaternionAtFrame', (t) => {
	const qSeq = new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray, 300);

	t.like(qSeq.getQuaternionAtFrame(2), { x: 2, y: 2, z: 2, w: 2 });

	const qSeqComp = new Quaternion(5, 6, 7, 8);

	t.like(qSeq.getQuaternionAtFrame(2, qSeqComp), { x: 2, y: 2, z: 2, w: 2 });

	t.like(qSeqComp, { x: 2, y: 2, z: 2, w: 2 });
});

test('QuaternionSequence - fromQuaternionArray', (t) => {
	const quats = [];

	for (let i = 0; i < 4; i++) {
		quats.push(new Quaternion(i, i, i, i));
	}

	const qSeq = QuaternionSequence.fromQuaternionArray(quats);
	const compArray = Float32Array.from([0, 1, 2, 3]);

	t.like(qSeq, {
		x: compArray,
		y: compArray,
		z: compArray,
		w: compArray,
		length: 4,
	});
});

test('QuaternionSequence - invert', (t) => {
	const qSeq = new QuaternionSequence(
		Float32Array.from([0.1300, 0.1267, 0.1243]),
		Float32Array.from([-0.1210, -0.1188, -0.1186]),
		Float32Array.from([-0.6676, -0.6672, -0.6655]),
		Float32Array.from([0.7230, 0.7243, 0.7264]),
	);
   
	const result = QuaternionSequence.invert(qSeq);	

	t.deepEqual(Array.from(result.x), [-0.13000522553920746, -0.126708522439003, -0.12429209053516388]);
	t.deepEqual(Array.from(result.y), [0.1210048720240593, 0.11880799382925034, 0.11859245598316193]);
	t.deepEqual(Array.from(result.z), [0.6676268577575684, 0.6672449111938477, 0.6654576063156128]);
	t.deepEqual(Array.from(result.w), [0.7230291366577148, 0.7243487238883972, 0.7263537645339966]);
});

test('QuaternionSequence - multiply', (t) => {
	const q0 = new QuaternionSequence(
		new Float32Array([0, 1, 2]),
		new Float32Array([1, 2, 3]),
		new Float32Array([2, 3, 4]),
		new Float32Array([3, 4, 5])
	);

	const q1 = new QuaternionSequence(
		new Float32Array([3, 4, 5]),
		new Float32Array([4, 5, 6]),
		new Float32Array([5, 6, 7]),
		new Float32Array([6, 7, 8])
	);

	const r0 = q0.multiply(q1);

	t.deepEqual(Array.from(r0.x), [6, 20, 38], 'x');
	t.deepEqual(Array.from(r0.y), [24, 40, 60], 'y');
	t.deepEqual(Array.from(r0.z), [24, 42, 64], 'z');
	t.deepEqual(Array.from(r0.w), [4, -4, -16], 'w');

	const r1 = new QuaternionSequence(new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3));
	q0.multiply(q1, r1);

	t.deepEqual(Array.from(r1.x), [6, 20, 38], 'x');
	t.deepEqual(Array.from(r1.y), [24, 40, 60], 'y');
	t.deepEqual(Array.from(r1.z), [24, 42, 64], 'z');
	t.deepEqual(Array.from(r1.w), [4, -4, -16], 'w');
});