import Chrome from '../../lsg/patterns/chrome';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/page/page-ref';
import * as React from 'react';
import { Store } from '../../store/store';

@observer
export class ChromeContainer extends React.Component {
	public render(): JSX.Element {
		let nextPage: PageRef | undefined;
		let previousPage: PageRef | undefined;

		const store = Store.getInstance();
		const page = store.getCurrentPage();
		const pages: PageRef[] = page ? page.getProject().getPages() : [];
		const currentIndex = page ? pages.indexOf(page.getPageRef()) : 0;

		if (currentIndex > 0) {
			previousPage = pages[currentIndex - 1];
		}

		if (currentIndex < pages.length - 1) {
			nextPage = pages[currentIndex + 1];
		}

		return (
			<Chrome
				leftVisible={!!previousPage}
				rightVisible={!!nextPage}
				onLeftClick={() => (previousPage ? store.openPage(previousPage.getId()) : undefined)}
				onRightClick={() => (nextPage ? store.openPage(nextPage.getId()) : undefined)}
				title={page ? page.getName() : undefined}
			>
				{this.props.children}
			</Chrome>
		);
	}
}
