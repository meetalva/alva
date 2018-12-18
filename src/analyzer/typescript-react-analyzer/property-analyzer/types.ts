import * as Ts from 'typescript';

export interface PropertyAnalyzeContext {
	program: Ts.Program;
	getEnumOptionId(enumId: string, contextId: string): string;
	getPropertyId(contextId: string): string;
}

export interface PropertyInit {
	symbol: Ts.Symbol;
	type: Ts.Type;
	typechecker: Ts.TypeChecker;
}
