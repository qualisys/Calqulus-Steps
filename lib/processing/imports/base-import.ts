import { StepCategory } from "../../step-registry";
import { markdownFmt } from "../../utils/template-literal-tags";
import { BaseStep } from "../base-step";

@StepCategory({
	name: 'Import',
	description: markdownFmt`
		These are steps that imports a specific type of step by name.
	`,
})
export class BaseImportStep extends BaseStep {
	async process() {
		return this.inputs[0];
	}
}