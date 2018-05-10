import TabNavigation, { TabNavigationItem } from './index';
import * as React from 'react';

const TabNavigationDemo = () => (
	<TabNavigation>
		<TabNavigationItem active={true} tabText="Patterns" />
		<TabNavigationItem active={false} tabText="Properties" />
	</TabNavigation>
);

export default TabNavigationDemo;
