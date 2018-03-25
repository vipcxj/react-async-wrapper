/* eslint-disable */
const fs = require('fs');
const execSync = require('child_process').execSync;
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

const exec = (command, extraEnv) => execSync(command, {
  stdio: 'inherit',
  env: Object.assign({}, process.env, extraEnv)
});

const name = 'index';
[
  {
    format: 'cjs',
    ext: 'js',
    tool: 'babel',
  },
  {
    format: 'es',
    ext: 'js',
    tool: 'babel',
  },
  {
    format: 'umd',
    ext: 'js',
    analyzer: true,
    tool: 'rollup',
  },
].forEach(({ format, analyzer, ext, tool }) => {
  if (tool === 'rollup') {
    console.log(`\nBuilding development ${format} module ...`);
    exec('rollup -c', {
      BABEL_ENV: format,
      NODE_ENV: 'development',
      FILE_NAME: name,
      TOOL_SET: tool,
      EXT: ext,
    });
    console.log(`\nBuilding production ${format} module ...`);
    exec('rollup -c', {
      BABEL_ENV: format,
      NODE_ENV: 'production',
      FILE_NAME: name,
      ANALYZER: analyzer,
      TOOL_SET: tool,
      EXT: ext,
    });
    // noinspection JSUnresolvedFunction
    const size = gzipSize.sync(
      fs.readFileSync(`${format}/${name}.min.${ext}`)
    );
    console.log(`\ngzipped, the ${format} build size is %s`, prettyBytes(size));
  } else if (tool === 'babel') {
    console.log(`\nBuilding ${format} module ...`);
    exec(`babel src -d ${format} --ignore __tests__`, {
      BABEL_ENV: format,
      NODE_ENV: 'development',
      TOOL_SET: tool,
    });
  }
});