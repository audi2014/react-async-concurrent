import React, { useContext, useEffect, useRef, useState } from 'react';

import { AsyncRoot } from '../context/AsyncRoot';
import { contextAsync } from '../context/contextAsync';
import { PromiseFn, PropsType, StateType } from './types';

export const Async = <TaskResult,>({
  asyncStart = false,
  asyncChildren = false,
  awaited = true,
  promiseFn,
  ...rest
}: PropsType<TaskResult>) => {
  const context = useContext(contextAsync);
  const taskRef = useRef<PromiseFn<TaskResult>>();
  const cancelTaskPromiseRef = useRef<() => void>();
  const resolveNextRef = useRef<() => void>();
  const [state, setState] = useState<StateType<TaskResult>>({
    status: 'pending',
    lastResult: null,
  });

  useEffect(() => {
    taskRef.current = promiseFn;
    setState(({ lastResult }) => ({ status: 'pending', lastResult }));
    const blocker = context.blocker;
    context.blocker = new Promise<void>((resolveNext) => {
      resolveNextRef.current = resolveNext;
      (asyncStart ? Promise.resolve() : blocker).then(() => {
        if (taskRef.current !== promiseFn) {
          // awaitFor didChange after finishing parent task - prevent start execution outdated task
          resolveNext();
          return;
        }
        if (!awaited) {
          // start next task before finishing this component task
          resolveNext();
        }
        setState(({ lastResult }) => ({ status: 'progress', lastResult }));

        const taskPromise = promiseFn();
        cancelTaskPromiseRef.current = taskPromise.cancel;
        taskPromise
          .then((success) => {
            // awaitFor didChange after finishing component task - prevent rendering of outdated results
            if (taskRef.current !== promiseFn) {
              return;
            }
            setState({
              result: success,
              status: 'result',
              lastResult: success,
            });
          })
          .catch((error) => {
            // awaitFor didChange after finishing component task - prevent rendering of outdated results
            if (taskRef.current !== promiseFn) {
              return;
            }
            setState(({ lastResult }) => ({ error, status: 'error', lastResult }));
          })
          .finally(resolveNext);
      });
    });

    return () => {
      taskRef.current = undefined;
      // unblock blocked child tasks:
      resolveNextRef.current && resolveNextRef.current();
      setState(({ lastResult, status }) => {
        if (status === 'progress') {
          // if task already started - send cancel signal
          cancelTaskPromiseRef.current && cancelTaskPromiseRef.current();
        }
        return { status: 'pending', lastResult };
      });
    };
  }, [context, promiseFn, awaited, asyncStart]);

  const resultElements =
    'children' in rest
      ? rest.children(state)
      : state.status === 'result'
      ? rest.renderResult(state)
      : null;

  if (resultElements) {
    return <AsyncRoot useParent={!asyncChildren}>{resultElements}</AsyncRoot>;
  }

  if (state.status === 'pending') {
    return (
      ('renderPending' in rest && rest.renderPending && rest.renderPending(state)) || null
    );
  }

  if (state.status === 'progress') {
    return (
      ('renderProgress' in rest && rest.renderProgress && rest.renderProgress(state)) ||
      null
    );
  }

  if ('error' in state) {
    if ('renderError' in rest && rest.renderError) return rest.renderError(state);
    throw state.error;
  }

  return null;
};
