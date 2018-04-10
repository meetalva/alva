import Chrome from '../../lsg/patterns/chrome';
import { CopySize as FontSize } from '../../lsg/patterns/copy';
import { observer } from 'mobx-react';
import { OverviewSwitchContainer } from './overview-switch-container';
import { Page } from '../../store/page/page';
import { PageRef } from '../../store/page/page-ref';
import * as React from 'react';
import { Store } from '../../store/store';
import { ViewSwitch, ViewTitle } from '../../lsg/patterns/view-switch';

@observer
export class ChromeContainer extends React.Component {
	protected store = Store.getInstance();

	protected getCurrentPage(): Page | undefined {
		return this.store.getCurrentPage();
	}

	protected openPage(page: PageRef | undefined): void {
		if (page) {
			this.store.openPage(page.getId());
		}
		return;
	}

	public render(): JSX.Element {
		let nextPage: PageRef | undefined;
		let previousPage: PageRef | undefined;

		const currentPage = this.getCurrentPage();
		const project = currentPage ? currentPage.getProject() : undefined;
		const pages = project ? project.getPages() : [];
		const currentIndex = currentPage ? pages.indexOf(currentPage.getPageRef()) : 0;

		if (currentIndex > 0) {
			previousPage = pages[currentIndex - 1];
		}

		if (currentIndex < pages.length - 1) {
			nextPage = pages[currentIndex + 1];
		}

		return (
			<Chrome>
				<OverviewSwitchContainer />
				{!this.store.pageOverviewIsOpened && (
					<ViewSwitch
						fontSize={FontSize.M}
						justify="center"
						leftVisible={Boolean(previousPage)}
						rightVisible={Boolean(nextPage)}
						onLeftClick={() => this.openPage(previousPage)}
						onRightClick={() => this.openPage(nextPage)}
						title={currentPage ? currentPage.getName() : ''}
					/>
				)}
				{this.store.pageOverviewIsOpened && (
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
