export interface HasGTypeAndOpenNums {
	GType: string;
	OpenNums: number;
}
// nums join with ','
export interface IPack {
	Pack(num: string[]): string;
}
