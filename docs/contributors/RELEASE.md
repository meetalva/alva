---
options:
  order: 2
tags:
  - contributing
---

# Release

## Build requirements:
- For signing the executable for OSX the build needs to be run on OSX
	- Xcode is needed for building on OSX
- Electron-builder dependencies:
	- glib
		```
			brew install glib
		```
	- snapcraft
		```
			brew install snapcraft
		```

## Build steps:
1. Run:
	```
		npm run dist
	```
2. Check if all the created executables are working correctly on every environment
3. Push the created commit and tag:
	```
		git push && git push origin <tag_name>
	```
4. Create a new release on Github
	1. https://github.com/meetalva/alva/releases/new
	2. Select the created tag
	3. Title should be the tag name (Exp: v0.6.1)
	4. Add the release notes from the changelog.md for the specific version in the description
	5. New contributors should be mentioned additionally
5. Upload the files from the `upload-for-github-release` folders
