import express, { Request, Response, Router } from "express";
import * as ccfunc from "../func/ccfunc";
import {dbPool} from "../func/db";
import ExpressAccess from "../func/ExpressAccess";
const EA = new ExpressAccess(dbPool);
const app: Router = express.Router();
app.get("/test", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.f);
});
app.get("/Save", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.save);
});
app.get("/SaveData", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.savedata);
});
app.get("/GetData", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.getdata);
});
app.post("/SendOrder", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.SendOrder);
});
app.get("/GetOrder", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.getOrder);
});
app.get("/GetLedgerInfo", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.getLedgerInfo);
});
app.get("/GetLedgerLever", (req: Request, res: Response) => {
  EA.process(req, res, ccfunc.getLedgerLeverInfo);
});
export default app;
