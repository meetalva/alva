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

export interface Export {
	symbol: TypeScript.Symbol;
	type: TypeScript.Type;
}

export interface FixtureSourceFile {
	sourceFile: TypeScript.SourceFile;
	sourceFiles: TypeScript.SourceFile[];
	program: TypeScript.Program;
}

export const getFixtureSourceFile = (
	name: string | string[],
	ctx: { fixtures: Fixtures }
): FixtureSourceFile => {
	const names = Array.isArray(name) ? name : [name];
	const paths = names
		.map(n => ctx.fixtures.find(n))
		.filter((n): n is string => typeof n !== 'undefined');

	if (paths.length === 0) {
		throw new Error(`Could not find fixture file ${names.join(', ')}`);
	}

	const program = TypeScript.createProgram(paths, {});

	const sourceFiles = paths.map(path => {
		const sourceFile = program.getSourceFile(path);

		if (!sourceFile) {
			throw new Error(`Could not obtain source file ${name} from ${path}`);
		}

		return sourceFile;
	});

	return { sourceFile: sourceFiles[0]!, sourceFiles, program };
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

export const getNamedPropType = (name: string, ctx: FixtureSourceFile): Prop => {
	const props = getPropTypes(ctx.sourceFile, ctx);

	const result = props.find(prop => prop.symbol.getName() === name);

	if (!result) {
		throw new Error(
			`Could not find prop with name ${name}. Available props: ${props
				.map(p => p.symbol.getName())
				.join(', ')}`
		);
	}

	return result;
};

export const getPropInterface = (
	sourceFile: TypeScript.SourceFile,
	ctx: { program: TypeScript.Program }
): TypeScriptUtils.TypeScriptType => {
	const [exp] = TypeScriptUtils.getExports(
		sourceFile,
		ctx.program
	) as TypeScriptUtils.TypescriptExport[];

	// tslint:disable-next-line:no-any
	const reactType = ReactUtils.findReactComponentType(exp.type, {
		program: ctx.program
	}) as TypeScriptUtils.TypeScriptType;
	const [props] = reactType.getTypeArguments();
	return props;
};

export const getPropTypes = (
	sourceFile: TypeScript.SourceFile,
	ctx: { program: TypeScript.Program }
): Prop[] => {
	const typeChecker = ctx.program.getTypeChecker();
	const props = getPropInterface(sourceFile, ctx);

	return props.type.getApparentProperties().map(symbol => {
		const declarations = symbol.declarations!;
		const type = typeChecker.getTypeAtLocation(declarations[declarations.length - 1]);

		return {
			symbol,
			type
		};
	});
};
