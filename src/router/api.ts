import express, { Router} from "express";
const apiRouter: Router = express.Router();
apiRouter.get("/hello/:name", (req, res) => {
    const param = req.query;
    console.log(`router api:hello ${req.params.name}`, param);
    res.send(JSON.stringify(param));
});
export default apiRouter;
