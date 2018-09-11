import * as M from '../../message';
import * as Model from '../../model';
import * as Types from '../../types';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';

export function startApp({ store, app }: MessageHandlerContext): MessageHandler<M.StartAppMessage> {
	return m => {
		store.setServerPort(Number(m.payload.port));

		try {
			if (m.payload.app) {
				app.update(Model.AlvaApp.from(m.payload.app));
			}
		} catch (err) {
			console.error(err);
			app.setState(Types.AppState.Started);
		} finally {
			console.log(`App started on port ${store.getServerPort()}.`);
			app.setState(Types.AppState.Started);
		}
	};
}
