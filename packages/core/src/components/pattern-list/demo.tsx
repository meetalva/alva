import DemoContainer from '../demo-container';
import * as PatternList from '.';
import * as React from 'react';

const PatternListItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Pattern List Item">
		<PatternList.PatternList>
			<PatternList.PatternFolderView name="Folder Name">
				<PatternList.PatternListItem icon="Box">
					<PatternList.PatternItemLabel>Label</PatternList.PatternItemLabel>
					<PatternList.PatternItemDescription>Description</PatternList.PatternItemDescription>
				</PatternList.PatternListItem>
			</PatternList.PatternFolderView>
		</PatternList.PatternList>
	</DemoContainer>
);

export default PatternListItemDemo;
