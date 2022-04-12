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