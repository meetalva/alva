import * as uuid from 'uuid';
import { ProjectUpdatePayload } from '../../message';
import { EditHistoryCommit } from './edit-history-commit';
import { revert } from './revert';

export class EditHistoryStage {
	public readonly id = uuid.v4();
	public changes: ProjectUpdatePayload[] = [];

	public constructor(changes?: ProjectUpdatePayload[]) {
		if (changes) {
			this.changes = changes;
		}
	}

	public get length() {
		return this.changes.length;
	}

	public add(change: ProjectUpdatePayload): void {
		this.changes.push(change);
	}

	public toCommit(): EditHistoryCommit {
		return new EditHistoryCommit({
			id: this.id,
			changes: this.changes,
			reverted: false
		});
	}

	public revert(): EditHistoryStage {
		return new EditHistoryStage(this.changes.map(revert));
	}
}
