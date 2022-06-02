import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Segment } from '../../models/segment';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { Signal } from '../../models/signal';

import { SegmentStep } from './segment';

/**
 * This test is testing the input parsing of the mockStep function.
 * YAML parsing is tested in the corresponding test in the engine lib.
 */

const a1 = f32(1, 2, 3);
const s1 = new Signal(new Segment('MySegment', new VectorSequence(a1, a1, a1), new QuaternionSequence(a1, a1, a1, a1)), undefined, 'MySegment');

const originSignals        = [ new Signal(1), new Signal(2), new Signal(3) ];
const primaryAxisSignals   = [ new Signal(0), new Signal(1), new Signal(0) ];
const secondaryAxisSignals = [ new Signal(1), new Signal(0), new Signal(0) ];

test('SegmentStep (mock) - Input errors', async(t) => {
	// Origin, but no primaryAxis
	await t.throwsAsync(mockStep(SegmentStep, [], { origin: s1 }).process());

	// primaryAxis, but no secondaryAxis
	await t.throwsAsync(mockStep(SegmentStep, [], { primaryAxis: s1 }).process());

	// secondaryAxis, but no primaryAxis
	await t.throwsAsync(mockStep(SegmentStep, [], { secondaryAxis: s1 }).process());
});

test('SegmentStep (mock) - simple input', async(t) => {
	const node = mockStep(SegmentStep, [s1]);
	const res = await node.process();

	t.is(res.getValue(), s1.getValue());
});

test('SegmentStep (mock) - prepare node (single input)', async(t) => {
	const node = mockStep(SegmentStep, { mySegment1: s1 }).node;
	t.deepEqual(node.in, ['segment://mySegment1']);
});

test('SegmentStep (mock) - prepare node (multiple inputs)', async(t) => {
	const node = mockStep(SegmentStep, { mySegment1: s1, mySegment2: s1 }).node;
	t.deepEqual(node.in, ['segment://mySegment1', 'segment://mySegment2']);
});

test('SegmentStep (mock) - prepare node (already prepared input)', async(t) => {
	const node = mockStep(SegmentStep, { 'segment://mySegment1': s1 }).node;
	t.deepEqual(node.in, ['segment://mySegment1']);
});

test('SegmentStep (mock) - virtual segment (missing options)', async(t) => {
	await t.throwsAsync(mockStep(SegmentStep, { 
		'segment://mySegment1': s1 
	}, { 
		origin: originSignals, 
		primaryAxis: [],
	}).process());
});

test('SegmentStep (mock) - virtual segment - default order (xy)', async(t) => {
	const res = await mockStep(SegmentStep, { 
		'segment://mySegment1': s1 
	}, { 
		origin: originSignals, 
		primaryAxis: primaryAxisSignals, 
		secondaryAxis: secondaryAxisSignals, 
	}).process();

	const segment = res.getSegmentValue();

	t.deepEqual(Array.from(segment.x), [1]);
	t.deepEqual(Array.from(segment.y), [2]);
	t.deepEqual(Array.from(segment.z), [3]);
	t.deepEqual(Array.from(segment.rx), [0.7071067690849304]);
	t.deepEqual(Array.from(segment.ry), [0.7071067690849304]);
	t.deepEqual(Array.from(segment.rz), [0]);
	t.deepEqual(Array.from(segment.rw), [0]);
});

test('SegmentStep (mock) - virtual segment - explicit order (yz)', async(t) => {
	const res = await mockStep(SegmentStep, { 
		'segment://mySegment1': s1 
	}, { 
		origin: originSignals, 
		primaryAxis: primaryAxisSignals, 
		secondaryAxis: secondaryAxisSignals, 
		order: 'yz',
	}).process();

	const segment = res.getSegmentValue();

	t.deepEqual(Array.from(segment.x), [1]);
	t.deepEqual(Array.from(segment.y), [2]);
	t.deepEqual(Array.from(segment.z), [3]);
	t.deepEqual(Array.from(segment.rx), [0]);
	t.deepEqual(Array.from(segment.ry), [0.7071067690849304]);
	t.deepEqual(Array.from(segment.rz), [0]);
	t.deepEqual(Array.from(segment.rw), [0.7071067690849304]);
});