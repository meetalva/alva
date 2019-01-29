import * as Fs from 'fs-extra';
import * as Path from 'path';
import * as RendererDocument from '../../renderer/renderer-document';
import * as Types from '@meetalva/types';
import * as Model from '../../model';
import { Message } from '../../message';

export async function build({
	path,
	host,
	project
}: {
	path: string;
	host: Types.Host<Model.AlvaApp<Message>, Model.Project, Message>;
	project?: Model.Project;
}): Promise<void> {
	const pkgDir = require('pkg-dir');
	const base = await pkgDir(__dirname);

	host.log(`Starting build to ${path}...`);

	await Fs.mkdirp(path);

	const renderDoc = RendererDocument.rendererDocument({
		payload: {
			host: Types.HostType.Browser,
			view: project ? Types.AlvaView.PageDetail : Types.AlvaView.SplashScreen,
			projectViewMode: Types.ProjectViewMode.Design,
			project
		}
	});

	await Fs.copy(Path.join(base, 'lib', 'scripts'), Path.join(path, 'scripts'));

	await host.writeFile(Path.join(path, 'index.html'), renderDoc);
	await host.writeFile(Path.join(path, '200.html'), renderDoc);

	host.log(`Built to ${path}...`);
}
