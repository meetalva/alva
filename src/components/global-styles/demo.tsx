import globalStyles from './index';
import * as React from 'react';

const DemoGlobal: React.StatelessComponent<void> = (): JSX.Element => {
	globalStyles();
	return <section>Global Styles</section>;
};

export default DemoGlobal;
