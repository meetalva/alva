import fs from 'fs';
import path from 'path';
import Page from './page';
import Project from './project';
import PatternFolder from './pattern/pattern_folder';

export default class Store {
	currentPage: Page;
	projects: Project[];
	patterns: PatternFolder;
	styleGuidePath: string;

	getProjectsPath(): string {
		return path.join(this.styleGuidePath, 'stacked', 'projects');
	}

	openStyleguide(styleGuidePath: string): void {
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
			.map((name: string) => ({ name: name, path: path.join(projectsPath, name) }))
			.filter(child => fs.lstatSync(child.path).isDirectory())
			.map(folder => ({
				id: folder.name,
				name: folder.name,
				pages: fs.readdirSync(folder.path)
					.filter(child => child.match(/\.json$/))
					.map(folder => ({
						id: folder.replace(/\.json$/, ''),
						name: folder.replace(/\.json$/, '')
					}))
			}));
	}

	openPage(projectId: string, pageId: string): void {
		this.currentPage = new Page(this, projectId, pageId);
		this.currentPage.load();
	}
}
