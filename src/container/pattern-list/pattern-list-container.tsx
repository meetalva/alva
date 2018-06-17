import { Search, Space, SpaceSize } from '../../components';
import { ElementDragImage } from '../element-drag-image';
import * as MobxReact from 'mobx-react';
import { PatternFolderContainer } from './pattern-folder-container';
import { PatternItemContainer } from './pattern-item-container';
import * as React from 'react';
import { ViewStore } from '../../store';

@MobxReact.inject('store')
@MobxReact.observer
export class PatternListContainer extends React.Component {
	private dragImg: HTMLElement | null;

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		if (this.dragImg) {
			e.dataTransfer.effectAllowed = 'copy';
			e.dataTransfer.setDragImage(this.dragImg, 75, 15);
		}
	}

	public render(): JSX.Element | null {
		const { store } = this.props as { store: ViewStore };

		return (
			<div onDragStart={e => this.handleDragStart(e)}>
				<Space sizeBottom={SpaceSize.XXS}>
					<Search
						placeholder="Search Library"
						onChange={e => store.setPatternSearchTerm(e.target.value)}
						value={store.getPatternSearchTerm()}
					/>
				</Space>
				{store.getPatternLibraries().map(library => {
					const patternRoot = library.getRoot();
					const matches = library.query(store.getPatternSearchTerm());

					return (
						<PatternFolderContainer
							isRoot
							folder={patternRoot}
							matches={matches}
							key={library.getId()}
							render={pattern => (
								<PatternItemContainer key={pattern.getId()} pattern={pattern} />
							)}
						/>
					);
				})}

				<ElementDragImage
					element={store.getDraggedElement()}
					innerRef={ref => (this.dragImg = ref)}
				/>
			</div>
		);
	}
}
