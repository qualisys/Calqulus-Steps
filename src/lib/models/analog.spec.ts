import test from 'ava';

import { Analog } from './analog';

const fakeArray = Float32Array.from([1, 2, 3]);

test('Analog - constructor', (t) => {
	const a = new Analog(
		'test',
		fakeArray,
		300
	);

	t.like(a, {
		name: 'test',
		signal: fakeArray,
		frameRate: 300,
	});
});

test('Analog - length', (t) => {
	const a = new Analog(
		'test',
		fakeArray,
		300
	);

	t.is(a.length, 3);
});

test('Analog - getComponent', (t) => {
	const a = new Analog(
		'test',
		fakeArray,
		300
	);

	t.is(a.getComponent('signal'), fakeArray);
	t.is(a.getComponent('wrongComponent'), undefined);
});
