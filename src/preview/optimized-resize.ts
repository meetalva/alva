export interface ResizeProps {
	// tslint:disable-next-line:prefer-method-signature
	add: (cb: () => {}) => void;
}
export function optimizedResize(): ResizeProps {
	const callbacks = [];
	let running = false;

	const runCallbacks = () => {
		callbacks.forEach((cb: () => void) => {
			// console.log('run callbacks', cb);
			cb();
		});
		running = false;
	};

	const resize = () => {
		if (!running) {
			running = true;
			console.log('run callbacks', running);
			window.requestAnimationFrame(runCallbacks);
		}
	};

	const addCallBack = (cb: never) => {
		if (cb) {
			callbacks.push(cb);
		}
	};

	return {
		add: (cb: () => {}) => {
			if (!callbacks.length) {
				window.addEventListener('resize', resize);
			}
			addCallBack(cb as never);
		}
	};
}
