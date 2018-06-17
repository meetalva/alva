import * as Fs from 'fs';
import * as Message from '../message';
import * as Model from '../model';
import { Sender } from '../sender/server';
import * as Types from '../types';
import * as uuid from 'uuid';

const MemoryFileSystem = require('memory-fs');

export type ExportResult = ExportSuccess | ExportError;

export enum ExportResultType {
	ExportSuccess,
	ExportError
}

export interface ExportSuccess {
	type: ExportResultType.ExportSuccess;
	fs: typeof Fs;
}

export interface ExportError {
	type: ExportResultType.ExportError;
	error: Error;
}

export async function exportHtmlProject({ sender }: { sender: Sender }): Promise<ExportResult> {
	const projectResponse = await sender.request<Message.ProjectRequestResponsePair>(
		{
			id: uuid.v4(),
			type: Message.ServerMessageType.ProjectRequest,
			payload: undefined
		},
		Message.ServerMessageType.ProjectResponse
	);

	if (
		projectResponse.payload.status !== Types.ProjectStatus.Ok ||
		typeof projectResponse.payload.data === 'undefined'
	) {
		return {
			type: ExportResultType.ExportError,
			error: new Error('Could not fetch project data while exporting to Sketch')
		};
	}

	const fs = new MemoryFileSystem() as typeof Fs;
	const project = Model.Project.from(projectResponse.payload.data);

	// Read preview scripts from disk

	// Create preview document enriched with library bundles and project data

	return {
		type: ExportResultType.ExportSuccess,
		fs
	};
}
