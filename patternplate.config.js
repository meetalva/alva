const logo = `<svg width="50" height="50" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<path fill="#ffffff" d="M60 110c-27.57 0-50-22.43-50-50s22.43-50 50-50 50 22.43 50 50-22.43 50-50 50" id="b"/>
	<path d="M78.96 55c.84 0 1.34.98.85 1.68L56.89 89.55c-.6.84-1.89.42-1.89-.62V56.06c0-.58.47-1.06 1.04-1.06h22.92z" fill="#EC0361"/>
	<path d="M63.95 30a1 1 0 0 0-.83.45L40.2 63.32c-.5.7 0 1.68.84 1.68h22.92c.57 0 1.04-.48 1.04-1.06V31.07c0-.66-.52-1.07-1.05-1.07M60 43.66V60H48.6L60 43.66" fill="#5802CD"/>
	<path d="M65 63.94V55h-5v5h-5v5h8.96c.57 0 1.04-.48 1.04-1.06" fill="#51004D"/>
</svg>
`;

const favicon = `<svg width="50" height="50" viewBox="10 10 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path fill="#ffffff" d="M60 110c-27.57 0-50-22.43-50-50s22.43-50 50-50 50 22.43 50 50-22.43 50-50 50" id="b"/>
<path d="M78.96 55c.84 0 1.34.98.85 1.68L56.89 89.55c-.6.84-1.89.42-1.89-.62V56.06c0-.58.47-1.06 1.04-1.06h22.92z" fill="#EC0361"/>
<path d="M63.95 30a1 1 0 0 0-.83.45L40.2 63.32c-.5.7 0 1.68.84 1.68h22.92c.57 0 1.04-.48 1.04-1.06V31.07c0-.66-.52-1.07-1.05-1.07M60 43.66V60H48.6L60 43.66" fill="#5802CD"/>
<path d="M65 63.94V55h-5v5h-5v5h8.96c.57 0 1.04-.48 1.04-1.06" fill="#51004D"/>
</svg>
`

module.exports = {
	docs: ["*.md", "docs/**/*.md"],
	entry: ["packages/core/build/components/**/demo.js"],
	mount: "@patternplate/render-react/mount",
	render: "@patternplate/render-react/render",
	cover: "@meetalva/site",
	ui: {
		logo,
		favicon,
		colorBackgroundDark: "rgb(0, 0, 0)",
		colorBackgroundSecondaryDark: "rgb(10, 10, 10)",
		colorBackgroundTertiaryDark: "rgb(10, 10, 10)",
		colorBorderDark: "rgb(10, 10, 10)",
		colorTextDark: "rgb(242, 242, 242)",
		colorRecessDark: "rgb(153, 153, 153)",
		colorActive: "rgb(215, 0, 82)",
		showComponents: process.env.NODE_ENV !== 'production'
	}
};

