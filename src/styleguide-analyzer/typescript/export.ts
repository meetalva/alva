// tslint:disable:no-bitwise

import { Type } from './type';
import * as ts from 'typescript';

/**
 * A JavaScript export declaration.
 */
export interface Export {
	/**
	 * The name of the export, or undefined if this is the default export.
	 */
	name?: string;

	/**
	 * The TypeScript export statement.
	 */
	statement: ts.Statement;

	/**
	 * The type of the object exported.
	 */
	type: Type;
}
