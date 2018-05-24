import { SelectArea } from './select-area';

describe('SelectArea', () => {
	const highlightArea = new SelectArea();
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

	test('SelectArea sets bounding client values', () => {
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

	test('SelectArea update values on update', () => {
		highlightArea.setSize(node);
		expect(highlightArea.node).toEqual(node);

		highlightArea.update();

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

	test('SelectArea hides element', () => {
		highlightArea.hide();
		expect(highlightArea.isVisible).toBe(false);
		expect(highlightArea).toEqual(
			expect.objectContaining({
				opacity: 0
			})
		);
	});

	test('SelectArea shows element', () => {
		highlightArea.show();

		expect(highlightArea.isVisible).toBe(true);
		expect(highlightArea).toEqual(
			expect.objectContaining({
				opacity: 1
			})
		);
	});
});
