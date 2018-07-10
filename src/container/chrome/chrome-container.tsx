import * as AlvaUtil from '../../alva-util';
import { ChromeSwitch } from './chrome-switch';
import { BugReport, Chrome, CopySize, ViewSwitch } from '../../components';
import { MessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import * as Types from '../../types';
import * as Sender from '../../sender/client';
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

		const page = store.getActivePage();

		if (!page) {
			return null;
		}

		const nextPage = project.getNextPage();
		const previousPage = project.getPreviousPage();

		const toPreviousPage = previousPage
			? () => project.setActivePage(previousPage)
			: AlvaUtil.noop;
		const toNextPage = nextPage ? () => project.setActivePage(nextPage) : AlvaUtil.noop;

		return (
			<Chrome
				onDoubleClick={() => {
					Sender.send({
						type: MessageType.Maximize,
						id: uuid.v4(),
						payload: undefined
					});
				}}
			>
				<ChromeSwitch />
				<ViewSwitch
					fontSize={CopySize.M}
					justify="center"
					leftVisible={typeof previousPage !== 'undefined'}
					rightVisible={typeof nextPage !== 'undefined'}
					onLeftClick={toPreviousPage}
					onRightClick={toNextPage}
				>
					<EditableTitleContainer
						focused={props.focused}
						page={page}
						secondary={Types.EditableTitleType.Secondary}
					/>
				</ViewSwitch>
				<BugReport
					title="Found a bug?"
					onClick={() => {
						Sender.send({
							type: MessageType.OpenExternalURL,
							id: uuid.v4(),
							payload: 'https://github.com/meetalva/alva/labels/type%3A%20bug'
						});
					}}
					onDoubleClick={event => {
						event.stopPropagation();
					}}
				/>
				{props.children}
			</Chrome>
		);
	})
);
