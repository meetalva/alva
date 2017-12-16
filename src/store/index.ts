import { PatternFolder } from './pattern/folder';
import { JsonArray, JsonObject, Persister } from './json';
import * as MobX from 'mobx';
import { IObservableArray } from 'mobx/lib/types/observablearray';
import { Page } from './page';
import { PageElement } from './page/page_element';
import { PageRef } from './project/page_ref';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { Project } from './project';

export class Store {
	@MobX.observable private clipboardElement?: PageElement | undefined;
	@MobX.observable private rearrangeElement?: PageElement | undefined;
	@MobX.observable private currentPage?: Page;
	@MobX.observable private patternSearchTerm: string = '';
	@MobX.observable private projects: Project[] = [];
	@MobX.observable private patternRoot: PatternFolder;
	@MobX.observable private selectedElement?: PageElement | undefined;
	@MobX.observable private elementHasFocus?: boolean = false;
	@MobX.observable private styleGuidePath: string;

	public addProject(project: Project): void {
		this.projects.push(project);
	}

	public closePage(): void {
		this.currentPage = undefined;
	}

	public getClipboardElement(): PageElement | undefined {
		return this.clipboardElement;
	}

	public getRearrangeElement(): PageElement | undefined {
		return this.rearrangeElement;
	}

	public getCurrentPage(): Page | undefined {
		return this.currentPage;
	}

	public getCurrentPageRef(): PageRef | undefined {
		if (!this.currentPage) {
			return undefined;
		}

		const currentPageId: string = this.currentPage.getId();
		for (const project of this.projects) {
			for (const pageRef of project.getPages()) {
				if (pageRef.getId() === currentPageId) {
					return pageRef;
				}
			}
		}

		return undefined;
	}

	public getCurrentProject(): Project | undefined {
		const pageRef: PageRef | undefined = this.getCurrentPageRef();
		return pageRef ? pageRef.getProject() : undefined;
	}

	public getPagesPath(): string {
		return PathUtils.join(this.styleGuidePath, 'alva');
	}

	public getPattern(path: string): Pattern | undefined {
		return this.patternRoot.getPattern(path);
	}

	public getPatternsPath(): string {
		return PathUtils.join(this.styleGuidePath, 'lib', 'patterns');
	}

	public getPatternRoot(): PatternFolder | undefined {
		return this.patternRoot;
	}

	public getPatternSearchTerm(): string {
		return this.patternSearchTerm;
	}

	public getProjects(): Project[] {
		return this.projects;
	}

	public getSelectedElement(): PageElement | undefined {
		return this.selectedElement;
	}

	public getElementFocus(): boolean | undefined {
		return this.elementHasFocus;
	}

	public getStyleGuidePath(): string {
		return this.styleGuidePath;
	}

	public openStyleguide(styleGuidePath: string): void {
		MobX.transaction(() => {
			if (!PathUtils.isAbsolute(styleGuidePath)) {
				// Currently, store is two levels below alva, so go two up
				styleGuidePath = PathUtils.join(styleGuidePath);
			}
			this.styleGuidePath = styleGuidePath;
			this.currentPage = undefined;
			this.patternRoot = new PatternFolder(this, '');
			this.patternRoot.addTextPattern();

			(this.projects as IObservableArray<Project>).clear();
			const projectsPath = PathUtils.join(this.getPagesPath(), 'projects.yaml');
			const projectsJsonObject: JsonObject = Persister.loadYamlOrJson(projectsPath);
			(projectsJsonObject.projects as JsonArray).forEach((projectJson: JsonObject) => {
				const project: Project = Project.fromJsonObject(projectJson, this);
				this.addProject(project);
			});
		});
	}

	public openFirstPage(): void {
		if (!this.projects.length) {
			return;
		}

		const pages: PageRef[] = this.projects[0].getPages();
		if (!pages.length) {
			return;
		}

		this.openPage(pages[0].getId());
	}

	public openPage(id: string): void {
		MobX.transaction(() => {
			const pagePath: string = PathUtils.join(this.getPagesPath(), `page-${id}.yaml`);
			const json: JsonObject = Persister.loadYamlOrJson(pagePath);
			this.currentPage = Page.fromJsonObject(json, id, this);

			this.selectedElement = undefined;
		});
	}

	public removeProject(project: Project): void {
		(this.projects as IObservableArray<Project>).remove(project);
	}

	public save(): void {
		if (this.currentPage) {
			const pagePath: string = PathUtils.join(
				this.getPagesPath(),
				`page-${this.currentPage.getId()}.yaml`
			);
			Persister.saveYaml(pagePath, this.currentPage.toJsonObject());
		}

		const projectsJsonObject: JsonObject = { projects: [] };
		this.projects.forEach(project => {
			(projectsJsonObject.projects as JsonArray).push(project.toJsonObject());
		});
		const projectsPath = PathUtils.join(this.getPagesPath(), 'projects.yaml');
		Persister.saveYaml(projectsPath, projectsJsonObject);
	}

	public searchPatterns(term: string): Pattern[] {
		return this.patternRoot ? this.patternRoot.searchPatterns(term) : [];
	}

	public setPageFromJsonInternal(json: JsonObject, id: string): void {
		MobX.transaction(() => {
			this.currentPage = json ? Page.fromJsonObject(json, id, this) : undefined;
			this.selectedElement = undefined;
		});
	}

	public setPatternSearchTerm(patternSearchTerm: string): void {
		this.patternSearchTerm = patternSearchTerm;
	}

	public setClipboardElement(clipboardElement: PageElement): void {
		this.clipboardElement = clipboardElement;
	}

	public setRearrangeElement(rearrangeElement: PageElement): void {
		this.rearrangeElement = rearrangeElement;
	}

	public setSelectedElement(selectedElement: PageElement | undefined): void {
		this.selectedElement = selectedElement;
	}

	public setElementFocus(state: boolean): void {
		this.elementHasFocus = state;
	}
}
