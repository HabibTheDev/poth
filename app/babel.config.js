// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       // react-native-reanimated/plugin must remain the last plugin in the list.
//       "react-native-worklets/plugin",
//     ],
//   };
// };


module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
  };
};