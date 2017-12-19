import DemoContainer from '../demo-container';
import Button, { Order } from './index';
import * as React from 'react';
import Space, { Size } from '../space';

const ButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<Space size={Size.L}>
			<Button order={Order.Primary}>Primary</Button>
		</Space>
		<Space size={Size.L}>
			<Button order={Order.Secondary}>Secondary</Button>
		</Space>
	</DemoContainer>
);

export default ButtonDemo;
