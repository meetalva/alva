import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as C from '../components';
import { Package } from 'react-feather';

@MobxReact.observer
@MobxReact.inject('store')
export class RecentFilesList extends React.Component {
	public render() {
		return (
			<div>
				<C.Item
					icon={<Package style={{ color: C.Color.Grey20 }} />}
					title={<C.Copy size={C.CopySize.M}>Some Project</C.Copy>}
					details={
						<C.Copy textColor={C.Color.Grey60} size={C.CopySize.S} cut>
							~/Documents/alva/alva/packages/core/alva/alva/packages/core
						</C.Copy>
					}
				/>
				<C.Item
					icon={<Package style={{ color: C.Color.Grey20 }} />}
					title={<C.Copy size={C.CopySize.M}>New Project</C.Copy>}
					details={
						<C.Copy textColor={C.Color.Grey60} size={C.CopySize.S} cut>
							~/Documents/alva/alva/packages/core/alva/alva/packages/core
						</C.Copy>
					}
				/>
				<C.Item
					icon={<Package style={{ color: C.Color.Grey20 }} />}
					title={<C.Copy size={C.CopySize.M}>Designkit</C.Copy>}
					details={
						<C.Copy textColor={C.Color.Grey60} size={C.CopySize.S} cut>
							~/Documents/alva/alva/packages/core/alva/alva/packages/core
						</C.Copy>
					}
				/>
				<C.Item
					icon={<Package style={{ color: C.Color.Grey20 }} />}
					title={<C.Copy size={C.CopySize.M}>Website</C.Copy>}
					details={
						<C.Copy textColor={C.Color.Grey60} size={C.CopySize.S} cut>
							~/Documents/alva/alva/packages/core/alva/alva/packages/core
						</C.Copy>
					}
				/>
			</div>
		);
	}
}
