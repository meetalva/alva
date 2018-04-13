import { Command } from './command/command';
import * as FileUtils from 'fs';
import * as FileExtraUtils from 'fs-extra';
import { JsonArray, JsonObject, Persister } from './json';
import * as Lodash from 'lodash';
import * as MobX from 'mobx';
import { IObservableArray } from 'mobx/lib/types/observablearray';
import * as OsUtils from 'os';
import { Page } from './page/page';
import { PageElement } from './page/page-element';
import { PageRef } from './page/page-ref';
import * as PathUtils from 'path';
import { Preferences } from './preferences';
import { Project } from './project';
import { Styleguide } from './styleguide/styleguide';

/**
 * The central entry-point for all application state, managed by MobX.
 * Use this object and its properties in your React components,
 * and call the respective business methods to perform operations.
 */
export class Store {
	/**
	 * The store singleton instance.
	 */
	private static INSTANCE: Store;

	/**
	 * The name of the analyzer that should be used for the open styleguide.
	 */
	@MobX.observable private analyzerName: string;

	/**
	 * The element currently in the clipboard, or undefined if there is none.
	 * Note: The element is cloned lazily, so it may represent a still active element.
	 * When adding the clipboard element to paste it, clone it first.
	 */
	@MobX.observable private clipboardElement?: PageElement;

	/**
	 * The page that is currently being displayed in the preview, and edited in the elements
	 * and properties panes. May be undefined if there is none.
	 */
	@MobX.observable private currentPage?: Page;

	/**
	 * The project that is currently being selected to add, edit, or remove pages of. May be
	 * undefined if none is selected is none. Opening a page automatically changes the selected
	 * project.
	 */
	@MobX.observable private currentProject?: Project;

	/**
	 * The element that is currently being dragged, or undefined if there is none.
	 */
	@MobX.observable private draggedElement?: PageElement;

	/**
	 * Whether the currently selected element also has focus.
	 * In this case, keyboard operations such as copy, cut, or delete
	 * should operate on that element.
	 * @see selectedElement
	 */
	@MobX.observable private elementFocussed?: boolean = false;

	/**
	 * The current search term in the patterns list, or an empty string if there is none.
	 */
	@MobX.observable private patternSearchTerm: string = '';

	/**
	 * The internal data storage for preferences, i.e. personal settings
	 * saved in the user's home directory (.alva-prefs.yaml).
	 */
	@MobX.observable private preferences: Preferences;

	/**
	 * All projects (references) of this styleguide. Projects point to page references,
	 * and both do not contain the actual page data (element), but only their IDs.
	 */
	@MobX.observable private projects: Project[] = [];

	/**
	 * The most recent undone user commands (user operations) to provide a redo feature.
	 * Note that operations that close or open a page clear this buffer.
	 * The last command in the list is the most recent undone.
	 */
	@MobX.observable private redoBuffer: Command[] = [];

	/**
	 * The path of the built pattern implementation's root folder, e.g. 'lib/patterns',
	 * relative to the styleguide root, always using forward slashes.
	 */
	@MobX.observable private relativePatternsPath: string;

	/**
	 * The currently selected element in the element list.
	 * The properties pane shows the properties of this element,
	 * and keyboard commands like cut, copy, or delete operate on this element.
	 * May be empty if no element is selected.
	 * @see isElementFocussed
	 */
	@MobX.observable private selectedElement?: PageElement;

	/**
	 * The currently opened styleguide or undefined, if no styleguide is open.
	 */
	@MobX.observable private styleguide?: Styleguide;

	/**
	 * The most recent user commands (user operations) to provide an undo feature.
	 * Note that operations that close or open a page clear this buffer.
	 * The last command in the list is the most recent executed one.
	 */
	@MobX.observable private undoBuffer: Command[] = [];

	/**
	 * Creates a new store.
	 */
	private constructor(basePreferencePath?: string) {
		try {
			this.preferences = Preferences.fromJsonObject(
				Persister.loadYamlOrJson(this.getPreferencesPath(basePreferencePath))
			);
		} catch (error) {
			this.preferences = new Preferences();
		}
	}

	/**
	 * Returns (or creates) the one global store instance.
	 * @return The one global store instance.
	 */
	public static getInstance(basePreferencePath?: string): Store {
		if (!Store.INSTANCE) {
			Store.INSTANCE = new Store(basePreferencePath);
		}

		return Store.INSTANCE;
	}

