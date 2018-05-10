import DemoContainer from '../demo-container';
import Button, { ButtonOrder } from './index';
import * as React from 'react';
import Space, { SpaceSize } from '../space';

const ButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<Space size={SpaceSize.L}>
			<Button order={ButtonOrder.Primary}>Primary</Button>
		</Space>
		<Space size={SpaceSize.L}>
			<Button order={ButtonOrder.Secondary}>Secondary</Button>
		</Space>
	</DemoContainer>
);

export default ButtonDemo;
