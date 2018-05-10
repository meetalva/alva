import * as AlvaUtil from '../../alva-util';
import { Chrome, CopySize, ViewSwitch, ViewTitle } from '../../components';
import * as MobxReact from 'mobx-react';
import { OverviewSwitchContainer } from './overview-switch-container';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../store/types';

export const ChromeContainer = MobxReact.observer((props): JSX.Element | null => {
	const store = ViewStore.getInstance();
	const project = store.getCurrentProject();

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

	const previous = index > 0 ? () => store.setActivePageByIndex(index - 1) : AlvaUtil.noop;
	const next = index < pages.length ? () => store.setActivePageByIndex(index + 1) : AlvaUtil.noop;

	return (
		<Chrome>
			{store.getActiveView() === Types.AlvaView.PageDetail ? (
				<OverviewSwitchContainer />
			) : (
				<div />
			)}
			{store.getActiveView() === Types.AlvaView.PageDetail && (
				<ViewSwitch
					fontSize={CopySize.M}
					justify="center"
					leftVisible={index > 0}
					rightVisible={index < pages.length - 1}
					onLeftClick={previous}
					onRightClick={next}
					title={page ? page.getName() : ''}
				/>
			)}
			{store.getActiveView() === Types.AlvaView.Pages && (
				<ViewTitle
					fontSize={CopySize.M}
					justify="center"
					title={project ? project.getName() : 'Alva'}
				/>
			)}
			{props.children}
		</Chrome>
	);
});
