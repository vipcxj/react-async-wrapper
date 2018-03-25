/* eslint-disable no-shadow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isPromise from 'is-promise';
import { some, toPairs, fromPairs, isFunction, mapValues } from './utils';

const DefaultLoadingComponent = () => null;
const DefaultErrorComponent = () => null;
const SymbolJob = Symbol('job');

const majorVersion = React.version ? Number.parseInt(React.version.slice(0, React.version.indexOf('.')), 10) : 0;

class AsyncComponent extends Component {
    static updateResolvedProps = resolvedProps => preState => ({
      resolvedProps: {
        ...preState.resolvedProps,
        ...resolvedProps,
      },
      progress: {
        ...preState.progress,
        ...fromPairs(Object.keys(resolvedProps).map(k => [k, 1])),
      },
    });
    constructor(props, ...args) {
      super(props, ...args);
      this.errorComponent = null;
      this.state = {
        error: null,
        loading: true,
        resolvedProps: {},
        progress: fromPairs(Object.keys(props.asyncProps || {}).map(k => [k, 0])),
      };
    }

    componentDidMount() {
      this.mounted = true;
      this.load();
    }

    componentWillUnmount() {
      this.mounted = false;
    }
    updateProgress = propName => progress => this.setState({
      progress: {
        ...this.state.progress,
        [propName]: progress,
      },
    });
    loadSuccess = (pairs) => {
      if (this.mounted) {
        this.setState({
          resolvedProps: fromPairs(pairs),
          progress: fromPairs(pairs.map(([k]) => [k, 1])),
          error: null,
          loading: false,
        });
      } else {
        this.state.resolvedProps = fromPairs(pairs);
        this.state.progress = fromPairs(pairs.map(([k]) => [k, 1]));
        this.state.error = null;
        this.state.loading = false;
      }
    };
    load() {
      const {
        asyncJobs, asyncProps, onError, delay,
      } = this.props;
      try {
        let pairs = [
          ...(asyncJobs || []).map(job => [SymbolJob, job]),
          ...toPairs(asyncProps || {}),
        ].filter(entry => entry[1]);
        if (some(pairs, entry => !isFunction(entry[1]))) {
          const error = new Error('The async job or async prop must be a function.');
          this.setState({
            error,
            loading: false,
          });
          if (onError) {
            onError(error);
          }
          return;
        }
        const { batch } = this.props;
        pairs = pairs.map(([k, v]) => ([k, v(this.updateProgress(k))]));
        if (delay > 0) {
          pairs.push([SymbolJob, new Promise(resolve => setTimeout(resolve, delay))]);
        }
        if (some(pairs, pair => isPromise(pair[1]))) {
          const promises = pairs.map(([k, p]) => {
            if (isPromise(p)) {
              return p.then((res) => {
                if (!batch && typeof k !== 'symbol') {
                  if (this.mounted) {
                    this.setState(AsyncComponent.updateResolvedProps({
                      [k]: res,
                    }));
                  } else {
                    this.state.resolvedProps[k] = res;
                    this.state.progress[k] = 1;
                  }
                }
                return [k, res];
              });
            }
            if (!batch && typeof k !== 'symbol') {
              this.setState(AsyncComponent.updateResolvedProps({
                [k]: p,
              }));
            }
            return [k, p];
          });
          Promise.all(promises).then((pairs) => {
            this.loadSuccess(pairs.filter(([k]) => typeof k !== 'symbol'));
          }).catch((e) => {
            if (this.mounted) {
              this.setState({
                error: e,
              });
            } else {
              this.state.error = e;
            }
            if (onError) {
              onError(e);
            }
          }).finally(() => {
            if (this.mounted) {
              this.setState({
                loading: false,
              });
            } else {
              this.state.loading = false;
            }
          });
        } else {
          this.loadSuccess(pairs.filter(([k]) => typeof k !== 'symbol'));
        }
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    }

    render() {
      const {
        errorComponent: ErrorComponent,
        loadingComponent: LoadingComponent,
        asyncPropOpts,
        asyncPropsMapper,
        component: Comp,
        children, // eslint-disable-line react/prop-types
      } = this.props;
      const {
        error, loading, resolvedProps, progress,
      } = this.state;
      const wrappedProps = asyncPropsMapper(Object.assign(
        {},
        mapValues(asyncPropOpts, opt => opt.defaultProp, opt => opt && opt.defaultProp),
        resolvedProps,
      ));
      const { children: ignored, ...restResolvedProps } = wrappedProps;
      if (loading && LoadingComponent !== DefaultLoadingComponent) {
        return <LoadingComponent {...this.props} {...restResolvedProps} progress={progress} />;
      }
      if (error) {
        return <ErrorComponent {...this.props} {...restResolvedProps} progress={progress} error={error} />;
      }
      if (Comp) {
        return <Comp {...wrappedProps} progress={progress} />;
      }
      // noinspection JSUnresolvedFunction JSCheckFunctionSignatures
      const newChildren = React.Children
        .map(children, child => React.cloneElement(child, restResolvedProps));
      if (newChildren.length === 1) {
        return newChildren[0];
      } else if (newChildren.length > 1) {
        return majorVersion >= 16 ? newChildren : <div> {newChildren} </div>;
      }
      return null;
    }
}

const {
  any,
  bool,
  number,
  objectOf,
  func,
  oneOfType,
  arrayOf,
  element,
  shape,
} = PropTypes;

AsyncComponent.propTypes = {
  batch: bool,
  asyncJobs: arrayOf(func),
  asyncProps: objectOf(func),
  asyncPropOpts: objectOf(shape({
    defaultProp: any,
  })),
  asyncPropsMapper: func,
  component: func,
  children: oneOfType([element, arrayOf(element)]),
  errorComponent: func,
  loadingComponent: func,
  onError: func,
  delay: number,
};

AsyncComponent.defaultProps = {
  batch: false,
  asyncJobs: [],
  asyncProps: {},
  asyncPropOpts: {},
  asyncPropsMapper: props => props,
  component: null,
  children: null,
  errorComponent: DefaultErrorComponent,
  loadingComponent: DefaultLoadingComponent,
  onError: () => null,
  delay: 0,
};

export default AsyncComponent;
