import { Sender } from './sender';
import * as Hosts from './hosts';
import { Location } from './types';

export interface AlvaServer {
	location: Location;
	port: number;
	sender: Sender;
	host: Hosts.Host;
	dataHost: Hosts.DataHost;
	start(): Promise<void>;
	stop(): Promise<void>;
}
