import { P } from '../algebraic/structure'
import {
  Parser,
  Maybe,
  success,
  successOf,
  nothingOf,
  justOf,
  failure,
  failureOf,
  Result,
  Success
} from '../algebraic/type'
import { optionalWhitespace } from './core'

export const toMaybe =
  <T>(parser: Parser<T>): Parser<Maybe<T>> =>
  (input) => {
    const result = parser(input)
    if (!success(result)) return successOf(nothingOf(), input)
    return successOf(justOf(result.value), result.rest)
  }
export const trimmed = <T>(parser: Parser<T>) =>
  P.map(
    sequence([optionalWhitespace, parser, optionalWhitespace]),
    ([_, trimmed]) => trimmed
  )

export const sequence =
  <T extends any[]>(parsers: { [K in keyof T]: Parser<T[K]> }): Parser<{
    [K in keyof T]: T[K]
  }> =>
  (input) => {
    const results = [] as { [K in keyof T]: T[K] }
    let rest = input

    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i]
      const result = parser(rest)
      if (failure(result)) return result
      results[i] = result.value
      rest = result.rest
    }

    return P.of(results)(rest)
  }

export const anyOf =
  <T>(parsers: Parser<T>[]): Parser<T> =>
  (input) =>
    parsers.reduce(
      (result, parser) => (success(result) ? result : parser(input)),
      failureOf('none matched') as Result<T>
    )

export const oneOrMore =
  <T>(parser: Parser<T>): Parser<T[]> =>
  (input) => {
    let result = parser(input)
    if (failure(result)) return result
    let lastSuccesful: Success<T> = result
    const results: T[] = []
    while (success(result)) {
      lastSuccesful = result
      results.push(result.value)
      result = parser(result.rest)
    }
    return successOf(results, lastSuccesful.rest)
  }
