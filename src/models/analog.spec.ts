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

test('Analog - clone', (t) => {
	const a = new Analog(
		'test',
		fakeArray,
		300
	);

	const clone = a.clone();

	t.not(clone, a, 'Clone should be a different instance');
	t.deepEqual(clone.signal, a.signal, 'Signal arrays should be equal in content');
	t.not(clone.signal, a.signal, 'Signal arrays should not be the same reference');
	t.is(clone.name, a.name, 'Names should be equal');
	t.is(clone.frameRate, a.frameRate, 'Frame rates should be equal');
	t.true(Analog.isAnalog(clone), 'Clone should be recognized as Analog');
});

test('Analog - length', (t) => {
	const a = new Analog(
		'test',
		fakeArray,
		300
	);

	t.is(a.length, 3);

	const b = new Analog(
		'test',
		new Float32Array(),
		300
	);

	t.is(b.length, 0);

	const c = new Analog(
		'test',
		undefined,
		300
	);

	t.is(c.length, 0);
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
