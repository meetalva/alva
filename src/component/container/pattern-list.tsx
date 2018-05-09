import Input from '../../lsg/patterns/input/';
import { observer } from 'mobx-react';
import { PatternAnchor, PatternFolderView, PatternListItem } from '../../lsg/patterns/pattern-list';
import * as React from 'react';
import Space, { SpaceSize } from '../../lsg/patterns/space';
import { Pattern, PatternFolder, Styleguide, ViewStore } from '../../store';

@observer
export class PatternListContainer extends React.Component {
	public render(): JSX.Element | null {
		const store = ViewStore.getInstance();
		const styleguide = store.getStyleguide();

		if (!styleguide) {
			return null;
		}

		const patternRoot = styleguide.getRoot();

		return (
			<>
				<Space sizeBottom={SpaceSize.XXS}>
					<Input placeholder="Search patterns" />
				</Space>
				<Space size={[0, SpaceSize.L]}>
					<PatternFolderContainer
						isRoot
						folder={patternRoot}
						render={pattern => (
							<PatternListemItemContainer key={pattern.getId()} pattern={pattern} />
						)}
						styleguide={styleguide}
					/>
				</Space>
			</>
		);
	}
}

interface PatternFolderContainerProps {
	folder: PatternFolder;
	isRoot: boolean;
	styleguide: Styleguide;
	render(item: Pattern): JSX.Element | null;
}

class PatternFolderContainer extends React.Component<PatternFolderContainerProps> {
	public render(): JSX.Element {
		const { props } = this;
		const isPattern = (pattern): pattern is Pattern => typeof pattern !== 'undefined';

		return (
			<PatternFolderView name={props.isRoot ? '' : props.folder.getName()}>
				{props.folder
					.getPatterns()
					.map(id => props.styleguide.getPattern(id))
					.filter(isPattern)
					.map(pattern => props.render(pattern))}
				{props.folder
					.getChildren()
					.map(child => (
						<PatternFolderContainer
							folder={child}
							isRoot={false}
							key={child.getId()}
							styleguide={props.styleguide}
							render={props.render}
						/>
					))}
			</PatternFolderView>
		);
	}
}

interface PatternListemItemContainerProps {
	pattern: Pattern;
}

class PatternListemItemContainer extends React.Component<PatternListemItemContainerProps> {
	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		e.dataTransfer.dropEffect = 'copy';

		e.dataTransfer.setDragImage(
			e.currentTarget.querySelector(`[${PatternAnchor.icon}]`) as Element,
			12,
			12
		);

		e.dataTransfer.setData('patternId', this.props.pattern.getId());
	}

	public render(): JSX.Element | null {
		const { props } = this;
		return (
			<PatternListItem
				key={props.pattern.getId()}
				draggable
				onDragStart={e => this.handleDragStart(e)}
			>
				{props.pattern.getName()}
			</PatternListItem>
		);
	}
}
