import { EventAction } from './event-action';
import { JsonObject } from '../../../json';

/**
 * The first parameter of these functions must be the DOM event (e.g. click, change).
 */
export class SetVariableAction extends EventAction {
	/**
	 * The name of the variable to set on events.
	 */
	private variable: string;

	/**
	 * Creates a new set-variable action
	 * @param variable The name of the variable to set on events.
	 */
	public constructor(props: { variable: string }) {
		super();
		this.variable = props.variable;
	}

	/**
	 * Returns the name of the variable to set on events.
	 * @return The name of the variable.
	 */
	public getVariable(): string {
		return this.variable;
	}

	/**
	 * @inheritdoc
	 */
	public toJsonObject(): JsonObject {
		return {
			_type: 'set-variable-event-action',
			variable: this.variable
		};
	}
}
