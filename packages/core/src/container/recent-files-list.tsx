import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as C from '../components';
import { MessageType as MT } from '../message';
import { Archive, Edit } from 'react-feather';
import { ViewStore } from '../store';
import { partition } from 'lodash';
import * as Types from '../types';
import * as uuid from 'uuid';

const timeago = require('timeago.js');

interface RecentFileItemProps {
	project: Types.ProjectRecord;
	sender: Types.Sender;
}

const RecentFileItem: React.SFC<RecentFileItemProps> = props => {
	const { project } = props;
	const ago = project.editDate ? timeago.format(project.editDate) : null;

	return (
		<a
			title={`Open "${project.name}"`}
			href={`/project/${project.id}`}
			target="_blank"
			style={{ textDecoration: 'none' }}
			onClick={() => {
				props.sender.send({
					id: uuid.v4(),
					type: MT.OpenFileRequest,
					payload: {
						path: project.path,
						replace: false
					}
				});
			}}
		>
			<C.Item
				icon={<Archive style={{ color: C.Color.Grey20 }} />}
				title={
					<C.Copy textColor={C.Color.Grey20} size={C.CopySize.M}>
						{project.name}
					</C.Copy>
				}
				details={
					<C.Copy textColor={C.Color.Grey60} size={C.CopySize.S} cut>
						{[ago, project.displayPath].join(' – ')}
					</C.Copy>
				}
			/>
		</a>
	);
};

const RecentDraftItem: React.SFC<RecentFileItemProps> = props => {
	const { project } = props;
	const ago = project.editDate ? timeago.format(project.editDate) : 'just now';

	return (
		<a
			title="Open Draft"
			href={`/project/${project.id}`}
			target="_blank"
			style={{ textDecoration: 'none' }}
			onClick={() => {
				props.sender.send({
					id: uuid.v4(),
					type: MT.OpenFileRequest,
					payload: {
						path: project.path,
						replace: false
					}
				});
			}}
		>
			<C.Item
				key={project.id}
				icon={<Edit style={{ color: C.Color.Grey60 }} />}
				title={
					<C.Copy textColor={C.Color.Grey60} size={C.CopySize.M}>
						{project.name}
					</C.Copy>
				}
				details={
					<C.Copy textColor={C.Color.Grey60} size={C.CopySize.S} cut>
						{ago}
					</C.Copy>
				}
			/>
		</a>
	);
};

@MobxReact.inject('store')
@MobxReact.observer
export class RecentFilesList extends React.Component {
	public render() {
		const { store } = this.props as { store: ViewStore };
		const [drafts, projects] = partition(store.getProjects().filter(p => p.valid), 'draft');

		return (
			<div>
				{projects.map(project => (
					<RecentFileItem key={project.id} project={project} sender={store.getSender()} />
				))}
				{drafts.map(project => (
					<RecentDraftItem key={project.id} project={project} sender={store.getSender()} />
				))}
			</div>
		);
	}
}
