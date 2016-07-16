"use strict";
function fillInArray(template, arr) {
    // First, length guards
    template = template.replace(/[<>](\d*)\|(.*?)\|/g, function (match, n, expr) {
        var testLength = parseInt(n);
        if (match.substr(0, 1) == "<" && arr.length < testLength) {
            return expr;
        }
        if (match.substr(0, 1) == ">" && arr.length > testLength) {
            return expr;
        }
        return "";
    });
    // Loops
    template = template.replace(/\*\((.*?)\)\[(.*?)\]/g, function (match, paramsStr, body) {
        if (typeof (body) !== "string") {
            return "";
        }
        var params = paramsStr.split(",");
        var begin = (params[0] == undefined) ? 0 : parseInt(params[0]);
        var end = (params[1] == undefined) ? arr.length - 1 : parseInt(params[1]);
        if (begin < 0) {
            begin = arr.length + begin;
        }
        if (end < 0) {
            end = arr.length + end;
        }
        var jointStr = "";
        for (var i = begin; i <= end; i++) {
            jointStr += body.replace(/\${\s*i\s*}/g, arr[i]);
        }
        return jointStr;
    });
    // Index Substitutions
    template = template.replace(/\${(.*?)}/g, function (match, idxStr) {
        var idx = parseInt(idxStr);
        if (idx < 0) {
            idx = arr.length + idx;
        }
        return (arr[idx] == undefined) ? "" : arr[idx].toString();
    });
    return template;
}
exports.fillInArray = fillInArray;
function fillIn(template, filler, langHelper) {
    // First, syntax sugar
    template = template.replace(/[+-]{(.*?)}/g, function (match, p1) {
        if (match.substr(0, 1) == "+") {
            return "?{isPlural;" + p1 + "}";
        }
        else {
            return "?{isPlural;;" + p1 + "}";
        }
    });
    // Conditionals
    template = template.replace(/\?{(.*?)}/g, function (match, paramsStr) {
        var params = paramsStr.split(";");
        if (params[1] && filler[params[0]] === true) {
            return fillIn(params[1], filler, langHelper);
        }
        if (params[2] && filler[params[0]] !== true) {
            return fillIn(params[2], filler, langHelper);
        }
        return "";
    });
    // Substitutions
    template = template.replace(/\${(.*?)}/g, function (match, p) {
        var prop = filler[p];
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
exports.fillIn = fillIn;
//# sourceMappingURL=transplates.js.map