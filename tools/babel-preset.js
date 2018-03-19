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

module.exports = declare(({ assertVersion }) => {
    assertVersion(7);
    return {
        presets: [
            [ '@babel/env', {
                modules: false,
                loose: true,
            } ],
            '@babel/react'
        ],
        plugins: plugins
    };
});