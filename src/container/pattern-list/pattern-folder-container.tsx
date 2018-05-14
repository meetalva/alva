import { PatternFolderView } from '../../components';
import { Pattern, PatternFolder } from '../../model';
import * as React from 'react';

export interface PatternFolderContainerProps {
	folder: PatternFolder;
	isRoot: boolean;
	matches: string[];
	render(item: Pattern): JSX.Element | null;
}

export class PatternFolderContainer extends React.Component<PatternFolderContainerProps> {
	public render(): React.ReactNode {
		const { props } = this;

		const folderMatches = props.isRoot ? true : props.matches.includes(props.folder.getId());
		const filter = folderMatches
			? () => true
			: pattern => props.matches.includes(pattern.getId());

		const patterns = props.folder.getPatterns().filter(filter);
		const children = props.folder.getChildren().filter(filter);

		return (
			<PatternFolderView name={props.isRoot ? '' : props.folder.getName()}>
				{patterns.map(pattern => props.render(pattern))}
				{children.map(child => (
					<PatternFolderContainer
						folder={child}
						isRoot={false}
						key={child.getId()}
						matches={props.matches}
						render={props.render}
					/>
				))}
			</PatternFolderView>
		);
	}
}
