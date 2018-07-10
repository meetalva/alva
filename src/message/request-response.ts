import * as Message from './message';

export type RequestResponsePair = AppRequestResponsePair | ProjectRequestResponsePair;

export interface AppRequestResponsePair {
	request: Message.AppRequest;
	response: Message.AppResponse;
}

export interface ProjectRequestResponsePair {
	request: Message.ProjectRequest;
	response: Message.ProjectResponse;
}
