import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isPromise from 'is-promise';
import { some, toPairs, fromPairs, isFunction } from './utils';

const DefaultLoadingComponent = () => null;
let DefaultErrorComponent = () => null;
try {
    // noinspection JSValidateTypes
    DefaultErrorComponent = require('redbox-react');
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
        const batch = this.props.batch;
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
                } else {
                    return [k, p];
                }
            }));
        Promise.all(promises).then((pairs) => {
            if (this.mounted) {
                this.setState({
                    resolvedProps: fromPairs(pairs),
                    error: null,
                })
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
        const { errorComponent: ErrorComponent, loadingComponent: LoadingComponent } = this.props;
        const { error, loading, resolvedProps } = this.state;
        if (loading) {
            return <LoadingComponent {...this.props} {...resolvedProps} />;
        }
        if (error) {
            return <ErrorComponent {...this.props} {...resolvedProps} error={error} />;
        }
        const { lazyProps } = this.state;
        return <Comp {...this.props} {...lazyProps} />;
    }

}

// noinspection JSUnresolvedVariable
AsyncComponent.propTypes = {
    batch: PropTypes.bool,
    asyncProps: PropTypes.object.isRequired,
    errorComponent: PropTypes.func,
    loadingComponent: PropTypes.func,
};

AsyncComponent.defaultProps = {
    batch: false,
    errorComponent: DefaultErrorComponent,
    loadingComponent: DefaultLoadingComponent,
};

export default AsyncComponent;