import { P } from '../algebraic/structure'
import { just, Maybe, Parser } from '../algebraic/type'
import { isDigit, isWhitespace } from '../string/lib'
import {
  anyOf,
  char,
  zeroOrMoreChar,
  str,
  sequence,
  oneOrMoreChar,
  optional
} from './lib'

export const maybeWhitespace = zeroOrMoreChar(isWhitespace)

export const trimmed = <T>(parser: Parser<T>) =>
  P.map(
    sequence([maybeWhitespace, parser, maybeWhitespace]),
    ([_1, result, _2]) => result
  )

export const digits = oneOrMoreChar(isDigit, 'expected digits, got none')

const digitsWithOptionalSign = P.map(
  trimmed(sequence([optional(anyOf([char('-'), char('+')])), digits] as const)),
  ([sign, digits]: [Maybe<string>, string]) =>
    just(sign) ? `${sign.value}${digits}` : digits
)
export const number: Parser<number> = P.map(digitsWithOptionalSign, (ds) =>
  parseInt(ds)
)

export const binaryOperator = trimmed(
  anyOf(['**', '+', '-', '*', '/', '^'].map(str))
)

export const operateOnTwoIntegers = P.lift3(
  (a: number, operator: string, b: number) => {
    switch (operator) {
      case '**':
        return a ** b
      case '+':
        return a + b
      case '-':
        return a - b
      case '*':
        return a * b
      case '/':
        return a / b
      case '^':
        return a ^ b
    }
  }
)(number, binaryOperator, number)
