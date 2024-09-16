import { Parser, failure, State } from './type'

const map =
  <A, B>(parser: Parser<A>, f: (a: A) => B): Parser<B> =>
  (input) => {
    const result = parser(input)
    if (failure(result)) return result
    return { ...result, value: f(result.value) }
  }

const pure =
  <A>(a: A): Parser<A> =>
  (input) => ({ state: State.Success, value: a, rest: input })

const ap =
  <A, B>(parserF: Parser<(a: A) => B>, parserA: Parser<A>): Parser<B> =>
  (input) => {
    const fResult = parserF(input)
    if (failure(fResult)) return fResult
    const aResult = parserA(fResult.rest)
    if (failure(aResult)) return aResult
    const result = {
      state: State.Success,
      value: fResult.value(aResult.value),
      rest: aResult.rest
    }
    return result
  }

const chain =
  <A, B>(parser: Parser<A>, f: (a: A) => Parser<B>): Parser<B> =>
  (input) => {
    const result = parser(input)
    if (failure(result)) return result
    return f(result.value)(result.rest)
  }

const lift2 =
  <A, B, C>(f: (a: A, b: B) => C) =>
  (parserA: Parser<A>, parserB: Parser<B>): Parser<C> =>
    ap(
      ap(
        pure((a: A) => (b: B) => f(a, b)),
        parserA
      ),
      parserB
    )

const lift3 =
  <A, B, C, D>(f: (a: A, b: B, c: C) => D) =>
  (parserA: Parser<A>, parserB: Parser<B>, parserC: Parser<C>): Parser<D> =>
    ap(lift2((a: A, b: B) => (c: C) => f(a, b, c))(parserA, parserB), parserC)

const lift4 =
  <A, B, C, D, E>(f: (a: A, b: B, c: C, d: D) => E) =>
  (
    parserA: Parser<A>,
    parserB: Parser<B>,
    parserC: Parser<C>,
    parserD: Parser<D>
  ): Parser<E> =>
    ap(
      lift3((a: A, b: B, c: C) => (d: D) => f(a, b, c, d))(
        parserA,
        parserB,
        parserC
      ),
      parserD
    )

const lift5 =
  <A, B, C, D, E, F>(f: (a: A, b: B, c: C, d: D, e: E) => F) =>
  (
    parserA: Parser<A>,
    parserB: Parser<B>,
    parserC: Parser<C>,
    parserD: Parser<D>,
    parserE: Parser<E>
  ): Parser<F> =>
    ap(
      lift4((a: A, b: B, c: C, d: D) => (e: E) => f(a, b, c, d, e))(
        parserA,
        parserB,
        parserC,
        parserD
      ),
      parserE
    )

const fold = <A, B>(
  parser: Parser<A[]>,
  reducer: (acc: B, curr: A) => B,
  initialValue: B
): Parser<B> => map(parser, (arr) => arr.reduce(reducer, initialValue))

const fold1 = <A>(parser: Parser<A[]>, reducer: (acc: A, curr: A) => A) =>
  map(parser, (arr) => arr.reduce(reducer))

export const P = {
  map: map,
  of: pure,
  ap: ap,
  lift2: lift2,
  lift3: lift3,
  lift4: lift4,
  lift5: lift5,
  chain: chain,
  fold: fold,
  fold1: fold1
}
