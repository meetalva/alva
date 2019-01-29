import * as TestUtils from '../test-utils';
import {
	getPatternAnalyzer,
	analyzePatternExport,
	PatternCandidate
} from './typescript-react-analyzer';
import Project from 'ts-simple-ast';
import * as uuid from 'uuid';
import { InternalPatternAnalysis } from '@meetalva/types';
import * as Path from 'path';

const fixtures = require('fixturez')(__dirname);

test('reuses properties from shared interfaces', () => {
	const { sourceFiles, program } = TestUtils.getFixtureSourceFile(
		['shared-properties-ab.ts', 'shared-properties-c.ts'],
		{ fixtures }
	);

	const project = new Project();

	const analyzePattern = getPatternAnalyzer(program, project, {
		analyzeBuiltins: false,
		getGlobalPatternId: () => uuid.v4(),
		getGlobalPropertyId: () => uuid.v4(),
		getGlobalSlotId: () => uuid.v4(),
		getGobalEnumOptionId: () => uuid.v4()
	});

	const candidates: PatternCandidate[] = sourceFiles.map(s => ({
		id: uuid.v4(),
		artifactPath: s.fileName,
		declarationPath: s.fileName,
		sourcePath: s.fileName,
		description: s.fileName,
		displayName: Path.basename(s.fileName, Path.extname(s.fileName))
	}));

	const [A, B] = candidates.reduce<InternalPatternAnalysis[]>((acc, candidate) => {
		return [...acc, ...analyzePattern(candidate, acc, analyzePatternExport)];
	}, []);

	const firstA = A.properties.find(p => p.property.propertyName === 'a')!;

	expect(B.properties).toHaveLength(1);
	expect(B.pattern.propertyIds).toContain(firstA.property.id);
});
