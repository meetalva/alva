import { PatternAssetProperty } from './asset-property';
import { PatternBooleanProperty } from './boolean-property';
import { PatternEnumProperty } from './enum-property';
import { PatternNumberArrayProperty } from './number-array-property';
import { PatternNumberProperty } from './number-property';
import { PatternObjectProperty } from './object-property';
import { PatternPropertyBase } from './property-base';
import { PatternStringArrayProperty } from './string-array-property';
import { PatternStringProperty } from './string-property';
import * as Types from '../types';

export class PatternProperty {
	public static from(serialized: Types.SerializedPatternProperty): PatternPropertyBase {
		switch (serialized.type) {
			case Types.PatternPropertyType.Asset:
				return PatternAssetProperty.from(serialized);
			case Types.PatternPropertyType.Boolean:
				return PatternBooleanProperty.from(serialized);
			case Types.PatternPropertyType.Enum:
				return PatternEnumProperty.from(serialized);
			case Types.PatternPropertyType.NumberArray:
				return PatternNumberArrayProperty.from(serialized);
			case Types.PatternPropertyType.Number:
				return PatternNumberProperty.from(serialized);
			case Types.PatternPropertyType.Object:
				return PatternObjectProperty.from(serialized);
			case Types.PatternPropertyType.StringArray:
				return PatternStringArrayProperty.from(serialized);
			case Types.PatternPropertyType.String:
				return PatternStringProperty.from(serialized);
		}
	}
}
