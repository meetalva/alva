import * as TypeScript from 'typescript';
import * as TypeScriptUtils from './typescript-utils';

export interface Fixtures {
	find(name: string): string | undefined;
}

export const getFixtureSourceFile = (
	name: string,
	ctx: { fixtures: Fixtures }
): { sourceFile: TypeScript.SourceFile; program: TypeScript.Program } => {
	const filePath = ctx.fixtures.find(name);

	if (!filePath) {
		throw new Error(`Could not find fixture file ${filePath}`);
	}

	const program = TypeScript.createProgram([filePath], {});
	const sourceFile = program.getSourceFile(filePath);

	if (!sourceFile) {
		throw new Error(`Could not obtain source file ${name} from ${filePath}`);
	}

	return { sourceFile, program };
};

export const getFirstPropType = (
	sourceFile: TypeScript.SourceFile,
	ctx: { program: TypeScript.Program }
): TypeScript.Type => {
	const propTypes = getPropTypes(sourceFile, ctx);

	if (propTypes.length === 0) {
		throw new Error(`Could not get first propType from ${sourceFile.fileName}`);
	}

	return propTypes[0];
};

export const getPropTypes = (
	sourceFile: TypeScript.SourceFile,
	ctx: { program: TypeScript.Program }
): TypeScript.Type[] => {
	const typeChecker = ctx.program.getTypeChecker();

	return sourceFile.statements
		.filter(statement => TypeScriptUtils.isExport(statement))
		.filter(statement => TypeScript.isInterfaceDeclaration(statement))
		.reduce(
			(members, interfaceDeclaration: TypeScript.InterfaceDeclaration) => [
				...members,
				...interfaceDeclaration.members
			],
			[]
		)
		.map(member => typeChecker.getTypeAtLocation(member))
		.filter((item): item is TypeScript.Type => typeof item !== 'undefined');
};
