import * as Mobx from 'mobx';
import * as Message from '../message';
import * as _ from 'lodash';
import * as Types from '../types';
import { Project } from './project';
import { UserStore } from './user-store';
import { UserStoreAction } from './user-store-action';
import { UserStoreProperty } from './user-store-property';
import * as uuid from 'uuid';

export interface Sender {
	send(msg: Message.Message): void;
}

export interface ElementActionInit {
	elementPropertyId: string;
	id: string;
	open: boolean;
	payload: string;
	payloadType: Types.ElementActionPayloadType;
	storeActionId: string;
	storePropertyId: string;
}

export class ElementAction {
	public readonly model = Types.ModelName.ElementAction;

	private elementPropertyId: string;
	private id: string;
	private userStore: UserStore;

	@Mobx.observable private open: boolean;
	@Mobx.observable private payload: string;
	@Mobx.observable private payloadType: Types.ElementActionPayloadType;
	@Mobx.observable private storeActionId: string;
	@Mobx.observable private storePropertyId: string;

	public constructor(init: ElementActionInit, ctx: { userStore: UserStore }) {
		this.elementPropertyId = init.elementPropertyId;
		this.id = init.id;
		this.open = init.open;
		this.payload = init.payload;
		this.payloadType = init.payloadType;
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
				elementPropertyId: serialized.elementPropertyId,
				id: serialized.id,
				open: serialized.open,
				payload: serialized.payload || '',
				payloadType: serialized.payloadType,
				storeActionId: serialized.storeActionId,
				storePropertyId: serialized.storePropertyId
			},
			ctx
		);
	}

	public clone(): ElementAction {
		return new ElementAction(
			{
				elementPropertyId: this.elementPropertyId,
				id: uuid.v4(),
				open: false,
				payload: this.payload,
				payloadType: this.payloadType,
				storeActionId: this.storeActionId,
				storePropertyId: this.storePropertyId
			},
			{ userStore: this.userStore }
		);
	}

	public equals(b: this): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public execute({
		sender,
		project,
		event
	}: {
		sender?: Sender;
		project: Project;
		event: Event;
	}): void {
		const userStore = project.getUserStore();
		const storeAction = userStore.getActionById(this.storeActionId);

		if (!storeAction) {
			return;
		}

		switch (storeAction.getType()) {
			case Types.UserStoreActionType.Noop:
				return;
			case Types.UserStoreActionType.Set: {
				const storeProperty = userStore.getPropertyById(this.storePropertyId);
				if (storeProperty) {
					storeProperty.setValue(this.getResolvedPayload({ project, event }) || '');
				}
				break;
			}
			case Types.UserStoreActionType.SetPage: {
				const pageProperty = userStore.getPageProperty();
				pageProperty.setValue(this.getPayload());
				break;
			}
			case Types.UserStoreActionType.OpenExternal: {
				if (sender) {
					sender.send({
						type: Message.MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: this.payload
					});
				} else {
					window.open(this.payload, '_blank', 'noopener');
				}
			}
		}
	}

	public getId(): string {
		return this.id;
	}

	public getElementPropertyId(): string {
		return this.elementPropertyId;
	}

	public getOpen(): boolean {
		return this.open;
	}

	public getPayload(): string {
		return this.payload;
	}

	// tslint:disable-next-line:no-any
	public getResolvedPayload({
		project,
		event
	}: {
		project: Project;
		// tslint:disable-next-line:no-any
		event: any;
	}): string | undefined {
		switch (this.payloadType) {
			case Types.ElementActionPayloadType.EventPayload: {
				switch (this.getPayload()) {
					case 'x':
						return event.clientX;
					case 'y':
						return event.clientY;
					case 'name':
						return event.target.name;
					case 'value':
						return event.target.value;
					case 'checked':
						return event.target.checked;
				}
				return undefined;
			}
			case Types.ElementActionPayloadType.PropertyPayload: {
				const elementProperty = project.getElementPropertyById(this.payload);
				return elementProperty ? String(elementProperty.getValue()) : undefined;
			}
			default:
			case Types.ElementActionPayloadType.String:
				return this.payload;
		}
	}

	public getPayloadType(): Types.ElementActionPayloadType {
		return this.payloadType || Types.ElementActionPayloadType.String;
	}

	public getStoreActionId(): string {
		return this.storeActionId;
	}

	public getStoreAction(): UserStoreAction | undefined {
		if (!this.storeActionId) {
			return;
		}

		return this.userStore.getActionById(this.storeActionId);
	}

	public getStorePropertyId(): string | undefined {
		return this.storePropertyId;
	}

	public getStoreProperty(): UserStoreProperty | undefined {
		const storeAction = this.getStoreAction();
		const actionPropId = storeAction && storeAction.getUserStorePropertyId();

		if (actionPropId) {
			return this.userStore.getPropertyById(actionPropId);
		}

		if (!this.storePropertyId) {
			return;
		}

		return this.userStore.getPropertyById(this.storePropertyId);
	}

	@Mobx.action
	public setStorePropertyId(storePropertyId: string): void {
		this.storePropertyId = storePropertyId;
	}

	@Mobx.action
	public setPayload(payload: string): void {
		this.payload = payload;
	}

	@Mobx.action
	public setPayloadType(payloadType: Types.ElementActionPayloadType): void {
		this.payloadType = payloadType;
	}

	@Mobx.action
	public setOpen(open: boolean): void {
		this.open = open;
	}

	public toJSON(): Types.SerializedElementAction {
		return {
			model: this.model,
			elementPropertyId: this.elementPropertyId,
			id: this.id,
			open: this.open,
			payload: this.payload,
			payloadType: this.payloadType,
			storeActionId: this.storeActionId,
			storePropertyId: this.storePropertyId
		};
	}

	@Mobx.action
	public unsetStorePropertyId(): void {
		this.storePropertyId = '';
	}

	@Mobx.action
	public update(b: this): void {
		this.id = b.id;
		this.payload = b.payload;
		this.payloadType = b.payloadType;
		this.storeActionId = b.storeActionId;
		this.storePropertyId = b.storePropertyId;
	}
}
