import * as MobX from 'mobx';
import * as Types from '../types';

export interface ElementAreaInit {
	top: number;
	left: number;
	width: number;
	height: number;
}

export class ElementArea {
	@MobX.observable public element: Element | undefined;
	@MobX.observable public isVisible: boolean = false;

	@MobX.action
	public hide(): void {
		this.isVisible = false;
	}

	@MobX.action
	public setElement(element: Element | undefined): void {
		this.element = element;
	}

	@MobX.action
	public show(): void {
		this.isVisible = true;
	}

	public write(element: HTMLElement, context: { scrollPositon: Types.Point }): void {
		if (!this.element) {
			return;
		}

		const rect = this.element.getBoundingClientRect();

		element.style.top = `${rect.top}px`;
		element.style.left = `${rect.left}px`;
		element.style.width = `${rect.width}px`;
		element.style.height = `${rect.height}px`;
		element.style.display = this.isVisible ? 'block' : 'none';
	}
}
