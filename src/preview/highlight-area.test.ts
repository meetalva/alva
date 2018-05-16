import { HighlightArea } from './highlight-area';

test('HighlightArea has expected properties', () => {
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

test('HighlightArea sets bounding client values', () => {
	const highlightArea = new HighlightArea();
	// tslint:disable:no-any
	const node: any = {
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
	highlightArea.setSize(node);
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

test('HighlightArea hides element', () => {
	const highlightArea = new HighlightArea();
	highlightArea.hide();

	expect(highlightArea).toEqual(
		expect.objectContaining({
			opacity: 0,
			isVisible: false
		})
	);
});

test('HighlightAria shows element', () => {
	const highlightArea = new HighlightArea();
	highlightArea.show();

	expect(highlightArea).toEqual(
		expect.objectContaining({
			opacity: 1,
			isVisible: true
		})
	);
});
