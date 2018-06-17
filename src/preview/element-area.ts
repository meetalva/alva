import * as MobX from 'mobx';

export interface ElementAreaInit {
	top: number;
	left: number;
	width: number;
	height: number;
}

export class ElementArea {
	@MobX.observable public top: number = 0;
	@MobX.observable public left: number = 0;
	@MobX.observable public width: number = 0;
	@MobX.observable public height: number = 0;
	@MobX.observable public isVisible: boolean = false;

	@MobX.action
	public hide(): void {
		this.isVisible = false;
	}

	@MobX.action
	public setSize(init: ElementAreaInit): void | Element {
		this.top = init.top;
		this.left = init.left;
		this.width = init.width;
		this.height = init.height;
	}

	@MobX.action
	public show(): void {
		this.isVisible = true;
	}

	public write(element: HTMLElement): void {
		element.style.top = `${this.top}px`;
		element.style.left = `${this.left}px`;
		element.style.width = `${this.width}px`;
		element.style.height = `${this.height}px`;
		element.style.display = this.isVisible ? 'block' : 'none';
	}
}
