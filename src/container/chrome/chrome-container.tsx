import * as AlvaUtil from '../../alva-util';
import { ChromeSwitch } from './chrome-switch';
import { BugReport, Chrome, CopySize, ViewSwitch } from '../../components';
import { ServerMessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import * as Sender from '../../message/client';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';

import { EditableTitleContainer } from '../editable-title/editable-title-container';

export interface InjectedChromeContainerProps {
	page: Page;
	store: ViewStore;
}

export const ChromeContainer = MobxReact.inject('store')(
	MobxReact.observer((props): JSX.Element | null => {
		const { store } = props as InjectedChromeContainerProps;
		const project = store.getProject();

		if (!project) {
			return null;
		}

		const page = store.getCurrentPage();

		if (!page) {
			return null;
		}

		const index = project.getPageIndex(page);
		const pages = project.getPages();

		if (typeof index !== 'number') {
			return null;
		}

		const toPreviousPage = () => {
			store.setActivePageByIndex(index - 1);
			store.unsetSelectedElement();
		};

		const toNextPage = () => {
			store.setActivePageByIndex(index + 1);
			store.unsetSelectedElement();
		};

		const previous = index > 0 ? toPreviousPage : AlvaUtil.noop;
		const next = index < pages.length ? toNextPage : AlvaUtil.noop;
		return (
			<Chrome
				onDoubleClick={() => {
					Sender.send({
						type: ServerMessageType.Maximize,
						id: uuid.v4(),
						payload: undefined
					});
				}}
			>
				<ChromeSwitch />
				<ViewSwitch
					fontSize={CopySize.M}
					justify="center"
					leftVisible={index > 0}
					rightVisible={index < pages.length - 1}
					onLeftClick={previous}
					onRightClick={next}
				>
					<EditableTitleContainer
						focused={props.focused}
						page={page}
						value={page ? page.getName() : ''}
						secondary
					/>
				</ViewSwitch>
				<BugReport
					title="Found a bug?"
					onClick={() => {
						Sender.send({
							type: ServerMessageType.OpenExternalURL,
							id: uuid.v4(),
							payload: 'https://github.com/meetalva/alva/labels/type%3A%20bug'
						});
					}}
				/>
				{props.children}
			</Chrome>
		);
	})
);
