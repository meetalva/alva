import * as React from 'react';
import { Radio } from './radio';
import { Space, SpaceSize } from '../space';

const RadioDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<Space size={SpaceSize.M} />
			<Radio labelText="Radio" />
			<Space size={SpaceSize.M} />
			<Radio labelText="Radio" checked />
			<Space size={SpaceSize.M} />
			<Radio labelText="Radio" disabled />
		</div>
	);
};

export default RadioDemo;
