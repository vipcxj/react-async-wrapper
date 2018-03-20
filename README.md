# react-async-wrapper &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![npm version](https://img.shields.io/npm/v/react-async-wrapper.svg?style=flat)](https://www.npmjs.com/package/react-async-wrapper)

Async component wrapper for [React](https://reactjs.org/).

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-async-wrapper
    
```jsx harmony
import { AsyncComponent } from 'react-async-wrapper';

//js version sleep.
const sleep = async t => new Promise(resolve => setTimeout(resolve, t));
//the component to be wrapped.
const Demo = ({a, b, c, d}) => (
    <ul>
        <li>{`a: ${a}`}</li>
        <li>{`b: ${b}`}</li>
        <li>{`c: ${c}`}</li>
        <li>{`d: ${d}`}</li>
    </ul>
);
//a function creator, which create a function accept a method for updating the progress and return a promise.
const progressReturn = (v, t) => async (updater) => {
    const step = t / 100;
    for (let i = 0; i < 100; ++i) {
        await sleep(step);
        updater(i / 100);
    }
    return v;
};
//a loading component, which accepts all resolved prop and their progress.
const ProgressLoading = ({ a, b, c, d, progress }) => (
    <ul>
        <li>{`a: ${(progress.a * 100).toFixed()}%`}</li>
        <li>{`b: ${(progress.b * 100).toFixed()}%`}</li>
        <li>{`c: ${(progress.c * 100).toFixed()}%`}</li>
        <li>{`d: ${(progress.d * 100).toFixed()}%`}</li>
    </ul>
);

export const AsyncDemo = () => {
    return (
        <AsyncComponent
         loadingComponent={ProgressLoading} //component show when loading
         batch={false} //if true, only when all props resolved, the wrapped component will be render.
         asyncProps={{ //async props
            a: progressReturn(1, 4000), //must be a function. async function means async props.
            b: progressReturn(2, 3000), //the function can accept a optional progress updater method.
            c: progressReturn(3, 2000),
            d: progressReturn(4, 1000),
            e: () => 1, //a function return constant is also permit, which cause the prop is sync.
        }}>
            <Demo/>
        </AsyncComponent>
    );
};
//if all props is sync, the component behavior the same as wrapped component.

```
