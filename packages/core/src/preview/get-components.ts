import * as Model from '../model';

// tslint:disable-next-line:no-any
export function getComponents(project: Model.Project): { [id: string]: any } {
	return project
		.getPatternLibraries()
		.filter(library => library.getBundleId() !== '')
		.reduce((components, library) => {
			const libraryComponents = (window as any)[library.getBundleId()];

			if (!libraryComponents) {
				return components;
			}

			// tslint:disable-next-line:prefer-object-spread
			return Object.assign(components, libraryComponents);
		}, {});
}
