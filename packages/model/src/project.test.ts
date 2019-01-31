import { Project } from './project';
import { Page } from './page';

test("project.update should apply b's page order to a", () => {
	const project = Project.create({
		name: 'Project',
		draft: false,
		path: '/fake/path'
	});

	const page = Page.create(
		{
			active: false,
			id: 'page-1',
			name: ''
		},
		{ project }
	);

	project.addPage(page);

	const b = project.clone();
	const [first, second] = b.getPages();

	b.movePageAfter({
		page: first,
		targetPage: second
	});

	expect(b.getPages().map(p => p.getId())).toEqual([second.getId(), first.getId()]);

	project.update(b);

	expect(project.getPages().map(p => p.getId())).toEqual([second.getId(), first.getId()]);
});
