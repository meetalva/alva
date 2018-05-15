class HighlightArea {
	public bottom: number = 0;
	public height: number = 0;
	public left: number = 0;
	public opacity: number = 0;
	public right: number = 0;
	public top: number = 0;
	public width: number = 0;
	public show(element: Element): void {
		const clientRect: ClientRect = element.getBoundingClientRect();
		this.bottom = clientRect.bottom;
		this.height = clientRect.height;
		this.left = clientRect.left;
		this.right = clientRect.right;
		this.top = clientRect.bottom;
		this.width = clientRect.width;
	}
}

test('highlightArea has expected properties', () => {
	const highlightArea = new HighlightArea();

	expect(highlightArea).toEqual(
		expect.objectContaining({
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			width: 0,
			height: 0,
			opacity: 0
		})
	);
});

test('highlightArea gets Bounding Client values', () => {
	const highlightArea = new HighlightArea();
	const div: HTMLElement = {
		getBoundingClientRect: jest.fn(() => ({
			top: 100,
			right: 100,
			bottom: 100,
			left: 100,
			width: 100,
			height: 100,
			x: 100,
			y: 100
		}))
	};

	highlightArea.show(div);
	expect(highlightArea).toEqual(
		expect.objectContaining({
			top: 100,
			right: 100,
			bottom: 100,
			left: 100,
			width: 100,
			height: 100
		})
	);
});
