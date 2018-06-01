import DemoContainer from '../demo-container';
import { Button, ButtonOrder } from './index';
import * as React from 'react';

const ButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Button">
		<Button order={ButtonOrder.Primary}>Primary</Button>
		<Button order={ButtonOrder.Secondary}>Secondary</Button>
	</DemoContainer>
);

export default ButtonDemo;
