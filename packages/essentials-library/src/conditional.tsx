import * as React from 'react';

export interface ConditionalProps {
	/**
	 * @name Condition
	 * @description Show the "True" slot, disable to show the "False" slot
	 */
	condition?: boolean;

	/** @name If True */
	true?: React.ReactNode;

	/** @name If False */
	false?: React.ReactNode;
}

export const Conditional: React.SFC<ConditionalProps> = props => {
	return <>{props.condition ? props.true : props.false}</>;
};
