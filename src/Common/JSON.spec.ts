export type TJSONPrimitive = string | number | boolean | null
export type TJSON = TJSONPrimitive | TJSONObject | TJSONArray
export type TJSONObject = { [k: string]: TJSON }
export type TJSONArray = TJSON[]