import React from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

class Code extends React.Component {
  componentDidMount() {
    this.highlightCode();
  }
  componentDidUpdate() {
    this.highlightCode();
  }
  setRef = (el) => {
    this.codeEl = el;
  };
  highlightCode = () => {
    hljs.highlightBlock(this.codeEl);
  };

  render() {
    return (
      <pre>
        <code
          ref={this.setRef}
          className={cs({
            [`language-${this.props.language}`]: !!this.props.language,
          })}
        >
          { this.props.value || this.props.code || null }
        </code>
      </pre>
    );
  }
}

Code.propTypes = {
  value: PropTypes.string,
  code: PropTypes.node,
  language: PropTypes.string,
};

Code.defaultProps = {
  language: '',
};

export default Code;
