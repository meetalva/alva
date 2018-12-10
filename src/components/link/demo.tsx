import { Color } from '../colors';
import DemoContainer from '../demo-container';
import { Link } from './index';
import * as React from 'react';

const LinkDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Link">
		<Link>Link</Link>
		<Link color={Color.Blue40}>Link with color</Link>
		<Link color={Color.Blue40}>Link with clickHandler</Link>
		<Link color={Color.Blue40} uppercase={true}>
			Link with uppercase
		</Link>
	</DemoContainer>
);

export default LinkDemo;
