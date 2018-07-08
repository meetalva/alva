import * as Electron from 'electron';
import * as Express from 'express';
import * as Path from 'path';
import { ProjectRequestResponsePair, ServerMessageType } from '../message';
import { Sender } from '../sender/server';
import * as Model from '../model';
import { sizedBrowser } from './sized-browser';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface ScreenshotRouteOptions {
	previewLocation: string;
	sender: Sender;
}

const SUPPORTED_EXTENSIONS = ['.png'];

export function createScreenshotRoute(options: ScreenshotRouteOptions): Express.RequestHandler {
	return async function screenshotRoute(
		req: Express.Request,
		res: Express.Response
	): Promise<void> {
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

		const width = numberFrom(req.query.width);
		const height = numberFrom(req.query.height);

		const scale = floatFrom(req.query.scale) || 1;
		const imageScale =
			floatFrom(req.query.scale) || Electron.screen.getPrimaryDisplay().scaleFactor;

		const browser = await sizedBrowser({
			url: `${options.previewLocation}/${page.getId()}.html`,
			width,
			height
		});

		const browserSize = browser.getContentBounds();

		browser.capturePage(
			{
				x: 0,
				y: 0,
				width: Math.round(browserSize.width * imageScale),
				height: Math.round(browserSize.height * imageScale)
			},
			image => {
				res.send(
					image
						.resize({ width: browserSize.width * scale, height: browserSize.height * scale })
						.toPNG()
				);
				browser.close();
			}
		);
	};
}

function numberFrom(input: string): number | undefined {
	const raw = parseInt(input, 10);
	return Number.isNaN(raw) ? undefined : raw;
}

function floatFrom(input: string): number | undefined {
	const raw = parseFloat(input);
	return Number.isNaN(raw) ? undefined : raw;
}