	/**
	 * Tries to guess a human-friendly name from an ID by splitting words at camel-case positions,
	 * and capitalizing the first letter. If an actual name is provided, this comes first.
	 * @param id The technical (internal) ID.
	 * @param name The human-friendly name.
	 * @return The guessed (or given) human-friendly name.
	 */
	public static guessName(id: string, name?: string): string {
		if (name) {
			return name;
		}

		const guessedName = id
			.replace(/[_-]+/, ' ')
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.toLowerCase();
		return guessedName.substring(0, 1).toUpperCase() + guessedName.substring(1);
	}

	/**
	 * Add a new project definition to the list of projects.
	 * Note: Changes to the projects and page references are saved only when calling save().
	 * @param project The new project.
	 * @see save
	 */
	public addProject(project: Project): void {
		this.projects.push(project);
	}

	/**
	 * Clears the undo and redo buffers (e.g. if a page is loaded or the page state get
	 * incompatible with the buffers).
	 */
	public clearUndoRedoBuffers(): void {
		this.undoBuffer = [];
		this.redoBuffer = [];
	}

	/**
	 * Closes the current page in edit and preview, setting it to undefined.
	 * @see getCurrentPage()
	 */
	public closePage(): void {
		this.currentPage = undefined;
	}

	/**
	 * Closes the current project in edit, also closing any open close.
	 * @see getCurrentProject()
	 */
	@MobX.action
	public closeProject(): void {
		this.currentProject = undefined;
		this.closePage();
	}

	/**
	 * Executes a user command (user operation) and registers it as undoable command.
	 * @param command The command to execute and register.
	 */
	public execute(command: Command): void {
		const successful: boolean = command.execute();
		if (!successful) {
			// The state and the undo/redo buffers are out of sync.
			// This may be the case if not all store operations are proper command implementations.
			// In that case, the store is correct and we drop the undo/redo buffers.
			this.clearUndoRedoBuffers();
			return;
		}

		// The command was processed successfully, now memorize it to provide an undo stack.

		// But first, we give the command the chance to indicate that the previous undo command
		// and the current one are too similar to keep both. If so, the newer command
		// incorporates both commands' changes into itself, and we keep only that newer one
		// on the undo stack.

		const previousCommand = this.undoBuffer[this.undoBuffer.length - 1];
		const wasMerged = previousCommand && command.maybeMergeWith(previousCommand);
		if (wasMerged) {
			// The newer command now contains both changes, so we drop the previous one
			this.undoBuffer.pop();
		}

		// Now memorize the new command
		this.undoBuffer.push(command);

		// All previously undone commands (the redo stack) are invalid after a forward command
		this.redoBuffer = [];
	}

	/**
	 * Tries to find an available path for the page file, starting with a normalized version of
	 * the project and page names.
	 * @param projectName The human-friendly project name.
	 * @param pageName The human-friendly page name.
	 * @return An available page file path.
	 */
	public findAvailablePagePath(pageRef: PageRef): string {
		const projectPart: string = Lodash.kebabCase(pageRef.getProject().getName());
		const pagePart: string = Lodash.kebabCase(pageRef.getName());

		for (let no = 1; no <= 1000; no++) {
			const suffix = no > 1 ? `-${no}` : '';
			const candidate = `./${projectPart}/${pagePart}${suffix}.yaml`;
			const collision = this.getPageRefByPath(candidate);
			if (!collision || collision === pageRef) {
				return candidate;
			}
		}

		throw new Error(
			`Tried 1000 page file paths for project '${pageRef
				.getProject()
				.getName()}', page '${pageRef.getName()}', giving up`
		);
	}

	/**
	 * Returns the name of the analyzer that should be used for the open styleguide.
	 * @return The name of the analyzer that should be used for the open styleguide.
	 */
	public getAnalyzerName(): string {
		return this.analyzerName;
	}

	/**
	 * Returns the element currently in the clipboard, or undefined if there is none.
	 * Note: The element is cloned lazily, so it may represent a still active element.
	 * When adding the clipboard element to paste it, clone it first.
	 * @return The element currently in the clipboard, or undefined if there is none.
	 */
	public getClipboardElement(): PageElement | undefined {
		return this.clipboardElement;
	}

