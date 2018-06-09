import { HighlightArea } from './highlight-area';

describe('Highlight Hover', () => {
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
		})),
		parentElement: true
	};

	test('default values should be 0', () => {
		expect(highlightArea).toEqual(
			expect.objectContaining({
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				width: 0,
				height: 0
			})
		);
	});

	test('values have been updated', () => {
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

	test('hover should be visible', () => {
		highlightArea.show();
		expect(highlightArea).toEqual(expect.objectContaining({ opacity: 1 }));
	});

	test('hover should be hidden', () => {
		highlightArea.hide();
		expect(highlightArea).toEqual(expect.objectContaining({ opacity: 0 }));
	});
});
