import test from 'ava';

import { f32, i32 } from '../../test-utils/mock-step';

import { SeriesSplitUtil } from './series-split';

test('SeriesSplitUtil.splitOnNaN', t => {
	t.throws(() => SeriesSplitUtil.splitOnNaN(undefined), { message: 'Invalid series.' });

	t.deepEqual(SeriesSplitUtil.splitOnNaN([]), { splits: [
		{ values: [], startIndex: 0 }
	], originalLength: 0 });

	t.deepEqual(SeriesSplitUtil.splitOnNaN([1, 2, 3, 4, 5]), { 
		splits: [
			{ 
				values: [1, 2, 3, 4, 5],
				startIndex: 0,
			}
		], 
		originalLength: 5 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(1, 2, 3, 4, 5)), { 
		splits: [
			{ 
				values: f32(1, 2, 3, 4, 5),
				startIndex: 0,
			}
		], 
		originalLength: 5 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, 1, 2, 3, 4, 5)), { 
		splits: [
			{ 
				values: f32(1, 2, 3, 4, 5),
				startIndex: 3,
			}
		], 
		originalLength: 8 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(1, 2, 3, 4, 5, NaN, NaN, NaN)), { 
		splits: [
			{ 
				values: f32(1, 2, 3, 4, 5),
				startIndex: 0,
			}
		], 
		originalLength: 8 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, 1, 2, 3, 4, 5, NaN, NaN, NaN)), { 
		splits: [
			{ 
				values: f32(1, 2, 3, 4, 5),
				startIndex: 3,
			}
		], 
		originalLength: 11 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(1, 2, 3, NaN, NaN, NaN, 4, 5)), { 
		splits: [
			{ 
				values: f32(1, 2, 3),
				startIndex: 0,
			}, { 
				values: f32(4, 5),
				startIndex: 6,
			}
		], 
		originalLength: 8 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, 1, 2, 3, NaN, NaN, NaN, 4, 5, NaN, NaN, NaN)), { 
		splits: [
			{ 
				values: f32(1, 2, 3),
				startIndex: 3,
			}, { 
				values: f32(4, 5),
				startIndex: 9,
			}
		], 
		originalLength: 14 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, 1, NaN, 2, 3, NaN, NaN, NaN, 4, 5, NaN, NaN, NaN)), { 
		splits: [
			{ 
				values: f32(1),
				startIndex: 3,
			}, { 
				values: f32(2, 3),
				startIndex: 5,
			}, { 
				values: f32(4, 5),
				startIndex: 10,
			}
		], 
		originalLength: 15 
	});

	t.deepEqual(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, NaN, NaN)), { 
		splits: [
			{
				values: f32(),
				startIndex: 5,
			}
		], 
		originalLength: 5 
	});
});

test('SeriesSplitUtil.mergeSplitSeries', t => {
	t.throws(() => SeriesSplitUtil.merge(undefined));
	t.throws(() => SeriesSplitUtil.merge({ splits: undefined, originalLength: 0 }));
	t.throws(() => SeriesSplitUtil.merge({ splits: [], originalLength: 0 }));

	t.deepEqual(SeriesSplitUtil.merge(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, NaN, NaN))), f32(NaN, NaN, NaN, NaN, NaN));
	t.deepEqual(SeriesSplitUtil.merge(SeriesSplitUtil.splitOnNaN([1, 2, 3, 4, 5])), [1, 2, 3, 4, 5]);
	t.deepEqual(SeriesSplitUtil.merge(SeriesSplitUtil.splitOnNaN(f32(1, 2, 3, 4, 5))), f32(1, 2, 3, 4, 5));
	t.deepEqual(SeriesSplitUtil.merge(SeriesSplitUtil.splitOnNaN(i32(1, 2, 3, 4, 5))), i32(1, 2, 3, 4, 5));
	t.deepEqual(SeriesSplitUtil.merge(SeriesSplitUtil.splitOnNaN(f32(NaN, NaN, NaN, 1, 2, 3, NaN, 4, 5, NaN, NaN, NaN))), f32(NaN, NaN, NaN, 1, 2, 3, NaN, 4, 5, NaN, NaN, NaN));

});
