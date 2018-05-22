import { HighlightHover } from './highlight-hover';

describe('Highlight Hover', () => {
	const highlightHover = new HighlightHover();
	// tslint:disable:no-any
	const node: any = {
		getBoundingClientRect: jest.fn(() => ({
			bottom: 20,
			height: 20,
			left: 20,
			right: 20,
			top: 20,
			width: 20
		})),
		opacity: 0,
		parentElement: true
	};

	test('default values should be 0', () => {
		expect(highlightHover).toEqual(
			expect.objectContaining({
				bottom: 0,
				height: 0,
				left: 0,
				right: 0,
				top: 0,
				width: 0,
				opacity: 0
			})
		);
	});

	test('values have been updated', () => {
		highlightHover.setSize(node);
		expect(highlightHover).toEqual(
			expect.objectContaining({
				bottom: 20,
				height: 20,
				left: 20,
				right: 20,
				top: 20,
				width: 20
			})
		);
	});

	test('hover should be visible', () => {
		highlightHover.show();
		expect(highlightHover).toEqual(expect.objectContaining({ opacity: 1 }));
	});

	test('hover should be hidden', () => {
		highlightHover.hide();
		expect(highlightHover).toEqual(expect.objectContaining({ opacity: 0 }));
	});
});
