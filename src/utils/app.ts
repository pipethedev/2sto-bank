export const omit = <T extends any>(
  obj: T,
  arrayOfOmitted: string[],
): Partial<T> => {
  const remain: unknown = {};

  if (arrayOfOmitted && arrayOfOmitted.length) {
    for (const prop in obj) {
      if (!arrayOfOmitted.includes(prop as any)) remain[prop] = obj[prop];
    }
  }

  return remain as Partial<T>;
};
