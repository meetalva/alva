import { ElementArea } from './element-area';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { Sender } from '../sender/preview';
import * as Types from '../types';
import * as uuid from 'uuid';

export type RequestIdleCallbackHandle = number;

export interface RequestIdleCallbackOptions {
	timeout: number;
}

export interface RequestIdleCallbackDeadline {
	readonly didTimeout: boolean;
	timeRemaining: (() => number);
}

declare global {
	interface Window {
		requestIdleCallback: ((
			callback: ((deadline: RequestIdleCallbackDeadline) => void),
			opts?: RequestIdleCallbackOptions
		) => RequestIdleCallbackHandle);
		cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void);
	}
}

export interface PreviewStoreInit<V, T extends Types.PreviewDocumentMode> {
	components: Components;
	highlightArea: ElementArea;
	mode: T;
	project: Model.Project;
	selectionArea: ElementArea;
	synthetics: SyntheticComponents<V>;
}

export interface Components {
	// tslint:disable-next-line:no-any
	[id: string]: any;
}

export interface SyntheticComponents<V> {
	'synthetic:box': V;
	'synthetic:page': V;
	'synthetic:image': V;
	'synthetic:link': V;
	'synthetic:text': V;
}

export class PreviewStore<V> {
	@Mobx.observable private components: Components;
	@Mobx.observable private highlightArea: ElementArea;
	@Mobx.observable private metaDown: boolean = false;
	@Mobx.observable private mode: Types.PreviewDocumentMode;
	@Mobx.observable private project: Model.Project;
	@Mobx.observable private selectionArea: ElementArea;
	@Mobx.observable private synthetics: SyntheticComponents<V>;

	private sender?: Sender;

	public constructor(init: PreviewStoreInit<V, Types.PreviewDocumentMode>) {
		this.mode = init.mode;
		this.project = init.project;
		this.components = init.components;
		this.synthetics = init.synthetics;
		this.selectionArea = init.selectionArea;
		this.highlightArea = init.highlightArea;
	}

	public getActivePage(): Model.Page | undefined {
		return this.project.getPages().find(page => page.getActive());
	}

	public getChildren<T>(element: Model.Element, render: (element: Model.Element) => T): T[] {
		const childContent = element.getContentBySlotType(Types.SlotType.Children);

		if (!childContent) {
			return [];
		}

		return childContent.getElements().map(render);
	}

	public getComponent(element: Model.Element): V | undefined {
		const pattern = element.getPattern();

		if (!pattern) {
			return;
		}

		const type = pattern.getType();

		switch (type) {
			case Types.PatternType.Pattern:
				// tslint:disable-next-line:no-any
				const component = this.components[pattern.getId()];

				if (!component) {
					throw new Error(
						`Could not find component with id "${pattern.getId()}" for pattern "${pattern.getName()}:${pattern.getExportName()}".`
					);
				}

				return component[pattern.getExportName()];
			case Types.PatternType.SyntheticBox:
			case Types.PatternType.SyntheticPage:
			case Types.PatternType.SyntheticImage:
			case Types.PatternType.SyntheticText:
			case Types.PatternType.SyntheticLink:
				return this.synthetics[type];
		}

		return;
	}

	public getElementById(id: string): Model.Element | undefined {
		return this.project.getElements().find(element => element.getId() === id);
	}

	public getHighlightedElement(): Model.Element | undefined {
		return this.project.getElements().find(element => element.getHighlighted());
	}

	public getHighlightedElementContent(): Model.ElementContent | undefined {
		return this.project.getElementContents().find(c => c.getHighlighted());
	}

	public getHighlightArea(): ElementArea {
		return this.highlightArea;
	}

	public getMetaDown(): boolean {
		return this.metaDown;
	}

	public getProperties<T>(
		element: Model.Element
	): { [propName: string]: Types.ElementPropertyValue } {
		return element.getProperties().reduce((renderProperties, elementProperty) => {
			const patternProperty = elementProperty.getPatternProperty();

			if (!patternProperty) {
				return renderProperties;
			}

			// TODO: Restore event handler things here
			renderProperties[patternProperty.getPropertyName()] = elementProperty.getValue();
			return renderProperties;
		}, {});
	}

	public getProject(): Model.Project {
		return this.project;
	}

