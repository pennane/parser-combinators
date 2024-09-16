import { operateOnTwoIntegers } from './combinators/numbers'

// Most convoluted way to operate on two integers
const parser = operateOnTwoIntegers
const input = '   -9  *    -9  '
const result = parser(input)
console.log(result) // 81 :D
