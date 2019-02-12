import * as React from 'react';
import { Menu } from './index';
import { MenuItem } from '../menu-item';

const MenuDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<Menu sticky logo="/api/static/logo.svg">
			<MenuItem linkName="Story" />
			<MenuItem linkName="Learn" />
			<MenuItem linkName="API" />
			<MenuItem linkName="Github" />
			<MenuItem linkName="Twitter" />
		</Menu>
	);
};

export default MenuDemo;