	public getSelectedElement(): Model.Element | undefined {
		return this.project.getElements().find(element => element.getSelected());
	}

	public getSelectionArea(): ElementArea {
		return this.selectionArea;
	}

	public getSlots<T>(
		element: Model.Element,
		render: (element: Model.Element) => T
	): { [propName: string]: T[] } {
		return element
			.getContents()
			.filter(content => content.getSlotType() !== Types.SlotType.Children)
			.reduce((renderProperties, content) => {
				const slot = content.getSlot();

				renderProperties[slot.getPropertyName()] = content.getElements().map(render);

				return renderProperties;
			}, {});
	}

	public getSender(): Sender | undefined {
		return this.sender;
	}

	public hasHighlightedItem(): boolean {
		return Boolean(this.getHighlightedElement() || this.getHighlightedElementContent());
	}

	public hasSelectedItem(): boolean {
		return Boolean(this.getSelectedElement());
	}

	public onElementClick(e: MouseEvent, element: Model.Element): void {
		console.log('onElementClick!');
	}

	public onElementMouseOver(e: MouseEvent, element: Model.Element): void {
		if (this.mode !== Types.PreviewDocumentMode.Live) {
			return;
		}

		this.setHighlightedElement(element);

		window.requestIdleCallback(() => {
			if (!this.sender) {
				return;
			}

			if (!element.getHighlighted()) {
				this.sender.send({
					id: uuid.v4(),
					payload: undefined,
					type: Message.PreviewMessageType.UnHighlightElement
				});
				return;
			}

			this.sender.send({
				id: uuid.v4(),
				payload: {
					id: element.getId()
				},
				type: Message.PreviewMessageType.HighlightElement
			});
		});
	}

	public onElementSelect(e: MouseEvent, element: Model.Element): void {
		if (this.mode !== Types.PreviewDocumentMode.Live) {
			return;
		}

		this.setSelectedElement(element);

		if (!this.sender) {
			return;
		}

		window.requestIdleCallback(() => {
			if (!this.sender) {
				return;
			}

			this.sender.send({
				id: uuid.v4(),
				payload: {
					id: element.getId()
				},
				type: Message.PreviewMessageType.SelectElement
			});
		});
	}

	public onOutsideClick(e: MouseEvent): void {
		if (this.mode !== Types.PreviewDocumentMode.Live) {
			return;
		}

		this.unsetSelectedElement();
		this.unsetHighlightedElement();
		this.unsetHighlightedElementContent();

		if (!this.sender) {
			return;
		}

		this.sender.send({
			id: uuid.v4(),
			payload: undefined,
			type: Message.PreviewMessageType.UnselectElement
		});

		this.sender.send({
			id: uuid.v4(),
			payload: undefined,
			type: Message.PreviewMessageType.UnHighlightElement
		});
	}

	@Mobx.action
	public setActivePage(page: Model.Page): void {
		this.project.getPages().forEach(p => p.setActive(false));
		page.setActive(true);
	}

	@Mobx.action
	public setComponents(components: Components): void {
		this.components = components;
	}

	@Mobx.action
	public setHighlightedElement(element: Model.Element): void {
		this.unsetHighlightedElement();
		this.unsetHighlightedElementContent();

		if (element.getRole() === Types.ElementRole.Root) {
			return;
		}

		element.setHighlighted(true);
	}

	@Mobx.action
	public setMetaDown(metaDown: boolean): void {
		this.metaDown = metaDown;
	}

	@Mobx.action
	public setSelectedElement(element: Model.Element): void {
		this.unsetSelectedElement();

		element.setSelected(true);
	}

	public setSender(sender: Sender): void {
		this.sender = sender;
	}

	@Mobx.action
	public unsetHighlightedElement(): void {
		this.project.getElements().forEach(e => e.setHighlighted(false));
	}

	@Mobx.action
	public unsetHighlightedElementContent(): void {
		this.project.getElementContents().forEach(e => e.setHighlighted(false));
	}

	@Mobx.action
	public unsetSelectedElement(): void {
		const previousSelectedElement = this.getSelectedElement();

		if (previousSelectedElement) {
			previousSelectedElement.setSelected(false);
		}

		this.selectionArea.hide();
	}
}
