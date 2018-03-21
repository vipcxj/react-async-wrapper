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

const delayReturn = (v, t) => async () => {
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

// noinspection JSUnresolvedFunction
storiesOf('async component', module)
  .add('without wrapped', () => <Demo a={1} b={2} c={3} d={4}/>)
  .add('sync wrapped', () => (
    <AsyncComponent asyncProps={{
        a: () => 1,
        b: () => 2,
        c: () => 3,
        d: () => 4,
    }}>
        <Demo/>
    </AsyncComponent>
  ))
  .add('force delay', () => (
    <AsyncComponent loadingComponent={SimpleLoading} delay={3000}>
        <Demo a={1} b={2} c={3} d={4}/>
    </AsyncComponent>
  ))
  .add('basic wrapped', () => (
    <AsyncComponent loadingComponent={SimpleLoading} asyncProps={{
        a: delayReturn(1, 1000),
        b: delayReturn(2, 1000),
        c: delayReturn(3, 1000),
        d: delayReturn(4, 1000),
    }}>
        <Demo/>
    </AsyncComponent>
  ))
  .add('detail loading wrapped', () => (
    <AsyncComponent loadingComponent={DetailLoading} batch={false} asyncProps={{
        a: delayReturn(1, 4000),
        b: delayReturn(2, 3000),
        c: delayReturn(3, 2000),
        d: delayReturn(4, 1000),
    }}>
        <Demo/>
    </AsyncComponent>
  ))
  .add('progress loading wrapped', () => (
    <AsyncComponent loadingComponent={ProgressLoading} batch={false} asyncProps={{
        a: progressReturn(1, 4000),
        b: progressReturn(2, 3000),
        c: progressReturn(3, 2000),
        d: progressReturn(4, 1000),
    }}>
        <Demo/>
    </AsyncComponent>
  ));