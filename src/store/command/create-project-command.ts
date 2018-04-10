import { Command } from './command';
import { PageRef } from '../page/page-ref';
import { Project } from '../project';
import { Store } from '../store';

export interface CreateProjectProps {
	previewFrame: string;
}

/**
 * A user operation that creates a Project with one empty page
 */
export class CreateProjectCommand extends Command {
	/**
	 *  Creates a new Project and add the Project in Store.
	 *  It also creates a new empty and unnamed Page. It also saves the page in the store.
	 */
	/**
	 * @inheritDoc
	 */
	public execute(): boolean {
		const projectProps = { previewFrame: '' };
		const project: Project = new Project(projectProps);
		const store = Store.getInstance();
		store.addProject(project);
		// tslint:disable-next-line:no-unused-expression
		new PageRef({ project });
		store.save();

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public getType(): string {
		return 'create-project';
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		return true;
	}
}
