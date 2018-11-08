import * as Readline from 'readline';

export interface RestartListenerInit {
	readline: Readline.ReadLine;
}

export class RestartListener {
	private readline: Readline.ReadLine;
	private listener: () => void;

	private constructor(init: RestartListenerInit) {
		this.readline = init.readline;
	}

	public static async fromProcess(process: NodeJS.Process): Promise<RestartListener> {
		return new RestartListener({
			readline: Readline.createInterface({
				input: process.stdin,
				terminal: false
			})
		});
	}

	private onRs = (line: string): void => {
		if (!line.endsWith('rs')) {
			return;
		}

		Readline.moveCursor(process.stdin, 0, -1);
		Readline.clearLine(process.stdin, 0);

		this.listener();
	};

	public subscribe(listener: () => void): void {
		this.listener = listener;
		this.readline.on('line', this.onRs);
	}

	public unsubscribe(): void {
		this.readline.removeListener('line', this.onRs);
	}
}
