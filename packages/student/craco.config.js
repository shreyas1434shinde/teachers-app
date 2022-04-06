const cracoModuleFederation = require("craco-module-federation");
const ExternalTemplateRemotesPlugin = require("external-remotes-plugin");

module.exports = {
  devServer: {
    port: 3006,
  },
  webpack: {
    plugins: [new ExternalTemplateRemotesPlugin()],
  },
  plugins: [
    {
      plugin: cracoModuleFederation,
    },
  ],
};
