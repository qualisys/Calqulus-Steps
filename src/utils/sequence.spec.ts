import test from 'ava';

import { Signal } from '../models/signal';

import { SequenceUtil } from './sequence';

const f32 = (...arr: number[]) => Float32Array.from(arr);
const i32 = (...arr: number[]) => Uint32Array.from(arr);

const s1 = new Signal(f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9));
test('SequenceUtil - sequenceByFrameMap - 2 inputs', (t) => {
	const res = SequenceUtil.sequenceByFrameMap(
		s1.getFrames(i32(1, 5, 8)),
		s1.getFrames(i32(3, 6, 7, 9)),
	);

	t.deepEqual(res.map(s => s.getValue()), [f32(1, 5, 8), f32(3, 6, 9)]);
});

test('SequenceUtil - sequenceByFrameMap - 2 inputs, some with equal indices', (t) => {
	const res = SequenceUtil.sequenceByFrameMap(
		s1.getFrames(i32(3, 5, 8)),
		s1.getFrames(i32(3, 6, 7, 9)),
	);

	t.deepEqual(res.map(s => s.getValue()), [f32(3, 5, 8), f32(3, 6, 9)]);
});

test('SequenceUtil - sequenceByFrameMap - 2 inputs, reversed order', (t) => {
	const res = SequenceUtil.sequenceByFrameMap(
		s1.getFrames(i32(3, 6, 7, 9)),
		s1.getFrames(i32(1, 5, 8)),
	);

	t.deepEqual(res.map(s => s.getValue()), [f32(3, 6), f32(5, 8)]);
});

test('SequenceUtil - sequenceByFrameMap - 3 inputs', (t) => {
	const res = SequenceUtil.sequenceByFrameMap(
		s1.getFrames(i32(1, 5, 8)),
		s1.getFrames(i32(3, 6, 7, 9)),
		s1.getFrames(i32(4, 7, 8, 9)),
	);

	t.deepEqual(res.map(s => s.getValue()), [f32(1, 5, 8), f32(3, 6, 9), f32(4, 7, 9)]);
});

test('SequenceUtil - sequenceByFrameMap - not all signals have frames', (t) => {
	const s1Frames = s1.getFrames(i32(3, 6, 7, 9));
	
	const res = SequenceUtil.sequenceByFrameMap(
		s1,
		s1Frames,
	);

	// The untouched signals should be returned.
	t.is(res.length, 2);
	t.is(res[0], s1);
	t.is(res[1], s1Frames);
});

test('SequenceUtil - sequenceByFrameMap - 2 inputs - wrong order', (t) => {
	const res = SequenceUtil.sequenceByFrameMap(
		s1.getFrames(i32(3)),
		s1.getFrames(i32(1)),
	);

	t.is(res.length, 0);
});

test('SequenceUtil - sequenceByFrameMap - all frameMaps empty - returns signals unchanged', (t) => {
	// Both signals have a frameMap set but it is empty, triggering the
	// `maps.every(m => m.length === 0)` branch.
	const sig1 = s1.shallowCopy();
	sig1.frameMap = i32();
	const sig2 = s1.shallowCopy();
	sig2.frameMap = i32();

	const res = SequenceUtil.sequenceByFrameMap(sig1, sig2);

	t.is(res.length, 2);
	t.is(res[0], sig1);
	t.is(res[1], sig2);
});

test('SequenceUtil - sequenceByFrameMap - maxFrame is -Infinity - returns empty array', (t) => {
	// With no signals, maps = [] and Math.max(...[]) === -Infinity,
	// triggering the `maxFrame === -Infinity` branch and returning signals (empty).
	const res = SequenceUtil.sequenceByFrameMap();

	t.is(res.length, 0);
});
