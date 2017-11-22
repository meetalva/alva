import React from 'react';
import ReactDom from 'react-dom';
import fs from 'fs';
import * as optimist from 'optimist';
import path from 'path';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.pagePath = path.join(props.styleGuidePath, 'stacked', props.projectName, props.pageName + '.json');
		if (!fs.existsSync(path)) {
			console.log('Error: Stacked page path "' + pagePath + '" does not exist.');
			process.exit(1);
		}

		this.patternFactories = {};
	}

	/**
	 * Converts a JSON-serializable declaration of a pattern, primitive, or collection
	 * into a React component (or primitive), deep-traversing through properties and children.
	 * 
	 * @param model The model, may be an object with 'patternSrc' property (a pattern declaration),
	 * a primitive like a string, number, boolean, null/undefined, etc.,
	 * or an array or object of such values.
	 * @returns A React component in case of a pattern declaration, the primitive in case of a primitive,
	 * or an array or object with values converted in the same manner, if an array resp. object is provided.
	 */
	createComponent(model) {
		if (Array.isArray(model)) {
			// Handle arrays by returning a new array with recursively processed elements.
			return model.map((element) => {
				return this.createComponent(element);
			});
		}

		if (model === null || typeof model !== 'object') {
			// Primitives stay primitives.
			return model;
		}

		if (model.patternSrc == null) {
			// The model is an object, but not a pattern declaration.
			// Create a new object with recursively processed values.
			return Object.entries(model).map(([key, value]) => {
				return [key, this.createComponent(value)];
			});
		}

		// The model is a pattern declaration, create a React pattern component

		// First, process the properties and children of the declaration recursively
		const componentProps = this.createComponent(model.properties);
		componentProps.children = this.createComponent(model.children);
		
		// Finally, build the component

		const patternSrc = path.join(props.styleGuidePath, 'lib', 'patterns', model.patternSrc, 'index.js');
		let patternFactory = this.patternFactories[patternSrc];
		if (patternFactory == null) {
			patternFactory = require(patternSrc).default;
			this.patternFactories[patternSrc] = patternFactory;
		}

		return patternFactory(componentProps);
	}

	render() {
		const pageModel = require(this.pagePath);
		return this.createComponent(pageModel.root);
	}
}

const [styleGuidePath, projectName, pageName] = optimist.argv._;
if (styleGuidePath == null || projectName == null || pageName == null) {
	console.log('Usage: npm run start-server <styleguide-path> <project-name> <page-name>');
	process.exit(1);
}

ReactDom.render(
	<App styleGuidePath="${styleGuidePath}" projectName="${projectName}" pageName="${pageName}" />,
	document.getElementById('app')
);
