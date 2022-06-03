import test from 'ava';

import { f32 } from '../../test-utils/mock-step';
import { Signal } from '../models/signal';

import { VectorInputParser } from './vector-input-parser';

test('Space - VectorInputParser - single float32 array', async t => {
	// length 3
	let vec = VectorInputParser.parse('', [new Signal(f32(1, 2, 3))]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });

	// length 5
	vec = VectorInputParser.parse('', [new Signal(f32(1, 2, 3, 4, 5))]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });

	// length 6
	vec = VectorInputParser.parse('', [new Signal(f32(1, 2, 3, 4, 5, 6))]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });
});

test('Space - VectorInputParser - multiple float32 arrays', async t => {
	// length 1
	let vec = VectorInputParser.parse('', [new Signal(f32(1)), new Signal(f32(2)), new Signal(f32(3))]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });

	// length 3
	vec = VectorInputParser.parse('', [new Signal(f32(1, 2, 3)), new Signal(f32(2, 3, 4)), new Signal(f32(3, 4, 5))]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1, 2, 3), y: f32(2, 3, 4), z: f32(3, 4, 5) });
});

test('Space - VectorInputParser - multiple floats', async t => {
	// length 3
	let vec = VectorInputParser.parse('', [new Signal(1), new Signal(2), new Signal(3)]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });

	// length 5
	vec = VectorInputParser.parse('', [new Signal(1), new Signal(2), new Signal(3), new Signal(4), new Signal(5)]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });

	// length 6
	vec = VectorInputParser.parse('', [new Signal(1), new Signal(2), new Signal(3), new Signal(4), new Signal(5), new Signal(6)]);
	t.is(vec.length, 1);
	t.like(vec[0], { x: f32(1), y: f32(2), z: f32(3) });
});

test('Space - VectorInputParser - invalid inputs', async t => {
	// Float32array, too few values
	t.throws(() => VectorInputParser.parse('', [new Signal(f32(1, 2))]));
	t.throws(() => VectorInputParser.parse('', [new Signal(f32(1))]));

	// Unsupported types
	t.throws(() => VectorInputParser.parse('', [new Signal([f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3)])]));
	t.throws(() => VectorInputParser.parse('', [new Signal(Uint32Array.from([1, 2, 3]))]));
	t.throws(() => VectorInputParser.parse('', [new Signal('String value')]));
});