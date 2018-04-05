/* eslint-disable react/forbid-prop-types */
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
  a: PropTypes.any,
  b: PropTypes.any,
  c: PropTypes.any,
  d: PropTypes.any,
};

AsyncDemo.defaultProps = {
  a: undefined,
  b: undefined,
  c: undefined,
  d: undefined,
};

export default AsyncDemo;
