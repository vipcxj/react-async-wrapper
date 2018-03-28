import React from 'react';
import PropTypes from 'prop-types';

const Demo = ({
  a, b, c, d,
}) => (
  <ul>
    <li>{`a: ${a}`}</li>
    <li>{`b: ${b}`}</li>
    <li>{`c: ${c}`}</li>
    <li>{`d: ${d}`}</li>
  </ul>
);

Demo.propTypes = {
  a: PropTypes.string,
  b: PropTypes.string,
  c: PropTypes.string,
  d: PropTypes.string,
};

Demo.defaultProps = {
  a: undefined,
  b: undefined,
  c: undefined,
  d: undefined,
};

export default Demo;
