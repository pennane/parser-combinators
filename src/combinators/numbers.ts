import { P } from '../algebraic/structure'
import { Parser, failure, failureOf, successOf, just } from '../algebraic/type'
import { isDigit } from '../string/lib'
import { char, str, symbol } from './core'
import { oneOrMore, toMaybe, anyOf, trimmed, sequence } from './utility'

export const digit: Parser<string> = (input) => {
  const result = symbol(input)
  if (failure(result)) {
    return result
  }
  if (!isDigit(input[0])) {
    return failureOf(`expected a digit, got ${input[0]} string`)
  }

  return successOf(input[0], input.slice(1))
}

export const digits = P.fold1(oneOrMore(digit), (acc, c) => acc.concat(c))

const optionalSign = toMaybe(anyOf([char('-'), char('+')]))
const withOptionalSignPrefix = <T>(parser: Parser<T>) =>
  P.map(trimmed(sequence([optionalSign, parser])), ([sign, parser]) =>
    just(sign) ? `${sign.value}${parser}` : parser
  )

const digitsWithOptionalSign = withOptionalSignPrefix(digits)

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
