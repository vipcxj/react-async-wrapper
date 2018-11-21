/* eslint-disable react/prop-types,import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import { AsyncComponent, makeAsync } from '../src';
import { sleep, progressReturn } from './utils';
import Demo, { SimpleLoading, ProgressLoading } from './Demo';
import ReloaderDemo from './ReloaderDemo';
import TableComponent from './TableComponent';
import Code from './Code';

const delayReturn = (v, t) => async () => {
  await sleep(t);
  return v;
};

// noinspection JSUnusedGlobalSymbols
const infoConfig = {
  inline: true,
  maxPropsIntoLine: 1,
  TableComponent,
  components: {
    code: Code,
  },
};

// noinspection JSUnresolvedFunction, BadExpressionStatementJS
storiesOf('async component', module)
  .addDecorator(withInfo)
  .addParameters({
    info: infoConfig,
  })
  .add(
    'demo 1',
    () => <Demo a={1} b={2} c={3} d={4} />,
    { info: 'No async wrapper.' },
  )
  .add(
    'demo 2',
    () => (
      <AsyncComponent asyncProps={{
        a: () => 1,
        b: () => 2,
        c: () => 3,
        d: () => 4,
      }}
      >
        <Demo />
      </AsyncComponent>
    ),
    { info: 'Only sync props, behavior same as the wrapped component, no async loading.' },
  )
  .add(
    'demo 3',
    () => (
      <AsyncComponent asyncProps={{
        a: delayReturn(1, 1000),
        b: delayReturn(2, 1100),
        c: delayReturn(3, 1200),
        d: delayReturn(4, 1200),
      }}
      >
        <Demo />
      </AsyncComponent>
    ),
    { info: 'With async props. No loading component. So the wrapped behavior as the loading component.' },
  )
  .add(
    'demo 4',
    () => (
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
    ),
    { info: 'With async props, default props and batch on, no loading component.' },
  )
  .add(
    'demo 5',
    () => (
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
    ),
    { info: 'With async props, default props and batch off, no loading component.' },
  )
  .add(
    'demo 6',
    () => (
      <AsyncComponent loadingComponent={SimpleLoading} delay={3000}>
        <Demo a={1} b={2} c={3} d={4} />
      </AsyncComponent>
    ),
    { info: 'With delay and a simple loading. No async jobs, props and component.' },
  )
  .add(
    'demo 7',
    () => (
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
    ),
    { info: 'Basic usage, with async props and a simple loading component.' },
  )
  .add(
    'demo 8',
    () => (
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
    ),
    {
      info: 'Show progress of async loading. '
      + 'A `progress` prop will be send to the loading component'
      + ' and the wrapped component.',
    },
  )
  .add(
    'demo 9',
    () => <ReloaderDemo />,
    {
      info: {
        source: false,
        propTables: [],
        text: 'Using reloader. ' +
        '`AsyncComponent.createReloader` will create a reloader ' +
        'which can be used to force reload.\n' +
        '```javascript\n' +
        'class ReloaderDemo extends React.PureComponent {\n' +
        '  constructor(props, context) {\n' +
        '    super(props, context);\n' +
        '    this.reloader = AsyncComponent.createReloader(this);\n' +
        '  }\n' +
        '\n' +
        '  render() {\n' +
        '    return (\n' +
        '      <div>\n' +
        '        <button onClick={() => this.reloader.reload()}>reload</button>\n' +
        '        <AsyncComponent\n' +
        '          loadingComponent={ProgressLoading}\n' +
        '          reloader={this.reloader}\n' +
        '          asyncProps={{\n' +
        '            a: progressReturn(1, 4000),\n' +
        '            b: progressReturn(2, 3000),\n' +
        '            c: progressReturn(3, 2000),\n' +
        '            d: progressReturn(4, 1000),\n' +
        '          }}\n' +
        '        >\n' +
        '          <Demo />\n' +
        '        </AsyncComponent>\n' +
        '      </div>\n' +
        '    );\n' +
        '  }\n' +
        '}' +
        '```',
      },
    },
  );

// noinspection JSUnresolvedFunction
storiesOf('make async', module)
  .addDecorator(withInfo)
  .addParameters({
    info: infoConfig,
  })
  .add(
    'demo 1',
    () => {
      const Wrapped = makeAsync({
        asyncProps: {
          a: delayReturn(1, 1000),
          b: delayReturn(2, 3000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 4000),
        },
      })(Demo);
      return <Wrapped />;
    },
    {
      info: {
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
      },
    },
  )
  .add(
    'demo 2',
    () => {
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
    },
    {
      info: {
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
      },
    },
  )
  .add(
    'demo 3',
    () => {
      const Wrapped = makeAsync({
        asyncProps: {
          a: delayReturn(1, 1000),
          b: delayReturn(2, 3000),
          c: delayReturn(3, 2000),
          d: delayReturn(4, 4000),
        },
      })(import('./AsyncDemo'));
      return <Wrapped />;
    },
    {
      info: {
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
      },
    },
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
          reloadOnUpdate
        >
          <TestUpdateWrapped />
        </AsyncComponent>
      </div>
    );
  }
}

// eslint-disable-next-line react/no-multi-comp
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
          reloadOnUpdate
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
