import { AppView } from './app-view';
import { ChromeContainer } from './chrome/chrome-container';
import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewDetails } from './view-details';
import { ViewStore } from '../store';
import { ViewSplashscreen } from './view-splashscreen';
import * as Types from '../types';

Components.globalStyles();

interface InjectedAppProps {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedAppProps;
		const app = props.store.getApp();

		if (app.getState() !== Types.AppState.Started) {
			return null;
		}

		return (
			<Components.Layout direction={Components.LayoutDirection.Column}>
				<Components.FixedArea top={0} right={0} left={0} z={10}>
					<ChromeContainer />
				</Components.FixedArea>
				<Components.MainArea>
					<AppView view={Types.AlvaView.SplashScreen}>
						<ViewSplashscreen />
					</AppView>
					<AppView view={Types.AlvaView.PageDetail}>
						<ViewDetails />
					</AppView>
				</Components.MainArea>
				<Components.IconRegistry />
			</Components.Layout>
		);
	}
}
