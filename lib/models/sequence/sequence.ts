
export interface ISequence {
	/** The sequence components as an array. */
	array: TypedArray[];
	/** The sequence length */
	length: number;
	/** The available components. */
	components: string[];

	/** Returns the series for the specified component. */
	getComponent(component: string): TypedArray;
}

export interface IDataSequence {
	/** The sequence name. */
	name: string;
}
