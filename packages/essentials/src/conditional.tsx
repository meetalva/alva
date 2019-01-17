import * as React from 'react';

export interface ConditionalProps {
	/**
	 * @name Condition
	 * @description Show the "True" slot, disable to show the "False" slot
	 */
	condition?: boolean;

	/** @name If True */
	truthy?: React.ReactNode;

	/** @name If False */
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
