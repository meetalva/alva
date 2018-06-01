import DemoContainer from '../demo-container';
import { TabNavigation, TabNavigationItem } from '.';
import * as React from 'react';

const TabNavigationDemo = () => (
	<DemoContainer title="Tab Navigation">
		<TabNavigation>
			<TabNavigationItem active={true} tabText="Patterns" />
			<TabNavigationItem active={false} tabText="Properties" />
		</TabNavigation>
	</DemoContainer>
);

export default TabNavigationDemo;
