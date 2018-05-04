import { EventAction } from './event-action';
import { OpenPageAction } from './open-page-action';
import { Property } from '../property';
import { SetVariableAction } from './set-variable-action';

/**
 * An event property is a property that takes EventActions to generate handler functions
 * for UI events.
 * @see Property
 */
export class EventProperty extends Property {
	/**
	 * Creates a new boolean property.
	 * @param id The technical ID of this property (e.g. the property name
	 * in the TypeScript props interface).
	 */
	public constructor(id: string) {
		super(id);
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value instanceof EventAction) {
			return value;
		} else if (
			value &&
			value._type === 'set-variable-event-action' &&
			typeof value.variable === 'string'
		) {
			return new SetVariableAction({ variable: value.variable as string });
		} else if (
			value &&
			value._type === 'open-page-event-action' &&
			typeof value.pageId === 'string'
		) {
			return new OpenPageAction({ pageId: value.pageId as string });
		} else {
			return undefined;
		}
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'event';
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `EventProperty(${super.toString()})`;
	}
}
