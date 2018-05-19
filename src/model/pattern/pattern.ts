import * as AlvaUtil from '../../alva-util';
import { PatternFolder } from './pattern-folder';
import { PatternLibrary } from '../pattern-library';
import * as PatternProperty from '../pattern-property';
import { PatternSlot } from './pattern-slot';
import * as Types from '../types';
import * as uuid from 'uuid';

// tslint:disable-next-line:no-duplicate-imports
// import { PatternPropertyType } from '../types';

export type PatternType = SyntheticPatternType | ConcretePatternType;

export enum SyntheticPatternType {
	SyntheticBox = 'synthetic:box',
	SyntheticPage = 'synthetic:page',
	SyntheticPlaceholder = 'synthetic:placeholder',
	SyntheticText = 'synthetic:text'
}

export enum ConcretePatternType {
	Pattern = 'pattern'
}

export interface PatternInit {
	exportName?: string;
	id?: string;
	name: string;
	path: string;
	propertyIds?: string[];
	slots?: PatternSlot[];
	type: PatternType;
}

export interface PatternContext {
	patternLibrary: PatternLibrary;
}

/**
 * A pattern represents a reusable, styled component (e.g. a React component) of the styleguide.
 * Patterns are parsed from the lib folder of the styleguide, supporting a set of properties
 * of various types, like strings, numbers, page elements, etc.
 * The designer then creates page elements within a page using these patterns as a basis.
 * Patterns may be structured into folders (like 'atoms', 'modules', etc.).
 * Depending on the styleguide analyzer used, various styleguide formats are supported,
 * e.g. Patternplate.
 */
export class Pattern {
	/**
	 * The name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 */
	private exportName: string;

	/**
	 * The folder containing the pattern.
	 */
	private folder: PatternFolder;

	/**
	 * The ID of the pattern. How this is generated is completely up to the styleguide analyzer
	 * that creates the pattern (and does not necessarily represent the file path).
	 */
	private id: string;

	/**
	 * The human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 */
	private name: string;

	/**
	 * The absolute path to the JavaScript implementation of the pattern,
	 * used to preview page elements.
	 */
	private path: string;

	private patternLibrary: PatternLibrary;

	/**
	 * The properties this pattern supports.
	 */
	private propertyIds: string[];

	/**
	 * The slots this pattern supports
	 */
	private slots: PatternSlot[];

	private type: PatternType;

	/**
	 * Creates a new pattern.
	 * @param id The ID of the pattern. How this is generated is completely up to the styleguide analyzer
	 * that creates the pattern (and does not necessarily represent the file path).
	 * @param name The human-readable name of the pattern.
	 * @param implementationPath The absolute path to the JavaScript implementation of the pattern,
	 * used to preview page elements.
	 * @param exportName The name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 */
	public constructor(init: PatternInit, context: PatternContext) {
		this.exportName = init.exportName || 'default';
		this.id = init.id || uuid.v4();
		this.name = AlvaUtil.guessName(init.name);
		this.path = init.path || '';
		this.patternLibrary = context.patternLibrary;
		this.propertyIds = init.propertyIds || [];
		this.type = init.type;
		this.slots = init.slots || [
			new PatternSlot({
				displayName: 'Children',
				propertyName: 'children',
				id: uuid.v4(),
				type: Types.SlotType.Children
			})
		];
	}

	public static from(serialized: Types.SerializedPattern, context: PatternContext): Pattern {
		return new Pattern(
			{
				exportName: serialized.exportName,
				id: serialized.id,
				name: serialized.name,
				path: serialized.path,
				propertyIds: serialized.propertyIds,
				slots: serialized.slots.map(slot => PatternSlot.from(slot)),
				type: stringToType(serialized.type)
			},
			context
		);
	}

	/**
	 * Adds a slot to this pattern. This method is called by the analyzer only.
	 * @param name The slot to add.
	 */
	public addSlot(slot: PatternSlot): void {
		this.slots.push(slot);
	}

	/**
	 * Returns the name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 * @return The name of the export.
	 */
	public getExportName(): string {
		return this.exportName;
	}

	public getFolder(): PatternFolder {
		return this.folder;
	}

	/**
	 * Returns the ID of the pattern. How this is generated is completely up to the
	 * styleguide analyzer that creates the pattern (and does not necessarily represent
	 * the file path).
	 * @return The ID of the pattern.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-readable name of the pattern.
	 */
	public getName(): string {
		return this.name;
	}

	public getPath(): string {
		return this.path;
	}

	/**
	 * Returns the properties this pattern supports.
	 * @return The properties this pattern supports.
	 */
	public getProperties(): PatternProperty.AnyProperty[] {
		return this.propertyIds
			.map(propertyId => this.patternLibrary.getPatternPropertyById(propertyId))
			.filter((p): p is PatternProperty.AnyProperty => typeof p !== 'undefined');
	}

	/**
	 * Returns the slots this pattern supports.
	 * @return The slots this pattern supports.
	 */
	public getSlots(): PatternSlot[] {
		return this.slots;
	}

	public getType(): PatternType {
		return this.type;
	}

	public toJSON(): Types.SerializedPattern {
		return {
			exportName: this.exportName,
			id: this.id,
			name: this.name,
			path: this.path,
			propertyIds: this.propertyIds,
			slots: this.slots.map(slot => slot.toJSON()),
			type: this.type
		};
	}
}

const stringToType = (input: string): PatternType => {
	switch (input) {
		case 'synthetic:page':
			return SyntheticPatternType.SyntheticPage;
		case 'synthetic:placeholder':
			return SyntheticPatternType.SyntheticPlaceholder;
		case 'synthetic:text':
			return SyntheticPatternType.SyntheticText;
		case 'synthetic:box':
			return SyntheticPatternType.SyntheticBox;
		case 'pattern':
			return ConcretePatternType.Pattern;
		default:
			throw new Error(`Unknown pattern type ${input}`);
	}
};

// const P = PatternProperty;

/* const unserializeProperty = (
	serialized: Types.SerializedPatternProperty
): PatternProperty.PatternProperty => {
	switch (serialized.type) {
		case PatternPropertyType.Asset:
			return P.PatternAssetProperty.from(serialized);
		case PatternPropertyType.Boolean:
			return P.PatternBooleanProperty.from(serialized);
		case PatternPropertyType.Enum:
			return P.PatternEnumProperty.from(serialized);
		case PatternPropertyType.Number:
			return P.PatternNumberProperty.from(serialized);
		case PatternPropertyType.NumberArray:
			return P.PatternNumberArrayProperty.from(serialized);
		case PatternPropertyType.Object:
			return P.PatternObjectProperty.from(serialized);
		case PatternPropertyType.String:
			return P.PatternStringProperty.from(serialized);
		case PatternPropertyType.StringArray:
			return P.StringPatternArrayProperty.from(serialized);
	}
}; */
