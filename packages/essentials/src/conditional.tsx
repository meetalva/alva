import * as React from 'react';

export interface ConditionalProps {
	/**
	 * @name Condition
	 * @description Show the "True" slot, disable to show the "False" slot
	 */
	condition?: boolean;

	/**
	 * @name If True
	 *
	 * @default
	 * ~~~tsx
	 * import * as React from 'react';
	 * import { Box, AlignItems, JustifyContent, Text } from '@meetalva/essentials';
	 *
	 * export default () => (
	 *   <Box
	 *     flex={true}
	 *     justifyContent={JustifyContent.center}
	 *     alignItems={AlignItems.center}
	 *     height="100px"
	 *     backgroundColor="#eee">
	 *     <Text text="Shown if condition is true"/>
	 *   </Box>
	 * );
	 * ~~~
	 **/
	truthy?: React.ReactNode;

	/**
	 * @name If False
	 *
	 * @default
	 * ```tsx
	 * import * as React from 'react';
	 * import { Box, AlignItems, JustifyContent, Text } from '@meetalva/essentials';
	 *
	 * export default () => (
	 *  <Box
	 *    flex={true}
	 *    justifyContent={JustifyContent.center}
	 *    alignItems={AlignItems.center}
	 *    height="100px"
	 *    backgroundColor="#eee">
	 *    <Text text="Shown if condition is false"/>
	 *   </Box>
	 * );
	 * ```
	 **/
	falsy?: React.ReactNode;
}

/**
 * @name Conditional
 * @description for Show and Hide Logic
 * @icon ToggleRight
 * @patternType synthetic:conditional
 */
export const Conditional: React.SFC<ConditionalProps> = props => {
	return <>{props.condition ? props.truthy : props.falsy}</>;
};
