import { Color } from '../colors';
import DemoContainer from '../demo-container';
import { Link } from './index';
import * as React from 'react';

const clickHandler = (event: React.MouseEvent<HTMLElement>): void => console.log(event);
const LinkDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Link">
		<Link>Link</Link>
		<Link color={Color.Blue40}>Link with color</Link>
		<Link color={Color.Blue40} onClick={clickHandler}>
			Link with clickHandler
		</Link>
		<Link color={Color.Blue40} onClick={clickHandler} uppercase={true}>
			Link with uppercase
		</Link>
	</DemoContainer>
);

export default LinkDemo;
