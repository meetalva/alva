import * as Types from '../types';

export interface SlotInit {
	id: string;
	name: string;
}

export class Slot {
	private id: string;

	private name: string;

	public constructor(init: SlotInit) {
		this.id = init.id;
		this.name = init.name;
	}

	public static from(serialized: Types.SerializedPatternSlot): Slot {
		return new Slot(serialized);
	}

	/**
	 * Returns the technical ID of this slot (e.g. the property name in the TypeScript props
	 * interface).
	 * @return The technical ID.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the human-friendly name of the slot.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-friendly name of the slot.
	 */
	public getName(): string {
		return this.name;
	}

	public toJSON(): Types.SerializedPatternSlot {
		return {
			id: this.id,
			name: this.name
		};
	}
}
