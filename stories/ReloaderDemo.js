import React from 'react';
import AsyncComponent from '../src/AsyncComponent';
import Demo, { ProgressLoading } from './Demo';
import { progressReturn } from './utils';

export default class ReloaderDemo extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.reloader = AsyncComponent.createReloader(this);
  }

  render() {
    return (
      <div>
        <button onClick={() => this.reloader.reload()}>reload</button>
        <AsyncComponent
          loadingComponent={ProgressLoading}
          reloader={this.reloader}
          asyncProps={{
            a: progressReturn(1, 4000),
            b: progressReturn(2, 3000),
            c: progressReturn(3, 2000),
            d: progressReturn(4, 1000),
          }}
        >
          <Demo />
        </AsyncComponent>
      </div>
    );
  }
}
