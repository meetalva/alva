import { lstatSync, readdirSync, statSync } from 'fs';
import * as PathUtils from 'path';

import { Persister } from '../store/json';

// Migrator scripts
import { migrate as migrateTo_0_7_0 } from './0.7.0';

const basePath = './src/migrator/';

function convertToFloatVersionNumber(modelVersion: string): number {
	return parseFloat(`0.${modelVersion.replace('.', '0')}`);
}

function triggerMigrators(modelVersion: number, migrators: object, styleguidePath: string): void {
	let newModelVersion = modelVersion;
	for (const key in migrators) {
		if (migrators.hasOwnProperty(key)) {
			const migratorVersion = convertToFloatVersionNumber(key);
			if (migratorVersion > newModelVersion) {
				console.log(`Convert to version ${key}`);
				const migrateScript = require(`${migrators[key]}`).migrate;
				migrateScript(styleguidePath);
				newModelVersion = migratorVersion;
			}
		}
	}

	// Also use the dev version if present
	try {
		const file = readdirSync(`${basePath}dev/`)[0];
		console.log('hey', readdirSync('.'));
		console.log('file', file);
		console.log('./' + PathUtils.join('./dev/', file));
		console.log('require', require('./dev/index.js'));
		const devMigrator = require('./' + PathUtils.join('./dev/', file));
		devMigrator.migrate(styleguidePath);
	} catch {
		// There is no dev migrator. Do nothing.
	}
}

export function migrate(styleguidePath: string): void {
	const projectConfigPath = PathUtils.join(styleguidePath, 'alva/alva.yaml');

	// With out a alva.yaml and with a project.yaml we have to convert to version 0.7.0
	try {
		statSync(projectConfigPath);
	} catch {
		const oldProjectConfigPath = PathUtils.join(styleguidePath, 'alva/projects.yaml');
		if (Boolean(statSync(oldProjectConfigPath))) {
			migrateTo_0_7_0(styleguidePath);
		}
	}

	// The Part above is just for backwards compatibility every future converter should
	// be triggered automatically.

	const projectConfig = Persister.loadYamlOrJson(projectConfigPath);
	const modelVersion: string =
		((projectConfig && projectConfig.modelVersion) as string) || '0.7.0';

	const migratorFolders = readdirSync(basePath).filter(file =>
		lstatSync(PathUtils.join(basePath, file)).isDirectory()
	);
	const migrators = {};
	migratorFolders.forEach(item => {
		const path = PathUtils.join(basePath, item);
		const file = readdirSync(path)[0];
		migrators[item] = './' + PathUtils.join(item, file);
	});

	const modelVersionFloat = convertToFloatVersionNumber(modelVersion);
	triggerMigrators(modelVersionFloat, migrators, styleguidePath);
}
