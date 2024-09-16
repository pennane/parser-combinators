import { P } from '../algebraic/structure'
import {
  Parser,
  failure,
  failureOf,
  successOf,
  success,
  Result,
  Maybe,
  nothingOf,
  justOf
} from '../algebraic/type'

export const sequence =
  <A>(parsers: Readonly<Parser<A>[]>): Parser<A[]> =>
  (input) => {
    const results: A[] = []
    let rest = input
    for (const parser of parsers) {
      const result = parser(rest)
      if (failure(result)) return result
      results.push(result.value)
      rest = result.rest
    }
    return P.of(results)(rest)
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

export const char =
  (c: string): Parser<string> =>
  (input) => {
    if (input[0] !== c) {
      return failureOf("expected '" + c + "', got '" + input[0] + "' instead")
    }
    return successOf(c, input.slice(1))
  }

export const oneOrMoreChar =
  (f: (c: string) => boolean, error?: string): Parser<string> =>
  (input) => {
    let found = ''
    for (let i = 0; i < input.length; i++) {
      if (!f(input[i])) {
        break
      }
      found += input[i]
    }
    if (found.length === 0) {
      return failureOf((error || 'char expectation failed') + ': ' + input)
    }
    return successOf(found, input.slice(found.length))
  }

export const zeroOrMoreChar =
  (f: (c: string) => boolean): Parser<string> =>
  (input) => {
    let found = ''
    for (let i = 0; i < input.length; i++) {
      if (!f(input[i])) {
        break
      }
      found += input[i]
    }
    return successOf(found, input.slice(found.length))
  }

export const anyOf =
  <T>(parsers: Parser<T>[]): Parser<T> =>
  (input) =>
    parsers.reduce((result, parser) => {
      if (success(result)) {
        return result
      }
      return parser(input)
    }, failureOf('none matched') as Result<T>)

export const optional =
  <T>(parser: Parser<T>): Parser<Maybe<T>> =>
  (input) => {
    const result = parser(input)
    if (!success(result)) return successOf(nothingOf(), input)
    return successOf(justOf(result.value), result.rest)
  }
