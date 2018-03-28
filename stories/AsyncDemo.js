import React from 'react';
import PropTypes from 'prop-types';

const AsyncDemo = ({
  a, b, c, d,
}) => (
  <ul>
    <li>Async Demo</li>
    <li>{`a: ${a}`}</li>
    <li>{`b: ${b}`}</li>
    <li>{`c: ${c}`}</li>
    <li>{`d: ${d}`}</li>
  </ul>
);

AsyncDemo.propTypes = {
  a: PropTypes.string,
  b: PropTypes.string,
  c: PropTypes.string,
  d: PropTypes.string,
};

AsyncDemo.defaultProps = {
  a: undefined,
  b: undefined,
  c: undefined,
  d: undefined,
};

export default AsyncDemo;