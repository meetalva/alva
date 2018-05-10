import DemoContainer from '../demo-container';
import { IconName, IconRegistry } from '../icons';
import PatternList from './index';
import * as React from 'react';

const PatternListItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Pattern List Item">
		<PatternList>Copy</PatternList>
		<IconRegistry names={IconName} />
	</DemoContainer>
);

export default PatternListItemDemo;
