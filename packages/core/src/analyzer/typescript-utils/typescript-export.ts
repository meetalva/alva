// tslint:disable:no-bitwise

import * as ts from 'typescript';
import { TypeScriptType } from './typescript-type';
import * as Types from '../../types';

/**
 * A JavaScript export declaration
 */
export interface TypescriptExport {
	/**
	 * The name of the export, or undefined if this is the default export
	 */
	exportName?: string;

	/**
	 * The name of the component set via JSDoc or exportName if no name is set
	 */
	displayName?: string;

	/**
	 * The description of the export
	 */
	description: string;

	/**
	 * The TypeScript export statement
	 */
	statement: ts.Statement;

	/**
	 * Icon to show in pattern list
	 */
	icon: string;

	/**
	 * The type of the object exported
	 */
	type: TypeScriptType;

	/**
	 * The pattern type (like synthetic:page)
	 */
	patternType: Types.SerializedPatternType;

	/**
	 * If the export should be ignored
	 */
	ignore: boolean;
}
