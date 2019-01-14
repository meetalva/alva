import * as uuid from 'uuid';
import { ProjectUpdatePayload } from '../../message';
import { revert } from './revert';

export class EditHistoryCommit {
	public readonly id: string;
	public readonly changes: ProjectUpdatePayload[];
	public readonly reverted: boolean;

	public constructor(init: { id: string; changes: ProjectUpdatePayload[]; reverted: boolean }) {
		this.id = init.id;
		this.changes = init.changes;
		this.reverted = init.reverted;
	}

	public revert(): EditHistoryCommit {
		return new EditHistoryCommit({
			id: uuid.v4(),
			changes: this.changes.map(revert).reverse(),
			reverted: !this.reverted
		});
	}

	public amend(b: EditHistoryCommit): EditHistoryCommit {
		return new EditHistoryCommit({
			id: uuid.v4(),
			changes: [...b.changes, ...this.changes],
			reverted: !this.reverted
		});
	}
}
