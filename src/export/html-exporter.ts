import { createCompiler } from '../electron/create-compiler';
import { previewDocument, PreviewDocumentMode } from '../preview/document';
import { Exporter, ExportResult } from './exporter';
import * as Fs from 'fs';
import { ServerMessageType } from '../message';
import * as Path from 'path';
import { Store } from '../store/store';
import * as Util from 'util';
import * as uuid from 'uuid';

const SCRIPTS = ['vendor', 'components', 'preview'];

const createScript = (name: string, content: string) =>
	`<script data-script="${name}">${content}</script>`;

export class HtmlExporter extends Exporter {
	public async createExport(): Promise<ExportResult> {
		const store = Store.getInstance();
		const project = store.getCurrentProject();
		const currentPage = store.getCurrentPage();
		const styleguide = store.getStyleguide();

		// TODO: Come up with good user-facing errors
		if (!project || !currentPage || !styleguide) {
			return {};
		}

		const data = {
			id: uuid.v4(),
			type: ServerMessageType.State,
			payload: {
				currentPageId: currentPage.getId(),
				pages: project.getPages().map(page => page.toJsonObject({ forRendering: true }))
			}
		};

		const compiler = createCompiler(styleguide);
		await Util.promisify(compiler.run).bind(compiler)();

		const fs = (await compiler.outputFileSystem) as typeof Fs;

		const scripts = SCRIPTS.map(name => [
			name,
			fs.readFileSync(Path.posix.join('/', `${name}.js`)).toString()
		])
			.map(([name, content]) => createScript(name, content))
			.join('\n');

		const document = previewDocument({
			data,
			mode: PreviewDocumentMode.Static,
			scripts
		});

		this.contents = Buffer.from(document);

		return {
			result: this.contents
		};
	}
}
