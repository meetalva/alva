import { Sender } from './sender';
import * as Hosts from './hosts';

export interface AlvaServer {
	sender: Sender;
	host: Hosts.Host;
	dataHost: Hosts.DataHost;
	start(): Promise<void>;
	stop(): Promise<void>;
}
