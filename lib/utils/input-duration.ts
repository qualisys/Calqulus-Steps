import Qty from "js-quantities";

/**
 * Parses a duration and provides methods to retrieve the
 * frame count or time in seconds for the duration.
 */
export class InputDuration {
	static readonly TIME_REGEX = /([\d.]+)\s*([a-z]+)/i;

	private frames;
	private seconds;

	/**
	 * Instantiates a new `InputDuration` object with a
	 * given duration.
	 * @param duration The duration in frames or a time value.
	 */
	constructor(duration: number | string) {
		this.parseInput(duration);
	}

	/**
	 * Returns `true` if the current duration is valid and
	 * it is possible to retrieve the frames or seconds.
	 */
	isValidDuration() {
		return this.frames !== undefined || this.seconds !== undefined;
	}

	/**
	 * Returns the number of frames in this duration. If the 
	 * input was given in time-based units, the `frameRate` argument
	 * is used to convert the time to frames.
	 * 
	 * The frame count is rounded to the nearest integer unless the 
	 * `round` argument is set to `false`. 
	 * @param frameRate 
	 * @param round 
	 */
	getFrames(frameRate: number, round = true) {
		if (this.frames !== undefined) return (round) ? Math.round(this.frames) : this.frames;

		if (!frameRate) return undefined;

		return (round) ? Math.round(this.seconds * frameRate) : this.seconds * frameRate;
	}

	/**
	 * Returns the number of seconds in this duration. If the 
	 * input was given in frames, the `frameRate` argument
	 * is used to convert the frame count to seconds.
	 * @param frameRate 
	 */
	getSeconds(frameRate: number) {
		if (this.seconds !== undefined) return this.seconds;

		if (!frameRate) return undefined;

		return this.frames / frameRate;
	}

	/**
	 * Parses the input string or number to a frame or
	 * time based value.
	 * @param duration 
	 */
	protected parseInput(duration: number | string) {
		if (!isNaN(duration as number)) {
			// Input is a number or a string number -> store as frames
			if (typeof duration === 'string') {
				const parsed = parseFloat(duration);
				this.frames = (isNaN(parsed)) ? undefined : parsed;
			}

			if (typeof duration === 'number') this.frames = duration;

			return;
		}

		if (typeof duration === 'string') {
			// Try to parse a time based duration with a unit
			const [, value, unitInput] = InputDuration.TIME_REGEX.exec(duration) || [undefined, undefined, undefined];
			if (value === undefined || !unitInput) return;

			const unit = unitInput.toLowerCase();

			// Special case for units "f" and "frames", interpret as frames.
			if (unit === 'f' || unit === 'frames') {
				this.frames = parseFloat(value);
				return;
			}

			// Convert time to seconds
			try {
				const converted = new Qty(value + ' ' + unit).to('seconds');
				if (converted.scalar !== undefined) {
					this.seconds = converted.scalar;
				}
			} catch (e) {
				// Could not convert input to seconds
			}
		}
	}
}