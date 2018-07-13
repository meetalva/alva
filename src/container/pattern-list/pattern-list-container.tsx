import * as Components from '../../components';
import { ElementDragImage } from '../element-drag-image';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import { PatternItemContainer } from './pattern-item-container';
import * as React from 'react';
import * as Types from '../../types';
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

		const project = store.getProject();

		if (!project) {
			return null;
		}

		const searchResult = project.getPatternSearch().query(store.getPatternSearchTerm());

		return (
			<div onDragStart={e => this.handleDragStart(e)}>
				<Components.Space sizeBottom={Components.SpaceSize.XXS}>
					<Components.Search
						placeholder="Search Library"
						onChange={e => store.setPatternSearchTerm(e.target.value)}
						value={store.getPatternSearchTerm()}
					/>
				</Components.Space>
				{store
					.getPatternLibraries()
					.map(library => (
						<PatternLibraryContainer
							key={library.getId()}
							library={library}
							searchResult={searchResult}
						/>
					))}
				<ElementDragImage
					element={store.getDraggedElement()}
					innerRef={ref => (this.dragImg = ref)}
				/>
			</div>
		);
	}
}

export interface PatternLibraryContainerProps {
	library: Model.PatternLibrary;
	searchResult: string[];
}

class PatternLibraryContainer extends React.Component<PatternLibraryContainerProps> {
	public render(): JSX.Element | null {
		const props = this.props;
		const patterns = props.library
			.getPatterns(props.searchResult)
			.filter(pattern => pattern.getType() !== Types.PatternType.SyntheticPage);

		if (patterns.length === 0) {
			return null;
		}

		return (
			<Components.PatternFolderView name={props.library.getName()}>
				{patterns.map(pattern => (
					<PatternItemContainer key={pattern.getId()} pattern={pattern} />
				))}
			</Components.PatternFolderView>
		);
	}
}
