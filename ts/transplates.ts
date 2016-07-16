

export interface LangHelper {
    concat: string;
}


export function fillInArray(template: string, arr: any[]) {

    // First, length guards
    template = template.replace(/[<>](\d*)\|(.*?)\|/g, (match: string, n: string, expr: string) => {

        let testLength = parseInt(n);

        if (match.substr(0, 1) == "<" && arr.length < testLength) {
            return expr;
        }

        if (match.substr(0, 1) == ">" && arr.length > testLength) {
            return expr;
        }

        return "";
    });

    // Loops
    template = template.replace(/\*\((.*?)\)\[(.*?)\]/g, (match: string, paramsStr: string, body: string) => {

        if (typeof (body) !== "string") {
            return "";
        }

        let params = paramsStr.split(",");

        let begin = (params[0] == undefined) ? 0 : parseInt(params[0]);
        let end = (params[1] == undefined) ? arr.length - 1 : parseInt(params[1]);

        if (begin < 0) {
            begin = arr.length + begin;
        }

        if (end < 0) {
            end = arr.length + end;
        }

        let jointStr = "";

        for (let i = begin; i <= end; i++) {
            jointStr += body.replace(/\${\s*i\s*}/g, arr[i]);
        }

        return jointStr;
    });

    // Index Substitutions
    template = template.replace(/\${(.*?)}/g, (match: string, idxStr: string) => {
        let idx = parseInt(idxStr);
        if (idx < 0) {
            idx = arr.length + idx;
        }
        return (arr[idx] == undefined) ? "" : arr[idx].toString();
    });

    return template;
}

export function fillIn(template: string, filler: Object, langHelper?: LangHelper): string {

    // First, syntax sugar
    template = template.replace(/[+-]{(.*?)}/g, (match: string, p1: string) => {
        if (match.substr(0, 1) == "+") {
            return `?{isPlural;${p1}}`;
        } else {
            return `?{isPlural;;${p1}}`;
        }
    });

    // Conditionals
    template = template.replace(/\?{(.*?)}/g, (match: string, paramsStr: string) => {

        let params = paramsStr.split(";");

        if (params[1] && filler[params[0]] === true) {
            return fillIn(params[1], filler, langHelper);
        }

        if (params[2] && filler[params[0]] !== true) {
            return fillIn(params[2], filler, langHelper);
        }

        return "";
    });

    // Substitutions
    template = template.replace(/\${(.*?)}/g, (match: string, p: string) => {

        let prop = filler[p];

        if (prop == undefined) {
            return "";
        }

        if (prop instanceof Array) {
            if (langHelper && langHelper.concat) {
                return fillInArray(langHelper.concat, prop);
            }
            return prop.join(", ");
        }

        return prop.toString();
    });


    return template;
}