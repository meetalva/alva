import * as Types from '../types';
import { MessageType as M } from '../message';

export class HostAdapter {
	private sender: Types.Sender;
	private host: BrowserHost;

	private constructor(init: { sender: Types.Sender }) {
		this.sender = init.sender;
		this.host = new BrowserHost();
	}

	public static fromSender(sender: Types.Sender): HostAdapter {
		return new HostAdapter({ sender });
	}

	public start() {
		this.sender.match(M.OpenExternalURL, m => this.host.open(m.payload));
		this.sender.match(M.ShowMessage, m => this.host.showMessage(m.payload));
	}
}

export class BrowserHost implements Partial<Types.Host> {
	public async open(url: string): Promise<void> {
		window.open(url, '_blank');
	}

	public async showMessage(opts: Types.HostMessageOptions): Promise<undefined> {
		// TODO: implement custom dialogs
		alert([opts.message, opts.detail].filter(Boolean).join('\n'));
		return;
	}
}
