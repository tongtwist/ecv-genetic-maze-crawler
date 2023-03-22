export type TJSONPrimitive = string | number | boolean | null;
export type TJSONArray = TJSON[];
export type TJSONObject = { [k: string]: TJSON };
export type TJSON = TJSONPrimitive | TJSONObject | TJSONArray;
