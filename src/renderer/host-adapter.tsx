import * as Types from '../types';
import * as M from '../message';
import * as Store from '../store';
import * as ContextMenu from '../context-menu';
import { Persistence } from '../persistence';
import * as Path from 'path';
import { BrowserHost } from '../hosts/browser-host';
import * as Serde from '../sender/serde';
import * as uuid from 'uuid';

export class HostAdapter {
	private sender: Types.Sender;
	private store: Store.ViewStore;
	private host: BrowserHost;

	private constructor(init: { sender: Types.Sender; store: Store.ViewStore }) {
		this.sender = init.sender;
		this.store = init.store;

		this.host = new BrowserHost({
			store: this.store
		});
	}

	public static fromStore(store: Store.ViewStore): HostAdapter {
		return new HostAdapter({ sender: store.getSender(), store });
	}

	public start() {
		this.host.start();

		this.sender.match<M.OpenExternalURL>(M.MessageType.OpenExternalURL, m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			this.host.open(m.payload);
		});

		this.sender.match<M.ShowMessage>(M.MessageType.ShowMessage, m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			this.host.showMessage(m.payload);
		});

		this.sender.match<M.ShowError>(M.MessageType.ShowError, m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			this.host.showMessage({
				message: m.payload.message,
				detail: m.payload.stack,
				buttons: []
			});
		});

		this.sender.match<M.Save>(M.MessageType.Save, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			if (!m.payload || !m.payload.publish) {
				return;
			}

			const project = this.store.getProject();

			if (!project) {
				return;
			}

			const serializeResult = await Persistence.serialize(project);

			// TODO: error handling
			if (serializeResult.state !== Types.PersistenceState.Success) {
				return;
			}

			await this.host.saveFile(`${project.getName()}.alva`, serializeResult.contents);
		});

		this.sender.match<M.ContextMenuRequest>(M.MessageType.ContextMenuRequest, m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			if (m.payload.menu === Types.ContextMenuType.ElementMenu) {
				const element = this.store.getProject().getElementById(m.payload.data.element.id);

				if (!element) {
					return;
				}

				this.host.showContextMenu({
					position: m.payload.position,
					items: ContextMenu.elementContextMenu({
						app: this.store.getApp(),
						project: this.store.getProject(),
						element
					})
				});
			}
		});

		this.sender.match<M.ExportHtmlProject>(M.MessageType.ExportHtmlProject, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			const project = this.store.getProject();

			if (project.getId() !== m.payload.projectId) {
				return;
			}

			const name = m.payload.path ? Path.basename(m.payload.path) : `${project.getName()}.html`;
			await this.host.download(
				name,
				`http://localhost:${this.store.getServerPort()}/project/export/${project.getId()}`
			);
		});

		this.sender.match<M.Reload>(M.MessageType.Reload, m => {
			const senders = m.sender ? m.sender : [];

			if (senders.includes(this.sender.id)) {
				this.host.reload();
			}
		});

		this.sender.match<M.Copy>(M.MessageType.Copy, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			const project = this.store.getProject();

			if (project.getId() !== m.payload.projectId) {
				return;
			}

			const item = project.getItem(m.payload.itemId, m.payload.itemType);

			if (!item) {
				return;
			}

			this.host.writeClipboard(
				Serde.serialize({
					type: M.MessageType.Clipboard,
					id: uuid.v4(),
					payload: {
						type: m.payload.itemType,
						item: item.toJSON(),
						project: project.toJSON()
					}
				})
			);
		});

		this.sender.match<M.CopyElement>(M.MessageType.CopyElement, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			const project = this.store.getProject();
			const item = project.getElementById(m.payload);

			if (!item) {
				return;
			}

			this.host.writeClipboard(
				Serde.serialize({
					type: M.MessageType.Clipboard,
					id: uuid.v4(),
					payload: {
						type: 'element',
						item: item.toJSON(),
						project: project.toJSON()
					}
				})
			);
		});

		this.sender.match<M.CutElement>(M.MessageType.CutElement, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			const project = this.store.getProject();
			const item = project.getElementById(m.payload);

			if (!item) {
				return;
			}

			this.host.writeClipboard(
				Serde.serialize({
					type: M.MessageType.Clipboard,
					id: uuid.v4(),
					payload: {
						type: 'element',
						item: item.toJSON(),
						project: project.toJSON()
					}
				})
			);
		});

		this.sender.match<M.Paste>(M.MessageType.Paste, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

			const contents = await this.host.readClipboard();

			if (!contents) {
				return;
			}

			const message = Serde.deserialize(contents);

			if (!message || message.type !== M.MessageType.Clipboard) {
				return;
			}

			const targetType = m.payload ? m.payload.targetType : Types.ElementTargetType.Auto;
			const targetId = m.payload ? m.payload.id : '';
			const itemType = deserializeItemType(message.payload.type);

			switch (itemType) {
				case Types.ItemType.Element: {
					this.sender.send({
						appId: m.appId,
						id: uuid.v4(),
						type: M.MessageType.PasteElement,
						payload: {
							element: message.payload.item as Types.SerializedElement,
							project: message.payload.project,
							targetType,
							targetId
						}
					});
					break;
				}
				case Types.ItemType.Page:
					this.sender.send({
						appId: m.appId,
						id: uuid.v4(),
						type: M.MessageType.PastePage,
						payload: {
							page: message.payload.item as Types.SerializedPage,
							project: message.payload.project
						}
					});
			}
		});
	}
}

function deserializeItemType(type: Types.SerializedItemType): Types.ItemType {
	switch (type) {
		case 'element':
			return Types.ItemType.Element;
		case 'page':
			return Types.ItemType.Page;
		case 'none':
			return Types.ItemType.None;
	}
}
