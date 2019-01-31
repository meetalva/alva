import * as MobX from 'mobx';
import * as Types from '@meetalva/types';

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

	public write(element: HTMLElement, _: { scrollPositon: Types.Point }): void {
		const rect = this.element
			? this.element.getBoundingClientRect()
			: { top: 0, left: 0, width: 0, height: 0 };

		element.style.top = `${rect.top}px`;
		element.style.left = `${rect.left}px`;
		element.style.width = `${rect.width}px`;
		element.style.height = `${rect.height}px`;

		element.style.display = !this.isVisible || (!rect.height && !rect.width) ? 'none' : 'block';
	}
}
