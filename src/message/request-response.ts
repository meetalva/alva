import * as Message from './message';

export type RequestResponsePair =
	| AppRequestResponsePair
	| ProjectRequestResponsePair
	| OpenFileRequestResponsePair;

export interface AppRequestResponsePair {
	request: Message.AppRequest;
	response: Message.AppResponse;
}

export interface ProjectRequestResponsePair {
	request: Message.ProjectRequest;
	response: Message.ProjectResponse;
}

export interface OpenFileRequestResponsePair {
	request: Message.OpenFileRequest;
	response: Message.OpenFileResponse;
}
