module.exports = (api) => {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      '@babel/plugin-transform-export-namespace-from',
      require.resolve('expo-router/babel'),
    ],
  };
};
