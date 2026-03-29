module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // NativeWind must come before Reanimated
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
