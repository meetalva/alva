import { Store } from '../store';

/**
 * A Slot is the meta-information about one styleguide patterns supported composition points.
 * It enables a PageElement to receive other PageElements from outside at defined locations.
 *
 * If a Pattern supports outside composition it usually has at least one slot (the default slot).
 * The default slot has the id 'default'. For React the default slot maps to `props.children`. For other Frameworks this might be the un-named slot.
 *
 * Furthermore, if there are other slots than the default one supported by the pattern they will be listed by name in the element pane and are marked by a special icon.
 *
 * If a Pattern doesn't support outside composition it shouldn't have slots.
 *
 * Slots get generated and added to a Pattern by the StyleguideAnalyzer in use.
 * Page elements contain the actual contents for each slot.
 * @see PageElement
 * @see StyleguideAnalyzer
 */
export class Slot {
	/**
	 * The technical ID of this slot (e.g. the property name in the TypeScript props interface).
	 */
	private id: string;

	/**
	 * The human-friendly name of the slot.
	 * In the frontend, to be displayed instead of the ID.
	 */
	private name: string;

	public constructor(id: string) {
		this.id = id;
		this.name = Store.guessName(id);
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
}
