export type ContextPromiseResult = void;
export type ContextPromise = Promise<ContextPromiseResult>;
export type ContextValue = {
  blocker: ContextPromise;
};
