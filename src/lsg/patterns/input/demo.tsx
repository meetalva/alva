import Input, { InputTypes } from './index';
import * as React from 'react';

const InputDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<Input type={InputTypes.string} placeholder="Placeholder.."/>
);

export default InputDemo;
