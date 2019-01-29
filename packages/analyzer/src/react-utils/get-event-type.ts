import * as TypeScript from 'typescript';
import * as Types from '@meetalva/types';

export interface GetEventTypeInput {
	symbol: TypeScript.Symbol;
	type: TypeScript.Type;
}

export interface GetEventTypeContext {
	typechecker: TypeScript.TypeChecker;
}

export function getEventType(
	input: GetEventTypeInput,
	ctx: GetEventTypeContext
): Types.SerializedPatternEventType {
	const eventName = getRelevantTypeName(input.symbol);

	switch (eventName) {
		case 'InputEvent':
		case 'ChangeEvent':
		case 'FocusEvent':
		case 'MouseEvent':
			return eventName;
		default:
			return 'Event';
	}
}

// tslint:disable-next-line:cyclomatic-complexity
function getRelevantTypeName(symbol: TypeScript.Symbol): string | undefined {
	const declarations = symbol.getDeclarations();

	if (!declarations) {
		return;
	}

	const [decl] = declarations;

	if (!decl) {
		return;
	}

	if (TypeScript.isPropertySignature(decl)) {
		const signatureType = decl.type;

		if (!signatureType) {
			return;
		}

		switch (signatureType.kind) {
			// prop: any
			case TypeScript.SyntaxKind.AnyKeyword:
				return 'Event';
			// prop: EventHandler<any>
			case TypeScript.SyntaxKind.TypeReference:
				const refType = signatureType as TypeScript.TypeReferenceNode;
				const text = getEventName(refType.typeName);

				// propName: React.EventHandler<React.ChangeEvent<any>>
				const typeArg = refType.typeArguments ? refType.typeArguments[0] : undefined;

				if (typeArg && text === 'EventHandler') {
					if (typeArg.kind === TypeScript.SyntaxKind.TypeReference) {
						const refArg = typeArg as TypeScript.TypeReferenceNode;
						return getEventName(refArg.typeName);
					}

					return 'Event';
				}

				// onClick: React.ChangeEventHandler<any>
				return text ? text.replace(/Handler$/, '') : undefined;
			// prop: (e: React.MousEvent<any>) => void;
			case TypeScript.SyntaxKind.FunctionType:
				const functionType = signatureType as TypeScript.FunctionTypeNode;
				const param = functionType.parameters[0];

				if (!param || !param.type) {
					return 'Event';
				}

				if (param.type.kind === TypeScript.SyntaxKind.TypeReference) {
					const refParam = param.type as TypeScript.TypeReferenceNode;
					return getEventName(refParam.typeName);
				}

				return 'Event';
			default:
				return 'Event';
		}
	}

	// propName(e: React.MouseEvent<any>): void
	if (TypeScript.isMethodSignature(decl)) {
		const param = decl.parameters ? decl.parameters[0] : undefined;

		if (!param) {
			return;
		}

		const paramType = param.type ? param.type : param;

		if (!paramType) {
			return;
		}

		return getEventName((paramType as TypeScript.TypeReferenceNode).typeName);
	}

	return;
}

function getEventName(node: TypeScript.Node): string | undefined {
	// React.MouseEvent => MousEvent
	if (TypeScript.isQualifiedName(node)) {
		return node.right.getText();
	}

	// MousEvent => MousEvent
	if (TypeScript.isTypeReferenceNode(node)) {
		return node.typeName.getText();
	}

	// MousEvent => MousEvent
	if (TypeScript.isIdentifier(node)) {
		return node.getText();
	}

	return;
}
