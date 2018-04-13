import { readdirSync, readFileSync, statSync } from 'fs';
import * as MockFs from 'mock-fs';

import { Store } from '../store/store';

const testBasePath = 'src/test/';
const mocks = readdirSync(`${testBasePath}/mock-styleguides`);

function createMockConfigFromFolder(path: string, symlink?: boolean): MockFs.Config {
	const folder = readdirSync(path);
	const virtualFolder: MockFs.Config = {};

	folder.map((item: string) => {
		const itemPath = path + item;
		if (statSync(itemPath).isDirectory()) {
			virtualFolder[item] = createMockConfigFromFolder(itemPath + '/');

			return;
		}

		virtualFolder[item] = symlink ? MockFs.symlink({ path: itemPath }) : readFileSync(itemPath);
	});

	return virtualFolder;
}

function setupVirtualFileSystem() {
	const mockFolderStructure: MockFs.Config = {
		'src/': createMockConfigFromFolder('src/'),
		'node_modules/': createMockConfigFromFolder('node_modules/', true),
		'tsconfig.json': MockFs.file({
			content: readFileSync('./tsconfig.json')
		})
	};

	mocks.map((mock: string) => {
		mockFolderStructure[`/${mock}/projectfiles/`] = createMockConfigFromFolder(
			`${testBasePath}mock-styleguides/${mock}/styleguide/`
		);
		mockFolderStructure[`/${mock}/projectfiles/lib/`] = createMockConfigFromFolder(
			`${testBasePath}dummy-patterns/lib/`
		);
		mockFolderStructure[`/${mock}/userfiles/`] = createMockConfigFromFolder(
			`${testBasePath}mock-styleguides/${mock}/userfiles/`
		);
	});

	MockFs(mockFolderStructure);
}

describe(`Test for backwards compatibility of config files`, () => {
	afterAll(() => {
		MockFs.restore();
	});

	setupVirtualFileSystem();

	mocks.map((mock: string) => {
		describe(`with version ${mock}:`, () => {
			const store: Store = Store.getInstance(`/${mock}/userfiles/`);
			store.openFromPreferences();

			test('correct analyzername is set', () => {
				expect(store.getAnalyzerName()).toBe('typescript-react-analyzer');
			});

			describe('project', () => {
				const currentProject = store.getCurrentProject();

				test('is defined', () => {
					expect(currentProject).toBeDefined();
				});
				if (!currentProject) {
					return;
				}

				test('id is of type string', () => {
					expect(typeof currentProject.getId()).toBe('string');
				});
			});

			describe('page', () => {
				const currentPage = store.getCurrentPage();

				test('is defined', () => {
					expect(currentPage).toBeDefined();
				});
				if (!currentPage) {
					return;
				}

				test('id is of type string', () => {
					expect(typeof currentPage.getId()).toBe('string');
				});

				test('name is correct', () => {
					expect(currentPage.getName()).toBe('Testpage');
				});
			});

			describe('page-element', () => {
				const currentPage = store.getCurrentPage();
				if (!currentPage) {
					return;
				}

				const rootElement = currentPage.getRoot();

				test('is defined', () => {
					expect(rootElement).toBeDefined();
				});
				if (!rootElement) {
					return;
				}

				test('id is of type string', () => {
					expect(typeof rootElement.getId()).toBe('string');
				});

				const rootElementPattern = rootElement.getPattern();
				test('pattern reference is defined', () => {
					expect(rootElementPattern).toBeDefined();
				});
				if (!rootElementPattern) {
					return;
				}

				// currently the typescript-react-analyzer does not find properties for our test file
				// test('property values', () => {
				// 	console.log('getProperties', rootElementPattern.getProperties());
				// })

				const rootElementChildren = rootElement.getChildren();
				test('children are defined', () => {
					expect(rootElementChildren).toBeDefined();
				});
				if (!rootElementChildren) {
					return;
				}

				test('name of first child is correct', () => {
					expect(rootElementChildren[0].getName()).toBe('Image');
				});
			});
		});
	});
});
