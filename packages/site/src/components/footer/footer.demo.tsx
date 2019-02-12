import * as React from 'react';
import { Footer } from './footer';
import { MenuItem } from '../menu-item';

const FooterDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<Footer copyright="&copy; 2017-present Alva">
			<MenuItem linkName="Privacy Policy" />
			<MenuItem linkName="Legal Notice" />
		</Footer>
	);
};

export default FooterDemo;
