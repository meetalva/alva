import * as React from 'react';

// tslint:disable-next-line:no-any
export const SyntheticConditional: React.SFC<any> = props => (
	<>
		<>{props.condition === true ? props.ifTrue : null}</>
		<>{props.condition === false ? props.ifFalse : null}</>
	</>
);
