### react-async-concurrent

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/audi2014/react-async-concurrent/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@audi2014/react-async-concurrent.svg?style=flat)](https://www.npmjs.com/package/@audi2014/react-async-concurrent)
[![npm](https://img.shields.io/npm/dw/@audi2014/react-async-concurrent.svg)](https://www.npmjs.com/package/@audi2014/react-async-concurrent)
![](https://img.shields.io/bundlephobia/min/@audi2014/react-async-concurrent.svg?style=flat)
![](https://img.shields.io/github/languages/code-size/audi2014/react-async-concurrent.svg?style=flat)
---

## Dummy package for declarative(JSX) sequential promise execution

```tsx
...
<Async promiseFn={promiseFn}>{render}</Async> // this promiseFn starts at first
<Async promiseFn={promiseFn}>{render}</Async> // starts after finishing first
<Async promiseFn={promiseFn}>{render}</Async> // starts after finishing seccond
...
```

### Index

- [async](#Async)
  - Async
- [context](#Context)
  - AsyncRoot
  - contextAsync

### Async

Component (wrapper) which will put promise result into
children ([FaCC](https://reactpatterns.js.org/docs/function-as-child-component))
or [renderResult function](https://reactpatterns.js.org/docs/function-as-prop-component)

#### Props

- **renderPending** ({status: `pending`}) - optional callback for rendering `pending` status:
  (promiseFn was not called or canceled. Component is waiting for finishing other concurrent promises)
- **renderProgress** ({status: `progress`}) - optional callback for rendering `progress` status:
  (promiseFn was called but promise did not fulfilled yet)
- **renderError** ({error, status: `error`}) - optional callback for rendering `error` status:
    (promiseFn promise throws error)
- **promiseFn** - function callback that should create new promise. 
  will be called if all child promises resolved.
  supports cancelable promises such as [cancelable-promise](https://github.com/alkemics/CancelablePromise)
- **children** - FaCC with arguments {lastResult/result:"Awaited result of promiseFn", status: `pending`|`progress`|`error`|`result`}
  if children is set - renderers renderPending/renderProgress/renderError/renderResult will be ignored
- asyncStart - do not wait for finishing concurrent promises. call **promiseFn** immediately
- asyncChildren - children will have parallel concurrent context
- awaited - promiseFn will not block other concurrent promises 

#### Example

https://qz8j6h.csb.app/

[![Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/audi2014-react-async-concurrent-demo-qz8j6h)

---

# Bugs

- React.StrictMode runs all promiseFn at first render in codesandbox env

---

[subpath imports support](./docs/subpath-imports.md) (ESM/CommonJs)
