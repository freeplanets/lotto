import express, { Request, Response, Router, response } from "express";
import {PoolConnection} from "mariadb";
import {getConnection} from '../func/db';
import https from 'https';
import querystring from 'querystring';
import JTable from '../class/JTable';
import {ITerms,IGame} from '../DataSchema/user';
import JDate from '../class/JDate';


interface IFromCenter {
  issueno: string;  // 彩期編號 '20200702089',
  lrid: string; // 彩期中心代號 '1420082',
  openbet: string; // 自動開盤 'true',
  lastresultissue:string; // 上期編號'20200702087',
  op: string; // 功能代號 'issue',
  Method: string; // web 接收方式 'POST',
  lottoid?: string;  // 遊戲代號 '37',
  drawtime?: string; // 開獎時間 '2020-07-02 14:50:00',
  setdate?: string;  // 立帳時期 '2020-07-02',
  result?: string;  // '04,35,02,21,34,01',
  result2?: string; //'40',
  gettime?: string; // '2020-07-02 14:31:11',
  memo?:string; // 'macau.mark6',  
}
interface IAns {
  error:any;
  slack?:string;
} 
const app: Router = express.Router();
app.get('doit',webFunc);
app.post('doit',webFunc);
async function webFunc(req:Request,res:Response){
  let param:IFromCenter;
  const ans:IAns={
    error:''
  }
  if(req.query) param=req.query;
  else param=req.body;
  const conn=await getConnection();
  if(conn){
    switch(param.op){
      case 'issue':
    }
    conn.release();
  } else {
    ans.error='Get connection error!!';
  }
  res.send(JSON.stringify(ans));
}

async function doIssue(param:IFromCenter,conn:PoolConnection){
  const game:JTable<IGame>=new JTable(conn,'Games');
  if(param.lottoid){
    const term:ITerms = createTerm();
    let gInfo=await game.getOne(parseInt(param.lottoid,10));
    if(gInfo){
      const tmp:string[] | undefined=param.drawtime?.split(' ');
      if(tmp){
        term.PDate = tmp[0];
        term.PTime = tmp[1];
      }
      const sec=gInfo.StopBeforeEnd ? -1*gInfo.StopBeforeEnd : -20;
      term.StopTimeS=timeMoveSec(term.PTime,sec);
      term.StopTime = term.StopTimeS;
    }
  }
}
async function sendMsg(msg:string){
  const Inputs:querystring.ParsedUrlQueryInput={
    acc: 'issues-james',
    msg
  };
  const Optons:https.RequestOptions={
    headers:{'x-api-key': '7tFUAxk6tIayqq89vMTjK3NRX4qACEk39AniZJd5'}
  }
  const url:string=`https://nacauhh4p9.execute-api.ap-southeast-1.amazonaws.com/default/slackpush?${querystring.encode(Inputs)}`
  return new Promise((resolve,reject)=>{
    https.get(url,Optons,(res)=>{
      console.log('sendMsg statusCode:',res.statusCode);
      console.log('sendMsg headers:',res.headers);
      res.on('data',(d)=>{
        console.log('Receive from SendMsg:',d);
        resolve(d);
      }).on('error',(err)=>{
        console.log('Error is raised by SendMsg:',err);
        reject(err);
      })
    })
  });
}
function createTerm():ITerms {
  const term:ITerms = {
    id:0,
    GameID:0,
    PDate:'',
    PTime:'',
    TermID:'',
    StopTime:'',
    StopTimeS:'',
    ModifyID:0    
  }
  return term;
}

function timeMoveSec(time:string,df:number):string{
  const hms:number[]=time.split(':').map(s=>{ return parseInt(s,10)});
  let total:number=hms[0]*3600+hms[1]*60+hms[2] + df;
  let sec:number=total % 60;
  let totalmin= (total - sec)/60;
  let min:number= totalmin % 60;
  let hour:number = (totalmin - min)/60;
  return `${JDate.addZeroIfUnderTen(hour)}:${JDate.addZeroIfUnderTen(min)}:${JDate.addZeroIfUnderTen(sec)}`;
}