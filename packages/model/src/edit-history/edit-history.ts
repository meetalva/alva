import { ProjectUpdatePayload } from '@meetalva/message';
import { EditHistoryCommit } from './edit-history-commit';
import { EditHistoryStage } from './edit-history-stage';

export class EditHistory {
	private commits: EditHistoryCommit[] = [];
	private reverts: EditHistoryCommit[] = [];

	private stage = new EditHistoryStage();

	public get length(): number {
		return this.commits.length;
	}

	public record(record: ProjectUpdatePayload): void {
		this.stage.add(record);
	}

	public commit(): void {
		if (this.stage.length === 0) {
			return;
		}

		this.reverts = [];
		this.commits.unshift(this.stage.toCommit());
		this.clearStage();
	}

	public peek(offset: number = 0): EditHistoryCommit | undefined {
		return this.commits[offset];
	}

	public undo(): EditHistoryCommit | undefined {
		const commit = this.commits.shift();

		if (!commit) {
			return;
		}

		const revert = commit.revert();
		this.reverts.unshift(revert);
		return revert;
	}

	public redo(): EditHistoryCommit | undefined {
		const revert = this.reverts.shift();

		if (!revert) {
			return;
		}

		const commit = revert.revert();
		this.commits.unshift(commit);
		return commit;
	}

	public clearStage(): void {
		this.stage = new EditHistoryStage();
	}
}
