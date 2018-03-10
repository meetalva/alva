import { Type } from './type';
import * as ts from 'typescript';

const REACT_COMPONENT_TYPES = [
	'Component',
	'ComponentClass',
	'PureComponent',
	'StatelessComponent'
];

export class ReactUtils {
	public findWellKnownReactType(program: ts.Program, type: Type): Type | undefined {
		if (this.isReactType(program, type.type)) {
			return type;
		}

		for (const baseType of type.getBaseTypes()) {
			const wellKnownReactType = this.findWellKnownReactType(program, baseType);

			if (wellKnownReactType) {
				return wellKnownReactType;
			}
		}

		return undefined;
	}

	public isReactType(program: ts.Program, type: ts.Type): boolean {
		if (!type.symbol || !type.symbol.declarations) {
			return false;
		}

		const symbol = type.symbol;
		const isWellKnownType: boolean = REACT_COMPONENT_TYPES.some(
			wellKnownReactComponentType => symbol.name === wellKnownReactComponentType
		);
		if (!isWellKnownType) {
			return false;
		}

		for (const declaration of type.symbol.declarations) {
			const sourceFile = declaration.getSourceFile();
			return sourceFile.fileName.includes('react/index.d.ts');
		}

		return false;
	}
}
