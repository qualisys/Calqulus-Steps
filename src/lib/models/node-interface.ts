import { Pair, YAMLMap } from 'yaml';

import { PropertyType } from './property';

export interface INode {
	/** The YAML node. */
	node: YAMLMap;
	/** The node name. */
	name: string;
	/** The node set. Usually set to `left`, `right`, or `undefined`, but any string is valid. */
	set: string;
	
	/**
	* Returns a property Pair node from this node's YAML node with the provided `key`.
	* 
	* If not found, this function returns `undefined`.
	* @param key 
	*/
	getProperty(key: string): Pair;

	/**
	* Returns the parsed value from a property of this node's YAML node.
	* 
	* Optionally, an expected [[PropertyType]] can be set for the requested property.
	* If the wrong type was set, an error will be thrown. **Not implemented.**
	* 
	* You can also specify if the property is `required`. If so, and the property 
	* is missing, an error will be thrown. **Not implemented.**
	* 
	* @todo Implement error handling
	* 
	* @param key 
	* @param expectedTypes 
	* @param required 
	*/
   getPropertyValue<T>(key: string, expectedTypes: PropertyType | PropertyType[], required?: boolean, defaultValue?: T): T;
}

export interface IStepNode extends INode {
	/** Array of all imports to this step node. */
	in: (string | number | (string | number)[])[];
	/** The local scope output from this this step node. */
	out: string;
	/** Array of all main inputs to this step node. */
	mainInputs: (string | number | (string | number)[])[];
	/** The export (global scope) from this this step node. */
	exp: string;
	/** The space defined for this step node. */
	space: string;

	/**
	 * If the input to the step was a string, this property 
	 * saves the original string. Used when interpreting 
	 * inputs that has been changed, like with the IfStep.
	 */
	originalInputString: string;

	/**
	 * Returns true if the node has a property with the given name.
	 * @param name 
	 */
	hasProperty(name: string): boolean;
}

export interface IStepContainerNode extends INode {
	/** The step nodes for this output node. */
	steps: IStepNode[];

	/** Array of all imports to this output node. */
	imports: string[];
	/** Array of all exports from this output node. */
	exports: string[];
	/** The main export for this output node. */
	mainExport: string;
	/** The signals that are accessible within the scope of this container node. */
	localScope: string[];
	/** Unique ID used for prefixing signal names of locally scoped signals. */
	scopeId: string;
}

export interface ISpaceNode extends IStepNode {
	/** Array of all imports to this output node. */
	imports: string[];
	/** Array of all exports from this output node. */
	exports: string[];
	/** An array of the main named inputs and value inputs this node. */
	mainInputs: (string | number | (string | number)[])[];
}