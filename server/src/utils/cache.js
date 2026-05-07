const cache = new Map()

export const cachePROutput = (prNumber, data) => {
  cache.set(prNumber, data)
}

export const getCachedPROutput = (prNumber) => {
  return cache.get(prNumber)
}

export const clearPRCache = (prNumber) => {
  cache.delete(prNumber)
}