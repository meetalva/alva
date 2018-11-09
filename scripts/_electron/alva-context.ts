import { AlvaWindow } from './alva-window';
import * as Express from 'express';
import * as Mobx from 'mobx';
import * as Model from '../model';
import * as getPort from 'get-port';
import { Sender } from '../sender/server';

const yargsParser = require('yargs-parser');

export interface AlvaContextInit {
	hot: boolean;
	port: number;
}

export class AlvaContext {
	@Mobx.observable public projects: Map<string, Model.Project> = new Map();

	@Mobx.observable public windows: Map<string, AlvaWindow> = new Map();

	public readonly sender: Sender;
	public readonly base?: string;
	public readonly port?: number;
	public readonly hot?: boolean;

	@Mobx.computed
	public get middlewares(): Express.RequestHandler[] {
		if (this.hot) {
			const webpack = require('webpack');
			const webpackConfig = require('../../webpack.config');

			const compiler = webpack(webpackConfig);

			const devWare = require('webpack-dev-middleware')(compiler, {
				noInfo: true,
				publicPath: webpackConfig.output.publicPath
			});

			const hotWare = require('webpack-hot-middleware')(compiler);

			return [devWare, hotWare];
		} else {
			return [];
		}
	}

	public constructor(init: AlvaContextInit) {
		this.hot = init.hot;
		this.port = init.port;
		this.sender = new Sender();
	}

	public static async fromArgv(argv: string[]): Promise<AlvaContext> {
		const args = yargsParser(argv.slice(2));
		const hot = args.hot || false;
		const port = await (getPort({ port: args.port }) as Promise<number>);

		return new AlvaContext({ hot, port });
	}
}
