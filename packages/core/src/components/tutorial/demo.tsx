import DemoContainer from '../demo-container';
import { Tutorial } from './index';
import * as React from 'react';

const TutorialDemo = () => {
	return (
		<DemoContainer title="Image">
			<Tutorial progress={0}>Hello World</Tutorial>
		</DemoContainer>
	);
};

export default TutorialDemo;
