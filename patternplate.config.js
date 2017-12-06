module.exports = {
  docs: ["docs/**/*.md"],
  entry: ["lsg/lib/patterns/**/demo.js"],
  render: "@patternplate/render-styled-components/render",
  mount: "@patternplate/render-styled-components/mount",
  ui: {
    title: "@patternplate/components"
  }
};
