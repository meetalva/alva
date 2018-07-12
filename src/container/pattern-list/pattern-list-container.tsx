import * as Components from '../../components';
import { ElementDragImage } from '../element-drag-image';
import * as MobxReact from 'mobx-react';
// import { PatternFolderContainer } from './pattern-folder-container';
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
				<Components.Space sizeBottom={Components.SpaceSize.XXS}>
					<Components.Search
						placeholder="Search Library"
						onChange={e => store.setPatternSearchTerm(e.target.value)}
						value={store.getPatternSearchTerm()}
					/>
				</Components.Space>
				{store.getPatternLibraries().map(library => (
					<Components.PatternFolderView key={library.getId()} name={library.getName()}>
						{library
							.getPatterns()
							.map(pattern => (
								<PatternItemContainer key={pattern.getId()} pattern={pattern} />
							))}
					</Components.PatternFolderView>
				))}

				<ElementDragImage
					element={store.getDraggedElement()}
					innerRef={ref => (this.dragImg = ref)}
				/>
			</div>
		);
	}
}
