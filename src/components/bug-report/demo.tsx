import DemoContainer from '../demo-container';
import { BugReport } from './index';
import * as React from 'react';

const BugReportDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="BugReport">
		<BugReport title="Found a bug?" />
	</DemoContainer>
);

export default BugReportDemo;
