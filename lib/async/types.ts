import { ReactElement } from 'react';

export type RenderReturnType = ReactElement | null;

export type RenderPendingType<TaskResult> = (
  props: PendingPropsType<TaskResult>,
) => RenderReturnType;
export type RenderProgressType<TaskResult> = (
  props: ProgressPropsType<TaskResult>,
) => RenderReturnType;
export type RenderErrorType<TaskResult> = (
  props: ErrorPropsType<TaskResult>,
) => RenderReturnType;
export type RenderResultType<TaskResult> = (
  props: ResultPropsType<TaskResult>,
) => RenderReturnType;
export type RenderAnyType<TaskResult> = (
  props: StateType<TaskResult>,
) => RenderReturnType;

export type LastResultType<TaskResult> = {
  lastResult: TaskResult | null;
};
export type PendingPropsType<TaskResult> = {
  status: 'pending';
} & LastResultType<TaskResult>;
export type ProgressPropsType<TaskResult> = {
  status: 'progress';
} & LastResultType<TaskResult>;
export type ErrorPropsType<TaskResult> = {
  error: unknown;
  status: 'error';
} & LastResultType<TaskResult>;
export type ResultPropsType<TaskResult> = {
  result: TaskResult;
  status: 'result';
} & LastResultType<TaskResult>;

export type StateType<TaskResult> = (
  | PendingPropsType<TaskResult>
  | ProgressPropsType<TaskResult>
  | ErrorPropsType<TaskResult>
  | ResultPropsType<TaskResult>
) &
  LastResultType<TaskResult>;

export type ConfigPropsType = {
  asyncStart: boolean;
  asyncChildren: boolean;
  awaited: boolean;
};

export type PromiseFn<TaskResult> = () => Promise<TaskResult> & { cancel?: () => void };

export type PropsType<TaskResult> = {
  promiseFn: PromiseFn<TaskResult>;
} & Partial<ConfigPropsType> &
  (
    | {
        // FaCC or Function as a Child Component:
        children: RenderAnyType<TaskResult>;
      }
    | {
        // Render props:
        renderPending?: RenderPendingType<TaskResult>;
        renderProgress?: RenderProgressType<TaskResult>;
        renderError?: RenderErrorType<TaskResult>;
        renderResult: RenderResultType<TaskResult>;
      }
  );
