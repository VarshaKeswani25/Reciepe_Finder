const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Suppress deprecation warnings
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
