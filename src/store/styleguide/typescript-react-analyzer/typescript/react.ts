import { Export, getExports } from './ts-utils';
import { Type } from './type';
import * as ts from 'typescript';

const WellKnownReactComponentTypes = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent'
];

export interface ReactComponentExport extends Export {
	wellKnownReactAncestorType: Type;
}

export function getReactComponentExports(
	sourceFile: ts.SourceFile,
	program: ts.Program
): ReactComponentExport[] {
	const reactExports: ReactComponentExport[] = [];

	const exports = getExports(sourceFile, program);

	exports.forEach(exportInfo => {
		const reactType = findWellKnownReactType(program, exportInfo.type);

		if (reactType) {
			reactExports.push({
				...exportInfo,
				wellKnownReactAncestorType: reactType
			});
		}
	});

	return reactExports;
}

export function findWellKnownReactType(program: ts.Program, type: Type): Type | undefined {
	if (isReactType(program, type.type)) {
		return type;
	}

	for (const baseType of type.baseTypes) {
		const wellKnownReactType = findWellKnownReactType(program, baseType);

		if (wellKnownReactType) {
			return wellKnownReactType;
		}
	}

	return undefined;
}

export function isReactType(program: ts.Program, type: ts.Type): boolean {
	if (!(type.symbol && type.symbol.declarations)) {
		return false;
	}

	const symbol = type.symbol;
	const declarations = type.symbol.declarations;

	const isWellKnownType = WellKnownReactComponentTypes.some(
		wellKnownReactComponentType => symbol.name === wellKnownReactComponentType
	);

	if (!isWellKnownType) {
		return false;
	}

	for (const declaration of declarations) {
		const sourceFile = declaration.getSourceFile();
		return sourceFile.fileName.includes('react/index.d.ts');
	}

	return false;
}
