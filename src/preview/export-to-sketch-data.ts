import * as HtmlSketchApp from '@brainly/html-sketchapp';

// tslint:disable-next-line:no-any
export default async function exportToSketchData(): Promise<any> {
	return HtmlSketchApp.nodeTreeToSketchPage(document.documentElement, {
		pageName: 'Page',
		addArtboard: true,
		artboardName: 'Artboard',
		getGroupName: node =>
			node.getAttribute('data-sketch-name') || `(${node.nodeName.toLowerCase()})`,
		getRectangleName: () => 'background',
		skipSystemFonts: true
	});
}
