import Chrome from '../../lsg/patterns/chrome';
import { CopySize as FontSize } from '../../lsg/patterns/copy';
import { observer } from 'mobx-react';
import { OverviewSwitchContainer } from './overview-switch-container';
import * as React from 'react';
import { AlvaView, Page, ViewStore } from '../../store';
import { ViewSwitch, ViewTitle } from '../../lsg/patterns/view-switch';

@observer
export class ChromeContainer extends React.Component {
	protected store = ViewStore.getInstance();

	protected getCurrentPage(): Page | undefined {
		return this.store.getCurrentPage();
	}

	public render(): JSX.Element {
		let nextPage: Page | undefined;
		let previousPage: Page | undefined;

		const currentPage = this.getCurrentPage();
		const project = this.store.getCurrentProject();
		const pages = project ? project.getPages() : [];
		const currentIndex = currentPage ? pages.indexOf(currentPage) : 0;

		if (currentIndex > 0) {
			previousPage = pages[currentIndex - 1];
		}

		if (currentIndex < pages.length - 1) {
			nextPage = pages[currentIndex + 1];
		}

		return (
			<Chrome>
				{this.store.getActiveView() === AlvaView.PageDetail ? (
					<OverviewSwitchContainer />
				) : (
					<div />
				)}
				{this.store.getActiveView() === AlvaView.PageDetail && (
					<ViewSwitch
						fontSize={FontSize.M}
						justify="center"
						leftVisible={Boolean(previousPage)}
						rightVisible={Boolean(nextPage)}
						// onLeftClick={() => /* this.openPage(previousPage) */}
						// onRightClick={() => /* this.openPage(nextPage) */}
						title={currentPage ? currentPage.getName() : ''}
					/>
				)}
				{this.store.getActiveView() === AlvaView.Pages && (
					<ViewTitle
						fontSize={FontSize.M}
						justify="center"
						title={project ? project.getName() : 'Alva'}
					/>
				)}
				{this.props.children}
			</Chrome>
		);
	}
}