	/**
	 * Returns the page content that is currently being displayed in the preview,
	 * and edited in the elements and properties panes. May be undefined if there is none.
	 * @return The page content that is currently being displayed in the preview, or undefined.
	 */
	public getCurrentPage(): Page | undefined {
		return this.currentPage;
	}

	/**
	 * Returns the page reference (IDs only) that is currently being displayed in the preview,
	 * and edited in the elements and properties panes. May be undefined if there is none.
	 * @return The page reference that is currently being displayed in the preview, or undefined.
	 */
	public getCurrentPageRef(): PageRef | undefined {
		if (!this.currentPage) {
			return;
		}

		const currentPageId: string = this.currentPage.getId();
		for (const project of this.projects) {
			for (const pageRef of project.getPages()) {
				if (pageRef.getId() === currentPageId) {
					return pageRef;
				}
			}
		}

		return;
	}

	/**
	 * Returns the project that is currently being selected to add, edit, or remove pages of. May be
	 * undefined if none is selected is none. Opening a page automatically changes the selected
	 * project.
	 * @return The currently selected project or undefined.
	 */
	public getCurrentProject(): Project | undefined {
		return this.currentProject;
	}

	/**
	 * Returns the element that is currently being dragged, or undefined if there is none.
	 * @return The dragged element or undefined.
	 */
	public getDraggedElement(): PageElement | undefined {
		return this.draggedElement;
	}

	/**
	 * Returns a page reference (containing ID and name) object by its ID.
	 * @param id The page ID.
	 * @return The page reference or undefined, if no such ID exists.
	 */
	public getPageRefById(id: string): PageRef | undefined {
		for (const project of this.projects) {
			for (const pageRef of project.getPages()) {
				if (pageRef.getId() === id) {
					return pageRef;
				}
			}
		}

		return;
	}

	/**
	 * Returns a page reference (containing ID and name) object by its page file path.
	 * @param path The page file path.
	 * @return The page reference or undefined, if no such page exists.
	 */
	public getPageRefByPath(path: string): PageRef | undefined {
		for (const project of this.projects) {
			for (const pageRef of project.getPages()) {
				if (pageRef.getPath() === path) {
					return pageRef;
				}
			}
		}

		return;
	}

	/**
	 * Returns the absolute and OS-specific path of the root folder of the designs (projects, pages)
	 * in the currently opened styleguide.
	 * @return The absolute and OS-specific page root path.
	 */
	public getPagesPath(): string {
		if (!this.styleguide) {
			throw new Error('Cannot open page: No styleguide open');
		}

		return PathUtils.join(this.styleguide.getPath(), 'alva');
	}

	/**
	 * Returns the current search term in the patterns list, or an empty string if there is none.
	 * @return The current pattern search term or an empty string.
	 */
	public getPatternSearchTerm(): string {
		return this.patternSearchTerm;
	}

	/**
	 * Returns the path to the user preferences YAML file.
	 * @return The path to the user preferences YAML file.
	 */
	public getPreferencesPath(basePreferencePath?: string): string {
		return PathUtils.join(basePreferencePath || OsUtils.homedir(), '.alva-prefs.yaml');
	}

	/**
	 * Returns a project by its ID.
	 * @param id The project ID.
	 * @return The project or undefined, if no such ID exists.
	 */
	public getProjectById(id: string): Project | undefined {
		for (const project of this.projects) {
			if (project.getId() === id) {
				return project;
			}
		}

		return;
	}

	/**
	 * Returns all projects (references) of this styleguide. Projects point to page references,
	 * and both do not contain the actual page data (element), but only their IDs.
	 * @return All project objects.
	 */
	public getProjects(): Project[] {
		return this.projects;
	}

	/**
	 * Returns the currently selected element in the element list.
	 * The properties pane shows the properties of this element,
	 * and keyboard commands like cut, copy, or delete operate on this element.
	 * May be empty if no element is selected.
	 * @return The selected element or undefined.
	 * @see isElementFocussed
	 */
	public getSelectedElement(): PageElement | undefined {
		return this.selectedElement;
	}

	/**
	 * Returns the specified styleguide by id.
	 */
	public getStyleguide(): Styleguide | undefined {
		return this.styleguide;
	}

	/**
	 * Returns whether there is a user comment (user operation) to redo.
	 * @return Whether there is a user comment (user operation) to redo.
	 * @see redo
	 */
	public hasRedoCommand(): boolean {
		return this.redoBuffer.length > 0;
	}

