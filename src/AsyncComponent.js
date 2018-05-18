/* eslint-disable no-shadow */
import React from 'react';
import PropTypes from 'prop-types';
import isPromise from 'is-promise';
import { some, toPairs, fromPairs, isFunction, mapValues } from './utils';

const isStateless = Component => !Component.prototype || !Component.prototype.render;
export const DefaultLoadingComponent = () => null;
export const DefaultErrorComponent = () => null;
const SymbolComp = Symbol('component');
const SymbolJob = Symbol('job');

const majorVersion = React.version ? Number.parseInt(React.version.slice(0, React.version.indexOf('.')), 10) : 0;

export function shallowEqual(o1, o2, excludes = []) {
  if (o1 === o2) {
    return true;
  }
  if (typeof o1 !== 'object' || typeof o2 !== 'object' || o1 === null || o2 === null) {
    return false;
  }
  if (Array.isArray(o1) && Array.isArray(o2)) {
    const len = o1.length;
    if (len !== o2.length) {
      return false;
    }
    for (let i = 0; i < len; ++i) {
      if (o1[i] !== o2[i]) {
        return false;
      }
    }
    return true;
  }
  const keys1 = Object.keys(o1);
  const keys2 = Object.keys(o2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let i = 0; i < keys1.length; ++i) {
    const key = keys1[i];
    if (!excludes.includes(key) && (!keys2.includes(key) || o1[key] !== o2[key])) {
      return false;
    }
  }
  return true;
}

