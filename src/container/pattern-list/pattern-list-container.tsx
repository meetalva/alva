import * as Components from '../../components';
import { ElementDragImage } from '../element-drag-image';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import { PatternItemContainer } from './pattern-item-container';
import * as React from 'react';
import { ViewStore } from '../../store';

@MobxReact.inject('store')
@MobxReact.observer
export class PatternListContainer extends React.Component {
	private dragImg: React.RefObject<any> = React.createRef();

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		if (this.dragImg.current) {
			e.dataTransfer.setDragImage(this.dragImg.current, 75, 15);
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
			<div>
				<div
					style={{
						position: 'sticky',
						top: 0,
						backgroundColor: Components.Color.Grey97,
						boxSizing: 'border-box',
						marginLeft: -1 * Components.getSpace(Components.SpaceSize.M),
						marginRight:
							-1 *
							(Components.getSpace(Components.SpaceSize.M) -
								1) /* -1 to not overlap parent border */
					}}
				>
					<Components.Space sizeBottom={Components.SpaceSize.XXS}>
						<Components.Search
							placeholder="Search Library"
							onChange={e => store.setPatternSearchTerm(e.target.value)}
							value={store.getPatternSearchTerm()}
						/>
					</Components.Space>
				</div>
				<div onDragStart={e => this.handleDragStart(e)} style={{}}>
					{store
						.getPatternLibraries()
						.map(library => (
							<PatternLibraryContainer
								key={library.getId()}
								library={library}
								searchResult={searchResult}
							/>
						))}
					<ElementDragImage element={store.getDraggedElement()} dragRef={this.dragImg} />
				</div>
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
		const patterns = props.library.getPatterns(props.searchResult);

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
