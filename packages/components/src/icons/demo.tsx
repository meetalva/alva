import { Icon, IconSize, getIcon } from './index';
import * as React from 'react';
import { Color } from '../colors';

const IconDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<>
		<Icon size={IconSize.XS} color={Color.Green} icon="FlexAlignCenter" />
		{getIcon({ icon: 'Box' })}
		{getIcon({ icon: 'Hello' })}
	</>
);

export default IconDemo;