class AsyncComponent extends React.PureComponent {
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
    this.state = {
      error: null,
      loading: true,
      resolvedProps: {},
      component: null,
      progress: fromPairs(Object.keys(props.asyncProps || {}).map(k => [k, 0])),
    };
  }
  componentDidMount() {
    this.mounted = true;
    this.load();
  }
  componentWillReceiveProps(nextProps) {
    // noinspection JSUnresolvedFunction
    if (nextProps.reloader && nextProps.reloader.isReload()) {
      // noinspection JSUnresolvedFunction
      nextProps.reloader.resetReload();
      if (!this.state.loading) {
        this.load();
      }
    }
    if (nextProps.reloadOnUpdate && !this.state.loading) {
      if (nextProps.reloadDependents === null || nextProps.reloadDependents === undefined) {
        if (!shallowEqual(this.props, nextProps, [
          'batch', 'errorComponent', 'loadingComponent',
          'onError', 'delay', 'reloadOnUpdate', 'reloadDependents', 'reloader',
        ])) {
          this.load();
        }
      } else if (!shallowEqual(this.props.reloadDependents, nextProps.reloadDependents)) {
        this.load();
      }
    }
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  setStateSafe = (newState) => {
    if (this.mounted) {
      this.setState(newState);
    } else {
      Object.assign(this.state, newState);
    }
  };
  // noinspection JSCheckFunctionSignatures
  updateProgress = propName => progress => this.setState(preState => ({
    progress: {
      ...preState.progress,
      [propName]: progress,
    },
  }));
  loadSuccess = (pairs) => {
    let compPair = null;
    for (let i = 0; i < pairs.length; ++i) {
      const [k] = pairs[i];
      if (k === SymbolComp) {
        [compPair] = pairs.splice(i, 1);
      }
    }
    const newState = {
      resolvedProps: fromPairs(pairs),
      progress: fromPairs(pairs.map(([k]) => [k, 1])),
      error: null,
      loading: false,
    };
    if (compPair) {
      [, newState.component] = compPair;
    }
    this.setStateSafe(newState);
  };
  load() {
    const {
      asyncComponent, asyncJobs, asyncProps, onError, delay,
    } = this.props;
    this.setStateSafe({
      error: null,
      loading: true,
      progress: fromPairs(Object.keys(asyncProps || {}).map(k => [k, 0])),
    });
    try {
      let pairs = [
        ...(asyncComponent ? [[SymbolComp, asyncComponent]] : []),
        ...(asyncJobs || []).map(job => [SymbolJob, job]),
        ...toPairs(asyncProps || {}),
      ].filter(entry => entry[1]);
      if (some(pairs, entry => !isFunction(entry[1]))) {
        const error = new Error('The async job or async prop must be a function.');
        // noinspection JSCheckFunctionSignatures
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
      pairs = pairs.map(([k, v]) => ([k, v(typeof k !== 'symbol' ? this.updateProgress(k) : null)]));
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
              if (!batch && k === SymbolComp) {
                this.setStateSafe({
                  component: res,
                });
              }
              return [k, res];
            });
          }
          if (!batch && typeof k !== 'symbol') {
            this.setState(AsyncComponent.updateResolvedProps({
              [k]: p,
            }));
          }
          if (!batch && k === SymbolComp) {
            // noinspection JSCheckFunctionSignatures
            this.setState({
              component: p,
            });
          }
          return [k, p];
        });
        Promise.all(promises).then((pairs) => {
          this.loadSuccess(pairs.filter(([k]) => typeof k !== 'symbol'));
        }).catch((e) => {
          try {
            if (onError) {
              onError(e);
            }
          } finally {
            this.setStateSafe({
              error: e,
            });
          }
        }).finally(() => {
          this.setStateSafe({
            loading: false,
          });
        });
      } else {
        this.loadSuccess(pairs.filter(([k]) => typeof k !== 'symbol'));
      }
    } catch (error) {
      try {
        if (onError) {
          onError(error);
        }
      } finally {
        this.setStateSafe({ loading: false });
      }
    }
  }

  render() {
    const {
      errorComponent: ErrorComponent,
      loadingComponent: LoadingComponent,
      asyncPropOpts,
      asyncPropsMapper,
      asyncComponent,
      children, // eslint-disable-line react/prop-types
      unwrapDefault,
    } = this.props;
    let { syncProps } = this.props;
    let { component: Comp } = this.props;
    const {
      error, loading, resolvedProps, progress,
    } = this.state;
    let wrappedProps = asyncPropsMapper(Object.assign(
      {},
      mapValues(asyncPropOpts, opt => opt.defaultProp, opt => opt && {}.hasOwnProperty.call(opt, 'defaultProp')),
      resolvedProps,
    ));
    let ref;
    if ({}.hasOwnProperty.call(syncProps, 'ref')) {
      ({ ref, ...syncProps } = syncProps);
    }
    if ({}.hasOwnProperty.call(wrappedProps, 'ref')) {
      ({ ref, ...wrappedProps } = wrappedProps);
    }
    const { children: ignored, ...restResolvedProps } = wrappedProps;
    if (loading && LoadingComponent !== DefaultLoadingComponent) {
      return <LoadingComponent {...this.props} {...restResolvedProps} loading={loading} progress={progress} />;
    }
    if (error) {
      return (
        <ErrorComponent
          {...this.props}
          {...restResolvedProps}
          loading={loading}
          progress={progress}
          error={error}
        />
      );
    }
    if (asyncComponent) {
      if (this.state.component) {
        Comp = this.state.component;
      } else {
        return null;
      }
    }
    if (Comp) {
      if (unwrapDefault) {
        // eslint-disable-next-line no-underscore-dangle
        Comp = Comp.default || Comp;
      }
      return (!isStateless(Comp) && ref)
        ? <Comp {...(syncProps || {})} {...wrappedProps} ref={ref} loading={loading} progress={progress} />
        : <Comp {...(syncProps || {})} {...wrappedProps} loading={loading} progress={progress} />;
    }
    // noinspection JSUnresolvedFunction JSCheckFunctionSignatures
    const newChildren = React.Children
      .map(children, child => React.cloneElement(child, {
        ...(syncProps || {}),
        ...restResolvedProps,
        loading,
        progress,
      }));
    if (!newChildren) {
      return null;
    }
    if (newChildren.length === 1) {
      return newChildren[0];
    } else if (newChildren.length > 1) {
      return majorVersion >= 16 ? newChildren : <div> {newChildren} </div>;
    }
    return null;
  }
}

