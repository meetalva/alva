import * as React from 'react';
import { Copy, CopySize } from './copy';
import { TextAlign } from '../types';

const CopyDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<Copy size={CopySize.Small}>
				CopySize.S
				<div />
				Lorem ipsum dolor sit, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
				invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
			</Copy>
			<Copy>
				CopySize.M
				<div />
				Lorem ipsum dolor sit, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
				invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
			</Copy>
			<Copy textAlign={TextAlign.Right}>Lorem</Copy>
			<Copy uppercase>Lorem Ipsum</Copy>
		</div>
	);
};

export default CopyDemo;
