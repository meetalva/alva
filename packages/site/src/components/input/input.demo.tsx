import * as React from 'react';
import { Input } from './input';
import { Space, SpaceSize } from '../space';

const InputDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<Input labelText="Label" placeholder="Placeholder" />
			<Space size={SpaceSize.M} />
			<Input labelText="Label" value="The quick brown fox jumps over the lazy dog" readOnly />
			<Space size={SpaceSize.M} />
			<Input
				labelText="Label"
				value="The quick brown fox jumps over the lazy dog"
				errorText="Something went wrong :("
				readOnly
			/>
		</div>
	);
};

export default InputDemo;