	/**
	 * Returns whether there is a user comment (user operation) to undo.
	 * @return Whether there is a user comment (user operation) to undo.
	 * @see undo
	 */
	public hasUndoCommand(): boolean {
		return this.undoBuffer.length > 0;
	}

	/**
	 * Returns whether the currently selected element also has focus.
	 * In this case, keyboard operations such as copy, cut, or delete
	 * should operate on that element.
	 * @return Whether the currently selected element also has focus.
	 * @see getSelectedElement()
	 */
	public isElementFocussed(): boolean | undefined {
		return this.elementFocussed;
	}

	/**
	 * Opens the first page of a given project for preview and editing.
	 * @param projectId The ID of the project to open the first page of.
	 * May be undefined, in this case, the first project of the styleguide is used.
	 */
	public openFirstPage(projectId?: string): void {
		if (!this.projects.length) {
			return;
		}

		const project: Project = this.projects[0];

		const pages: PageRef[] = project.getPages();
		if (!pages.length) {
			return;
		}

		this.openPage(pages[0].getId());
	}

	/**
	 * Opens the last used styleguide, project, and page from the user's preferences.
	 */
	public openFromPreferences(): void {
		try {
			const lastStyleguidePath = this.preferences.getLastStyleguidePath();
			if (lastStyleguidePath) {
				this.openStyleguide(lastStyleguidePath);

				const lastProjectId = this.preferences.getLastProjectId();
				if (lastProjectId) {
					this.openProject(lastProjectId);
				}

				const lastPageId = this.preferences.getLastPageId();
				if (lastPageId) {
					try {
						this.openPage(lastPageId);
					} catch (error) {
						// Ignored: The page does not exist anymore
					}
				}

				if (!this.currentPage) {
					this.openFirstPage();
				}
			}
		} catch (error) {
			console.error(`Failed to open last styleguide or page: ${error}`);
		}
	}

	/**
	 * Opens a given page for preview and editing (elements and properties panes).
	 * Any previously edited page is discarded (not saved), so call save() first.
	 * @param id The ID of the page to open.
	 * @see save
	 */
	@MobX.action
	public openPage(id: string): boolean {
		const styleguide = this.styleguide;
		if (!styleguide) {
			throw new Error('Cannot open page: No styleguide open');
		}

		this.save();

		const pageRef = this.getPageRefById(id);
		if (pageRef && pageRef.getLastPersistedPath()) {
			const pagePath: string = PathUtils.join(
				this.getPagesPath(),
				pageRef.getLastPersistedPath() as string
			);
			const json: JsonObject = Persister.loadYamlOrJson(pagePath);
			this.currentPage = Page.fromJsonObject(json, id);
			this.currentProject = this.currentPage.getProject();
		} else {
			this.currentPage = undefined;
		}

		this.selectedElement = undefined;

		this.preferences.setLastPageId(this.currentPage ? this.currentPage.getId() : undefined);
		this.savePreferences();

		return this.currentPage !== undefined;
	}

	/**
	 * Opens the project that is currently being selected to add, edit, or remove pages of. May be
	 * undefined if none is selected is none. Opening a page automatically changes the selected
	 * project.
	 * @param project The ID of the project to open.
	 */
	@MobX.action
	public openProject(id: string): void {
		const project: Project | undefined = this.getProjectById(id);
		this.currentProject = project;

		if (this.currentPage && this.currentPage.getProject() === project) {
			this.closePage();
		}
	}

