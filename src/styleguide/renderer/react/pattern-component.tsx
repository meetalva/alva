import * as React from 'react';

export interface PatternComponentProps {
	patternFactory: React.StatelessComponent | ObjectConstructor;
	// tslint:disable-next-line:no-any
	patternProps: any;
}

export const PatternComponent: React.StatelessComponent<PatternComponentProps> = props =>
	React.createElement(props.patternFactory, props.patternProps);
