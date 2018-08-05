import { computeDifference } from '../alva-util';
import { ElementArea } from './element-area';
import exportToSketchData from './export-to-sketch-data';
import { getComponents } from './get-components';
import { getInitialData } from './get-initial-data';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import * as ModelTree from '../model-tree';
import { PreviewStore, SyntheticComponents } from './preview-store';
import { Sender } from '../sender/client';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface Renderer<T> {
	render(store: PreviewStore<T>, container: HTMLElement): void;
	getSynthetics(): SyntheticComponents<T>;
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

function main(): void {
	const data = getInitialData();

	if (!data) {
		return;
	}

	// (1) Deserialize Project from HTML-embedded data payload
	const mode =
		data.mode === 'live' ? Types.PreviewDocumentMode.Live : Types.PreviewDocumentMode.Static;
	const project = Model.Project.from(data.data);

	// (2) Collect components from library scripts
	const components = getComponents(project);

	const store = new PreviewStore({
		mode,
		components,
		project,
		synthetics: window.previewRenderer.getSynthetics(),
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
		const sender = new Sender({ endpoint: `ws://${window.location.host}` });

		store.setSender(sender);

		sender.match<Message.KeyboardChange>(Message.MessageType.KeyboardChange, message => {
			store.setMetaDown(message.payload.metaDown);
		});

		sender.match<Message.ChangePages>(Message.MessageType.ChangePages, message => {
			Mobx.transaction(() => {
				const changes = computeDifference<Model.Page>({
					after: message.payload.pages.map(p => Model.Page.from(p, { project })),
					before: project.getPages()
				});

				changes.added.forEach(change => project.addPage(change.after));
				changes.changed.forEach(change => change.before.update(change.after));
				changes.removed.forEach(change => project.removePage(change.before));
			});
		});

		sender.match<Message.MobxUpdateMessage>(Message.MessageType.MobxUpdate, message => {
			if (message.payload.change.hasOwnProperty('key')) {
				const change = message.payload.change as
					| Message.MobxObjectUpdatePayload
					| Message.MobxMapUpdatePayload;
				const object = project.getObject(message.payload.name, message.payload.id);

				if (!object) {
					// console.log(message);
					return;
				}

				const changedData = object.toJSON();
				changedData[change.key] = change.newValue;

				// tslint:disable-next-line:no-any
				(object.update as any)(changedData);
			}

			if (message.payload.change.hasOwnProperty('index')) {
				console.log('MobxArrayUpdatePayload', message);
				// const change = message.payload.change as Message.MobxArrayUpdatePayload;
			}
		});

		sender.match<Message.MobxAddMessage>(Message.MessageType.MobxAdd, message => {
			const parent = project.getObject(message.payload.name, message.payload.id);
			const ValueModel = ModelTree.getModelByName(message.payload.valueModel);

			if (!parent) {
				console.log(message);
				return;
			}

			const mayBeMember = parent[message.payload.memberName];

			if (!mayBeMember) {
				return;
			}

			const value = ValueModel
				? ValueModel.from(message.payload.change.newValue, { project })
				: message.payload.change.newValue;

			if (typeof value === 'object' && !ValueModel) {
				console.log(message);
			}

			const member = mayBeMember as Map<unknown, unknown>;
			member.set(message.payload.change.key, value);
		});

		sender.match<Message.MobxDeleteMessage>(Message.MessageType.MobxDelete, message => {
			const parent = project.getObject(message.payload.name, message.payload.id);

			if (!parent) {
				console.log(message);
				return;
			}

			const mayBeMember = parent[message.payload.memberName];

			if (!mayBeMember) {
				return;
			}

			const member = mayBeMember as Map<unknown, unknown>;
			member.delete(message.payload.change.key);
		});

		sender.match<Message.MobxSpliceMessage>(Message.MessageType.MobxSplice, message => {
			const parent = project.getObject(message.payload.name, message.payload.id);

			if (!parent) {
				console.log(message);
				return;
			}

			const changedData = parent.toJSON();
			const target = changedData[message.payload.memberName];

			if (!Array.isArray(target)) {
				console.log(message);
				return;
			}

			if (message.payload.change.removed.length > 0) {
				target.splice(message.payload.change.index, message.payload.change.removed.length);
			}

			if (message.payload.change.added.length > 0) {
				target.splice(message.payload.change.index, 0, ...message.payload.change.added);
			}

			// tslint:disable-next-line:no-any
			(parent.update as any)(changedData);
		});

		sender.match<Message.ChangePatternLibraries>(
			Message.MessageType.ChangePatternLibraries,
			message => {
				Mobx.transaction(() => {
					const libraryChanges = computeDifference<Model.PatternLibrary>({
						before: project.getPatternLibraries(),
						after: message.payload.patternLibraries.map(e => Model.PatternLibrary.from(e))
					});

					libraryChanges.added.forEach(change => {
						const script = document.createElement('script');
						script.dataset.bundle = change.after.getBundleId();
						script.textContent = change.after.getBundle();
						document.body.appendChild(script);

						project.addPatternLibrary(change.after);
					});

					libraryChanges.changed.forEach(change => {
						const scriptCandidate = document.querySelector(
							`[data-bundle="${change.before.getBundleId()}"]`
						);

						if (scriptCandidate && scriptCandidate.parentElement) {
							scriptCandidate.parentElement.removeChild(scriptCandidate);
						}

						const script = document.createElement('script');
						script.dataset.bundle = change.after.getBundleId();
						script.textContent = change.after.getBundle();
						document.body.appendChild(script);

						change.before.update(change.after);
					});

					store.setComponents(getComponents(store.getProject()));
				});
			}
		);

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

		Mobx.autorun(
			() => {
				const selectionArea = store.getSelectionArea();
				const selectionNode = document.getElementById('preview-selection') as HTMLElement;
				selectionArea.write(selectionNode, { scrollPositon: store.getScrollPosition() });
			},
			{ scheduler: window.requestAnimationFrame }
		);

		Mobx.autorun(
			() => {
				const highlightNode = document.getElementById('preview-highlight') as HTMLElement;
				const highlightArea = store.getHighlightArea();
				highlightArea.write(highlightNode, { scrollPositon: store.getScrollPosition() });
			},
			{ scheduler: window.requestAnimationFrame }
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

		/* Mobx.autorun(
			() => {
				const userStore = store.getProject().getUserStore();

				sender.send({
					id: uuid.v4(),
					payload: { userStore: userStore.toJSON() },
					type: Message.MessageType.ChangeUserStore
				});
			},
			{
				scheduler: window.requestIdleCallback
			}
		); */
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
