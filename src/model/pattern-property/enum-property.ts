import * as Mobx from 'mobx';
import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../../types';
import { IconName } from '../../components';

export interface PatternEnumPropertyInit {
	contextId: string;
	defaultOptionId?: string;
	description?: string;
	hidden: boolean;
	id: string;
	inputType: Types.PatternPropertyInputType;
	label: string;
	options: PatternEnumPropertyOption[];
	origin: Types.PatternPropertyOrigin;
	propertyName: string;
	required: boolean;
}

export type EnumValue = string | number;

export class PatternEnumProperty extends PatternPropertyBase<EnumValue | undefined> {
	@Mobx.observable private defaultOptionId?: string;
	@Mobx.observable private options: PatternEnumPropertyOption[] = [];

	public readonly type = Types.PatternPropertyType.Enum;

	public constructor(init: PatternEnumPropertyInit) {
		super(init);
		this.options = init.options;
		this.defaultOptionId = init.defaultOptionId;
	}

	public static from(serialized: Types.SerializedPatternEnumProperty): PatternEnumProperty {
		return new PatternEnumProperty({
			contextId: serialized.contextId,
			defaultOptionId: serialized.defaultOptionId,
			description: serialized.description,
			hidden: serialized.hidden,
			id: serialized.id,
			inputType: serialized.inputType,
			label: serialized.label,
			options: serialized.options.map(serializedOption =>
				PatternEnumPropertyOption.from(serializedOption)
			),
			origin: deserializeOrigin(serialized.origin),
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): EnumValue | undefined {
		if (typeof value !== 'string' && typeof value !== 'number') {
			return;
		}

		if (typeof value === 'number' && Number.isNaN(value)) {
			return;
		}

		return value;
	}

	public getDefaultOptionId(): string | undefined {
		return this.defaultOptionId;
	}

	public getDefaultValue(): EnumValue | undefined {
		const option = this.options.find(o => o.getId() === this.defaultOptionId);

		if (!option) {
			return;
		}

		return option.getValue();
	}

	public getOptionByContextId(contextId: string): PatternEnumPropertyOption | undefined {
		return this.options.find(option => option.getContextId() === contextId);
	}

	public getOptionById(id: string): PatternEnumPropertyOption | undefined {
		return this.options.find(option => option.getId() === id);
	}

	public getOptionByValue(value: EnumValue): PatternEnumPropertyOption | undefined {
		return this.options.find(option => option.getValue() === value);
	}

	public getOptions(): PatternEnumPropertyOption[] {
		return this.options;
	}

	public toJSON(): Types.SerializedPatternEnumProperty {
		return {
			contextId: this.contextId,
			defaultOptionId: this.defaultOptionId,
			example: String(this.example),
			description: this.description,
			hidden: this.hidden,
			id: this.id,
			inputType: this.inputType,
			label: this.label,
			propertyName: this.propertyName,
			options: this.options.map(option => option.toJSON()),
			origin: serializeOrigin(this.origin),
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternEnumProperty): void {
		this.contextId = prop.getContextId();
		this.defaultOptionId = prop.getDefaultOptionId();
		this.example = prop.getExample();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.options = prop.getOptions();
		this.required = prop.getRequired();
	}
}

export interface PatternEnumPropertyOptionInit {
	contextId: string;
	icon: IconName | undefined;
	id: string;
	name: string;
	ordinal: string;
	value: string | number;
}

export class PatternEnumPropertyOption {
	@Mobx.observable private contextId: string;
	@Mobx.observable private icon: IconName | undefined;
	@Mobx.observable private id: string;
	@Mobx.observable private name: string;
	@Mobx.observable private ordinal: string;
	@Mobx.observable private value: string | number;

	public constructor(init: PatternEnumPropertyOptionInit) {
		this.id = init.id;
		this.name = init.name;
		this.ordinal = init.ordinal;
		this.value = init.value;
		this.contextId = init.contextId;
		this.icon = init.icon;
	}

	public static from(serialized: Types.SerializedEnumOption): PatternEnumPropertyOption {
		return new PatternEnumPropertyOption(serialized);
	}

	public getContextId(): string {
		return this.contextId;
	}

	public getIcon(): IconName | undefined {
		return this.icon;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getOrdinal(): string {
		return this.ordinal;
	}

	public getValue(): string | number {
		return this.value;
	}

	public toJSON(): Types.SerializedEnumOption {
		return {
			contextId: this.contextId,
			icon: this.icon,
			id: this.id,
			name: this.name,
			ordinal: this.ordinal,
			value: this.value
		};
	}
}
