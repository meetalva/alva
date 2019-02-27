import * as React from 'react';
import { ComponentBox } from '.';
import { Button, ButtonOrder } from '../button';
import { ComponentBoxView } from './component-box';
import { Space, SpaceSize } from '../space';

const ComponentBoxDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<ComponentBox view={ComponentBoxView.Design} title="Button">
				<Button order={ButtonOrder.Primary}>Navigate</Button>
			</ComponentBox>
			<Space size={SpaceSize.L} />
			<ComponentBox view={ComponentBoxView.Code} title="Button">
				<Button order={ButtonOrder.Primary}>Navigate</Button>
			</ComponentBox>
		</div>
	);
};

export default ComponentBoxDemo;
