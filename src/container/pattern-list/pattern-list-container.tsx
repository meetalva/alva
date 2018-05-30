import { Search, Space, SpaceSize } from '../../components';
import * as MobxReact from 'mobx-react';
import { PatternFolderContainer } from './pattern-folder-container';
import { PatternItemContainer } from './pattern-item-container';
import * as React from 'react';
import { ViewStore } from '../../store';

@MobxReact.observer
export class PatternListContainer extends React.Component {
	public render(): JSX.Element | null {
		const store = ViewStore.getInstance();
		const patternLibrary = store.getPatternLibrary();

		if (!patternLibrary) {
			return null;
		}

		const patternRoot = patternLibrary.getRoot();
		const matches = patternLibrary.query(store.getPatternSearchTerm());

		return (
			<>
				<Space sizeBottom={SpaceSize.XXS}>
					<Search
						placeholder="Search Library"
						onChange={e => store.setPatternSearchTerm(e.target.value)}
						value={store.getPatternSearchTerm()}
					/>
				</Space>
				<PatternFolderContainer
					isRoot
					folder={patternRoot}
					matches={matches}
					render={pattern => <PatternItemContainer key={pattern.getId()} pattern={pattern} />}
				/>
			</>
		);
	}
}
