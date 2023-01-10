import { ComponentType, PropsWithChildren, useContext, useRef } from 'react';

import { contextAsync } from './contextAsync';

export const AsyncRoot: ComponentType<PropsWithChildren<{ useParent?: boolean }>> = ({
  useParent,
  children,
}) => {
  const context = useContext(contextAsync);
  const valueRef = useRef({ blocker: Promise.resolve() });
  return (
    <contextAsync.Provider value={useParent ? context : valueRef.current}>
      {children}
    </contextAsync.Provider>
  );
};
