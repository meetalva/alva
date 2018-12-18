import * as React from 'react';

export const BasicComponent: React.SFC = props => {
	return <div>{props.children}</div>;
};

export const OtherProperty: React.SFC<{ other: React.ReactNode }> = props => {
	return <div>{props.other}</div>;
};
