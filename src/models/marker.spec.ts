import test from 'ava';

import { Marker } from './marker';

const fakeArray = Float32Array.from([1, 2, 3]);

test('Marker - constructor', (t) => {
	const marker = new Marker(
		'test',
		fakeArray,
		fakeArray,
		fakeArray,
		300
	);

	t.like(marker, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
		frameRate: 300,
	});
});

test('Marker - clone', (t) => {
	const marker = new Marker(
		'test',
		fakeArray,
		fakeArray,
		fakeArray,
		300
	);

	const clone = marker.clone();

	t.not(clone, marker, 'Clone should be a different instance');
	t.deepEqual(clone, marker, 'Clone should have the same properties as the original');
	t.not(clone.x, marker.x, 'Clone x array should be a different instance');
	t.not(clone.y, marker.y, 'Clone y array should be a different instance');
	t.not(clone.z, marker.z, 'Clone z array should be a different instance');
	t.deepEqual(clone.x, marker.x, 'Clone x array should have the same values');
	t.deepEqual(clone.y, marker.y, 'Clone y array should have the same values');
	t.deepEqual(clone.z, marker.z, 'Clone z array should have the same values');
});

test('Marker - fromArray', (t) => {
	const marker = Marker.fromArray(
		'test',
		[fakeArray, fakeArray, fakeArray]
	);

	t.like(marker, {
		name: 'test',
		x: fakeArray,
		y: fakeArray,
		z: fakeArray,
	});
});