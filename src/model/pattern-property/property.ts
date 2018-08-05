import { PatternAssetProperty } from './asset-property';
import { PatternBooleanProperty } from './boolean-property';
import { PatternEnumProperty } from './enum-property';
import { PatternEventHandlerProperty } from './event-handler-property';
import { PatternHrefProperty } from './href-property';
import { PatternNumberProperty } from './number-property';
import { PatternPropertyBase } from './property-base';
import { PatternStringProperty } from './string-property';
import * as Types from '../../types';

export type PatternPropertyValueType = string | boolean | number | number[] | string[] | undefined;

export type AnyPatternProperty = PatternPropertyBase<PatternPropertyValueType>;

export class PatternProperty {
	public static from(serialized: Types.SerializedPatternProperty): AnyPatternProperty {
		switch (serialized.type) {
			case Types.PatternPropertyType.Asset:
				return PatternAssetProperty.from(serialized);
			case Types.PatternPropertyType.Boolean:
				return PatternBooleanProperty.from(serialized);
			case Types.PatternPropertyType.Enum:
				return PatternEnumProperty.from(serialized);
			case Types.PatternPropertyType.EventHandler:
				return PatternEventHandlerProperty.from(serialized);
			case Types.PatternPropertyType.Number:
				return PatternNumberProperty.from(serialized);
			case Types.PatternPropertyType.Href:
				return PatternHrefProperty.from(serialized);
			case Types.PatternPropertyType.String:
				return PatternStringProperty.from(serialized);
		}
		throw new Error(`Unknown property type: ${serialized.type}`);
	}
}
