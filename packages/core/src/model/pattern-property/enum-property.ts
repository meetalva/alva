import * as Mobx from 'mobx';
import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../../types';
import { IconName } from '../../components';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { computeDifference } from '../../alva-util';

export interface PatternEnumPropertyInit {
	contextId: string;
	defaultOptionId?: string;
	description?: string;
	group: string;
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
	@Mobx.observable private options: Map<string, PatternEnumPropertyOption> = new Map();

	public readonly type = Types.PatternPropertyType.Enum;

	public constructor(init: PatternEnumPropertyInit) {
		super(init);
		this.defaultOptionId = init.defaultOptionId;
		init.options.forEach(option => this.options.set(option.getId(), option));
	}

	public static Defaults(mixin?: Partial<PatternEnumPropertyInit>): PatternEnumPropertyInit {
		return {
			defaultOptionId: undefined,
			description: '',
			group: '',
			hidden: false,
			id: uuid.v4(),
			inputType: Types.PatternPropertyInputType.Select,
			options: [],
			origin: Types.PatternPropertyOrigin.UserProvided,
			propertyName: 'a',
			required: false,
			label: 'Enum Property',
			contextId: 'a',
			...mixin
		};
	}

	public static from(serialized: Types.SerializedPatternEnumProperty): PatternEnumProperty {
		return new PatternEnumProperty({
			contextId: serialized.contextId,
			defaultOptionId: serialized.defaultOptionId,
			description: serialized.description,
			group: serialized.group,
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

	public static fromDefaults(mixin?: Partial<PatternEnumPropertyInit>): PatternEnumProperty {
		return new PatternEnumProperty(PatternEnumProperty.Defaults(mixin));
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
		const option = this.options.get(this.defaultOptionId || '');

		if (!option) {
			return;
		}

		return option.getValue();
	}

	public getOptionByContextId(contextId: string): PatternEnumPropertyOption | undefined {
		return [...this.options.values()].find(option => option.getContextId() === contextId);
	}

	public getOptionById(id: string): PatternEnumPropertyOption | undefined {
		return this.options.get(id);
	}

	public getOptionByValue(value: EnumValue): PatternEnumPropertyOption | undefined {
		return [...this.options.values()].find(option => option.getValue() === value);
	}

	public getOptions(): PatternEnumPropertyOption[] {
		return [...this.options.values()];
	}

	public toJSON(): Types.SerializedPatternEnumProperty {
		return {
			model: this.model,
			contextId: this.contextId,
			defaultOptionId: this.defaultOptionId,
			example: String(this.example),
			description: this.description,
			group: this.group,
			hidden: this.hidden,
			id: this.id,
			inputType: this.inputType,
			label: this.label,
			propertyName: this.propertyName,
			options: [...this.options.values()].map(option => option.toJSON()),
			origin: serializeOrigin(this.origin),
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternEnumProperty): void {
		this.contextId = prop.getContextId();
		this.defaultOptionId = prop.getDefaultOptionId();
		this.example = prop.getExample();
		this.group = prop.getGroup();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();

		const diff = computeDifference({
			before: this.getOptions(),
			after: prop.getOptions()
		});

		diff.added.forEach(o => {
			this.options.set(o.after.getId(), o.after);
		});

		diff.changed.forEach(o => o.before.update(o.after));

		diff.removed.forEach(o => {
			this.options.delete(o.before.getId());
		});
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
	public model = Types.ModelName.PatternEnumPropertyOption;

	@Mobx.observable private contextId: string;
	@Mobx.observable private icon: IconName | undefined;
	@Mobx.observable private id: string;
	@Mobx.observable private name: string;
	@Mobx.observable private ordinal: string;
	@Mobx.observable private value: string | number;

	public static Defaults(
		mixin?: Partial<PatternEnumPropertyOptionInit>
	): PatternEnumPropertyOptionInit {
		return {
			id: uuid.v4(),
			name: 'Enum Option',
			ordinal: '0',
			value: '0',
			contextId: '0',
			icon: undefined,
			...mixin
		};
	}

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

	public static fromDefaults(
		mixin?: Partial<PatternEnumPropertyOptionInit>
	): PatternEnumPropertyOption {
		return new PatternEnumPropertyOption(PatternEnumPropertyOption.Defaults(mixin));
	}

	public equals(b: PatternEnumPropertyOption): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
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

	public setValue(value: string | number): void {
		this.value = value;
	}

	public toJSON(): Types.SerializedEnumOption {
		return {
			model: Types.ModelName.PatternEnumPropertyOption,
			contextId: this.contextId,
			icon: this.icon,
			id: this.id,
			name: this.name,
			ordinal: this.ordinal,
			value: this.value
		};
	}

	@Mobx.action
	public update(b: PatternEnumPropertyOption): void {
		this.contextId = b.contextId;
		this.icon = b.icon;
		this.name = b.name;
		this.ordinal = b.ordinal;
		this.value = b.value;
	}
}
