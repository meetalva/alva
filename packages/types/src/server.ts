import { Sender } from './sender';
import * as Hosts from './hosts';
import { Location } from './types';

export interface AlvaServer<T> {
	location: Location;
	port: number;
	sender: Sender;
	host: Hosts.Host;
	dataHost: Hosts.DataHost<T>;
	start(): Promise<void>;
	stop(): Promise<void>;
}
