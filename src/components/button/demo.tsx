import DemoContainer from '../demo-container';
import { Button, ButtonOrder, ButtonSize } from './index';
import * as React from 'react';

const ButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Button">
		<Button order={ButtonOrder.Primary}>Primary</Button>
		<Button order={ButtonOrder.Primary} size={ButtonSize.Medium}>
			Primary
		</Button>
		<Button order={ButtonOrder.Primary} size={ButtonSize.Small}>
			Primary
		</Button>

		<Button order={ButtonOrder.Secondary}>Secondary</Button>
		<Button order={ButtonOrder.Secondary} size={ButtonSize.Medium}>
			Secondary
		</Button>
		<Button order={ButtonOrder.Secondary} size={ButtonSize.Small}>
			Secondary
		</Button>

		<Button order={ButtonOrder.Tertiary}>Tertiary</Button>
		<Button order={ButtonOrder.Tertiary} size={ButtonSize.Medium}>
			Tertiary
		</Button>
		<Button order={ButtonOrder.Tertiary} size={ButtonSize.Small}>
			Tertiary
		</Button>
	</DemoContainer>
);

export default ButtonDemo;
