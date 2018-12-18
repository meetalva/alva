import * as React from 'react';

export const BasicComponent: React.SFC = props => {
	return <div>{props.children}</div>;
};

export const OtherProperty: React.SFC<{ other: React.ReactNode }> = props => {
	return <div>{props.other}</div>;
};

export function FunctionDeclarationComponent(p: { children: React.ReactNode }) {
	return <div>{p.children}</div>;
}

export class BasicClassComponent extends React.Component {
	public render() {
		return <div>{this.props.children}</div>;
	}
}

export const DestructuringSFC: React.SFC = ({ children }) => {
	return <div>{children}</div>;
};

export const AliasingSFC: React.SFC = props => {
	const p = props;
	const c = p.children;
	return <div>{c}</div>;
};
