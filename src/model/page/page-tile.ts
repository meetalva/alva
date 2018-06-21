import * as Mobx from 'mobx';

export interface PageTileInit {
	isDragging: boolean;
	targetSignalIsHighlighted: boolean;
}

export class PageTile {
	@Mobx.observable private isDragging: boolean = false;
	@Mobx.observable private targetSignalIsHighlighted: boolean = false;

	public getIsDragging(): boolean {
		return this.isDragging;
	}

	public getTargetSignalIsHighlighted(): boolean {
		return this.targetSignalIsHighlighted;
	}

	@Mobx.action
	public setIsDragging(isDragging: boolean): void {
		this.isDragging = isDragging;
		console.log(this.isDragging, 'page tile model');
	}

	@Mobx.action
	public setTargetSignalIsHighlighted(isDragging: boolean): void {
		this.targetSignalIsHighlighted = isDragging;
	}
}
