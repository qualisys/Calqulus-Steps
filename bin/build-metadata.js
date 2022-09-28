const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const createBuildMeta = (dest) => {
	const revision = new Promise(s => {
		exec('git rev-parse HEAD', function (error, stdout, stderr) {
			if (error !== null) {
				console.log('git error: ' + error + stderr);
			}
			s(stdout.toString().trim());
		});
	});

	const branch = new Promise(s => {
		exec('git rev-parse --abbrev-ref HEAD', function (error, stdout, stderr) {
			if (error !== null) {
				console.log('git error: ' + error + stderr);
			}
			s(stdout.toString().trim());
		});
	});

	return Promise.all([revision, branch])
		.then((results) => {
			const ref = results[0];
			const branch = results[1];
			const version = require('../package.json').version;
			const dateTimeFormat = new Intl.DateTimeFormat('sv-SE', {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
				hour12: false,
				timeZoneName: 'short'
			});

			const content = '// This file is automatically generated by build-metadata.js.\n'
				+ 'export const buildMetadata = {'
				+ `\n	version: '${ version }',`
				+ `\n	ref: '${ ref }',`
				+ `\n	branch: '${ branch }',`
				+ `\n	built: '${ dateTimeFormat.format(new Date()) }'`
				+ '\n};';
			;

			fs.writeFileSync(dest, content, { encoding: 'utf8' });
		})
	;
};

let promise = createBuildMeta(path.resolve(__dirname, '../src/build-metadata.ts'));