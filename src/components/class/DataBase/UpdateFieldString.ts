import { IKeyVal } from "../../../DataSchema/if";

export default class UpdateFieldString {
	public generate(fields: IKeyVal | IKeyVal[]) {
		let ans = "";
		if (Array.isArray(fields)) {
			ans = this.gFields(fields);
		} else {
			ans = this.gField(fields);
		}
		return ans;
	}
	private gField(field: IKeyVal) {
		let ans = "";
		if (field.Key) {
			const Val = typeof field.Val !== "number" ?  `'${field.Val}'` : `${field.Val}`;
			ans = `${field.Key}=${Val}`;
		} else {
			const fields = Object.keys(field).map((key) => {
				return this.gField({Key: key, Val: field[key]});
			});
			ans = fields.join(",");
		}
		return ans;
	}
	private gFields(field: IKeyVal[]) {
		const fields = field.map((f) => {
			return this.gField(f);
		});
		return fields.join(",");
	}
}
