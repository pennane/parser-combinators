type Result = string | (string | Result)[];

type Ctx = Readonly<{
    index: number;
    input: string;
    result: Result[];
}>;

type Parser = (ctx: Ctx) => Ctx | null;

const withNestedResult = (ctx: Ctx, result: Result): Ctx => {
    const resultArray = Array.isArray(result) ? result : [result];
    return {
        ...ctx,
        result: ctx.result.concat(resultArray)
    };
};

const withStringResult = (ctx: Ctx, result: string): Ctx => ({
    ...ctx,
    result: ctx.result.concat([result]),
    index: ctx.index + result.length
});

const withArrayConcatResult = (ctx: Ctx, result: Result[]): Ctx => ({
    ...ctx,
    result: ctx.result.concat(result),
    index: ctx.index + result.reduce((sum, s) => sum + (typeof s === 'string' ? s.length : 0), 0)
});

const ctxOf = (input: string): Ctx => ({ index: 0, input, result: [] });

const symbol = (c: string): Parser => ctx => ctx.input.at(ctx.index) === c[0] ?
    withStringResult(ctx, c) : null;

const literal = (str: string): Parser => ctx => ctx.input.slice(ctx.index).startsWith(str) ?
    withStringResult(ctx, str) : null;

const anyOf = (parsers: Parser[]): Parser => ctx =>
    parsers.reduce((resultCtx, parser) => resultCtx || parser(ctx), null as Ctx | null);

const sequence = (parsers: Parser[]): Parser => ctx => {
    let currentCtx: Ctx | null = { ...ctx, result: [] };
    for (const parser of parsers) {
        currentCtx = parser(currentCtx);
        if (!currentCtx) return null;
    }
    return withNestedResult(ctx, currentCtx.result);
};

const skipWhiteSpace: Parser = ctx => {
    let i = ctx.index;
    while (i < ctx.input.length && ctx.input[i] === " ") {
        i++;
    }
    return { ...ctx, index: i };
};

const whileParser = (parser: Parser): Parser => ctx => {
    let currentCtx: Ctx = { ...ctx, result: [] };
    while (true) {
        const resultCtx = parser(currentCtx);
        if (!resultCtx || resultCtx.index === currentCtx.index) break;
        currentCtx = resultCtx;
    }
    if (currentCtx.result.length === 0) return null;
    return withArrayConcatResult(ctx, currentCtx.result);
};

const openSquare = symbol("[");
const closedSquare = symbol("]");
const comma = symbol(",");

const quote = symbol('"');
const whileNotQuote = whileParser(ctx => ctx.input.at(ctx.index) !== '"' ? withStringResult(ctx, ctx.input.at(ctx.index)!) : null);
const string = sequence([quote, whileNotQuote, quote]);

const number = whileParser(ctx => {
    const match = ctx.input.slice(ctx.index).match(/^\d+/);
    if (match) {
        return withStringResult(ctx, match[0]);
    }
    return null;
});

const elements = whileParser(
    sequence([skipWhiteSpace, anyOf([number, string, comma])])
);

const array = sequence([openSquare, skipWhiteSpace, anyOf([closedSquare, elements]), skipWhiteSpace, closedSquare]);

// Test
console.log(sequence([openSquare, skipWhiteSpace, anyOf([closedSquare, sequence([elements, closedSquare])])])(ctxOf("[                    ]")))
console.log(string(ctxOf('"adf"')))

