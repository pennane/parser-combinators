const zeroCode = '0'.charCodeAt(0)
const nineCode = '9'.charCodeAt(0)
export const isDigit = (c: string) => {
  const code = c.charCodeAt(0)
  return code >= zeroCode && code <= nineCode
}

export const isWhitespace = (c: string) => c[0] === ' '
