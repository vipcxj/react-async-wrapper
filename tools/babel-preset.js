/* eslint-disable */
const { declare } = require('@babel/helper-plugin-utils');

const plugins = [
  '@babel/proposal-object-rest-spread',
  ['@babel/proposal-class-properties', {
    loose: true,
  }],
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    'dev-expression',
    'transform-react-remove-prop-types'
  );
}

const format = process.env.BABEL_ENV;
const toolSet = process.env.TOOL_SET;
let modules = false;
if (toolSet === 'babel') {
  if (format !== 'es') {
    if (format === 'cjs') {
      modules = 'commonjs';
    } else {
      modules = format;
    }
  }
}

if (modules) {
  plugins.push('add-module-exports');
}

module.exports = declare(({ assertVersion }) => {
  assertVersion(7);
  return {
    presets: [
      [ '@babel/env', {
        modules,
        loose: true,
      } ],
      '@babel/react'
    ],
    plugins: plugins
  };
});