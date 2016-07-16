export interface LangHelper {
    concat: string;
}
export declare function fillInArray(template: string, arr: any[]): string;
export declare function fillIn(template: string, filler: Object, langHelper?: LangHelper): string;
