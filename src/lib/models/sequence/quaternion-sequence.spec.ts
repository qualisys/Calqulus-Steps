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