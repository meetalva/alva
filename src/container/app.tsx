import { AppView } from './app-view';
import { ChromeContainer } from './chrome/chrome-container';
import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewDetails } from './view-details';
import { ViewSplashscreen } from './view-splashscreen';
import * as Types from '../types';

@MobxReact.inject('store')
@MobxReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		return (
			<Components.Layout
				direction={Components.LayoutDirection.Column}
				height={Components.LayoutHeight.Full}
			>
				<Components.GlobalStyle />
				<ChromeContainer />
				<Components.MaiArea>
					<AppView view={Types.AlvaView.SplashScreen}>
						<ViewSplashscreen />
					</AppView>
					<AppView view={Types.AlvaView.PageDetail}>
						<ViewDetails />
					</AppView>
				</Components.MaiArea>
				<Components.IconRegistry />
			</Components.Layout>
		);
	}
}
