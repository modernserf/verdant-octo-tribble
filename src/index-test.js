const test = require('tape')
const fs = require('fs')
const peg = require('pegjs')

const data = fs.readFileSync('./src/index.peg', 'utf8')
const theParser = peg.generate(data)

function parse (t, str, parseTree) {
    return t.deepEqual(theParser.parse(str), parseTree)
}

function failParse (t, str) {
    return t.throws(() => theParser.parse(str))
}

const types = {
    Number: 'Number',
    Binding: 'Binding',
    String: 'String',
    FuncCall: 'FuncCall'
}

test('Number', (t) => {
    parse(t, `123`,
        [types.Number, 123])

    parse(t, `-42`,
        [types.Number, -42])
    parse(t, `0.5`,
        [types.Number, 0.5])
    parse(t, `.2`,
        [types.Number, 0.2])
    parse(t, `-.4`,
        [types.Number, -0.4])

    failParse(t, `4.`)
    failParse(t, `6-2`)
    failParse(t, `3.2.5`)
    t.end()
})

test('Binding', (t) => {
    parse(t, `x`,
        [types.Binding, 'x'])
    parse(t, `+`,
        [types.Binding, '+'])
    parse(t, `foo_123`,
        [types.Binding, 'foo_123'])

    failParse(t, `123foo`)
    t.end()
})

test('FuncCall', (t) => {
    parse(t, `foo 1.5`,
        [types.FuncCall,
            [types.Binding, 'foo'],
            [types.Number, 1.5]])

    parse(t, `foo bar`,
        [types.FuncCall,
            [types.Binding, 'foo'],
            [types.Binding, 'bar']])

    parse(t, `foo 1.5, bar, -3`,
        [types.FuncCall,
            [types.Binding, 'foo'],
            [types.Number, 1.5],
            [types.Binding, 'bar'],
            [types.Number, -3]])

    parse(t, `foo 10, bar 3, 8`,
        [types.FuncCall,
            [types.Binding, 'foo'],
            [types.Number, 10],
            [types.FuncCall,
                [types.Binding, 'bar'],
                [types.Number, 3],
                [types.Number, 8]]])

    failParse(t, `foo 10,`)

    t.end()
})

test('Grouping', (t) => {
    parse(t, `(1)`,
        [types.Number, 1])
    parse(t, `(foo)`,
        [types.Binding, 'foo'])
    parse(t, `(+ 1, 2)`,
        [types.FuncCall,
            [types.Binding, '+'],
            [types.Number, 1],
            [types.Number, 2]])

    parse(t, `foo 10, (bar 3), 8`,
        [types.FuncCall,
            [types.Binding, 'foo'],
            [types.Number, 10],
            [types.FuncCall,
                [types.Binding, 'bar'],
                [types.Number, 3]],
            [types.Number, 8]])

    parse(t, `foo (bar (baz 10), 12), quxx`,
        [types.FuncCall,
            [types.Binding, 'foo'],
            [types.FuncCall,
                [types.Binding, 'bar'],
                [types.FuncCall,
                    [types.Binding, 'baz'],
                    [types.Number, 10]],
                [types.Number, 12]],
            [types.Binding, 'quxx']])

    t.end()
})
