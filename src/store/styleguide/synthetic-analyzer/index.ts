import { Pattern } from '../../pattern/pattern';
import { StyleguideAnalyzer } from '../styleguide-analyzer';

import { PatternType } from '../../pattern/pattern-type';
import * as patternFactories from './patterns';

export class SyntheticAnalyzer extends StyleguideAnalyzer {
	public getPatternType(): PatternType {
		return PatternType.synthetic;
	}

	public analyze(path: string): Pattern[] {
		return [
			patternFactories.createTextPattern({
				analyzer: this,
				id: 'text',
				name: 'text'
			})
		];
	}
}
