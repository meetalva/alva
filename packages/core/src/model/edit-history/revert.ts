import { ProjectUpdatePayload, MobxChange } from '../../message';

export function revert(update: ProjectUpdatePayload): ProjectUpdatePayload {
	return {
		path: update.path,
		projectId: update.projectId,
		change: revertChange(update.change)
	};
}

export function revertChange(change: MobxChange): MobxChange {
	switch (change.type) {
		case 'add':
			return {
				type: 'remove',
				name: change.name,
				object: change.object,
				oldValue: change.newValue
			};
		case 'remove':
			return {
				type: 'add',
				name: change.name,
				object: change.object,
				oldValue: undefined,
				newValue: change.oldValue
			};
		case 'update':
			return {
				type: 'update',
				name: (change as any).name, // object update
				index: (change as any).index, // array update
				object: change.object,
				oldValue: change.newValue,
				newValue: change.oldValue
			};
		case 'splice':
			return {
				type: 'splice',
				object: change.object,
				index: change.index,
				added: change.removed,
				addedCount: change.removedCount,
				removed: change.added,
				removedCount: change.addedCount
			};
		case 'delete':
			return {
				type: 'add',
				name: change.name,
				object: change.object,
				newValue: change.oldValue
			};
	}
}
