import { operateOnTwoIntegers } from './combinators'

// Most convoluted way to operate on two integers
const parser = operateOnTwoIntegers
const input = '  -10 +  +35  '
const result = parser(input)
console.log(result)
