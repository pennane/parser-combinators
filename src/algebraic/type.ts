export type Parser<T> = (input: string) => Result<T>

export enum State {
  Success = 'success',
  Failure = 'Failure'
}
export type Success<T> = { state: State.Success; value: T; rest: string }
export type Failure = { state: State.Failure; error?: string }
export type Result<T> = Success<T> | Failure

export const success = <T>(x: Result<T>): x is Success<T> =>
  x.state === State.Success

export const successOf = <T>(value: T, rest: string): Success<T> => ({
  state: State.Success,
  value,
  rest
})

export const failure = <T>(x: Result<T>): x is Failure => !success(x)

export const failureOf = (error: string): Failure => ({
  state: State.Failure,
  error
})

export type Just<T> = { value: T }
export type Nothing = null
export type Maybe<T> = Just<T> | Nothing

export const just = <T>(x: Maybe<T>): x is Just<T> => !!x && 'value' in x

export const justOf = <T>(value: T): Just<T> => ({
  value
})

export const nothing = <T>(x: Maybe<T>): x is Nothing => !just(x)

export const nothingOf = (): Nothing => null
