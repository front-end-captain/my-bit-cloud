/**
 * asynchronously iterate an array.
 */
export async function asyncForEach<T>(
  array: T[],
  callback: (elm: T, index: number, array: T[]) => Promise<unknown>,
) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}
