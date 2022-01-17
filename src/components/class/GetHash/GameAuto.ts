import {Term} from "./TermInfo";

interface Terms {
	GameID: number;
	GType: string;
	CurTerm: Term;
	LastTerm: Term;
}
export default class GameAuto {
	constructor(private term: Terms) {}
}
