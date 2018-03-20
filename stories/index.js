import React from 'react';
import { storiesOf } from '@storybook/react';

import { AsyncComponent } from '../src';

const sleep = async t => new Promise(resolve => setTimeout(resolve, t));
const Demo = ({a, b, c, d}) => (
    <ul>
        <li>{`a: ${a}`}</li>
        <li>{`b: ${b}`}</li>
        <li>{`c: ${c}`}</li>
        <li>{`d: ${d}`}</li>
    </ul>
);

const lazyReturn = (v, t) => async () => {
    await sleep(t);
    return v;
};

const progressReturn = (v, t) => async (updater) => {
    const step = t / 100;
    for (let i = 0; i < 100; ++i) {
        await sleep(step);
        updater(i / 100);
    }
    return v;
};

const SimpleLoading = () => "Loading ...";
const DetailLoading = ({ a, b, c, d, progress }) => (
  <ul>
      <li>{`a: ${progress.a === 1 ? a : 'Loading ...'}`}</li>
      <li>{`b: ${progress.b === 1 ? b : 'Loading ...'}`}</li>
      <li>{`c: ${progress.c === 1 ? c : 'Loading ...'}`}</li>
      <li>{`d: ${progress.d === 1 ? d : 'Loading ...'}`}</li>
  </ul>
);
const ProgressLoading = ({ a, b, c, d, progress }) => (
    <ul>
        <li>{`a: ${(progress.a * 100).toFixed()}%`}</li>
        <li>{`b: ${(progress.b * 100).toFixed()}%`}</li>
        <li>{`c: ${(progress.c * 100).toFixed()}%`}</li>
        <li>{`d: ${(progress.d * 100).toFixed()}%`}</li>
    </ul>
);

storiesOf('async component', module)
.add('without wrapped', () => <Demo a={1} b={2} c={3} d={4}/>)
.add('with basic wrapped', () => (
  <AsyncComponent loadingComponent={SimpleLoading} asyncProps={{
      a: lazyReturn(1, 1000),
      b: lazyReturn(2, 1000),
      c: lazyReturn(3, 1000),
      d: lazyReturn(4, 1000),
  }}>
      <Demo/>
  </AsyncComponent>
))
.add('with detail loading wrapped', () => (
  <AsyncComponent loadingComponent={DetailLoading} batch={false} asyncProps={{
      a: lazyReturn(1, 4000),
      b: lazyReturn(2, 3000),
      c: lazyReturn(3, 2000),
      d: lazyReturn(4, 1000),
  }}>
      <Demo/>
  </AsyncComponent>
))
.add('with progress loading wrapped', () => (
  <AsyncComponent loadingComponent={ProgressLoading} batch={false} asyncProps={{
      a: progressReturn(1, 4000),
      b: progressReturn(2, 3000),
      c: progressReturn(3, 2000),
      d: progressReturn(4, 1000),
  }}>
      <Demo/>
  </AsyncComponent>
));