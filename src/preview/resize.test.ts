import { ResizeFactory } from './resize';

describe('ResizeFactory', () => {
	const resize = ResizeFactory();

	test('Resize registers callbacks', () => {
		const mockCallback = jest.fn();

		resize.register(mockCallback);
		expect(resize.callbacks).toEqual(expect.arrayContaining([mockCallback]));
	});

	test('Resize executes every callback in the array', () => {
		const mockCallback = jest.fn();
		resize.register(mockCallback);
		resize.register(mockCallback);
		resize.register(mockCallback);

		resize.execute();
		expect(mockCallback.mock.calls.length).toBe(3);
		expect(resize.isRunning).toBe(false);
	});
});
