import Input, { InputTypes } from './index';
import * as React from 'react';
import Space, { Size } from '../space';

const InputDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<Space size={Size.L}>
		<Input type={InputTypes.string} placeholder="Placeholder.." />
	</Space>
);

export default InputDemo;
