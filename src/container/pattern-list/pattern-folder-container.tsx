import { PatternFolderView } from '../../components';
import * as React from 'react';
import { Pattern, PatternFolder, PatternLibrary } from '../../store';

export interface PatternFolderContainerProps {
	folder: PatternFolder;
	isRoot: boolean;
	styleguide: PatternLibrary;
	render(item: Pattern): JSX.Element | null;
}

export class PatternFolderContainer extends React.Component<PatternFolderContainerProps> {
	public render(): JSX.Element {
		const { props } = this;
		const isPattern = (pattern): pattern is Pattern => typeof pattern !== 'undefined';

		return (
			<PatternFolderView name={props.isRoot ? '' : props.folder.getName()}>
				{props.folder
					.getPatterns()
					.map(id => props.styleguide.getPatternById(id))
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
