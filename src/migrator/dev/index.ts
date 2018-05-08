import { JsonObject, Persister } from '../../store/json';
import * as PathUtils from 'path';

export function migrate(styleguidePath: string): void {
	console.log('migratedev');
	const projectConfigPath = PathUtils.join(styleguidePath, 'alva/alva.yaml');
	let json: JsonObject = Persister.loadYamlOrJson(projectConfigPath);

	// if there is a config param we flatten the structure
	if (json.config) {
		json = json.config as JsonObject;
	}

	json.modelVersion = 'dev';
	console.log('json', json);
	Persister.saveYaml(projectConfigPath, json);
}
