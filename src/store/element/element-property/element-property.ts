import * as Mobx from 'mobx';
import { PatternProperty, PatternPropertyType } from '../../pattern-property';
import * as Types from '../../types';
import * as uuid from 'uuid';

// tslint:disable-next-line:no-duplicate-imports
import * as P from '../../pattern-property';

export interface ElementPropertyInit {
	id: string;
	patternProperty: PatternProperty;
	setDefault: boolean;
	value: Types.ElementPropertyValue;
}

export class ElementProperty {
	private id: string;
	private patternProperty: PatternProperty;
	private setDefault: boolean;
	@Mobx.observable private value: Types.ElementPropertyValue;

	public constructor(init: ElementPropertyInit) {
		this.id = init.id;
		this.patternProperty = init.patternProperty;
		this.setDefault = init.setDefault;
		this.value = init.value;
	}

	public static from(serialized: Types.SerializedElementProperty): ElementProperty {
		return new ElementProperty({
			id: serialized.id,
			patternProperty: deserializeProperty(serialized.patternProperty),
			setDefault: serialized.setDefault,
			value: serialized.value
		});
	}

	public clone(): ElementProperty {
		return new ElementProperty({
			id: uuid.v4(),
			patternProperty: this.patternProperty,
			setDefault: this.setDefault,
			value: this.value
		});
	}

	public getId(): string {
		return this.id;
	}

	public getLabel(): string {
		return this.patternProperty.getLabel();
	}

	public getType(): PatternPropertyType {
		return this.patternProperty.getType();
	}

	public getValue(): Types.ElementPropertyValue {
		return this.value;
	}

	public hasPatternProperty(patternProperty: PatternProperty): boolean {
		return this.patternProperty.getId() === patternProperty.getId();
	}

	@Mobx.action
	public setValue(value: Types.ElementPropertyValue): void {
		this.value = value;
	}

	public toJSON(): Types.SerializedElementProperty {
		return {
			id: this.id,
			patternProperty: this.patternProperty.toJSON(),
			setDefault: this.setDefault,
			value: this.value
		};
	}
}

function deserializeProperty(input: Types.SerializedPatternProperty): PatternProperty {
	switch (input.type) {
		case PatternPropertyType.Asset:
			return P.PatternAssetProperty.from(input);
		case PatternPropertyType.Boolean:
			return P.PatternBooleanProperty.from(input);
		case PatternPropertyType.Enum:
			return P.PatternEnumProperty.from(input);
		case PatternPropertyType.Number:
			return P.PatternNumberProperty.from(input);
		case PatternPropertyType.NumberArray:
			return P.PatternNumberArrayProperty.from(input);
		case PatternPropertyType.Object:
			return P.PatternObjectProperty.from(input);
		case PatternPropertyType.String:
			return P.StringPatternProperty.from(input);
		case PatternPropertyType.StringArray:
			return P.StringPatternArrayProperty.from(input);
		default:
			console.warn(`Tried to deserialize unknown property: ${JSON.stringify(input)}`);
			return P.StringPatternProperty.from(input);
	}
}
