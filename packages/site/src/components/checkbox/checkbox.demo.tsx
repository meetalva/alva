import * as React from 'react';

import { Checkbox } from './checkbox';
import { Space, SpaceSize } from '../space';

const CheckboxDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<Checkbox labelText="Checkbox" />
			<Space size={SpaceSize.M} />
			<Checkbox labelText="Checkbox" checked />
			<Space size={SpaceSize.M} />
			<Checkbox labelText="Checkbox" disabled />
			<Space size={SpaceSize.M} />
			<Checkbox labelText="Checkbox" checked disabled />
		</div>
	);
};

export default CheckboxDemo;
