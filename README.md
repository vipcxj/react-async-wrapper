# react-async-wrapper &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![npm version](https://img.shields.io/npm/v/react-async-wrapper.svg?style=flat)](https://www.npmjs.com/package/react-async-wrapper)

Async component wrapper for [React](https://reactjs.org/).

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-async-wrapper
    
```javascript
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

## API

### Properties
- *batch* - **bool** `false`

  If true, only when all async props are resolved, the wrapped component is rendered again. 
  Otherwise, the wrapped component will be updated when any async prop is resolved.

- *asyncJobs* - **[ func() : (Promise\<any\> | any) ]** `[]`

  The async jobs. 
  Compared to async props, they will not provide the props to the wrapped component, 
  but they should be done before the wrapped component finally render.
  The word 'finally' means the wrapped component will be updated sevial time if 'batch' set to false.
  
- *asyncProps* - **{ property: func( progressUpdater: ( func(number):void ) ) : (Promise\<any> | any) }** `{}`

  All async props should be declared here.They should be functions. 
  If the function return a promise, it will be a real async prop, otherwise it is still a sync prop.
  The es6 async function is supported. In fact it is just a function return promise.
  The async component will provide every function with a method to update the progress which is a number range from 0 to 1.
  
- *asyncPropOpts* - **{ property: { defaultProp: any } }** `{}`

  The option of the async props. At this moment, only 'defaultProp' is supported.
  
- *asyncPropsMapper* - **func( props: { property: any } ):{ property: any }** `props => props`

  Accept the resolved async props, and return the props provide to the wrapped component.

- *syncProps* - **{ property: any }** `{}`

  The sync props. This is useful when providing component or asyncComponent prop instead of children node as wrapped component.
  
- *component* - **Component** `null`

  If specialized, the async wrapper will use this as the wrapped component instead of the children components.
  
- *asyncComponent* - **func() : ( Promise\<Component\> | Component )** `null`

  If specialized, the async wrapper will use this as the wrapped component when resolved instead of component prop and the children components.
  
- *errorComponent* - **Component** `() => null`

  This component will be used to show the error.
  
- *loadingComponent* - **Component** `() => null`

  When the async jobs and async props have not been resolved yet, this component will be rendered. 
  However, if this prop is not specialized, the wrapped component with default and partial resolved props will be rendered instead.
  
- *onError* - **func( error: any ) : void** `() => null`

  The error callback. 
  It will be called when a error is throwed 
  during the async jobs is running or the async props is resolved.
  
- *delay* - **number** : `0`

  A number greater than 0 will force the wrapped component rendering with a delay.
  