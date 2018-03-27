import React from 'react';

// eslint-disable-next-line object-curly-newline,react/prop-types
export default ({ a, b, c, d }) => (
  <ul>
    <li>Async Demo</li>
    <li>{`a: ${a}`}</li>
    <li>{`b: ${b}`}</li>
    <li>{`c: ${c}`}</li>
    <li>{`d: ${d}`}</li>
  </ul>
);