	/**
	 * Closes any open page or styleguide, and opens and parses the given styleguide instead.
	 * This triggers parsing of all contained patterns, and loading all projects and page refs
	 * from the styleguide's alva folder.
	 * @param styleguidePath The absolute and OS-dependent file-system path to the styleguide.
	 */
	@MobX.action
	public openStyleguide(styleguidePath: string): void {
		if (this.currentPage) {
			this.save();
		}

		this.currentPage = undefined;

		const alvaYamlPath = PathUtils.join(styleguidePath, 'alva/alva.yaml');

		// TODO: Converts old alva.yaml structure to new one.
		// This should be removed after the next version.
		const projectsPath = PathUtils.join(styleguidePath, 'alva/projects.yaml');
		try {
			const oldFileStructure = Boolean(FileUtils.statSync(projectsPath));
			if (oldFileStructure) {
				const oldAlvaYaml = Persister.loadYamlOrJson(projectsPath);
				const newAlvaYaml = {
					analyzerName: 'typescript-react-analyzer',
					...oldAlvaYaml
				};
				FileUtils.writeFileSync(alvaYamlPath, {});
				Persister.saveYaml(alvaYamlPath, newAlvaYaml);
				FileUtils.unlinkSync(projectsPath);
			}
		} catch (error) {
			// ignore the correct setup with missing projects.yaml
		}

		let json: JsonObject = Persister.loadYamlOrJson(alvaYamlPath);

		// TODO: Converts old alva.yaml structure to new one.
		// This should be removed after the next version.
		if (json.config) {
			json = json.config as JsonObject;
		}

		json.styleguidePath = styleguidePath;
		this.setStyleguideFromJsonInternal(json);

		this.preferences.setLastStyleguidePath(styleguidePath);
		this.savePreferences();
	}

	/**
	 * Redoes the last undone user operation, if available.
	 * @return Whether the redo was successful.
	 * @see hasRedoCommand
	 */
	public redo(): boolean {
		const command: Command | undefined = this.redoBuffer.pop();
		if (!command) {
			return false;
		}

		const successful: boolean = command.execute();
		if (!successful) {
			// The state and the undo/redo buffers are out of sync.
			// This may be the case if not all store operations are proper command implementations.
			// In that case, the store is correct and we drop the undo/redo buffers.
			this.clearUndoRedoBuffers();
			return false;
		}

		this.undoBuffer.push(command);
		return true;
	}

	/**
	 * Removes a given page from the styleguide designs.
	 * If the page is currently open, it is closed first.
	 * Note: Changes to the page are saved only when calling save() first.
	 * @param page The page to be removed.
	 * @see save
	 */
	public removePage(page: PageRef): void {
		if (!page) {
			return;
		}

		const currentPage: Page | undefined = this.getCurrentPage();
		if (currentPage && currentPage.getPageRef() === page) {
			this.closePage();
		}

		page
			.getProject()
			.getPagesInternal()
			.remove(page);
	}

	/**
	 * Removes a given project and its child pages from the styleguide designs.
	 * If one of these pages is currently open, it is closed first.
	 * Note: Changes to the projects and pages are saved only when calling save() first.
	 * @param project The project to be removed.
	 * @see save
	 */
	public removeProject(project: Project): void {
		if (!project) {
			return;
		}

		const currentPage: Page | undefined = this.getCurrentPage();
		if (currentPage) {
			project.getPages().forEach(pageRef => {
				if (currentPage.getPageRef() === pageRef) {
					this.closePage();
				}
			});
		}

		(this.projects as IObservableArray<Project>).remove(project);

		if (this.currentProject === project) {
			this.closeProject();
		}
	}

	/**
	 * Saves the entire store. This includes the project definitions and page references and
	 * the currently opened page and its elements.
	 * Call this method when the user click Save in the File menu.
	 */
	@MobX.action
	public save(): void {
		const styleguide = this.styleguide;
		if (!styleguide) {
			throw new Error('Cannot save: No styleguide open');
		}

		if (!this.styleguide) {
			return;
		}

		// Move all page file to their new locations, if the path has changed

		this.projects.forEach(project => {
			project.getPages().forEach(page => {
				const lastPath = page.getLastPersistedPath();
				if (lastPath && page.getPath() !== lastPath) {
					try {
						const lastFullPath = PathUtils.join(this.getPagesPath(), lastPath);
						const newFullPath = PathUtils.join(this.getPagesPath(), page.getPath());
						FileExtraUtils.mkdirpSync(PathUtils.dirname(newFullPath));
						FileUtils.renameSync(lastFullPath, newFullPath);
						page.updateLastPersistedPath();
					} catch (error) {
						// Fall back to original path to continue saving
						page.setPath(lastPath);
					}
				}
			});
		});

		// Then update the currently open page's file

		const currentPage: Page | undefined = this.getCurrentPage();
		if (currentPage) {
			const pagePath: string = PathUtils.join(
				this.getPagesPath(),
				currentPage.getPageRef().getPath()
			);
			Persister.saveYaml(pagePath, currentPage.toJsonObject());
		}

		// Finally, update the alva.yaml

		const json: JsonObject = {
			analyzerName: this.analyzerName,
			patternsPath: this.relativePatternsPath,
			projects: this.projects.map(project => project.toJsonObject())
		};

		const configPath = PathUtils.join(this.getPagesPath(), 'alva.yaml');
		Persister.saveYaml(configPath, json);
	}

