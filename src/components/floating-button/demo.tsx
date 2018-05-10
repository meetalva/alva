import DemoContainer from '../demo-container';
import { Icon, IconName, IconRegistry } from '../icons';
import * as React from 'react';
import { SpaceSize } from '../space';
import { FloatingButton } from '.';

const FloatingButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<div style={{ width: SpaceSize.XXXL }}>
			<FloatingButton icon={<Icon name={IconName.Robo} />} />
		</div>
		<IconRegistry names={IconName} />
	</DemoContainer>
);

export default FloatingButtonDemo;
