import * as React from 'react';
import { createContainer } from 'unstated-next';

const useTestInner = () => {
  const [val, setVal] = React.useState<number>();

  const incremement = React.useCallback(
    () => setVal((v = 0) => v + 1),
    [setVal]
  );
  const decrement = React.useCallback(() => setVal((v = 0) => v - 1), [setVal]);

  return { val, incremement, decrement };
};

export const TestContainer = createContainer(useTestInner);

export const useTest = () => {
  const { val, incremement, decrement } = TestContainer.useContainer();
  return { val, incremement, decrement };
};

export const TestProvider = (props: any) => (
  <TestContainer.Provider {...props} />
);

export const TestContext = React.createContext<{
  val?: number;
  increment?: () => void;
  decrement?: () => void;
}>({});

export function TestContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [val, setVal] = React.useState<number>();

  const increment = React.useCallback(() => setVal((v = 0) => v + 1), [setVal]);
  const decrement = React.useCallback(() => setVal((v = 0) => v - 1), [setVal]);
  return (
    <TestContext.Provider
      value={{ val, increment, decrement }}
      children={children}
    />
  );
}
