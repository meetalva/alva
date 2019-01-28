import { Color } from '../colors';
import DemoContainer from '../demo-container';
import { LinkIcon } from './index';
import * as React from 'react';
import { CopySize } from '../copy';

const LinkIconDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Link with Icon">
		<LinkIcon icon="Box" color={Color.Blue} size={CopySize.M}>
			Link
		</LinkIcon>
	</DemoContainer>
);

export default LinkIconDemo;