	/**
	 * Saves the user preferences. Called automatically when preferences change.
	 */
	private savePreferences(): void {
		Persister.saveYaml(this.getPreferencesPath(), this.preferences.toJsonObject());
	}

	/**
	 * Sets the element currently in the clipboard, or undefined if there is none.
	 * Note: The element is cloned lazily, so you don't need to clone it when setting.
	 * @return The element currently in the clipboard, or undefined if there is none.
	 * @see getClipboardElement
	 */
	public setClipboardElement(clipboardElement: PageElement): void {
		this.clipboardElement = clipboardElement;
	}

	/**
	 * Sets the element that is currently being dragged, or undefined if there is none.
	 * @param draggedElement The dragged element or undefined.
	 */
	public setDraggedElement(draggedElement: PageElement): void {
		this.draggedElement = draggedElement;
	}

	/**
	 * Sets whether the currently selected element also has focus.
	 * In this case, keyboard operations such as copy, cut, or delete
	 * should operate on that element.
	 * @param elementFocussed Whether the currently selected element also has focus.
	 * @see setSelectedElement()
	 */
	public setElementFocussed(elementFocussed: boolean): void {
		this.elementFocussed = elementFocussed;
	}

	/**
	 * Loads a given JSON object into the store as current page.
	 * Used internally within the store, do not use from UI components.
	 * Also unselects any selected element.
	 * @param json The JSON object to set.
	 */
	@MobX.action
	public setPageFromJsonInternal(json: JsonObject): void {
		this.currentPage = json.page
			? Page.fromJsonObject(json.page as JsonObject, json.pageId as string)
			: undefined;
		this.selectedElement = undefined;
	}

	/**
	 * Sets the current search term in the patterns list, or an empty string if there is none.
	 * @param patternSearchTerm The current pattern search term or an empty string.
	 */
	public setPatternSearchTerm(patternSearchTerm: string): void {
		this.patternSearchTerm = patternSearchTerm;
	}

	/**
	 * Sets the currently selected element in the element list.
	 * The properties pane shows the properties of this element,
	 * and keyboard commands like cut, copy, or delete operate on this element.
	 * May be empty if no element is selected.
	 * @param selectedElement The selected element or undefined.
	 * @see setElementFocussed
	 */
	public setSelectedElement(selectedElement: PageElement | undefined): void {
		this.selectedElement = selectedElement;
	}

	/**
	 * Loads a styleguide from a JSON object into the store.
	 * Used internally within the store, do not use from UI components.
	 * @param json The JSON object to load from.
	 */
	@MobX.action
	public setStyleguideFromJsonInternal(json: JsonObject): void {
		this.analyzerName = json.analyzerName as string;
		this.relativePatternsPath = (json.patternsPath as string) || 'lib/patterns';

		(this.projects as IObservableArray<Project>).clear();
		(json.projects as JsonArray).forEach((projectJson: JsonObject) => {
			const project: Project = Project.fromJsonObject(projectJson);
			this.addProject(project);
		});

		if (json.styleguidePath && this.analyzerName) {
			const styleguidePath = json.styleguidePath as string;
			const patternsPath = PathUtils.join(
				styleguidePath,
				this.relativePatternsPath.split('/').join(PathUtils.sep)
			);

			this.styleguide = new Styleguide(styleguidePath, patternsPath, this.analyzerName);
		} else {
			this.styleguide = undefined;
		}

		this.clearUndoRedoBuffers();
	}

	/**
	 * Undoes the last user operation, if available.
	 * @return Whether the undo was successful.
	 * @see hasUndoCommand
	 */
	public undo(): boolean {
		const command: Command | undefined = this.undoBuffer.pop();
		if (!command) {
			return false;
		}

		const successful: boolean = command.undo();
		if (!successful) {
			// The state and the undo/redo buffers are out of sync.
			// This may be the case if not all store operations are proper command implementations.
			// In that case, the store is correct and we drop the undo/redo buffers.
			this.clearUndoRedoBuffers();
			return false;
		}

		this.redoBuffer.push(command);
		return true;
	}
}
