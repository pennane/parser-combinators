import { P } from '../algebraic/structure'
import { Parser, failure, failureOf, successOf } from '../algebraic/type'
import { oneOrMore, toMaybe } from './utility'

export const symbol: Parser<string> = (input) => {
  if (!input.length) {
    return failureOf('expected a symbol, got empty string')
  }
  return successOf(input[0], input.slice(1))
}

export const char =
  (targetChar: string): Parser<string> =>
  (input) => {
    const result = symbol(input)
    if (failure(result)) {
      return result
    }
    if (result.value !== targetChar) {
      return failureOf(`expected ${targetChar} but got ${result.value}`)
    }
    return result
  }

export const str =
  (str: string): Parser<string> =>
  (input) => {
    if (!input.startsWith(str)) {
      return failureOf(
        "expected '" +
          str +
          "', got '" +
          input.slice(0, str.length) +
          "' instead"
      )
    }
    return successOf(str, input.slice(str.length))
  }

export const whiteSpaceChar = char(' ')
export const whiteSpace = P.fold1(oneOrMore(whiteSpaceChar), (acc, c) =>
  acc.concat(c)
)
export const optionalWhitespace = toMaybe(whiteSpace)
