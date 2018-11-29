// tslint:disable:no-bitwise

import * as ts from 'typescript';
import { TypeScriptType } from './typescript-type';

/**
 * A JavaScript export declaration.
 */
export interface TypescriptExport {
	/**
	 * The name of the export, or undefined if this is the default export.
	 */
	name?: string;

	/**
	 * The description of the export
	 */
	description: string;

	/**
	 * The TypeScript export statement.
	 */
	statement: ts.Statement;

	/**
	 * The type of the object exported.
	 */
	type: TypeScriptType;

	/**
	 * If the export should be ignored
	 */
	ignore: boolean;
}
