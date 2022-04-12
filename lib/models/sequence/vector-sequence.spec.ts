import test from 'ava';

import { Vector } from '../spatial/vector';

import { VectorSequence } from './vector-sequence';

const fakeArray = Float32Array.from([1, 2, 3]);

test('VectorSequence - constructor', (t) => {
	const vSeq = new VectorSequence(fakeArray, fakeArray, fakeArray, 300);

	t.like(vSeq, {
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		length: 3,
		frameRate: 300,
	});
});

test('VectorSequence - cross', (t) => {
	const x1 = Float32Array.from([1, 1, 0]);
	const y1 = Float32Array.from([0, 0, 1]);
	const z1 = Float32Array.from([0, 0, 0]);

	const x2 = Float32Array.from([0, 0, 0]);
	const y2 = Float32Array.from([1, 1, 0]);
	const z2 = Float32Array.from([0, 0, 1]);

	const v1 = new VectorSequence(x1, y1, z1, 300);
	const v2 = new VectorSequence(x2, y2, z2, 300);

	const crossProduct = v1.cross(v2);

	t.deepEqual(
		[
			Array.from(crossProduct.x),
			Array.from(crossProduct.y),
			Array.from(crossProduct.z)
		],
		[
			[0, 0, 1],
			[0, 0, 0],
			[1, 1, 0]
		],
		'Cross product is not orthogonal to v1 and v2'
	);
});

test('VectorSequence - fromArray', (t) => {
	const vSeq = VectorSequence.fromArray(null, [
		new Float32Array([1, 1, 1]),
		new Float32Array([2, 2, 2]),
		new Float32Array([3, 3, 3])
	]);

	t.deepEqual(
		[
			Array.from(vSeq.x),
			Array.from(vSeq.y),
			Array.from(vSeq.z)
		],
		[
			[1, 1, 1],
			[2, 2, 2],
			[3, 3, 3]
		],
		'VectorSequence.fromArray returns unexpected result'
	);
});

test('VectorSequence - fromFloats', (t) => {
	const vSeq = VectorSequence.fromFloats(1, 2, 3);

	t.deepEqual(
		[
			Array.from(vSeq.x),
			Array.from(vSeq.y),
			Array.from(vSeq.z)
		],
		[[1], [2], [3]],
		'VectorSequence.fromFloats returns unexpected result'
	);
});

test('VectorSequence - getComponent', (t) => {
	const vSeq = new VectorSequence(fakeArray, fakeArray, fakeArray, 300);

	for (const comp of vSeq.components) {
		t.is(vSeq.getComponent(comp), fakeArray);
	}

	t.is(vSeq.getComponent('wrongComponent'), undefined);
});

test('VectorSequence - normalize', (t) => {
	const vSeq = new VectorSequence(fakeArray, fakeArray, fakeArray, 300);
	const normalized = vSeq.normalize();

	const eqish = (a, b, threshold = 1 / 100000000000000) => {
		return Math.abs(a - b) < threshold;
	}

	t.true(eqish(Math.sqrt(
		normalized.x[0] * normalized.x[0]
		+ normalized.y[0] * normalized.y[0]
		+ normalized.z[0] * normalized.z[0]
	), 1, 0.000001), 'Magnitude of normalized vector does not equal 1');
});

test('VectorSequence - getVectorAtFrame', (t) => {
	const vSeq = new VectorSequence(fakeArray, fakeArray, fakeArray, 300);

	t.like(vSeq.getVectorAtFrame(2), { x: 2, y: 2, z: 2 });

	const vSeqComp = new Vector(5, 6, 7);

	t.like(vSeq.getVectorAtFrame(2, vSeqComp), { x: 2, y: 2, z: 2 });

	t.like(vSeqComp, { x: 2, y: 2, z: 2 });
});

test('VectorSequence - subtract', (t) => {
	const revFakeArray = Float32Array.from([3, 2, 1]);

	const vSeq1 = new VectorSequence(fakeArray, fakeArray, fakeArray, 300);
	const vSeq2 = new VectorSequence(revFakeArray, revFakeArray, revFakeArray, 300);

	const subSeq = Float32Array.from([-2, 0, 2]);

	t.like(vSeq1.subtract(vSeq2), { x: subSeq, y: subSeq, z: subSeq });

	const emptyArr = new Float32Array(3);
	const vSeqComp = new VectorSequence(emptyArr, emptyArr, emptyArr, 300);

	t.like(vSeq1.subtract(vSeq2, vSeqComp), { x: subSeq, y: subSeq, z: subSeq });
	t.like(vSeqComp, { x: subSeq, y: subSeq, z: subSeq });
});