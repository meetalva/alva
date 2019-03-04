import * as React from 'react';
import { Footer } from './footer';
import { MenuItem } from '../menu-item';

const FooterDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<Footer copyright="&copy; 2017-present Alva">
			<MenuItem>Privacy Policy</MenuItem>
			<MenuItem>Legal Notice></MenuItem>
		</Footer>
	);
};

export default FooterDemo;
