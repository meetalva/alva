import * as Mobx from 'mobx';

export interface PageTileInit {
	isDragging: boolean;
	targetSignalIsHighlighted: boolean;
}

export class PageTile {
	@Mobx.observable private isDragging: boolean;
	@Mobx.observable private targetSignalIsHighlighted: boolean;

	public constructor(init: PageTileInit) {
		this.isDragging = init.isDragging;
		this.targetSignalIsHighlighted = init.targetSignalIsHighlighted;
	}

	public getIsDragging(): boolean {
		return this.isDragging;
	}

	public getTargetSignalIsHighlighted(): boolean {
		return this.targetSignalIsHighlighted;
	}

	@Mobx.action
	public setIsDragging(isDragging: boolean): void {
		this.isDragging = isDragging;
	}

	@Mobx.action
	public setTargetSignalIsHighlighted(isDragging: boolean): void {
		this.targetSignalIsHighlighted = isDragging;
	}
}
