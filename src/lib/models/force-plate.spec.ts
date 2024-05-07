import test from 'ava';

import { ForcePlate } from './force-plate';

const corners = [
	{ x: 0, y: 0, z: 0 },
	{ x: 0, y: 1, z: 0 },
	{ x: 1, y: 1, z: 0 },
	{ x: 1, y: 0, z: 0 },
];

const fp = new ForcePlate('forceplate 1', corners, 100, 200, { x: 0, y: 0, z: 0 }, 10, true);

test('ForcePlate - constructor', (t) => {
	t.is(fp.name, 'forceplate 1');
	t.is(fp.corners, corners);
	t.is(fp.width, 100);
	t.is(fp.length, 200);
	t.deepEqual(fp.offset, { x: 0, y: 0, z: 0 });
	t.is(fp.copLevelZ, 10);
	t.is(fp.copFilter, true);
});

test('ForcePlate - setMetadata', (t) => {
	t.is(fp.amplifierSerial, null);
	t.is(fp.serial, null);

	fp.setMetadata('Qualisys', 'FP1', '123', '456', 'world');

	t.is(fp.type, 'Qualisys');
	t.is(fp.model, 'FP1');
	t.is(fp.serial, '123');
	t.is(fp.amplifierSerial, '456');
	t.is(fp.coordinateSystem, 'world');
});