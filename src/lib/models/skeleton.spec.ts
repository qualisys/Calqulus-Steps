import test from 'ava';

import { Segment } from './segment';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { Skeleton } from './skeleton';

const fakeArray = Float32Array.from([1, 2, 3]);

const segmentHead = new Segment(
	'head', 
	new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
	new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
	300
);

const segmentHip = new Segment(
	'hip', 
	new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
	new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
	300
);

const segmentFoot = new Segment(
	'foot', 
	new VectorSequence(fakeArray, fakeArray, fakeArray, 300),
	new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray),
	300
);

const skeleton = new Skeleton('test', [segmentHead, segmentHip, segmentFoot]);

test('Skeleton - constructor', (t) => {
	t.is(skeleton.name, 'test');
});

test('Skeleton - getSegment', (t) => {
	t.is(skeleton.getSegment('head'), segmentHead);
	t.is(skeleton.getSegment('hip'), segmentHip);
	t.is(skeleton.getSegment('foot'), segmentFoot);
	
	t.throws(() => {
		skeleton.getSegment('toe');
	}, { message: 'Skeleton: No segment named \'toe\'' });
});