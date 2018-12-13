import { ElementArea } from './element-area';
import exportToSketchData from './export-to-sketch-data';
import { getComponents } from './get-components';
import { getInitialData } from './get-initial-data';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { PreviewStore } from './preview-store';
import { Sender } from '../sender';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface Renderer<T> {
	render(store: PreviewStore<T>, container: HTMLElement): void;
}

declare global {
	interface Window {
		// tslint:disable-next-line:no-any
		previewRenderer: Renderer<any>;
		rpc: {
			getDocumentSize(): Promise<{ width: number; height: number }>;
			// tslint:disable-next-line:no-any
			exportToSketchData(): Promise<any>;
		};
	}
}

async function main(): Promise<void> {
	const data = getInitialData();

	if (!data) {
		return;
	}

	const mode =
		data.mode === 'live' ? Types.PreviewDocumentMode.Live : Types.PreviewDocumentMode.Static;

	const transferType =
		data.transferType === 'inline'
			? Types.PreviewTransferType.Inline
			: Types.PreviewTransferType.Message;

	const endpoint =
		mode === Types.PreviewDocumentMode.Live ? `ws://${window.location.host}` : undefined;

	const sender = new Sender(
		framed() ? { window: window.parent } : { endpoint, window: window.parent }
	);

	const projectResult =
		transferType === Types.PreviewTransferType.Inline
			? // (1a) Deserialize Project from HTML-embedded data payload
			  Model.Project.toResult(data.data)
			: // (1b) Request project from edit interface
			  await sender
					.transaction<Message.ProjectRequest, Message.ProjectResponse>(
						{
							id: uuid.v4(),
							type: Message.MessageType.ProjectRequest,
							payload: undefined
						},
						{
							type: Message.MessageType.ProjectResponse
						}
					)
					.then(response => {
						if (response.payload.status === Types.ProjectStatus.Ok && response.payload.data) {
							return Model.Project.toResult(response.payload.data);
						}

						if (
							response.payload.status === Types.ProjectStatus.Ok &&
							!response.payload.data
						) {
							const err: { status: Types.ProjectStatus.Error; error: Error } = {
								status: Types.ProjectStatus.Error,
								error: new Error(`Received empty project`)
							};

							return err;
						}

						const err: { status: Types.ProjectStatus.Error; error: Error } = {
							status: Types.ProjectStatus.Error,
							error: (response.payload as any).error as Error
						};

						return err;
					});

	if (projectResult.status === Types.ProjectStatus.Error) {
		console.error(projectResult.error);
		return;
	}

	const project = projectResult.result;

	project
		.getPatternLibraries()
		.filter(library => library.getOrigin() === Types.PatternLibraryOrigin.UserProvided)
		.forEach(library => {
			const script = document.createElement('script');
			script.dataset.bundle = library.getBundleId();
			script.textContent = library.getBundle();
			document.body.appendChild(script);
		});

	// (2) Collect components from library scripts
	const components = getComponents(project);

	const store = new PreviewStore({
		mode,
		components,
		project,
		selectionArea: new ElementArea(),
		highlightArea: new ElementArea()
	});

	window.addEventListener('keydown', e => {
		if (e.key === 'Meta') {
			store.setMetaDown(true);
		}
	});

	window.addEventListener('keyup', e => {
		if (e.key === 'Meta') {
			store.setMetaDown(false);
		}
	});

	window.addEventListener('scroll', () => {
		const el = document.scrollingElement || document.documentElement;
		store.setScrollPosition({
			x: el.scrollLeft,
			y: el.scrollTop
		});
	});

	document.body.addEventListener('mouseleave', () => {
		store.getProject().unsetHighlightedElement();
		store.getProject().unsetHighlightedElementContent();
	});

	// (3) Render the preview application
	window.previewRenderer.render(store, document.getElementById('preview') as HTMLElement);

	// (4) Connect to the Alva server for updates
	// - when mode is "live", used for editable preview
	if (mode === Types.PreviewDocumentMode.Live) {
		store.setSender(sender);
		project.sync(sender);

		sender.match<Message.KeyboardChange>(Message.MessageType.KeyboardChange, message => {
			store.setMetaDown(message.payload.metaDown);
		});

		sender.match<Message.ChangeApp>(Message.MessageType.ChangeApp, m => {
			const app = Model.AlvaApp.from(m.payload.app, { sender });
			store.setApp(app);
		});

		Mobx.autorun(() => {
			Array.prototype.slice
				.call(document.querySelectorAll('script[data-bundle]'), 0)
				.filter(script => script.parentElement)
				.forEach(script => script.parentElement.removeChild(script));

			store
				.getProject()
				.getPatternLibraries()
				.filter(library => library.getOrigin() === Types.PatternLibraryOrigin.UserProvided)
				.forEach(library => {
					const script = document.createElement('script');
					script.dataset.bundle = library.getBundleId();
					script.textContent = library.getBundle();
					document.body.appendChild(script);
				});

			store.setComponents(getComponents(store.getProject()));
		});

		Mobx.reaction(
			() => store.hasSelectedItem(),
			hasSelection => {
				const selectionArea = store.getSelectionArea();
				hasSelection ? selectionArea.show() : selectionArea.hide();
			}
		);

		Mobx.reaction(
			() => store.hasHighlightedItem(),
			hasHighlight => {
				const highlightArea = store.getHighlightArea();
				hasHighlight ? highlightArea.show() : highlightArea.hide();
			}
		);

		Mobx.reaction(
			() => store.getMetaDown(),
			metaDown => {
				if (!sender) {
					return;
				}

				sender.send({
					id: uuid.v4(),
					payload: {
						metaDown
					},
					type: Message.MessageType.KeyboardChange
				});
			}
		);

		Mobx.autorun(
			() => {
				const userStore = store.getProject().getUserStore();

				sender.send({
					id: uuid.v4(),
					payload: { userStore: userStore.toJSON(), projectId: project.getId() },
					type: Message.MessageType.ChangeUserStore
				});
			},
			{
				scheduler: window.requestIdleCallback
			}
		);

		const selectionNode = document.getElementById('preview-selection') as HTMLElement;
		const highlightNode = document.getElementById('preview-highlight') as HTMLElement;

		const updateHighlightAndSelectionAreas = () => {
			const selectionArea = store.getSelectionArea();
			selectionArea.write(selectionNode, { scrollPositon: store.getScrollPosition() });

			const highlightArea = store.getHighlightArea();
			highlightArea.write(highlightNode, { scrollPositon: store.getScrollPosition() });

			window.requestAnimationFrame(updateHighlightAndSelectionAreas);
		};

		window.requestAnimationFrame(updateHighlightAndSelectionAreas);
	}
}

main();

window.rpc = {
	exportToSketchData,
	async getDocumentSize(): Promise<{ width: number; height: number }> {
		return {
			width: (document.scrollingElement || document.documentElement).scrollWidth,
			height: (document.scrollingElement || document.documentElement).scrollHeight
		};
	}
};

function framed(): boolean {
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
}
