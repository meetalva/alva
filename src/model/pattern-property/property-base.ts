// TODO: Disband this file in favor of a pure interface
// that can be implemented by properties. Also consider
// splitting array vs enum vs object vs primitive properties
import * as Types from '../types';
import * as uuid from 'uuid';

export { PatternPropertyType } from '../types';

export interface PatternPropertyInit<T> {
	defaultValue?: T;
	hidden?: boolean;
	id?: string;
	label: string;
	propertyName: string;
	required?: boolean;
}

/**
 * A property is the meta-information about one styleguide pattern component property
 * (props interface), such as its name and type. Read by the pattern parsers and provided to build
 * the property editing pane.
 * Page elements contain the actual values for each property.
 * @see PageElement
 * @see PatternParser
 */
export abstract class PatternPropertyBase<T> {
	protected readonly defaultValue: T;

	protected readonly hidden: boolean = false;

	protected readonly id: string;

	protected readonly label: string;

	protected readonly propertyName: string;

	protected readonly required: boolean = false;

	public readonly type: Types.PatternPropertyType;

	public constructor(init: PatternPropertyInit<T>) {
		this.id = init.id || uuid.v4();
		this.label = init.label;
		this.propertyName = init.propertyName;

		if (typeof init.hidden !== 'undefined') {
			this.hidden = init.hidden;
		}

		if (typeof init.required !== 'undefined') {
			this.required = init.required;
		}

		this.defaultValue = this.coerceValue(init.defaultValue);
	}

	// tslint:disable-next-line:no-any
	public abstract coerceValue(value: any): T;

	public getDefaultValue(): T | undefined {
		return this.defaultValue;
	}

	public getHidden(): boolean {
		return this.hidden;
	}

	public getId(): string {
		return this.id;
	}

	public getLabel(): string {
		return this.label;
	}

	public getRequired(): boolean {
		return this.required;
	}

	public getType(): Types.PatternPropertyType {
		return this.type;
	}

	public abstract toJSON(): Types.SerializedPatternProperty;
}
