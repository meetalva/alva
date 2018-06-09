import * as Mobx from 'mobx';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface ElementActionInit {
	id: string;
	payload: string;
	storeActionId: string;
	storePropertyId: string;
}

export class ElementAction {
	private id: string;
	@Mobx.observable private payload: string;
	@Mobx.observable private storeActionId: string;
	@Mobx.observable private storePropertyId: string;

	public constructor(init: ElementActionInit) {
		this.id = init.id;
		this.payload = init.payload;
		this.storeActionId = init.storeActionId;
		this.storePropertyId = init.storePropertyId;
	}

	public static from(serialized: Types.SerializedElementAction): ElementAction {
		return new ElementAction({
			id: serialized.id,
			payload: serialized.payload || '',
			storeActionId: serialized.storeActionId,
			storePropertyId: serialized.storePropertyId
		});
	}

	public clone(): ElementAction {
		return new ElementAction({
			id: uuid.v4(),
			payload: this.payload,
			storeActionId: this.storeActionId,
			storePropertyId: this.storePropertyId
		});
	}

	public getId(): string {
		return this.id;
	}

	public getPayload(): string | undefined {
		return this.payload;
	}

	public getStoreActionId(): string {
		return this.storeActionId;
	}

	public getStorePropertyId(): string | undefined {
		return this.storePropertyId;
	}

	@Mobx.action
	public setPayload(payload: string): void {
		this.payload = payload;
	}

	@Mobx.action
	public setStorePropertyId(storePropertyId: string): void {
		this.storePropertyId = storePropertyId;
	}

	public toJSON(): Types.SerializedElementAction {
		return {
			id: this.id,
			payload: this.payload,
			storeActionId: this.storeActionId,
			storePropertyId: this.storePropertyId
		};
	}

	@Mobx.action
	public unsetStorePropertyId(): void {
		this.storePropertyId = '';
	}
}
