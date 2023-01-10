import { createContext } from 'react';

import { ContextValue } from './types';

export const contextAsync = createContext<ContextValue>({
  blocker: Promise.resolve(),
});
