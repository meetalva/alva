import * as React from 'react';
import { Button, ButtonOrder } from './button';
import { Space, SpaceSize } from '../space';

const ButtonDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<>
			<Button order={ButtonOrder.Primary}>Primary</Button>
			<Space size={SpaceSize.M} />
			<Button order={ButtonOrder.Secondary}>Secondary</Button>
			<Space size={SpaceSize.M} />
			<Button order={ButtonOrder.Primary} disabled>
				Primary disabled
			</Button>
			<Space size={SpaceSize.M} />
			<Button order={ButtonOrder.Secondary} disabled>
				Secondary disabled
			</Button>
		</>
	);
};

export default ButtonDemo;
