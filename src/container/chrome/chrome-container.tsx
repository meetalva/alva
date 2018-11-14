import * as AlvaUtil from '../../alva-util';
import { ChromeSwitch } from './chrome-switch';
import { ChromeButton, Chrome, CopySize, IconSize, ViewSwitch } from '../../components';
import { MessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';
import { LogOut } from 'react-feather';
import * as Types from '../../types';

export interface InjectedChromeContainerProps {
	page: Page;
	store: ViewStore;
}

export const ChromeContainer = MobxReact.inject('store')(
	MobxReact.observer((props): JSX.Element | null => {
		const { store } = props as InjectedChromeContainerProps;
		const app = store.getApp();
		const project = store.getProject();

		if (!project || app.getActiveView() !== Types.AlvaView.PageDetail) {
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
				onDoubleClick={e => {
					props.store.getSender().send({
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
					<ProjectName name={project.getName()} draft={project.getDraft()} /> —{' '}
					{page.getName()}
				</ViewSwitch>
				<div style={{ display: 'flex', justifySelf: 'right', alignItems: 'center' }}>
					<ChromeButton
						title="Help"
						onClick={() => {
							props.store.getSender().send({
								type: MessageType.OpenExternalURL,
								id: uuid.v4(),
								payload: 'https://meetalva.io/doc/docs/start'
							});
						}}
						onDoubleClick={event => {
							event.stopPropagation();
						}}
					/>
					<ChromeButton
						title="Found a Bug?"
						onClick={() => {
							props.store.getSender().send({
								type: MessageType.OpenExternalURL,
								id: uuid.v4(),
								payload: 'https://github.com/meetalva/alva/labels/type%3A%20bug'
							});
						}}
						onDoubleClick={event => {
							event.stopPropagation();
						}}
					/>
					<ChromeButton
						title="Export"
						icon={
							<LogOut size={IconSize.XS} strokeWidth={1.5} style={{ display: 'block' }} />
						}
						onClick={() => {
							props.store.getSender().send({
								id: uuid.v4(),
								type: MessageType.ExportHtmlProject,
								payload: { path: undefined, projectId: store.getProject().getId() }
							});
						}}
						onDoubleClick={event => {
							event.stopPropagation();
						}}
					/>
				</div>
				{props.children}
			</Chrome>
		);
	})
);

export interface ProjectNameProps {
	draft: boolean;
	name: string;
}

const ProjectName: React.SFC<ProjectNameProps> = props =>
	props.draft ? <i>{props.name}</i> : <>{props.name}</>;
