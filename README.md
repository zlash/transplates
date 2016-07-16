# transplates
Simple string templates, useful for translation. (node.js module)

## Simple Example (Using TypeScript)

```typescript
import * as Transplates from "transplates";

let languages = {
    en: {
        concat: ">1|*(0,-3)[${i}, ]${-2} and |${-1}",
        template: "Hello ${name}, your item+{s} -{is}+{are}: ${items}."
    },
    es: {
        concat: ">1|*(0,-3)[${i}, ]${-2} y |${-1}",
        template: "Hola ${name}, su+{s} item+{s} -{es}+{son}: ${items}."
    },
    ja: {
        concat: ">1|*(0,-2)[${i}と]|${-1}",
        template: "こんにちは、${name}の項目は${items}です."
    }
};

function listItems(name: string, items: string[]): void {
    for (let langK in languages) {
        let lang = languages[langK];
        let str = Transplates.fillIn(lang.template,
            { name: name, items: items, isPlural: items.length > 1 },
            { concat: lang.concat });
        console.log(`${langK}: ${str}`);
    }
}

let items = ["foo"];
listItems("John", items);
items.push("bar");
items.push("hoge");
listItems("John", items);
```
will output

    en: Hello John, your item is: foo.
    es: Hola John, su item es: foo.
    ja: こんにちは、Johnの項目はfooです.
    en: Hello John, your items are: foo, bar and hoge.
    es: Hola John, sus items son: foo, bar y hoge.
    ja: こんにちは、Johnの項目はfooとbarとhogeです.

## Operation

The main function in transplates is:

    fillIn(template: string, filler: Object, langHelper?: LangHelper): string ;

`fillIn` will find and replace tokens in the template string using the following syntax:

*   **${property}**

    Will be replaced with `filler.property` or `""` if `filler.property` is `undefined`.
    
    If `filler.property` is an array, it will be treated in the following way:
    *   If `array.length === 0`  => `""`
    *   If `array.length >= 1`  =>

        It will use a [list template](#list-template) to concatenate array parts, the list-template to use will be taken from `langHelper.concat`.
        If langHelper is undefined, it will just concatenate the array items with commas.

*   **?{property[; trueTS; falseTS]}**

    If `filler.property===true`, it will be replaced with `fillIn(trueTS,filler)` else `fillIn(falseTS,filler)` will be used.
    Both parameters are optional, in which case, `""` will be used when needed.

*   **+{TS}, -{TS}**

    These are syntax sugar version for `?{filler.isPlural;TS}` and `?{filler.isPlural;;TS}` , respectively

 
 ### [`List templates`](#list-templates)

 List templates are a special case of templates suited to generate human readable concatenation of items on an array, or in any case where items from an array need to be extracted.
 The following tokens are used

*   **${n} , ${-n}** 

    To be replaced with `array[n]` or `array[array.length+n]` respectively.
    
*   **\*([begin,end])[ loopExpr ]**

    From begin to end, `loopExpr` will be joined and then replaced. ${i} inside `loopExpr` will contain the current position in the array.
    If begin is missing, 0 will be assumed. If begin is negative, `array.length+begin` will be used.
    If end is missing, array.length-1 will be assumed. If end is negative `array.length+end` will be used.

*   **>n|str|,<n|str|**

    This guards will be applied before parsing the template. If `array.length > n` the string inside the braces will be kept, otherwise it will be discarded. The same but with `array.length < n` for the '<' version.


For example, to make a concatenation of items in English:

    `">1|*(0,-3)[${i}, ]${-2} and |${-1}"`

Spanish:

    `">1|*(0,-3)[${i}, ]${-2} y |${-1}"`

And Japanese:

    `">1|*(0,-2)[${i}と]|${-1}"`