import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg, LedgerLever, MemberGainLose } from "../../../DataSchema/if";
import { Query } from "../../../func/db";
import NumFunc from "../Functions/MyNumber";
import AGainLose from "./AGainLose";

export default class Member extends AGainLose {
	public add(ldgLever: LedgerLever): Promise<IMsg> {
		return this.modifyTotal(ldgLever, 1);
	}
	public remove(ldgLever: LedgerLever): Promise<IMsg> {
		return this.modifyTotal(ldgLever, -1);
	}
	public reset(): Promise<IMsg> {
		const sql = `insert into MemberGainLose(UserID,UpId,SDate,Total,LeverTotal,BuyFee,SellFee,TFee,GainLose)
		 SELECT UserID,UpId,DATE_FORMAT(FROM_UNIXTIME(SellTime/1000),'%Y-%m-%d') SDate,sum(Qty*BuyPrice) Total,
		 sum(Qty*BuyPrice*Lever) LeverTotal,sum(BuyFee),sum(SellFee),sum(TFee),sum(GainLose)
		 FROM LedgerLever WHERE SellTime > 0 Group by UserID,SDate
		 on duplicate key update Total=values(Total),LeverTotal=values(LeverTotal),BuyFee=values(BuyFee),
		 SellFee=values(SellFee),TFee=values(TFee),GainLose=values(GainLose)`;
		return Query(sql, this.conn);
	}
	private async modifyTotal(ldgLever: LedgerLever, key: number) {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		const Total = ldgLever.BuyPrice * ldgLever.Qty * key;
		const LeverTotal = Total * ldgLever.Lever;
		const BuyFee = NumFunc.defaultZero(ldgLever.BuyFee) * key;
		const SellFee = NumFunc.defaultZero(ldgLever.SellFee) * key;
		const TFee = NumFunc.defaultZero(ldgLever.TFee) * key;
		const GainLose = NumFunc.defaultZero(ldgLever.GainLose) * key;
		const SellTime = NumFunc.defaultZero(ldgLever.SellTime);
		const mgl: MemberGainLose = {
			id: 0,
			UserID: ldgLever.UserID,
			UpId: ldgLever.UpId,
			SDate: this.date.toDbDateString(ldgLever.SellTime),
			Total,
			LeverTotal,
			BuyFee,
			SellFee,
			TFee,
			GainLose,
		};
		const ans = await this.jt.MultiUpdate([mgl], true, true);
		if (ans) {
			msg.data = ans;
		} else {
			msg.ErrNo = ErrCode.DB_QUERY_ERROR;
		}
		return msg;
	}
}
