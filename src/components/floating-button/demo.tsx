import DemoContainer from '../demo-container';
import { Icon, IconName } from '../icons';
import * as React from 'react';
import { FloatingButton } from '.';

const FloatingButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Floating Button">
		<FloatingButton icon={<Icon name={IconName.Robo} />} />
	</DemoContainer>
);

export default FloatingButtonDemo;
