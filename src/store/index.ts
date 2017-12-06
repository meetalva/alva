import { PatternFolder } from './pattern/folder';
import * as FileUtils from 'fs';
import { observable } from 'mobx';
import { Page } from './page';
import { PageRef } from './page/page_ref';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { Project } from './project';

export class Store {
	@observable private currentPage?: Page;
	private projects: Project[] = [];
	private patternRoot: PatternFolder;
	@observable private styleGuidePath: string;

	public getCurrentPage(): Page | undefined {
		return this.currentPage;
	}

	public getPattern(path: string): Pattern | undefined {
		return this.patternRoot.getPattern(path);
	}

	public getPatternsPath(): string {
		return PathUtils.join(this.styleGuidePath, 'lib');
	}

	public getPatternRoot(): PatternFolder | undefined {
		return this.patternRoot;
	}

	public getProjects(): Project[] {
		return this.projects;
	}

	public getProjectsPath(): string {
		return PathUtils.join(this.styleGuidePath, 'stacked', 'projects');
	}

	public getStyleGuidePath(): string {
		return this.styleGuidePath;
	}

	public openStyleguide(styleGuidePath: string): void {
		if (!PathUtils.isAbsolute(styleGuidePath)) {
			// Currently, store is two levels below stacked, so go two up
			styleGuidePath = PathUtils.join(__dirname, '..', '..', styleGuidePath);
		}
		this.styleGuidePath = styleGuidePath;
		this.currentPage = undefined;
		this.projects = [];
		this.patternRoot = new PatternFolder(this, 'patterns');

		const projects: Project[] = [];

		const projectsPath = this.getProjectsPath();
		FileUtils.readdirSync(projectsPath)
			.map((name: string) => ({ name, path: PathUtils.join(projectsPath, name) }))
			.filter(child => FileUtils.lstatSync(child.path).isDirectory())
			.forEach(folder => {
				const pages: PageRef[] = [];
				FileUtils.readdirSync(folder.path)
					.filter(child => child.match(/\.json$/))
					.forEach(file => {
						const pageId: string = file.replace(/\.json$/, '');
						const pageName: string = file.replace(/\.json$/, '');
						pages.push(new PageRef(pageId, pageName));
					});

				projects.push(new Project(folder.name, folder.name, pages));
			});
		this.projects = projects;
	}

	public openPage(projectId: string, pageId: string): void {
		this.currentPage = new Page(this, projectId, pageId);
	}
}
