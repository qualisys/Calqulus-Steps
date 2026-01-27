import test from 'ava';

import { Plane } from '../spatial/plane';

import { PlaneSequence } from './plane-sequence';
import { VectorSequence } from './vector-sequence';

const f32 = (...arr: number[]) => Float32Array.from(arr);

const fakeArray = f32(1, 2, 3);

test('PlaneSequence - constructor', (t) => {
	const pSeq = new PlaneSequence(fakeArray, fakeArray, fakeArray, fakeArray);

	t.like(pSeq, {
		a: fakeArray,
		b: fakeArray,
		c: fakeArray,
		d: fakeArray,
		length: 3,
	});
});

test('PlaneSequence - fromArray', (t) => {
	const pSeq = PlaneSequence.fromArray([fakeArray, fakeArray, fakeArray, fakeArray]);

	t.like(pSeq, {
		a: fakeArray,
		b: fakeArray,
		c: fakeArray,
		d: fakeArray,
		length: 3,
	});
});

test('PlaneSequence - getComponent', (t) => {
	const pSeq = new PlaneSequence(fakeArray, fakeArray, fakeArray, fakeArray);

	for (const comp of pSeq.components) {
		t.is(pSeq.getComponent(comp), fakeArray);
	}

	t.is(pSeq.getComponent('wrongComponent'), undefined);
});

test('PlaneSequence - getPlaneAtFrame', (t) => {
	const pSeq = new PlaneSequence(fakeArray, fakeArray, fakeArray, fakeArray);

	t.like(pSeq.getPlaneAtFrame(2), { a: 2, b: 2, c: 2, d: 2 });

	const pSeqComp = new Plane(5, 6, 7, 8);

	t.like(pSeq.getPlaneAtFrame(2, pSeqComp), { a: 2, b: 2, c: 2, d: 2 });

	t.like(pSeqComp, { a: 2, b: 2, c: 2, d: 2 });
});

test('PlaneSequence - fromVectorSequence', (t) => {
	const vs1 = new VectorSequence(
		f32(1, 1, 1, 1, 1),
		f32(-2, -2, -2, -2 , -2),
		f32(1, 1, 1, 1, 1),
	);
	const vs2 = new VectorSequence(
		f32(4, 4, 4, 4, 4),
		f32(-2, -2, -2, -2, -2),
		f32(-2, -2, -2, -2, -2),
	);
	const vs3 = new VectorSequence(
		f32(4, 4, 4, 4, 4),
		f32(1, 1, 1, 1, 1),
		f32(4, 4, 4, 4, 4),
	);

	const pSeq = PlaneSequence.fromVectorSequence(vs1, vs2, vs3);

	t.is(pSeq.length, 5);
	t.like(pSeq.getPlaneAtFrame(1), { a: 9,  b: -18, c: 9,  d: -54 });
});

test('PlaneSequence - project', (t) => {
	const vs = new VectorSequence(
		f32(5, 5, 5, 5, 5),
		f32(-6, -6, -6, -6, -6),
		f32(3, 3, 3, 3, 3),
	);

	const ps = new PlaneSequence(
		f32(3, 3, 3, 3, 3),
		f32(-2, -2, -2, -2, -2),
		f32(1, 1, 1, 1, 1),
		f32(-2, -2, -2, -2, -2),
	);

	const pSeq = PlaneSequence.project(vs, ps);

	t.is(pSeq.length, 5);
	t.like(pSeq.getVectorAtFrame(1), { x: -1, y: -2, z: 1});
});