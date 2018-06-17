import * as ServerMessage from './server-message';

export type RequestResponsePair = AppRequestResponsePair | ProjectRequestResponsePair;

export interface AppRequestResponsePair {
	request: ServerMessage.AppRequest;
	response: ServerMessage.AppResponse;
}

export interface ProjectRequestResponsePair {
	request: ServerMessage.ProjectRequest;
	response: ServerMessage.ProjectResponse;
}
