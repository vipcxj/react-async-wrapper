/* eslint-disable */
const fs = require('fs');
const execSync = require('child_process').execSync;
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

const exec = (command, extraEnv) => execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
});

const name = 'react-async';
['umd', 'cjs', 'es'].forEach((mode) => {
    console.log(`\nBuilding ${mode}/${name}.js ...`);
    exec('rollup -c', {
        BABEL_ENV: mode,
        NODE_ENV: 'development',
        FILE_NAME: name,
    });
    console.log(`\nBuilding ${mode}/${name}.min.js ...`);
    exec('rollup -c', {
        BABEL_ENV: mode,
        NODE_ENV: 'production',
        FILE_NAME: name,
    });
    // noinspection JSUnresolvedFunction
    const size = gzipSize.sync(
        fs.readFileSync(`build/${mode}/${name}.min.js`)
    );
    console.log(`\ngzipped, the ${mode} build size is %s`, prettyBytes(size));
});