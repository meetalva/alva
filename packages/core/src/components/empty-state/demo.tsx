import { EmptyState } from './index';
import * as React from 'react';

const EmptyStateDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<EmptyState headline="Elements" copy="Drop them here" />
);

export default EmptyStateDemo;
