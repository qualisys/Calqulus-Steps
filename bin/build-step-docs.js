const fs = require('fs');
const path = require('path');

const lib = require('../build/main/index');

const { StepRegistry } = require('../build/main/lib/step-registry.js');
const { kebabCase, renderStepCategoryPage, renderStepIndexPage } = require('./docs-render/step-category-md-render');
const { renderJsonSchema } = require('./docs-render/json-schema-render');


(_ => {
	const categories = [...StepRegistry.stepDocs.values()].reduce((cats, currStep) => {
		if (!currStep.category) return cats;

		if (!cats[currStep.category]) {
			cats[currStep.category] = [];
		}

		cats[currStep.category].push(currStep);

		return cats;
	}, {});

	/**
	 * Generate markdown
	 */
	const mdDir = path.join(__dirname, '..', 'docs', 'nodes', 'steps');
	
	// Clear existing output directory
	if (fs.existsSync(mdDir)) {
		console.log('delete output folder', mdDir)
		fs.rmSync(mdDir, { recursive: true, force: true });
	}

	fs.mkdirSync(mdDir, { recursive: true });

	const contents = renderStepIndexPage(StepRegistry.globalStepDocs, categories);
	fs.writeFileSync(path.join(mdDir, 'index.md'), contents, 'utf8');

	console.log('-- Generated:', 'index.md');

	for (const categoryName in categories) {
		const categorySteps = categories[categoryName];

		let category;
		if (StepRegistry.stepCategoryDocs.has(categoryName)) {
			category = StepRegistry.stepCategoryDocs.get(categoryName);
		} else {
			category = {
				name: categoryName,
			};
		}

		// Sort steps in category by name.
		categorySteps.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		const filename = kebabCase(category.name) + '.md';
		const mdPath = path.join(mdDir, filename);
		
		const contents = renderStepCategoryPage(category, categorySteps, StepRegistry.globalStepDocs);
		fs.writeFileSync(mdPath, contents, 'utf8');

		console.log('-- Generated:', filename);
	}

	/**
	 * Generate JSON Schema
	 */

	const allSteps = Object.values(categories).reduce((all, curr) => {
		all.push(...curr);
		return all;
	}, []);

	const categoryDefs = Object.keys(categories).map(cat => {
		if (StepRegistry.stepCategoryDocs.has(cat)) {
			return StepRegistry.stepCategoryDocs.get(cat);
		}

		return {
			name: cat,
		};
	});

	const schema = renderJsonSchema(StepRegistry.globalStepDocs, categoryDefs, allSteps);
	const filename = 'calqulus-pipeline.schema.json';
	const schemaDir = path.join(__dirname, '..', 'build', 'schema');
	const schemaPath = path.join(schemaDir, filename);
	
	fs.mkdirSync(schemaDir, { recursive: true });
	fs.writeFileSync(schemaPath, JSON.stringify(schema, undefined, '\t'), 'utf8');
})();

