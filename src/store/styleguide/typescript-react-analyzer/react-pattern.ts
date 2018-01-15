import { Pattern, PatternInit } from '../../pattern/pattern';
import { Property } from '../../pattern/property/property';
import { getProperties } from './property-analyzer';
import { ReactComponentExport } from './typescript/react';

export interface PatternFileInfo {
	directory: string;
	jsFilePath: string;
	declarationFilePath: string;
}

export interface ReactPatternInit extends PatternInit {
	fileInfo: PatternFileInfo;
	exportInfo: ReactComponentExport;
}

export class ReactPattern extends Pattern {
	public readonly fileInfo: PatternFileInfo;
	public readonly exportInfo: ReactComponentExport;

	public get isConstructable(): boolean {
		return this.exportInfo.type.isConstructable;
	}

	public constructor(init: ReactPatternInit) {
		super(init);

		this.fileInfo = init.fileInfo;
		this.exportInfo = init.exportInfo;

		this.properties = this.generateProperties();
	}

	private generateProperties(): Map<string, Property> {
		const propType = this.exportInfo.wellKnownReactAncestorType.typeArguments[0];

		if (!propType) {
			return new Map();
		}

		return getProperties(propType.type, propType.typeChecker);
	}
}
