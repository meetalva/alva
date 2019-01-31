import { Sender, SenderMessage } from './sender';
import * as Hosts from './hosts';
import { Location } from './types';

/**
 * A - AlvaApp
 * P - Project
 */
export interface AlvaServer<A, P, M extends SenderMessage> {
	location: Location;
	port: number;
	sender: Sender<M>;
	host: Hosts.Host<A, P, M>;
	dataHost: Hosts.DataHost<P>;
	start(): Promise<void>;
	stop(): Promise<void>;
}
