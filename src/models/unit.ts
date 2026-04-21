/**
 * Named physical quantities.
 *
 * `unknown` is the fallback when a unit combination is not recognized.
 */
export type Quantity =
	| 'acceleration'
	| 'angle'
	| 'angularVelocity'
	| 'count'
	| 'dimensionless'
	| 'force'
	| 'frequency'
	| 'length'
	| 'mass'
	| 'moment'
	| 'power'
	| 'time'
	| 'unknown'
	| 'velocity'
	| 'voltage';

/**
 * An exponent map of base unit symbols.
 *
 * For example, `mm/s^2` is represented as `{ mm: 1, s: -2 }`.
 */
export type UnitExponents = Readonly<Record<string, number>>;

/**
 * A physical unit attached to a [[Signal]].
 *
 * Units are tracked symbolically: each `Unit` carries a canonical string
 * `name` (e.g. `mm`, `N`, `Nmm`, `mm/s`) together with a high-level
 * `quantity` category (e.g. `length`, `force`, `moment`, `velocity`).
 *
 * Unit algebra is performed via [[Units]] helper functions. Values are
 * never auto-converted (no mm↔m scaling); conversions are explicit
 * (via the `convert` step).
 */
export class Unit {
	public readonly exponents: UnitExponents;
	public readonly name: string;
	public readonly quantity: Quantity;

	constructor(exponents: Record<string, number>, name?: string, quantity?: Quantity) {
		this.exponents = Object.freeze(cleanExponents(exponents));
		this.name = name ?? nameFromExponents(this.exponents);
		this.quantity = quantity ?? quantityFromExponents(this.exponents);
	}
}

/**
 * A stable signature for an exponent map, used as a lookup key for
 * recognizing well-known unit combinations.
 */
const signature = (exp: UnitExponents): string => {
	return Object.keys(exp)
		.sort()
		.map(k => `${ k }^${ exp[k] }`)
		.join('*');
};

/**
 * Removes zero-valued exponents and returns a new object with sorted keys.
 */
const cleanExponents = (exp: Record<string, number>): Record<string, number> => {
	const out: Record<string, number> = {};

	for (const key of Object.keys(exp).sort()) {
		const value = exp[key];

		if (value !== 0 && Number.isFinite(value)) {
			out[key] = value;
		}
	}

	return out;
};

/**
 * Well-known canonical units, in a fixed lookup order.
 *
 * The first entry wins, so more specific combinations (e.g. `Nmm`) should
 * come before more generic ones (e.g. `N`).
 */
const knownUnits: { exponents: Record<string, number>; name: string; quantity: Quantity }[] = [
	{ exponents: {}, name: 'unitless', quantity: 'dimensionless' },

	{ exponents: { mm: 1 }, name: 'mm', quantity: 'length' },
	{ exponents: { m: 1 }, name: 'm', quantity: 'length' },
	{ exponents: { s: 1 }, name: 's', quantity: 'time' },
	{ exponents: { ms: 1 }, name: 'ms', quantity: 'time' },
	{ exponents: { Hz: 1 }, name: 'Hz', quantity: 'frequency' },
	{ exponents: { rad: 1 }, name: 'rad', quantity: 'angle' },
	{ exponents: { deg: 1 }, name: 'deg', quantity: 'angle' },
	{ exponents: { kg: 1 }, name: 'kg', quantity: 'mass' },
	{ exponents: { V: 1 }, name: 'V', quantity: 'voltage' },
	{ exponents: { N: 1 }, name: 'N', quantity: 'force' },
	{ exponents: { W: 1 }, name: 'W', quantity: 'power' },
	{ exponents: { frames: 1 }, name: 'frames', quantity: 'count' },
	{ exponents: { percent: 1 }, name: '%', quantity: 'dimensionless' },

	{ exponents: { N: 1, mm: 1 }, name: 'Nmm', quantity: 'moment' },
	{ exponents: { N: 1, m: 1 }, name: 'Nm', quantity: 'moment' },

	{ exponents: { mm: 1, s: -1 }, name: 'mm/s', quantity: 'velocity' },
	{ exponents: { m: 1, s: -1 }, name: 'm/s', quantity: 'velocity' },
	{ exponents: { mm: 1, s: -2 }, name: 'mm/s^2', quantity: 'acceleration' },
	{ exponents: { m: 1, s: -2 }, name: 'm/s^2', quantity: 'acceleration' },
	{ exponents: { rad: 1, s: -1 }, name: 'rad/s', quantity: 'angularVelocity' },
	{ exponents: { deg: 1, s: -1 }, name: 'deg/s', quantity: 'angularVelocity' },
];

const exponentsEqual = (a: UnitExponents, b: Record<string, number>): boolean => {
	const aClean = cleanExponents(a as Record<string, number>);
	const bClean = cleanExponents(b);
	const aKeys = Object.keys(aClean);
	const bKeys = Object.keys(bClean);

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	for (const key of aKeys) {
		if (aClean[key] !== bClean[key]) {
			return false;
		}
	}

	return true;
};

const nameFromExponents = (exp: UnitExponents): string => {
	for (const known of knownUnits) {
		if (exponentsEqual(exp, known.exponents)) {
			return known.name;
		}
	}

	return formatExponents(exp);
};

const quantityFromExponents = (exp: UnitExponents): Quantity => {
	for (const known of knownUnits) {
		if (exponentsEqual(exp, known.exponents)) {
			return known.quantity;
		}
	}

	return 'unknown';
};

/**
 * Renders an exponent map as a canonical unit string like `mm/s^2` or
 * `N*mm`. Positive-exponent symbols come first, separated by `*`;
 * negative-exponent symbols appear after `/`.
 */
