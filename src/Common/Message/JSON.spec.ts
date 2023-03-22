export type TJSONPrimitive = number | string |boolean | null;
export type TJSONARrray = TJSON[]
export type TJSONObject = {[k:string]: TJSON}
export type TJSON = TJSONPrimitive | TJSONARrray | TJSONObject
