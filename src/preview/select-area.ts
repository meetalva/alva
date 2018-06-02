import * as MobX from 'mobx';
import * as Types from '../types';

export class SelectArea implements Types.RenderSelectArea {
	@MobX.observable public bottom: number = 0;
	@MobX.observable public height: number = 0;

	@MobX.observable public isVisible: boolean = false;
	@MobX.observable public left: number = 0;
	@MobX.observable public node: Element;
	@MobX.observable public opacity: number = 0;
	@MobX.observable public right: number = 0;
	@MobX.observable public top: number = 0;
	@MobX.observable public width: number = 0;

	@MobX.action
	public hide(): void {
		this.opacity = 0;
		this.isVisible = false;
	}

	@MobX.action
	public setSize(element: Element): void | Element {
		const clientRect = element.getBoundingClientRect();
		this.bottom = clientRect.bottom;
		this.height = clientRect.height;
		this.left = clientRect.left + window.scrollX;
		this.right = clientRect.right;
		this.top = clientRect.top + window.scrollY;
		this.width = clientRect.width;
		if (!this.node) {
			this.node = element;
			return this.node;
		}
	}

	@MobX.action
	public show(): void {
		this.opacity = 1;
		this.isVisible = true;
	}

	@MobX.action
	public update(): void {
		if (!this.node) {
			return;
		} else {
			this.setSize(this.node);
		}
	}
}
