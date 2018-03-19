import analyzer from 'rollup-analyzer-plugin';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
// import closure from 'rollup-plugin-closure-compiler-js';
import camelCase from 'lodash/camelcase';

let file, sourcemap;
if (process.env.NODE_ENV === 'production') {
    file = `${process.env.BABEL_ENV}/${process.env.FILE_NAME}.min.${process.env.EXT}`;
    sourcemap = false;
} else {
    file = `${process.env.BABEL_ENV}/${process.env.FILE_NAME}.${process.env.EXT}`;
    sourcemap = true;
}

const config = {
    input: 'src/index.js',
    output: {
        file,
        name: `${camelCase(process.env.FILE_NAME)}`,
        format: process.env.BABEL_ENV,
        sourcemap,
        globals: {
            react: 'React',
            'prop-types': 'PropTypes',
        }
    },
    plugins: [
        external(),
        resolve({
            jsnext: true,
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        babel({
            exclude: "node_modules/**",
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        // closure(),
    ],
};

if (process.env.ANALYZER === true) {
    config.plugins.push(analyzer());
}

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(uglify());
}

// noinspection JSUnusedGlobalSymbols
export default config;