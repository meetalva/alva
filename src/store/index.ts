import { PatternFolder } from './pattern/folder';
import * as FileUtils from 'fs';
import * as MobX from 'mobx';
import { Page } from './page';
import { PageElement } from './page/page_element';
import { PageRef } from './page/page_ref';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { Project } from './project';

export class Store {
	@MobX.observable private currentPage?: Page;
	@MobX.observable private projects: Map<string, Project> = new Map();
	private patternRoot: PatternFolder;
	@MobX.observable private selectedElement?: PageElement;
	@MobX.observable private styleGuidePath: string;

	public getCurrentPage(): Page | undefined {
		return this.currentPage;
	}

	public getCurrentProject(): Project | undefined {
		return this.currentPage ? this.getProjectById(this.currentPage.getProjectId()) : undefined;
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

	public getProjectById(id: string): Project | undefined {
		return this.projects.get(id);
	}

	public getProjects(): Project[] {
		return Array.from(this.projects.values());
	}

	public getProjectsPath(): string {
		return PathUtils.join(this.styleGuidePath, 'stacked', 'projects');
	}

	public getSelectedElement(): PageElement | undefined {
		return this.selectedElement;
	}

	public getStyleGuidePath(): string {
		return this.styleGuidePath;
	}

	public openStyleguide(styleGuidePath: string): void {
		MobX.transaction(() => {
			if (!PathUtils.isAbsolute(styleGuidePath)) {
				// Currently, store is two levels below stacked, so go two up
				styleGuidePath = PathUtils.join(__dirname, '..', '..', styleGuidePath);
			}
			this.styleGuidePath = styleGuidePath;
			this.currentPage = undefined;
			this.projects.clear();
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

			projects.forEach(project => {
				this.projects.set(project.getId(), project);
			});
		});
	}

	public openPage(projectId: string, pageId: string): void {
		MobX.transaction(() => {
			this.currentPage = new Page(this, projectId, pageId);
			this.selectedElement = undefined;
		});
	}

	public setSelectedElement(selectedElement: PageElement): void {
		this.selectedElement = selectedElement;
	}
}
