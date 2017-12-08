import * as React from 'react'
import { observer } from 'mobx-react';
import ChromeComponent from '../../lsg/patterns/chrome';


export interface ChromeProps {
	title: string;
}

@observer
export class Chrome extends React.Component<ChromeProps> {
	public render(): JSX.Element {
		return <ChromeComponent title={this.props.title} />;
	}
}
