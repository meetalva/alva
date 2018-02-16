import { Pattern } from '../../pattern/pattern';
import { StyleguideAnalyzer } from '../styleguide-analyzer';

import { Folder } from '../utils/folder';
import { PatternType } from '../../pattern/pattern-type';
import * as patternFactories from './patterns';

export class SyntheticAnalyzer extends StyleguideAnalyzer {
	public getPatternType(): PatternType {
		return PatternType.synthetic;
	}

	public analyze(path: string): Folder<Pattern> {
		const patterns: Pattern[] = [
			patternFactories.createTextPattern({
				analyzer: this,
				id: 'text',
				name: 'text'
			})
		];

		const folder = new Folder<Pattern>('synthetic');
		const subFolder = new Folder<Pattern>('synthetic');
		subFolder.setItems(patterns);
		folder.setSubFolders([subFolder]);

		return folder;
	}
}
