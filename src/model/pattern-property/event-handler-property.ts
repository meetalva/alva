import * as AlvaUtil from '../../alva-util';
import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../../types';

export interface PatternEventHandlerPropertyInit {
	contextId: string;
	defaultOptionId?: string;
	description?: string;
	event: PatternEvent;
	hidden: boolean;
	id: string;
	inputType: Types.PatternPropertyInputType;
	label: string;
	origin: Types.PatternPropertyOrigin;
	propertyName: string;
	required: boolean;
}

export class PatternEventHandlerProperty extends PatternPropertyBase<string[]> {
	public readonly type = Types.PatternPropertyType.EventHandler;
	private event: PatternEvent;

	public constructor(init: PatternEventHandlerPropertyInit) {
		super(init);
		this.event = init.event;
	}

	public static from(
		serialized: Types.SerializedPatternEventHandlerProperty
	): PatternEventHandlerProperty {
		return new PatternEventHandlerProperty({
			contextId: serialized.contextId,
			description: serialized.description,
			event: PatternEvent.from(serialized.event),
			hidden: serialized.hidden,
			id: serialized.id,
			inputType: serialized.inputType,
			label: serialized.label,
			origin: deserializeOrigin(serialized.origin),
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	public coerceValue<T>(value: T): string[] {
		return AlvaUtil.ensureArray(value).map(
			item => (typeof item === 'string' ? item : item.toString())
		);
	}

	public toJSON(): Types.SerializedPatternEventHandlerProperty {
		return {
			contextId: this.contextId,
			description: this.description,
			event: this.event.toJSON(),
			example: this.example,
			hidden: this.hidden,
			id: this.id,
			inputType: this.inputType,
			label: this.label,
			origin: serializeOrigin(this.origin),
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternEventHandlerProperty): void {
		this.contextId = prop.getContextId();
		this.description = prop.getDescription();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
	}
}

export interface PatternEventInit {
	type: Types.PatternEventType;
}

export class PatternEvent {
	private type: Types.PatternEventType;

	public constructor(init: PatternEventInit) {
		this.type = init.type;
	}

	public static from(serialized: Types.SerializedPatternEvent): PatternEvent {
		return new PatternEvent({
			type: deserializeEventType(serialized.type)
		});
	}

	public toJSON(): Types.SerializedPatternEvent {
		return {
			type: serializeEventType(this.type)
		};
	}
}

function deserializeEventType(type: Types.SerializedPatternEventType): Types.PatternEventType {
	switch (type) {
		case 'ChangeEvent':
			return Types.PatternEventType.ChangeEvent;
		case 'MouseEvent':
			return Types.PatternEventType.MouseEvent;
		default:
			throw new Error(`Unknown event type: ${type}`);
	}
}

function serializeEventType(type: Types.PatternEventType): Types.SerializedPatternEventType {
	switch (type) {
		case Types.PatternEventType.ChangeEvent:
			return 'ChangeEvent';
		case Types.PatternEventType.MouseEvent:
			return 'MouseEvent';
		default:
			throw new Error(`Unknown event type: ${type}`);
	}
}
