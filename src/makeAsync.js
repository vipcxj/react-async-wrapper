import React from 'react';
import PropTypes from 'prop-types';
import isPromise from 'is-promise';
import hoistStatics from 'hoist-non-react-statics';
import AsyncComponent, { DefaultErrorComponent, DefaultLoadingComponent } from './AsyncComponent';

export default opts => (Comp) => {
  const {
    batch = false,
    asyncJobs = [],
    asyncProps = {},
    asyncPropOpts = {},
    asyncPropsMapper = props => props,
    errorComponent = DefaultErrorComponent,
    loadingComponent = DefaultLoadingComponent,
    onError = () => null,
    delay = 0,
  } = opts;
  const C = (props) => {
    const { wrappedComponentRef, ...remainingProps } = props;
    const wrapperProps = {
      batch,
      asyncJobs,
      asyncProps,
      asyncPropOpts,
      asyncPropsMapper,
      errorComponent,
      loadingComponent,
      onError,
      delay,
      syncProps: {
        ...remainingProps,
        ref: wrappedComponentRef,
      },
    };
    if (isPromise(Comp)) {
      wrapperProps.asyncComponent = () => Comp;
    } else {
      wrapperProps.component = Comp;
    }
    return <AsyncComponent {...wrapperProps} />;
  };
  C.displayName = `makeAsync(${!isPromise(Comp) ? (Comp.displayName || Comp.name) : 'Unknown'})`;
  C.propTypes = {
    // eslint-disable-next-line
    wrappedComponentRef: PropTypes.func,
  };
  return isPromise(Comp) ? C : hoistStatics(C, Comp);
};