AsyncComponent.createReloader = (compInst) => {
  let forceReload = false;
  return {
    reload() {
      forceReload = true;
      compInst.setState({
        __reloader__3yPbia72w46: {},
      });
    },
    isReload() {
      return forceReload;
    },
    resetReload() {
      forceReload = false;
    },
  };
};

const {
  any,
  bool,
  number,
  object,
  objectOf,
  func,
  oneOfType,
  arrayOf,
  element,
  shape,
} = PropTypes;

AsyncComponent.propTypes = {
  /** If true, only when all async props are resolved, the wrapped component is rendered again.
   Otherwise, the wrapped component will be updated when any async prop is resolved. */
  batch: bool,
  /** The async jobs.
   Compared to async props, they will not provide the props to the wrapped component,
   but they should be done before the wrapped component finally render.
   The word 'finally' means the wrapped component will be updated several time if 'batch' set to false. */
  asyncJobs: arrayOf(func),
  /** All async props should be declared here.They should be functions.
   If the function return a promise, it will be a real async prop,
   otherwise it is still a sync prop.
   The es6 async function is supported. In fact it is just a function return promise.
   The async component will provide every function with a method to update the progress
   which is a number range from 0 to 1. */
  asyncProps: objectOf(func),
  /** The option of the async props. At this moment, only 'defaultProp' is supported. */
  asyncPropOpts: objectOf(shape({
    defaultProp: any,
  })),
  /** Accept the resolved async props, and return the props provide to the wrapped component. */
  asyncPropsMapper: func,
  /** The sync props.
   *  This is useful when providing component or asyncComponent prop
   *  instead of children node as wrapped component. */
  syncProps: objectOf(any),
  /** If specialized, the async wrapper will use this as the wrapped component
   *  instead of the children components. */
  component: oneOfType([func, object]),
  /** If specialized, the async wrapper will use this as the wrapped component
   *  when resolved instead of component prop and the children components. */
  asyncComponent: func,
  children: oneOfType([element, arrayOf(element)]),
  /** This component will be used to show the error. */
  errorComponent: oneOfType([func, object]),
  /** When the async jobs and async props have not been resolved yet, this component will be rendered.
   However, if this prop is not specialized,
   the wrapped component with default and partial resolved props will be rendered instead. */
  loadingComponent: oneOfType([func, object]),
  /** The error callback.
   It will be called when a error is throwed
   during the async jobs is running or the async props is resolved. */
  onError: func,
  /** A number greater than 0 will force the wrapped component rendering with a delay. */
  delay: number,
  /** Useful when provide the asyncComponent with dynamic import method.
   * The dynamic import method return a promise resolving a module object.
   * However, we often need the module.default instead of the module itself.
   * This option make the wrapper try to use module.default when available */
  unwrapDefault: bool,
  /**
   * Whether to reload the date when the AsyncComponent is updated.
   */
  reloadOnUpdate: bool,
  /**
   * The dependents which using to decide whether to reload. Shallow equal is used to compare changed.
   * Only valid when reloadOnUpdate is true.
   * If set null or undefined, means use all props to decide.
   */
  reloadDependents: objectOf(any),
  /**
   * An object create by `AsyncComponent.createReloader`,
   * The api `reloader.reload()` can be used to force a reload task.
   */
  reloader: shape({
    reload: func,
    isReload: func,
    resetReload: func,
  }),
};

AsyncComponent.defaultProps = {
  batch: false,
  asyncJobs: [],
  asyncProps: {},
  asyncPropOpts: {},
  asyncPropsMapper: props => props,
  syncProps: {},
  component: null,
  asyncComponent: null,
  children: null,
  errorComponent: DefaultErrorComponent,
  loadingComponent: DefaultLoadingComponent,
  onError: () => null,
  delay: 0,
  unwrapDefault: true,
  reloadOnUpdate: false,
  reloadDependents: null,
  reloader: null,
};

export default AsyncComponent;
