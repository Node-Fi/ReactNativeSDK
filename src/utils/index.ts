export * from './accounts';
export * from './security';
export * from './asyncStorage';
export * from './storageKeys';
export * from './constants';

export function reduceArrayToMap<T>(
  arr: T[],
  key: keyof T
): { [x: string]: T } {
  return arr.reduce(
    (accum, cur: T) => ({
      ...accum,
      [cur[key] as unknown as string]: cur,
    }),
    {}
  );
}
