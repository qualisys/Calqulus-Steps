import test from 'ava';

import { f32 } from '../../test-utils/mock-step';

import { ForcePlate } from './force-plate';
import { VectorSequence } from './sequence/vector-sequence';

const corners = [
	{ x: 0, y: 0, z: 0 },
	{ x: 0, y: 1, z: 0 },
	{ x: 1, y: 1, z: 0 },
	{ x: 1, y: 0, z: 0 },
];

const cop = new VectorSequence(f32(1, 2, 3), f32(4, 5, 6), f32(7, 8, 9), 100);
const force = new VectorSequence(f32(1, 2, 3), f32(4, 5, 6), f32(7, 8, 9), 100);
const moment = new VectorSequence(f32(1, 2, 3), f32(4, 5, 6), f32(7, 8, 9), 100);

const fp = new ForcePlate('forceplate 1', cop, force, moment);

fp.corners = corners;
fp.dimensions = {
	width: 100,
	length: 200,
};
fp.offset = { x: 0, y: 0, z: 0 };
fp.copLevelZ = 10;
fp.copFilter = true;

test('ForcePlate - constructor', (t) => {
	t.is(fp.name, 'forceplate 1');
	
	t.is(fp.centerOfPressure, cop);
	t.is(fp.force, force);
	t.is(fp.moment, moment);

	t.is(fp.corners, corners);
	t.is(fp.dimensions.width, 100);
	t.is(fp.dimensions.length, 200);
	t.deepEqual(fp.offset, { x: 0, y: 0, z: 0 });
	t.is(fp.copLevelZ, 10);
	t.is(fp.copFilter, true);

	t.is(fp.length, 3);

	t.is(fp.x, cop.x);
	t.is(fp.y, cop.y);
	t.is(fp.z, cop.z);

	t.is(fp.fx, force.x);
	t.is(fp.fy, force.y);
	t.is(fp.fz, force.z);

	t.is(fp.mx, moment.x);
	t.is(fp.my, moment.y);
	t.is(fp.mz, moment.z);
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

test('ForcePlate - reassign sequence data', (t) => {
	const fp2 = new ForcePlate('forceplate 1', cop, force, moment);

	t.is(fp2.centerOfPressure, cop);
	t.is(fp2.force, force);
	t.is(fp2.moment, moment);
	t.deepEqual(fp2.array, [
		f32(1, 2, 3),
		f32(4, 5, 6),
		f32(7, 8, 9),
		f32(1, 2, 3),
		f32(4, 5, 6),
		f32(7, 8, 9),
		f32(1, 2, 3),
		f32(4, 5, 6),
		f32(7, 8, 9),
	]);

	t.is(fp2.x, cop.x);
	t.is(fp2.y, cop.y);
	t.is(fp2.z, cop.z);

	t.is(fp2.fx, force.x);
	t.is(fp2.fy, force.y);
	t.is(fp2.fz, force.z);

	t.is(fp2.mx, moment.x);
	t.is(fp2.my, moment.y);
	t.is(fp2.mz, moment.z);

	t.is(fp2.frameRate, 100);

	fp2.centerOfPressure = new VectorSequence(f32(10, 20, 30), f32(40, 50, 60), f32(70, 80, 90), 1000);
	fp2.force = new VectorSequence(f32(100, 200, 300), f32(400, 500, 600), f32(700, 800, 900), 1000);
	fp2.moment = new VectorSequence(f32(1000, 2000, 3000), f32(4000, 5000, 6000), f32(7000, 8000, 9000), 1000);

	t.deepEqual(fp2.array, [
		f32(10, 20, 30),
		f32(40, 50, 60),
		f32(70, 80, 90),
		f32(100, 200, 300),
		f32(400, 500, 600),
		f32(700, 800, 900),
		f32(1000, 2000, 3000),
		f32(4000, 5000, 6000),
		f32(7000, 8000, 9000),
	]);

	t.is(fp2.x, fp2.centerOfPressure.x);
	t.is(fp2.y, fp2.centerOfPressure.y);
	t.is(fp2.z, fp2.centerOfPressure.z);

	t.is(fp2.fx, fp2.force.x);
	t.is(fp2.fy, fp2.force.y);
	t.is(fp2.fz, fp2.force.z);

	t.is(fp2.mx, fp2.moment.x);
	t.is(fp2.my, fp2.moment.y);
	t.is(fp2.mz, fp2.moment.z);

	t.is(fp2.frameRate, 1000);
});

test('ForcePlate - getComponent', (t) => {
	t.deepEqual(fp.getComponent('x'), fp.x);
	t.deepEqual(fp.getComponent('y'), fp.y);
	t.deepEqual(fp.getComponent('z'), fp.z);
	t.deepEqual(fp.getComponent('fx'), fp.fx);
	t.deepEqual(fp.getComponent('fy'), fp.fy);
	t.deepEqual(fp.getComponent('fz'), fp.fz);
	t.deepEqual(fp.getComponent('mx'), fp.mx);
	t.deepEqual(fp.getComponent('my'), fp.my);
	t.deepEqual(fp.getComponent('mz'), fp.mz);
});

test('ForcePlate - from array', (t) => {
	const array = fp.array;
	const fp2 = ForcePlate.fromArray('forceplate 2', array);

	t.is(fp2.name, 'forceplate 2');
	t.deepEqual(fp2.array, array);
});