const formatExponents = (exp: UnitExponents): string => {
	const positives: string[] = [];
	const negatives: string[] = [];

	for (const key of Object.keys(exp)) {
		const value = exp[key];

		if (value > 0) {
			positives.push(value === 1 ? key : `${ key }^${ value }`);
		}
		else if (value < 0) {
			const absValue = -value;
			negatives.push(absValue === 1 ? key : `${ key }^${ absValue }`);
		}
	}

	if (positives.length === 0 && negatives.length === 0) {
		return 'unitless';
	}

	const positivePart = positives.length > 0 ? positives.join('*') : '1';
	const negativePart = negatives.join('*');

	return negativePart ? `${ positivePart }/${ negativePart }` : positivePart;
};

/**
 * Pure helper functions for [[Unit]] algebra and construction.
 *
 * Operations never mutate their arguments. Any operation involving an
 * `undefined` unit returns `undefined` — the unknown unit is propagated
 * and does not trigger warnings.
 */
export class Units {
	/**
	 * Returns an acceleration unit: `length / s^2`.
	 */
	static acceleration(length: Unit | undefined): Unit | undefined {
		return Units.perSecond(Units.perSecond(length));
	}

	/**
	 * Creates a [[Unit]] from a raw exponent map. Useful for tests and
	 * hand-constructed units. See [[Units.fromName]] for the common path.
	 */
	static create(exponents: Record<string, number>): Unit {
		return new Unit(exponents);
	}

	/**
	 * Returns `a / b` with `undefined` propagation.
	 */
	static divide(a: Unit | undefined, b: Unit | undefined): Unit | undefined {
		return Units.multiply(a, Units.power(b, -1));
	}

	/**
	 * Strict structural equality of two units.
	 *
	 * Two units are equal if their exponent maps are identical. A missing
	 * unit never equals a known unit (including `unitless`).
	 */
	static equals(a: Unit | undefined, b: Unit | undefined): boolean {
		if (!a || !b) {
			return a === b;
		}

		return exponentsEqual(a.exponents, b.exponents as Record<string, number>);
	}

	/**
	 * Parses a unit name string (e.g. `mm/s^2`, `N*mm`, `Hz`) into a
	 * [[Unit]]. Returns `undefined` when given `undefined` or an empty
	 * string.
	 */
	static fromName(name: string | undefined): Unit | undefined {
		if (!name) {
			return undefined;
		}

		const trimmed = name.trim();

		if (!trimmed || trimmed === 'unitless') {
			return new Unit({});
		}

		const [numerator, denominator] = trimmed.split('/');
		const exp: Record<string, number> = {};

		if (numerator) {
			addTerm(exp, numerator, 1);
		}

		if (denominator) {
			addTerm(exp, denominator, -1);
		}

		return new Unit(exp);
	}

	/**
	 * True when `unit` represents an angle (e.g. `rad`, `deg`).
	 */
	static isAngle(unit: Unit | undefined): boolean {
		return !!unit && unit.quantity === 'angle';
	}

	/**
	 * True when `unit` is the dimensionless unit.
	 */
	static isDimensionless(unit: Unit | undefined): boolean {
		return !!unit && Object.keys(unit.exponents).length === 0;
	}

	/**
	 * Returns the product of one or more units. `undefined` inputs are
	 * treated as unknown and propagate.
	 */
	static multiply(...units: (Unit | undefined)[]): Unit | undefined {
		if (units.length === 0) {
			return new Unit({});
		}

		const exp: Record<string, number> = {};

		for (const unit of units) {
			if (!unit) {
				return undefined;
			}

			for (const key of Object.keys(unit.exponents)) {
				exp[key] = (exp[key] ?? 0) + unit.exponents[key];
			}
		}

		return new Unit(exp);
	}

	/**
	 * Returns `unit / s` with `undefined` propagation.
	 */
	static perSecond(unit: Unit | undefined): Unit | undefined {
		return Units.divide(unit, Units.fromName('s'));
	}

	/**
	 * Returns `unit^n`. Fractional `n` is supported (e.g. `0.5` for sqrt).
	 */
	static power(unit: Unit | undefined, n: number): Unit | undefined {
		if (!unit) {
			return undefined;
		}

		if (n === 0) {
			return new Unit({});
		}

		const exp: Record<string, number> = {};

		for (const key of Object.keys(unit.exponents)) {
			exp[key] = unit.exponents[key] * n;
		}

		return new Unit(exp);
	}

	/**
	 * Returns `unit * s` with `undefined` propagation.
	 */
	static timesSecond(unit: Unit | undefined): Unit | undefined {
		return Units.multiply(unit, Units.fromName('s'));
	}

	/**
	 * Returns a velocity unit: `length / s`.
	 */
	static velocity(length: Unit | undefined): Unit | undefined {
		return Units.perSecond(length);
	}
}

/**
 * Adds a multiplicative term (e.g. `N*mm^2`) to an exponent map.
 */
const addTerm = (exp: Record<string, number>, term: string, sign: 1 | -1): void => {
	const factors = term.split('*').map(s => s.trim()).filter(Boolean);

	for (const factor of factors) {
		const match = factor.match(/^([A-Za-z%]+)(?:\^(-?\d+(?:\.\d+)?))?$/);

		if (!match) {
			continue;
		}

		const symbol = match[1];
		const exponent = match[2] !== undefined ? parseFloat(match[2]) : 1;
		exp[symbol] = (exp[symbol] ?? 0) + sign * exponent;
	}
};
