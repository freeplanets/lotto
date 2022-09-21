import express, { Router} from "express";
import StrFunc from "../components/class/Functions/MyStr";

const apiRouter: Router = express.Router();
apiRouter.get("/hello/:name", (req, res) => {
    const param = req.query;
    console.log(`router api:hello ${req.params.name}`, param);
    res.send(StrFunc.stringify(param));
});
export default apiRouter;
