import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageListComposite } from './page-list-composite';
import { PageRef } from '../../store/page/page-ref';
import { Project } from '../../store/project';
import * as React from 'react';
import { Store } from '../../store/store';

@observer
export class PageListContainer extends React.Component {
	@MobX.observable public focusStates: boolean[] = this.generateInitialFocusList(false);

	@MobX.action
	protected generateInitialFocusList(bool: boolean): boolean[] {
		const pages = this.getPages();
		const states: boolean[] = [];
		pages.forEach((page: PageRef) => {
			states.push(bool);
		});
		return states;
	}
	protected getPages(): PageRef[] {
		const project: Project | undefined = Store.getInstance().getCurrentProject();
		return project ? project.getPages() : [];
	}

	@MobX.action
	protected handleClick(e: React.MouseEvent<HTMLElement>, i: number): void {
		if (this.focusStates[i]) {
			return;
		}
		this.focusStates.forEach((state, index) => {
			this.focusStates[index] = false;
		});
		this.focusStates[i] = !this.focusStates[i];
	}

	public render(): JSX.Element {
		return (
			<PageListComposite
				focusStates={this.focusStates}
				pages={this.getPages()}
				onClick={this.handleClick}
			/>
		);
	}
}
