import React from 'react';
import { storiesOf } from '@storybook/react';

import { AsyncComponent } from '../src';

const sleep = async t => new Promise(resolve => setTimeout(resolve, t));
const Demo = ({a, b, c, d}) => (
    <ul>
        <li>{`a: ${a}`}</li>
        <li>{`b: ${b}`}</li>
        <li>{`b: ${c}`}</li>
        <li>{`b: ${d}`}</li>
    </ul>
);

const lazyReturn = (v, t) => async () => {
    await sleep(t);
    return v;
};

storiesOf('async component', module)
.add('without wrapped', () => <Demo a={1} b={2} c={3} d={4}/>)
.add('with basic wrapped', () => (
  <AsyncComponent asyncProps={{
      a: lazyReturn(1, 1000),
      b: lazyReturn(2, 1000),
      c: lazyReturn(3, 1000),
      d: lazyReturn(4, 1000),
  }}>
      <Demo/>
  </AsyncComponent>
));