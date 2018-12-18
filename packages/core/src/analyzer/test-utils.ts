import * as ReactUtils from './react-utils';
import * as TypeScript from 'typescript';
import * as TypeScriptUtils from './typescript-utils';

export interface Fixtures {
	find(name: string): string | undefined;
}

export interface Prop {
	symbol: TypeScript.Symbol;
	type: TypeScript.Type;
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
): Prop => {
	const propTypes = getPropTypes(sourceFile, ctx);

	if (propTypes.length === 0) {
		throw new Error(`Could not get first propType from ${sourceFile.fileName}`);
	}

	return propTypes[0];
};

export const getPropTypes = (
	sourceFile: TypeScript.SourceFile,
	ctx: { program: TypeScript.Program }
): Prop[] => {
	const typeChecker = ctx.program.getTypeChecker();
	const [exp] = TypeScriptUtils.getExports(
		sourceFile,
		ctx.program
	) as TypeScriptUtils.TypescriptExport[];

	// tslint:disable-next-line:no-any
	const reactType = ReactUtils.findReactComponentType(exp.type, {
		program: ctx.program
	}) as TypeScriptUtils.TypeScriptType;
	const [props] = reactType.getTypeArguments();

	return props.type.getApparentProperties().map(symbol => {
		const declarations = symbol.declarations!;
		const type = typeChecker.getTypeAtLocation(declarations[declarations.length - 1]);

		return {
			symbol,
			type
		};
	});
};
