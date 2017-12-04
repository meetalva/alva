import { PatternFolder } from './pattern/folder';
import * as FileUtils from 'fs';
import { observable } from 'mobx';
import { Page } from './page';
import * as PathUtils from 'path';
import { Project } from './project';

export class Store {
	@observable public currentPage?: Page;
	public projects: Project[];
	public patterns: PatternFolder;
	@observable public styleGuidePath: string;

	public getProjectsPath(): string {
		return PathUtils.join(this.styleGuidePath, 'stacked', 'projects');
	}

	public openStyleguide(styleGuidePath: string): void {
		if (!PathUtils.isAbsolute(styleGuidePath)) {
			// Currently, store is two levels below stacked, so go two up
			styleGuidePath = PathUtils.join(__dirname, '..', '..', styleGuidePath);
		}
		this.styleGuidePath = styleGuidePath;
		this.currentPage = undefined;
		this.projects = [];
		this.patterns = new PatternFolder(this, 'patterns');

		const projectsPath = this.getProjectsPath();
		this.projects = FileUtils.readdirSync(projectsPath)
			.map((name: string) => ({ name, path: PathUtils.join(projectsPath, name) }))
			.filter(child => FileUtils.lstatSync(child.path).isDirectory())
			.map(folder => ({
				id: folder.name,
				name: folder.name,
				pages: FileUtils.readdirSync(folder.path)
					.filter(child => child.match(/\.json$/))
					.map(file => ({
						id: file.replace(/\.json$/, ''),
						name: file.replace(/\.json$/, '')
					}))
			}));
	}

	public openPage(projectId: string, pageId: string): void {
		this.currentPage = new Page(this, projectId, pageId);
	}
}
