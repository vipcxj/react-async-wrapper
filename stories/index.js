/* eslint-disable react/prop-types,import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import { AsyncComponent, makeAsync } from '../src';
import Demo from './Demo';

const sleep = async t => new Promise(resolve => setTimeout(resolve, t));

const delayReturn = (v, t) => async () => {
  await sleep(t);
  return v;
};

const progressReturn = (v, t) => async (updater) => {
  const step = t / 100;
  for (let i = 0; i < 100; ++i) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(step);
    updater(i / 100);
  }
  return v;
};

const SimpleLoading = () => 'Loading ...';
const ProgressLoading = ({
  progress,
}) => (
  <ul>
    <li>{`a: ${(progress.a * 100).toFixed()}%`}</li>
    <li>{`b: ${(progress.b * 100).toFixed()}%`}</li>
    <li>{`c: ${(progress.c * 100).toFixed()}%`}</li>
    <li>{`d: ${(progress.d * 100).toFixed()}%`}</li>
  </ul>
);

// noinspection JSUnresolvedFunction
storiesOf('async component', module)
  .add(
    'demo 1',
    withInfo('No async wrapper.')(() => <Demo a={1} b={2} c={3} d={4} />),
  )
  .add(
    'demo 2',
    withInfo('Only sync props, behavior same as the wrapped component, no async loading.')(() => (
      <AsyncComponent asyncProps={{
        a: () => 1,
        b: () => 2,
        c: () => 3,
        d: () => 4,
      }}
      >
        <Demo />
      </AsyncComponent>
    )),
  )
  .add(
    'demo 3',
    withInfo('With async props. No loading component. So the wrapped behavior as the loading component.')(() => (
      <AsyncComponent asyncProps={{
        a: delayReturn(1, 1000),
        b: delayReturn(2, 1100),
        c: delayReturn(3, 1200),
        d: delayReturn(4, 1200),
      }}
      >
        <Demo />
      </AsyncComponent>
    )),
  )
  .add(
    'demo 4',
    withInfo('With async props, default props and batch on, no loading component.')(() => (
      <AsyncComponent
        asyncProps={{
          a: delayReturn(1, 500),
          b: delayReturn(2, 1000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 1500),
        }}
        asyncPropOpts={{
          a: { defaultProp: 'Loading' },
          b: { defaultProp: 'Loading' },
          c: { defaultProp: 'Loading' },
          d: { defaultProp: 'Loading' },
        }}
        batch
      >
        <Demo />
      </AsyncComponent>
    )),
  )
  .add(
    'demo 5',
    withInfo('With async props, default props and batch off, no loading component.')(() => (
      <AsyncComponent
        asyncProps={{
          a: delayReturn(1, 500),
          b: delayReturn(2, 1000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 1500),
        }}
        asyncPropOpts={{
          a: { defaultProp: 'Loading' },
          b: { defaultProp: 'Loading' },
          c: { defaultProp: 'Loading' },
          d: { defaultProp: 'Loading' },
        }}
        batch={false}
      >
        <Demo />
      </AsyncComponent>
    )),
  )
  .add(
    'demo 6',
    withInfo('With delay and a simple loading. No async jobs, props and component.')(() => (
      <AsyncComponent loadingComponent={SimpleLoading} delay={3000}>
        <Demo a={1} b={2} c={3} d={4} />
      </AsyncComponent>
    )),
  )
  .add(
    'demo 7',
    withInfo('Basic usage, with async props and a simple loading component.')(() => (
      <AsyncComponent
        loadingComponent={SimpleLoading}
        asyncProps={{
          a: delayReturn(1, 1000),
          b: delayReturn(2, 1000),
          c: delayReturn(3, 1000),
          d: delayReturn(4, 1000),
        }}
      >
        <Demo />
      </AsyncComponent>
    )),
  )
  .add(
    'demo 8',
    withInfo('Show progress of async loading. '
      + 'A `progress` prop will be send to the loading component'
      + ' and the wrapped component.')(() => (
        <AsyncComponent
          loadingComponent={ProgressLoading}
          asyncProps={{
          a: progressReturn(1, 4000),
          b: progressReturn(2, 3000),
          c: progressReturn(3, 2000),
          d: progressReturn(4, 1000),
        }}
        >
          <Demo />
        </AsyncComponent>
    )),
  );

// noinspection JSUnresolvedFunction
storiesOf('make async', module)
  .add(
    'demo 1',
    withInfo({
      source: false,
      propTables: [],
      text: 'Basic usage, just with async props.\n' +
      '```javascript\n' +
      'makeAsync({\n' +
      '  asyncProps: {\n' +
      '    a: delayReturn(1, 1000),\n' +
      '    b: delayReturn(2, 3000),\n' +
      '    c: delayReturn(3, 2000),\n' +
      '    d: delayReturn(4, 4000),\n' +
      '  },\n' +
      '})(Demo)' +
      '```',
    })(() => {
      const Wrapped = makeAsync({
        asyncProps: {
          a: delayReturn(1, 1000),
          b: delayReturn(2, 3000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 4000),
        },
      })(Demo);
      return <Wrapped />;
    }),
  )
  .add(
    'demo 2',
    withInfo({
      source: false,
      text: 'With async props and using async component as wrapped component.\n' +
      'With unwrapDefault off. So we should be careful to use `m.default`.\n' +
      '```javascript\n' +
      'const Wrapped = makeAsync({\n' +
      '  asyncProps: {\n' +
      '    a: delayReturn(1, 1000),\n' +
      '    b: delayReturn(2, 3000),\n' +
      '    c: delayReturn(3, 2000),\n' +
      '    d: delayReturn(4, 4000),\n' +
      '  },\n' +
      '  unwrapDefault: false,\n' +
      '})(import(\'./AsyncDemo\').then(m => m.default));\n' +
      'return <Wrapped />;\n' +
      '```',
    })(() => {
      const Wrapped = makeAsync({
        asyncProps: {
          a: delayReturn(1, 1000),
          b: delayReturn(2, 3000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 4000),
        },
        unwrapDefault: false,
      })(import('./AsyncDemo').then(m => m.default));
      return <Wrapped />;
    }),
  )
  .add(
    'demo 3',
    withInfo({
      source: false,
      text: 'With async props and using async component as wrapped component.\n' +
      'With unwrapDefault on. So we can use the promise returned by dynamic directly.\n' +
      '```javascript\n' +
      'const Wrapped = makeAsync({\n' +
      '  asyncProps: {\n' +
      '    a: delayReturn(1, 1000),\n' +
      '    b: delayReturn(2, 3000),\n' +
      '    c: delayReturn(3, 2000),\n' +
      '    d: delayReturn(4, 4000),\n' +
      '  },\n' +
      '})(import(\'./AsyncDemo\'));\n' +
      'return <Wrapped />;\n' +
      '```',
    })(() => {
      const Wrapped = makeAsync({
        asyncProps: {
          a: delayReturn(1, 1000),
          b: delayReturn(2, 3000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 4000),
        },
      })(import('./AsyncDemo'));
      return <Wrapped />;
    }),
  );

const TestUpdateWrapped = ({ value, loading }) => (
  <div>
    { loading ? (<span>Loading ... <br /></span>) : null }
    { `value: ${value}` }
  </div>
);

class TestUpdate extends React.Component {
  state = {
    value: 0,
  };
  asyncProps = {
    value: async () => {
      await sleep(500);
      return this.state.value;
    },
  };
  asyncPropOpts = {
    value: {
      defaultProp: '',
    },
  };
  render() {
    const cb = () => {
      // noinspection JSCheckFunctionSignatures
      this.setState(state => ({ value: state.value + 1 }));
    };
    return (
      <div>
        <button onClick={cb}>Click me</button>
        <AsyncComponent
          asyncProps={this.asyncProps}
          asyncPropOpts={this.asyncPropOpts}
        >
          <TestUpdateWrapped />
        </AsyncComponent>
      </div>
    );
  }
}

class TestUpdateWithDependent extends React.Component {
  state = {
    value: 0,
  };
  asyncProps = {
    value: async () => {
      await sleep(500);
      return this.state.value;
    },
  };
  asyncPropOpts = {
    value: {
      defaultProp: '',
    },
  };
  render() {
    const cb = () => {
      // noinspection JSCheckFunctionSignatures
      this.setState(state => ({ value: state.value + 1 }));
    };
    return (
      <div>
        <button onClick={cb}>Click me</button>
        <AsyncComponent
          asyncProps={this.asyncProps}
          asyncPropOpts={this.asyncPropOpts}
          reloadOnUpdate
          reloadDependents={{ value: this.state.value }}
        >
          <TestUpdateWrapped />
        </AsyncComponent>
      </div>
    );
  }
}

// eslint-disable-next-line react/no-multi-comp
class TestUpdateWithWrong extends React.Component {
  state = {
    value: 0,
  };
  asyncPropOpts = {
    value: {
      defaultProp: '',
    },
  };
  render() {
    const cb = () => {
      // noinspection JSCheckFunctionSignatures
      this.setState(state => ({ value: state.value + 1 }));
    };
    return (
      <div>
        <button onClick={cb}>Click me</button>
        <AsyncComponent
          asyncProps={{
            value: delayReturn(this.state.value, 500),
          }}
          asyncPropOpts={this.asyncPropOpts}
        >
          <TestUpdateWrapped />
        </AsyncComponent>
      </div>
    );
  }
}

storiesOf('update async component', module)
  .add('test update', () => (<TestUpdate />))
  .add('test update with dependent', () => (<TestUpdateWithDependent />))
  .add('test update with wrong', () => (<TestUpdateWithWrong />));
