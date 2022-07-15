import HashNum from "./HashNum";

export default class GenHashNum {
	public get(hash: string, GType: string) {
		if (hash.split(",").length > 1) { return hash; }
		if (GType === "HashSix") {
			return new HashNum(hash, 49, 0, 6, false, true, true, true).NumLine.join(",");
		} else if (GType === "BTCHash") {
			return new HashNum(hash, 9, 0, 5, true, true, false, true).NumLine.join(",");
		} else { return hash; }
	}
}
