import * as React from 'react';

export interface PropsWithSlots {
	/** Some basic comment */
	plainComment: string;
	/**
	 * @default
	 * ```
	 * import { Text } from '@meetalva/essentials';
	 * ```
	 */
	atSign: React.ReactNode;
	/**
	 * @default
	 * ~~~
	 * import { Text } from '@meetalva/essentials';
	 * ~~~
	 */
	atSignTilde: React.ReactNode;
}

export const ReactElement: React.SFC<PropsWithSlots> = () => null;
