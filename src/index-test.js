import test from "tape"
import fs from "fs"
import peg from "pegjs"

const data = fs.readFileSync("./src/index.peg","utf8")
const theParser = peg.buildParser(data)

function parse (str, parseTree) {
    return this.deepEqual(theParser.parse(str),parseTree)
}

function failParse (str) {
    return this.throws(() => theParser.parse(str))
}

const types = {
    Number: "Number",
    Binding: "Binding",
    String: "String",
    FuncCall: "FuncCall",
}

test("Number", (assert) => {
    assert::parse(`123`,
        [types.Number,123])

    assert::parse(`-42`,
        [types.Number,-42])
    assert::parse(`0.5`,
        [types.Number,0.5])
    assert::parse(`.2`,
        [types.Number,0.2])
    assert::parse(`-.4`,
        [types.Number,-0.4])

    assert::failParse(`4.`)
    assert::failParse(`6-2`)
    assert::failParse(`3.2.5`)
    assert.end()
})

test("Binding",(assert) => {
    assert::parse(`x`,
        [types.Binding,"x"])
    assert::parse(`+`,
        [types.Binding,"+"])
    assert::parse(`foo_123`,
        [types.Binding,"foo_123"])

    assert::failParse(`123foo`)
    assert.end()
})

test("FuncCall",(assert) => {
    assert::parse(`foo 1.5`,
        [types.FuncCall,
            [types.Binding,"foo"],
            [types.Number,1.5]])

    assert::parse(`foo bar`,
        [types.FuncCall,
            [types.Binding,"foo"],
            [types.Binding,"bar"]])

    assert::parse(`foo 1.5, bar, -3`,
        [types.FuncCall,
            [types.Binding,"foo"],
            [types.Number,1.5],
            [types.Binding, "bar"],
            [types.Number, -3]])

    assert::parse(`foo 10, bar 3, 8`,
        [types.FuncCall,
            [types.Binding, "foo"],
            [types.Number,10],
            [types.FuncCall,
                [types.Binding, "bar"],
                [types.Number,3],
                [types.Number,8]]])

    assert::failParse(`foo 10,`)

    assert.end()
})

test("Grouping",(assert) => {
    assert::parse(`(1)`,
        [types.Number, 1])
    assert::parse(`(foo)`,
        [types.Binding,"foo"])
    assert::parse(`(+ 1, 2)`,
        [types.FuncCall,
            [types.Binding,"+"],
            [types.Number,1],
            [types.Number,2]])

    assert::parse(`foo 10, (bar 3), 8`,
        [types.FuncCall,
            [types.Binding, "foo"],
            [types.Number,10],
            [types.FuncCall,
                [types.Binding, "bar"],
                [types.Number,3]],
            [types.Number,8]])

    assert::parse(`foo (bar (baz 10), 12), quxx`,
        [types.FuncCall,
            [types.Binding, "foo"],
            [types.FuncCall,
                [types.Binding, "bar"],
                [types.FuncCall,
                    [types.Binding,"baz"],
                    [types.Number, 10]],
                [types.Number, 12]],
            [types.Binding, "quxx"]])

    assert.end()
})
