import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { Space } from './space';

const hipsTowardsX = new Segment('Hips', 
	new VectorSequence( f32(1076.73, 1075.956), f32(324.277, 324.182), f32(1000.48, 998.467) ),
	new QuaternionSequence( f32(-0.076565, -0.076792), f32(0.030934, 0.028671), f32(-0.720501, -0.720117), f32(0.68852, 0.688994 ) )
);

const hipsTowardsY = new Segment('Hips', 
	new VectorSequence( f32(-323.022, -322.758), f32(1090.597, 1089.995), f32(1000.207, 998.027) ),
	new QuaternionSequence( f32(-0.077736, -0.075664), f32(-0.032416, -0.035248), f32(-0.022033, -0.02112), f32(0.996203, 0.996286) )
);

const hipsTowardsNegX = new Segment('Hips', 
	new VectorSequence( f32(-1090.465, -1089.706), f32(-322.987, -322.943), f32(1000.112, 998.191) ),
	new QuaternionSequence( f32(-0.033289, -0.030696), f32(-0.078753, -0.077999), f32(0.688342, 0.688541), f32(0.72033, 0.720337) )
);

const hipsTowardsNegY = new Segment('Hips', 
	new VectorSequence( f32(322.73, 322.753), f32(-1090.594, -1089.546), f32(1000.63, 998.634) ),
	new QuaternionSequence( f32(0.034182, 0.035225), f32(-0.080304, -0.077724), f32(0.995866, 0.996057), f32(0.02517, 0.02426) )
);

// Test input failures
test('Space - input failures', async (t) => {
	t.throws(() => {
		mockStep(Space, [], { 
			origin: '[0, 1, 0]', 
			secondaryAxis: '[0, 1, 0]' 
		})
	}, undefined, 'Origin defined but no primaryAxis - should produce error.');

	t.throws(() => {
		mockStep(Space, [], { 
			origin: '[0, 1, 0]', 
			primaryAxis: '[0, 1, 0]' 
		})
	}, undefined, 'Origin defined but no secondaryAxis - should produce error.');

	t.throws(() => {
		mockStep(Space, [], { primaryAxis: '[0, 1, 0]' })
	}, undefined, 'primaryAxis defined but no secondaryAxis - should produce error.');

	t.throws(() => {
		mockStep(Space, [], { secondaryAxis: '[0, 1, 0]' })
	}, undefined, 'secondaryAxis defined but no primaryAxis - should produce error.');

	t.throws(() => {
		mockStep(Space, [], {
			primaryAxis: [new Signal()],
			secondaryAxis: [new Signal(f32(0, 1, 0))],
		})
	}, undefined, 'primaryAxis & secondaryAxis defined, primaryAxis has no value - should produce error.');

	t.throws(() => {
		mockStep(Space, [], {
			primaryAxis: [new Signal(f32(0, 1, 0))],
			secondaryAxis: [new Signal()],
		})
	}, undefined, 'primaryAxis & secondaryAxis defined, secondaryAxis has no value - should produce error.');
});

test('Get points in space defined by vectors', async (t) => {
	const origin = new Signal(f32(0, 1, 0));
	const primaryAxis = new Signal(f32(0, 1, 0));
	const secondaryAxis = new Signal(f32(-1, 0, 0));
	const m0 = new Signal(VectorSequence.fromFloats(0, 0.5, 0.5));

	const options = {
		origin: [origin],
		primaryAxis: [primaryAxis],
		secondaryAxis: [secondaryAxis],
	};

	const space = mockStep(Space, [], options);
	const m0Result = space.getPointsInLocalSpace(m0.getVectorSequenceValue());

	t.is(m0Result.x[0], -0.5);
	t.is(m0Result.y[0], 0);
	t.is(m0Result.z[0], 0.5);
});

test('Get points in space defined by two vectors per axis', async (t) => {
	const origin = new Signal(f32(0, 1, 0));
	const primaryAxisFrom = new Signal(f32(1, 2, 2));
	const primaryAxisTo = new Signal(f32(1, 3, 2));
	const secondaryAxisFrom = new Signal(f32(3, 0, 1));
	const secondaryAxisTo = new Signal(f32(2, 0, 1));
	const m0 = new Signal(VectorSequence.fromFloats(0, 0.5, 0.5));

	const options = {
		origin: [origin],
		primaryAxis: [primaryAxisFrom, primaryAxisTo],
		secondaryAxis: [secondaryAxisFrom, secondaryAxisTo],
	}; 

	const space = mockStep(Space, [], options);

	t.is(space.primaryAxis.x[0], 0);
	t.is(space.primaryAxis.y[0], 1);
	t.is(space.primaryAxis.z[0], 0);

	t.is(space.secondaryAxis.x[0], -1);
	t.is(space.secondaryAxis.y[0], 0);
	t.is(space.secondaryAxis.z[0], 0);

	const m0Result = space.getPointsInLocalSpace(m0.getVectorSequenceValue());

	t.is(m0Result.x[0], -0.5);
	t.is(m0Result.y[0], 0);
	t.is(m0Result.z[0], 0.5);
});

