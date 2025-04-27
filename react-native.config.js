module.exports = {
    project: {
      ios: {},
      android: {},
    },
    "react-native-vector-icons": {
      platforms: {
        ios: null,
      },
    },
    assets: ["./src/assets/fonts/"],
    // finding fonts using above and linking using below path
    getTransformModulePath() {
      return require.resolve("react-native-typescript-transformer");
    },
    getSourceExts() {
      return ["ts", "tsx"];
    },
  };