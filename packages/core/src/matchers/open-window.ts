import * as M from '@meetalva/message';
import * as T from '@meetalva/types';
import { MatcherCreator } from './context';

export const openWindow: MatcherCreator<M.OpenWindow> = ({ host, location }) => {
	return async message => {
		switch (message.payload.view) {
			case T.AlvaView.PageDetail:
				await host.createWindow({
					address: `${location.origin}/project/${message.payload.projectId}`,
					variant: T.HostWindowVariant.Normal
				});
				return;
			case T.AlvaView.SplashScreen:
				await host.createWindow({
					address: location.origin,
					variant: T.HostWindowVariant.Splashscreen
				});
				return;
		}
	};
};