test('Get points in space defined by a vector and a vector sequence', async (t) => {
	const origin = new Signal(f32(0, 1, 0));
	const primaryAxis = new Signal();
	const secondaryAxis = new Signal(f32(-1, 0, 0));
	const m0 = new Signal();

	primaryAxis.setValue<VectorSequence>(new VectorSequence(
		new Float32Array([0, 0, 3]),
		new Float32Array([1, 1, 1]),
		new Float32Array([0, 0, 2])
	));
	
	m0.setValue<VectorSequence>(VectorSequence.fromArray(null, [
		new Float32Array([0, 0, 0]),
		new Float32Array([0.5, 0.5, 0.5]),
		new Float32Array([0.5, 0.5, 0.5])
	]));

	const options = {
		origin: [origin],
		primaryAxis: [primaryAxis],
		secondaryAxis: [secondaryAxis],
	};

	const space = mockStep(Space, [], options);
	const m0Result = space.getPointsInLocalSpace(m0.getVectorSequenceValue());

	t.is(m0Result.x[0], -0.5);
	t.is(m0Result.y[0], 0);
	t.is(m0Result.z[0], 0.5);

	t.is(m0Result.x[1], -0.5);
	t.is(m0Result.y[1], 0);
	t.is(m0Result.z[1], 0.5);

	t.not(m0Result.x[2], -0.5);
	t.not(m0Result.y[2], 0);
	t.not(m0Result.z[2], 0.5);
});

test('Custom space has transformation matrix', async (t) => {
	const origin = new Signal(f32(0, 1, 0));
	const primaryAxis = new Signal(f32(0, 1, 0));
	const secondaryAxis = new Signal(f32(-1, 0, 0));

	const options = {
		origin: [origin],
		primaryAxis: [primaryAxis],
		secondaryAxis: [secondaryAxis],
	};
	
	const space = mockStep(Space, [], options);
	t.assert(space.rotationMatrix);
});

test('Space aligned with segment has transformation matrix', async (t) => {
	const signalNegX = new Signal(hipsTowardsY);
	const optionsNegX = { 'alignWithSegment.segment': [signalNegX] };

	const space = mockStep(Space, [], optionsNegX);
	t.assert(space.rotationMatrix);
});

test('Get points in space defined by running direction', async (t) => {
	const m0 = new VectorSequence(new Float32Array([1]), new Float32Array([0]), new Float32Array([0]));

	// Check if numbers are almost equal, ie within a certain threshold.
	const eqish = (a, b, threshold = 1 / 100000000000000) => {
		return Math.abs(a - b) < threshold;
	}

	// Runner runs towards X.
	const signalX = new Signal(hipsTowardsX);
	const optionsX = { 'alignWithSegment.segment': [signalX] };
	const spaceX = mockStep(Space, [], optionsX);
	const m1 = spaceX.getPointsInLocalSpace(m0);

	// Rotate 90 deg.
	t.true(eqish(m1.x[0], 0));
	t.true(eqish(m1.y[0], 1));
	t.true(eqish(m1.z[0], 0));


	// Runner runs towards Y.
	const signalY = new Signal(hipsTowardsY);
	const optionsY = { 'alignWithSegment.segment': [signalY] };
	const spaceY = mockStep(Space, [], optionsY);
	const m2 = spaceY.getPointsInLocalSpace(m0);

	// Rotate 0 deg.
	t.true(eqish(m2.x[0], 1));
	t.true(eqish(m2.y[0], 0));
	t.true(eqish(m2.z[0], 0));


	// Runner runs towards -X.
	const signalNegX = new Signal(hipsTowardsNegX);
	const optionsNegX = { 'alignWithSegment.segment': [signalNegX] };
	const spaceNegX = mockStep(Space, [], optionsNegX);
	const m3 = spaceNegX.getPointsInLocalSpace(m0);

	// Rotate -90 deg.
	t.true(eqish(m3.x[0], 0));
	t.true(eqish(m3.y[0], -1));
	t.true(eqish(m3.z[0], 0));

	
	// Runner runs towards -Y.
	const signalNegY = new Signal(hipsTowardsNegY);
	const optionsNegY = { 'alignWithSegment.segment': [signalNegY] };
	const spaceNegY = mockStep(Space, [], optionsNegY);
	const m4 = spaceNegY.getPointsInLocalSpace(m0);

	// Rotate 180 deg.
	t.true(eqish(m4.x[0], -1));
	t.true(eqish(m4.y[0], 0));
	t.true(eqish(m4.z[0], 0));
});


// Test all order combinations
test('Space - order input', async (t) => {
	// Save cross product to use in comparison values.
	const a = 0.7071067690849304;

	// Define orders and the expected output matrix.
	const orders = {
		xy: { m11: 0, m21: 1, m31: 0, m12: a, m22: -0, m32: a, m13: a, m23: 0, m33: -a },
		yx: { m11: a, m21: -0, m31: a, m12: 0, m22: 1, m32: 0, m13: -a, m23: 0, m33: a },
		zx: { m11: a, m21: -0, m31: a, m12: a, m22: 0, m32: -a, m13: 0, m23: 1, m33: 0 },
		xz: { m11: 0, m21: 1, m31: -0, m12: -a, m22: 0, m32: a, m13: a, m23: 0, m33: a },
		yz: { m11: a, m21: 0, m31: -a, m12: 0, m22: 1, m32: 0, m13: a, m23: -0, m33: a },
		zy: { m11: -a, m21: 0, m31: a, m12: a, m22: -0, m32: a, m13: 0, m23: 1, m33: 0 },
	};

	for (const order in orders) {
		const options = {
			order: order,
			primaryAxis: [new Signal(new Float32Array([0, 1, 0]))],
			secondaryAxis: [new Signal(new Float32Array([1, 0, 1]))],
		};

		const space = mockStep(Space, [], options);
		const rotMatrix = space.rotationMatrix.getMatrixAtFrame(1);

		t.assert(rotMatrix);
		t.like(rotMatrix, orders[order], 'Error in applying order "' + order + '" in space.');
	}
});
