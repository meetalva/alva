import * as FileUtils from 'fs';
import { Persister } from '../../store/json';
import * as PathUtils from 'path';

export function migrate(styleguidePath: string): void {
	const oldPath = PathUtils.join(styleguidePath, 'alva/projects.yaml');
	const newPath = PathUtils.join(styleguidePath, 'alva/alva.yaml');

	const oldAlvaYaml = Persister.loadYamlOrJson(oldPath);
	const newAlvaYaml = {
		analyzerName: 'typescript-react-analyzer',
		...oldAlvaYaml
	};
	FileUtils.writeFileSync(newPath, {});
	Persister.saveYaml(newPath, newAlvaYaml);
	FileUtils.unlinkSync(oldPath);
}
