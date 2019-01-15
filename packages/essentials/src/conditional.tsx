import * as React from 'react';

export interface ConditionalProps {
	/**
	 * @name Condition
	 * @description Show the "True" slot, disable to show the "False" slot
	 */
	condition?: boolean;

	/** @name If True */
	ifTrue?: React.ReactNode;

	/** @name If False */
	ifFalse?: React.ReactNode;
}

/**
 * @name Conditional
 * @description for Show and Hide Logic
 * @icon ToggleRight
 * @patternType synthetic:conditional
 */
export const Conditional: React.SFC<ConditionalProps> = props => {
	return <>{props.condition ? props.ifTrue : props.ifFalse}</>;
};
