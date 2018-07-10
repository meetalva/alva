import * as Mobx from 'mobx';
import * as _ from 'lodash';
import * as Types from '../types';
import { UserStore } from './user-store';
import * as uuid from 'uuid';

export interface ElementActionInit {
	id: string;
	payload: string;
	storeActionId: string;
	storePropertyId: string;
}

export class ElementAction {
	private id: string;
	private userStore: UserStore;
	@Mobx.observable private payload: string;
	@Mobx.observable private storeActionId: string;
	@Mobx.observable private storePropertyId: string;

	public constructor(init: ElementActionInit, ctx: { userStore: UserStore }) {
		this.id = init.id;
		this.payload = init.payload;
		this.storeActionId = init.storeActionId;
		this.storePropertyId = init.storePropertyId;
		this.userStore = ctx.userStore;
	}

	public static from(
		serialized: Types.SerializedElementAction,
		ctx: { userStore: UserStore }
	): ElementAction {
		return new ElementAction(
			{
				id: serialized.id,
				payload: serialized.payload || '',
				storeActionId: serialized.storeActionId,
				storePropertyId: serialized.storePropertyId
			},
			ctx
		);
	}

	public clone(): ElementAction {
		return new ElementAction(
			{
				id: uuid.v4(),
				payload: this.payload,
				storeActionId: this.storeActionId,
				storePropertyId: this.storePropertyId
			},
			{ userStore: this.userStore }
		);
	}

	public equals(b: this): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public execute(): void {
		const storeAction = this.userStore.getActionById(this.storeActionId);

		if (!storeAction) {
			return;
		}

		const storeProperty = this.userStore.getPropertyById(this.storePropertyId);

		if (!storeProperty) {
			return;
		}

		switch (storeAction.getType()) {
			case Types.UserStoreActionType.Noop:
				return;
			case Types.UserStoreActionType.Set:
				storeProperty.setPayload(this.payload);
		}
	}

	public getId(): string {
		return this.id;
	}

	public getPayload(): string {
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

	@Mobx.action
	public update(after: this): void {
		this.id = after.id;
		this.payload = after.payload;
		this.storeActionId = after.storeActionId;
		this.storePropertyId = after.storePropertyId;
	}
}
