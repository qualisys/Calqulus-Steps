import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Marker } from '../../models/marker';
import { Signal } from '../../models/signal';

import { MarkerStep } from './marker';

/**
 * This test is testing the input parsing of the mockStep function.
 * YAML parsing is tested in the corresponding test in the engine lib.
 */

const a1 = f32(1, 2, 3, 4, 5);
const m1 = new Marker('MyMarker', a1, a1, a1);
const s1 = new Signal(m1, undefined, 'MyMarker');

const originSignals = [ new Signal(1), new Signal(2), new Signal(3) ];

test('MarkerStep (mock) - prepare node (single input)', async(t) => {
	const node = mockStep(MarkerStep, { myMarker1: s1 }).node;
	t.deepEqual(node.in, ['marker://myMarker1']);
});

test('MarkerStep (mock) - prepare node (multiple inputs)', async(t) => {
	const node = mockStep(MarkerStep, { myMarker1: s1, myMarker2: s1 }).node;
	t.deepEqual(node.in, ['marker://myMarker1', 'marker://myMarker2']);
});

test('MarkerStep (mock) - prepare node (already prepared input)', async(t) => {
	const node = mockStep(MarkerStep, { 'marker://myMarker1': s1 }).node;
	t.deepEqual(node.in, ['marker://myMarker1']);
});

test('MarkerStep (mock) - process', async(t) => {
	const res = await mockStep(MarkerStep, { myMarker1: s1 }).process();

	t.is(res.name, 'MyMarker');
	t.deepEqual(res.getVectorSequenceValue(), s1.getVectorSequenceValue());
});

test('MarkerStep (mock) - virtual marker - no main input)', async(t) => {
	const res = await mockStep(MarkerStep, [], { origin: originSignals }).process();
	const resVector = res.getVectorSequenceValue();

	t.deepEqual(Array.from(resVector.x), [1]);
	t.deepEqual(Array.from(resVector.y), [2]);
	t.deepEqual(Array.from(resVector.z), [3]);
});

test('MarkerStep (mock) - virtual marker - with main input)', async(t) => {
	const res = await mockStep(MarkerStep, { 
		'marker://myMarker': s1
	}, {
		origin: originSignals
	}).process();
	
	const resVector = res.getVectorSequenceValue();

	t.deepEqual(Array.from(resVector.x), [1]);
	t.deepEqual(Array.from(resVector.y), [2]);
	t.deepEqual(Array.from(resVector.z), [3]);
});