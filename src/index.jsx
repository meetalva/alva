import React from 'react';
import ReactDom from 'react-dom';
import path from 'path';
import fs from 'fs';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.styleGuidePath = '../stacked-example';
		this.projectName = 'my-project';
		this.pageName = 'mypage';

		this.pagePath = path.join(this.styleGuidePath, 'stacked', 'projects',
			this.projectName, this.pageName + '.json');
		this.patternFactories = {};
	}

	render() {
		const pageModel = JSON.parse(fs.readFileSync(this.pagePath, 'utf8'));;
		return this.createComponent(pageModel.root);
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
	createComponent(model, key) {
		if (Array.isArray(model)) {
			// Handle arrays by returning a new array with recursively processed elements.
			return model.map((element, index) => {
				return this.createComponent(element, index);
			});
		}

		if (model === null || typeof model !== 'object') {
			// Primitives stay primitives.
			return model;
		}

		if (model['_type'] == 'pattern') {
			// The model is a pattern declaration, create a React pattern component

			// First, process the properties and children of the declaration recursively
			const componentProps = this.createComponent(model.properties) || {};
			componentProps.children = this.createComponent(model.children);
			if (key != null) {
				componentProps.key = key;
			}

			// Then, load the pattern factory
			const patternFolder = path.join(this.styleGuidePath, 'lib', 'patterns', model.patternSrc);
			const patternSrc = path.join(patternFolder, 'index.js');
			let patternFactory = this.patternFactories[patternFolder];
			if (patternFactory == null) {
				console.log("Loading pattern '" + patternSrc + "'...");
				patternFactory = require(patternSrc).default;
				this.patternFactories[patternFolder] = patternFactory;
			}

			// Finally, build the component
			return patternFactory(componentProps);
		} else {
			// The model is an object, but not a pattern declaration.
			// Create a new object with recursively processed values.
			var result = {};
			Object.keys(model).forEach((key) => {
				result[key] = this.createComponent(model[key]);
			});
			return result;
		}

	}
}

ReactDom.render(<App />, document.getElementById('app'));
