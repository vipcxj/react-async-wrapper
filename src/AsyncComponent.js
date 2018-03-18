/* eslint-disable no-shadow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isPromise from 'is-promise';
import { some, toPairs, fromPairs, isFunction } from './utils';

const DefaultLoadingComponent = () => null;
let DefaultErrorComponent = () => null;
try {
    // noinspection JSValidateTypes
    DefaultErrorComponent = require('redbox-react'); // eslint-disable-line import/no-extraneous-dependencies,global-require
// eslint-disable-next-line no-empty
} catch (e) {}

class AsyncComponent extends Component {
    static updateResolvedProps = resolvedProps => preState => ({
        resolvedProps: {
            ...preState.resolvedProps,
            ...resolvedProps,
        },
    });
    constructor(...args) {
        super(...args);
        this.errorComponent = null;
        this.state = {
            error: null,
            loading: true,
            resolvedProps: {},
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.load();
    }
    componentWillUpdate() {
        this.mounted = false;
    }
    load() {
        const pairs = toPairs(this.props.asyncProps || {})
            .filter(entry => entry[1]);
        if (some(pairs, entry => !isFunction(entry[1]))) {
            this.setState({
                error: new Error('The prop of asyncProps must be a function.'),
                loading: false,
            });
            return;
        }
        const { batch } = this.props;
        const promises = pairs.map(([k, v]) => new Promise(resolve => resolve([k, v()]))
            .then(([k, p]) => {
                if (isPromise(p)) {
                    return p.then((res) => {
                        if (!batch) {
                            if (this.mounted) {
                                this.setState(AsyncComponent.updateResolvedProps({
                                    k: res,
                                }));
                            } else {
                                this.state.resolvedProps[k] = res;
                            }
                        }
                        return [k, res];
                    });
                }
                return [k, p];
            }));
        Promise.all(promises).then((pairs) => {
            if (this.mounted) {
                this.setState({
                    resolvedProps: fromPairs(pairs),
                    error: null,
                });
            } else {
                this.state.resolvedProps = fromPairs(pairs);
                this.state.error = null;
            }
        }).catch((e) => {
            if (this.mounted) {
                this.setState({
                    error: e,
                });
            } else {
                this.state.error = e;
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
    }

    render() {
        const {
            errorComponent: ErrorComponent,
            loadingComponent: LoadingComponent,
            component: Comp,
            children, // eslint-disable-line react/prop-types
        } = this.props;
        const { error, loading, resolvedProps } = this.state;
        if (loading) {
            return <LoadingComponent {...this.props} {...resolvedProps} />;
        }
        if (error) {
            return <ErrorComponent {...this.props} {...resolvedProps} error={error} />;
        }
        if (Comp) {
            return <Comp {...this.props} {...resolvedProps} />;
        }
        // noinspection JSUnresolvedFunction JSCheckFunctionSignatures
        const newChildren = React.Children
            .map(children, child => React.cloneElement(child, resolvedProps));
        if (newChildren.length === 1) {
            return newChildren[0];
        } else if (newChildren.length > 1) {
            return <div>{ newChildren }</div>;
        }
        return null;
    }
}

const {
    bool,
    object,
    func,
    oneOfType,
    arrayOf,
    element,
} = PropTypes;

AsyncComponent.propTypes = {
    batch: bool,
    // eslint-disable-next-line react/forbid-prop-types
    asyncProps: object.isRequired,
    component: func,
    children: oneOfType([element, arrayOf(element)]),
    errorComponent: func,
    loadingComponent: func,
};

AsyncComponent.defaultProps = {
    batch: false,
    component: null,
    children: null,
    errorComponent: DefaultErrorComponent,
    loadingComponent: DefaultLoadingComponent,
};

export default AsyncComponent;
