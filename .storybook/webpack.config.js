module.exports = (baseConfig, env, defaultConfig) => {
  if (env === 'DEVELOPMENT') {
    defaultConfig.devtool = 'inline-cheap-source-map';
  }
  return defaultConfig;
};
