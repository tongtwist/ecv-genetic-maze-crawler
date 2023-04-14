export type TJSONPrimitive = number | string | boolean | null;
export type TJSONArray = TJSON[];
export type TJSONObject = { [k: string]: TJSON };
export type TJSON = TJSONPrimitive | TJSONArray | TJSONObject;
