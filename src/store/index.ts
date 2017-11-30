import * as fs from 'fs';
import { observable } from 'mobx';
import { Page } from './page';
import * as path from 'path';
import { PatternFolder } from './pattern/pattern_folder';
import { Project } from './project';

export class Store {
	@observable public currentPage?: Page;
	public projects: Project[];
	public patterns: PatternFolder;
	@observable public styleGuidePath: string;

	public getProjectsPath(): string {
		return path.join(this.styleGuidePath, 'stacked', 'projects');
	}

	public openStyleguide(styleGuidePath: string): void {
		if (!path.isAbsolute(styleGuidePath)) {
			// Currently, store is two levels below stacked, so go two up
			styleGuidePath = path.join(__dirname, '..', '..', styleGuidePath);
		}
		this.styleGuidePath = styleGuidePath;

		this.currentPage = undefined;
		this.projects = [];
		this.patterns = new PatternFolder(this, 'patterns');

		const projectsPath = this.getProjectsPath();
		this.projects = fs.readdirSync(projectsPath)
			.map((name: string) => ({ name, path: path.join(projectsPath, name) }))
			.filter(child => fs.lstatSync(child.path).isDirectory())
			.map(folder => ({
				id: folder.name,
				name: folder.name,
				pages: fs.readdirSync(folder.path)
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
