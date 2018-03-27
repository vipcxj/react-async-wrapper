/* eslint-disable react/prop-types,import/no-extraneous-dependencies */
import React from 'react';
import { storiesOf } from '@storybook/react';

import { AsyncComponent, makeAsync } from '../src';

const sleep = async t => new Promise(resolve => setTimeout(resolve, t));
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
const DetailLoading = ({
  a, b, c, d, progress,
}) => (
  <ul>
    <li>{`a: ${progress.a === 1 ? a : 'Loading ...'}`}</li>
    <li>{`b: ${progress.b === 1 ? b : 'Loading ...'}`}</li>
    <li>{`c: ${progress.c === 1 ? c : 'Loading ...'}`}</li>
    <li>{`d: ${progress.d === 1 ? d : 'Loading ...'}`}</li>
  </ul>
);
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
  .add('without wrapped', () => <Demo a={1} b={2} c={3} d={4} />)
  .add('sync wrapped', () => (
    <AsyncComponent asyncProps={{
        a: () => 1,
        b: () => 2,
        c: () => 3,
        d: () => 4,
    }}
    >
      <Demo />
    </AsyncComponent>
  ))
  .add('without loading', () => (
    <AsyncComponent asyncProps={{
      a: delayReturn(1, 1000),
      b: delayReturn(2, 1100),
      c: delayReturn(3, 1200),
      d: delayReturn(4, 1200),
    }}
    >
      <Demo />
    </AsyncComponent>
  ))
  .add('wo loading/with default/batch', () => (
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
  ))
  .add('wo loading/with default/no batch', () => (
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
  ))
  .add('force delay', () => (
    <AsyncComponent loadingComponent={SimpleLoading} delay={3000}>
      <Demo a={1} b={2} c={3} d={4} />
    </AsyncComponent>
  ))
  .add('basic wrapped', () => (
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
  ))
  .add('detail loading wrapped', () => (
    <AsyncComponent
      loadingComponent={DetailLoading}
      asyncProps={{
        a: delayReturn(1, 4000),
        b: delayReturn(2, 3000),
        c: delayReturn(3, 2000),
        d: delayReturn(4, 1000),
    }}
    >
      <Demo />
    </AsyncComponent>
  ))
  .add('progress loading wrapped', () => (
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
  ));

// noinspection JSUnresolvedFunction
storiesOf('make async', module)
  .add('basic usage', () => {
    const Wrapped = makeAsync({
      asyncProps: {
        a: delayReturn(1, 1000),
        b: delayReturn(2, 3000),
        c: delayReturn(3, 2000),
        d: delayReturn(4, 4000),
      },
    })(Demo);
    return <Wrapped />;
  })
  .add('async component', () => {
    const Wrapped = makeAsync({
      asyncProps: {
        a: delayReturn(1, 1000),
        b: delayReturn(2, 3000),
        c: delayReturn(3, 2000),
        d: delayReturn(4, 4000),
      },
    })(import('./AsyncDemo').then(m => m.default));
    return <Wrapped />;
  });
