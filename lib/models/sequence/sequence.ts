export interface ISequence {
	typeName: string;

	/** The sequence components as an array. */
	array: TypedArray[];
	/** The sequence length */
	length: number;
	/** The available components. */
	components: string[];

	/** Returns the series for the specified component. */
	getComponent(component: string): TypedArray;
}

export interface ISequenceProperty {
	/** The property name, including path. */
	name: string;
	/** The property value. */
	value: number | string | TypedArray;
}

export interface ISequenceDataProperties {
	properties: ISequenceProperty[];
	getProperty(name: string): ISequenceProperty;
	setProperty(name: string, value: number | string | TypedArray): void;
}

export interface IDataSequence {
	/** The sequence name. */
	name: string;
}
