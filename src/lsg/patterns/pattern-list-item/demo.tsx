import { IconName, IconRegistry } from '../icons';
import PatternListItem from './index';
import * as React from 'react';

const PatternListItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<PatternListItem>
			Copy
		</PatternListItem>

		<IconRegistry names={IconName}/>
	</div>
);

export default PatternListItemDemo;
