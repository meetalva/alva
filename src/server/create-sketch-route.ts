import * as Express from 'express';
import * as Path from 'path';
import * as PreviewDocument from '../preview-document';
import { ProjectRequestResponsePair, ServerMessageType } from '../message';
import { Sender } from '../sender/server';
import { sizedBrowser } from './sized-browser';
import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface ScreenshotRouteOptions {
	previewLocation: string;
	sender: Sender;
}

const SUPPORTED_EXTENSIONS = ['.json', '.html'];

export function createSketchRoute(options: ScreenshotRouteOptions): Express.RequestHandler {
	return async function sketchRoute(req: Express.Request, res: Express.Response): Promise<void> {
		const extname = Path.extname(req.path);
		const id = Path.basename(req.path, Path.extname(req.path));

		if (!id || !extname) {
			res.sendStatus(400);
			return;
		}

		if (!SUPPORTED_EXTENSIONS.includes(extname)) {
			res.sendStatus(404);
			return;
		}

		res.type(extname);

		const projectResponse = await options.sender.request<ProjectRequestResponsePair>(
			{
				id: uuid.v4(),
				type: ServerMessageType.ProjectRequest,
				payload: undefined
			},
			ServerMessageType.ProjectResponse
		);

		if (projectResponse.payload.status === Types.ProjectStatus.None) {
			res.sendStatus(404);
			return;
		}

		if (projectResponse.payload.status === Types.ProjectStatus.Error) {
			res.sendStatus(500);
			return;
		}

		if (
			projectResponse.payload.status !== Types.ProjectStatus.Ok ||
			typeof projectResponse.payload.data === 'undefined'
		) {
			res.sendStatus(500);
			return;
		}

		const project = Model.Project.from(projectResponse.payload.data);
		const page = project.getPageById(id);

		if (!page) {
			res.sendStatus(404);
			return;
		}

		if (extname === '.html') {
			res.send(
				PreviewDocument.sketchDocument({
					data: project.toJSON(),
					scripts: project
						.getPatternLibraries()
						.map(
							lib => `<script data-bundle="${lib.getBundleId()}">${lib.getBundle()}</script>`
						)
				})
			);
			return;
		}

		const width = numberFrom(req.query.width);
		const height = numberFrom(req.query.height);

		try {
			const browser = await sizedBrowser({
				url: `${options.previewLocation}/${page.getId()}.html`,
				width,
				height
			});

			res.send(await browser.webContents.executeJavaScript('window.rpc.exportToSketchData()'));
		} catch (err) {
			console.error(err);
			res.sendStatus(500);
		}
	};
}

function numberFrom(input: string): number | undefined {
	const raw = parseInt(input, 10);
	return Number.isNaN(raw) ? undefined : raw;
}
