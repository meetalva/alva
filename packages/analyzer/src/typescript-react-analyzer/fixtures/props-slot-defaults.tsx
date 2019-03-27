import * as React from 'react';

export interface PropsWithSlots {
	/**
	 * @default
	 * ```tsx
	 * import * as React from 'react';
	 * import { Text } from '@meetalva/essentials';
	 * export default () => <Text text="Hello, World"/>
	 * ```
	 **/
	backtickBlock: string;
	/**
	 * @default
	 * ~~~tsx
	 * import * as React from 'react';
	 * import { Text } from '@meetalva/essentials';
	 * export default () => <Text text="Hello, World"/>
	 * ~~~
	 **/
	tildeBlock: string;
}

export const ReactElement: React.SFC<PropsWithSlots> = () => null;
