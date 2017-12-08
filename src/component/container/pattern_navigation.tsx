import Layout from '../../lsg/patterns/layout';
import * as React from 'react';
import { Store } from '../../store';
import TabNavigation, {TabNavigationItem} from '../../lsg/patterns/tab-navigation';

export interface PatternNavigationProps {
	store: Store;
}

export class PatternNavigation extends React.Component<PatternNavigationProps> {

	public constructor(props: PatternNavigationProps) {
		super(props);

		this.handleLinkClick = this.handleLinkClick.bind(this);
	}

	public render(): JSX.Element | null {
		return (
			<Layout>
				<TabNavigation>
					<TabNavigationItem active={true} onClick={this.handleLinkClick} tabText="Patterns" />
					<TabNavigationItem active={false} onClick={this.handleLinkClick} tabText="Properties" />
				</TabNavigation>
			</Layout>
		);
	}

	protected handleLinkClick(): void {
		console.log('click');
	}
}
