import * as React from 'react';
import DemoContainer from '../demo-container';
import { BadgeIcon } from './';
import { Color } from '../colors';

export default (): JSX.Element => (
	<DemoContainer title="Badge Icon">
		<BadgeIcon color={Color.Blue20}>3</BadgeIcon>
	</DemoContainer>
);
