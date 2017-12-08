import { colors } from '../colors';
import Link from './index';
import * as React from 'react';
import Space, { Size } from '../space';

const clickHandler = (event: React.MouseEvent<HTMLElement>): void => console.log(event);
const LinkDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<Space size={Size.L}>
		<Space size={Size.L}>
			<Link
			>
				Link
			</Link>
		</Space>
		<Space size={Size.L}>
			<Link
				color={colors.blue}
			>
				Link with color
			</Link>
		</Space>
		<Space size={Size.L}>
			<Link
				color={colors.blue}
				onClick={clickHandler}
			>
				Link with clickHandler
			</Link>
		</Space>
		<Space size={Size.L}>
			<Link
				color={colors.blue}
				onClick={clickHandler}
				uppercase={true}
			>
				Link with uppercase
			</Link>
		</Space>
	</Space>
);

export default LinkDemo;
