import test from 'ava';

import { Property, PropertyType } from './property';
import { Signal, SignalType } from './signal';

test('Property.typeToString', (t) => {
	t.is(Property.typeToString(PropertyType.Any), 'Any');
	t.is(Property.typeToString(PropertyType.Array), 'Array');
	t.is(Property.typeToString(PropertyType.Boolean), 'Boolean');
	t.is(Property.typeToString(PropertyType.Duration), 'Duration');
	t.is(Property.typeToString(PropertyType.Map), 'Map');
	t.is(Property.typeToString(PropertyType.Number), 'Number');
	t.is(Property.typeToString(PropertyType.String), 'String');
	t.is(Property.typeToString(undefined), 'Invalid type');
});

test('Property.validateSignalType', (t) => {
	t.is(Property.validateSignalType(SignalType.String, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.String, PropertyType.String), true);
	t.is(Property.validateSignalType(SignalType.String, PropertyType.Array), false);

	t.is(Property.validateSignalType(SignalType.Float32, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.Float32, PropertyType.Number), true);
	t.is(Property.validateSignalType(SignalType.Float32, PropertyType.Boolean), false);

	t.is(Property.validateSignalType(SignalType.Float32Array, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.Float32Array, PropertyType.Array), true);
	t.is(Property.validateSignalType(SignalType.Float32Array, PropertyType.Map), false);

	t.is(Property.validateSignalType(SignalType.Float32ArrayArray, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.Float32ArrayArray, PropertyType.Array), true);
	t.is(Property.validateSignalType(SignalType.Float32ArrayArray, PropertyType.Number), false);

	t.is(Property.validateSignalType(SignalType.PlaneSequence, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.PlaneSequence, PropertyType.Array), false);

	t.is(Property.validateSignalType(SignalType.Segment, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.Segment, PropertyType.String), false);

	t.is(Property.validateSignalType(SignalType.Uint32Array, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.Uint32Array, PropertyType.Array), true);
	t.is(Property.validateSignalType(SignalType.Uint32Array, PropertyType.Number), false);

	t.is(Property.validateSignalType(SignalType.VectorSequence, PropertyType.Any), true);
	t.is(Property.validateSignalType(SignalType.VectorSequence, PropertyType.Array), false);
});

test('Property.validateSignalTypes', (t) => {
	const stringSignal = new Signal('my string');
	const float32Signal = new Signal(10);

	t.is(Property.validateSignalTypes([stringSignal], [PropertyType.Any, PropertyType.Number]), true);
	t.is(Property.validateSignalTypes([stringSignal], [PropertyType.Number, PropertyType.String]), true);
	t.is(Property.validateSignalTypes([stringSignal], [PropertyType.Number, PropertyType.Array]), false);

	t.is(Property.validateSignalTypes([float32Signal], [PropertyType.String, PropertyType.Any]), true);
	t.is(Property.validateSignalTypes([float32Signal], [PropertyType.Number, PropertyType.Boolean]), true);
	t.is(Property.validateSignalTypes([float32Signal], [PropertyType.String, PropertyType.Boolean]), false);

	t.is(Property.validateSignalTypes([stringSignal, float32Signal], PropertyType.Any), true);
	t.is(Property.validateSignalTypes([stringSignal, float32Signal], PropertyType.Number), false);
	t.is(Property.validateSignalTypes([stringSignal, float32Signal], [PropertyType.String, PropertyType.Any]), true);
	t.is(Property.validateSignalTypes([stringSignal, float32Signal], [PropertyType.Number, PropertyType.String]), true);
	t.is(Property.validateSignalTypes([stringSignal, float32Signal], [PropertyType.Boolean, PropertyType.String]), false);
});