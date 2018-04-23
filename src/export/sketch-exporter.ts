import * as HtmlSketchApp from '@thereincarnator/html-sketchapp';
import * as FileExtraUtils from 'fs-extra';
import { Page } from '../store/page/page';
import { Store } from '../store/store';

export class SketchExporter {
	public static exportToSketch(path: string, element?: HTMLElement): void {
		if (!element) {
			element = document.querySelector('#preview > div > div:nth-child(1)') as HTMLElement;
		}

		const page = Store.getInstance().getCurrentPage() as Page;
		const pageName = page.getName();
		const projectName = page.getName();

		const sketchPage = HtmlSketchApp.nodeTreeToSketchPage(element, {
			pageName: projectName,
			addArtboard: true,
			artboardName: pageName,
			getGroupName: node =>
				node.getAttribute('data-sketch-name') || `(${node.nodeName.toLowerCase()})`,
			getRectangleName: () => 'background',
			skipSystemFonts: true
		});
		FileExtraUtils.writeFileSync(path, JSON.stringify(sketchPage.toJSON(), null, '\t'));
	}
}
