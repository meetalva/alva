import * as AlvaUtil from '../../alva-util';
import { ChromeSwitch } from './chrome-switch';
import * as C from '@meetalva/components';
import { MessageType } from '../../message';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';
import { LogOut } from 'react-feather';
import { When, WhenFalsy, WhenTruthy } from '../when';
import * as T from '../../types';

export interface InjectedChromeContainerProps {
	page: Page;
	store: ViewStore;
}

export const ChromeContainer = MobxReact.inject('store')(
	MobxReact.observer((props): JSX.Element | null => {
		const { store } = props as InjectedChromeContainerProps;
		const app = store.getApp();
		const project = store.getProject();
		const page = store.getActivePage();
		const hasProject = typeof project !== 'undefined';
		const viewMode = props.store.getApp().getProjectViewMode();
		const isDesignView = viewMode === T.ProjectViewMode.Design;

		const nextPage = hasProject ? project.getNextPage() : undefined;
		const previousPage = hasProject ? project.getPreviousPage() : undefined;

		const toPreviousPage = previousPage
			? () => (hasProject ? project.setActivePage(previousPage) : undefined)
			: AlvaUtil.noop;

		const toNextPage = nextPage ? () => project.setActivePage(nextPage) : AlvaUtil.noop;

		const update = app.getUpdate();

		return (
			<C.Chrome
				onDoubleClick={() => {
					props.store.getApp().send({
						type: MessageType.Maximize,
						id: uuid.v4(),
						payload: undefined
					});
				}}
				hidden={!hasProject}
			>
				<When hasProject={hasProject}>
					<WhenTruthy>
						<ChromeSwitch />
					</WhenTruthy>
					<WhenFalsy>
						<div />
					</WhenFalsy>
				</When>
				<When
					hasProject={hasProject}
					hasPage={typeof page !== 'undefined'}
					isDesignView={isDesignView}
				>
					<WhenTruthy>
						<C.ViewSwitch
							fontSize={C.CopySize.M}
							justify="center"
							leftVisible={typeof previousPage !== 'undefined'}
							rightVisible={typeof nextPage !== 'undefined'}
							onLeftClick={toPreviousPage}
							onRightClick={toNextPage}
						>
							<ProjectName
								name={project ? project.getName() : ''}
								draft={project ? project.getDraft() : false}
							/>{' '}
							— {page ? page!.getName() : ''}
						</C.ViewSwitch>
					</WhenTruthy>
					<WhenFalsy>
						<div />
					</WhenFalsy>
				</When>
				<C.Flex
					alignItems={C.FlexAlignItems.Center}
					style={{
						justifySelf: 'right',
						marginLeft: 'auto',
						gridColumn: 3
					}}
				>
					{typeof update !== 'undefined' && (
						<C.UpdateBadge
							title={`Update to version ${update!.version}`}
							onClick={() => {
								app.send({
									type: MessageType.ShowUpdateDetails,
									id: uuid.v4(),
									payload: update!
								});
							}}
						>
							{update!.version}
						</C.UpdateBadge>
					)}
					<When isDetailView={app.isActiveView(T.AlvaView.PageDetail)}>
						<C.ChromeButton
							title="Help"
							onClick={() => {
								props.store.getApp().send({
									type: MessageType.OpenExternalURL,
									id: uuid.v4(),
									payload: 'https://meetalva.io/doc/docs/start'
								});
							}}
							onDoubleClick={event => {
								event.stopPropagation();
							}}
						/>
						<C.ChromeButton
							title="Found a Bug?"
							onClick={() => {
								props.store.getApp().send({
									type: MessageType.OpenExternalURL,
									id: uuid.v4(),
									payload: AlvaUtil.newIssueUrl({
										user: 'meetalva',
										repo: 'alva',
										title: 'New bug report',
										body: `Hey there, I just encountered the following error with Alva:`,
										labels: ['type: bug']
									})
								});
							}}
							onDoubleClick={event => {
								event.stopPropagation();
							}}
						/>
						<C.ChromeButton
							title="Export"
							disabled={!hasProject}
							icon={
								<LogOut
									size={C.IconSize.XS}
									strokeWidth={1.5}
									style={{ display: 'block' }}
								/>
							}
							onClick={() => {
								if (!hasProject) {
									return;
								}

								props.store.getApp().send({
									id: uuid.v4(),
									type: MessageType.ExportHtmlProject,
									payload: { path: undefined, projectId: store.getProject().getId() }
								});
							}}
							onDoubleClick={event => {
								event.stopPropagation();
							}}
						/>
					</When>
				</C.Flex>
				{props.children}
			</C.Chrome>
		);
	})
);

export interface ProjectNameProps {
	draft: boolean;
	name: string;
}

const ProjectName: React.SFC<ProjectNameProps> = props =>
	props.draft ? <i>{props.name}</i> : <>{props.name}</>;
