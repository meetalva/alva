import { Input, Space, SpaceSize } from '../../components';
import { observer } from 'mobx-react';
import { PatternFolderContainer } from './pattern-folder-container';
import { PatternItemContainer } from './pattern-item-container';
import * as React from 'react';
import { ViewStore } from '../../store';

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
							<PatternItemContainer key={pattern.getId()} pattern={pattern} />
						)}
						styleguide={styleguide}
					/>
				</Space>
			</>
		);
	}
}
