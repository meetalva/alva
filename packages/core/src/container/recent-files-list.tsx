import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as C from '@meetalva/components';
import { MessageType as MT } from '@meetalva/message';
import { File, FileText } from 'react-feather';
import { ViewStore } from '../store';
import { partition } from 'lodash';
import * as Types from '@meetalva/types';
import * as uuid from 'uuid';
import { Message } from '@meetalva/message';

const timeago = require('timeago.js');

interface RecentFileItemProps {
	project: Types.ProjectRecord;
	sender: Types.Sender<Message>;
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
				icon={<FileText color={C.Color.Grey20} strokeWidth={1.5} size={18} />}
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
				icon={<File color={C.Color.Grey60} strokeWidth={1.5} size={18} />}
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
			<>
				{drafts.length === 0 && projects.length === 0 ? (
					<C.EmptyState
						headline="Welcome!"
						copy="Create a new Alva project or start with our guides"
					/>
				) : (
					<C.Space size={C.SpaceSize.XL} sizeBottom={C.SpaceSize.XS}>
						<C.Copy size={C.CopySize.S} textColor={C.Color.Grey36}>
							Recent Files
						</C.Copy>
					</C.Space>
				)}
				{projects.map(project => (
					<RecentFileItem key={project.id} project={project} sender={store.getSender()} />
				))}
				{drafts.map(project => (
					<RecentDraftItem key={project.id} project={project} sender={store.getSender()} />
				))}
			</>
		);
	}
}
