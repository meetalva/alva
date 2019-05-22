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
	 * import * as E from '@meetalva/essentials';
	 *
	 * export default () => (
	 *   <E.Box
	 *     flex={true}
	 *     justifyContent={E.JustifyContent.center}
	 *     alignItems={E.AlignItems.center}
	 *     height="100px"
	 *     backgroundColor="#eee">
	 *     <E.Text text="Shown if condition is true"/>
	 *   </E.Box>
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
	 * import * as E from '@meetalva/essentials';
	 *
	 * export default () => (
	 *  <E.Box
	 *    flex={true}
	 *    justifyContent={E.JustifyContent.center}
	 *    alignItems={E.AlignItems.center}
	 *    height="100px"
	 *    backgroundColor="#eee">
	 *    <E.Text text="Shown if condition is false"/>
	 *   </E.Box>
	 * );
	 * ```
	 **/
	falsy?: React.ReactNode;
}

/**
 * @name Conditional
 * @description for show & hide logic
 * @icon ToggleRight
 * @patternType synthetic:conditional
 */
export const Conditional: React.SFC<ConditionalProps> = props => {
	return <>{props.condition ? props.truthy : props.falsy}</>;
};
