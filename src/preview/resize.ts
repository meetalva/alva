export interface ResizeFactoryProps {
	callbacks: never[];
	isRunning: boolean;
	execute(): void;
	// tslint:disable: no-any
	register(cb: any): void;
	resize(): void;
}
export function ResizeFactory(): ResizeFactoryProps {
	// tslint:disable: no-invalid-this
	return {
		callbacks: [],
		isRunning: false,
		execute(): void {
			this.callbacks.forEach((cb: any) => {
				cb();
			});
			this.isRunning = false;
		},
		register(cb: never): void {
			if (cb) {
				this.callbacks.push(cb);
			}
			window.addEventListener('resize', this.resize.bind(this));
		},
		resize(): void {
			if (!this.isRunning) {
				this.isRunning = true;
				window.requestAnimationFrame(this.execute.bind(this));
			}
		}
	};
}
