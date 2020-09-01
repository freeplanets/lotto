import https from "https";
import {IKeyVal} from "../DataSchema/if";
export interface IParamForGoogleAuth {
  AppName: string;         // program name
  AppInfo: string;         // user name
  SecretCode: string;     // 12345678BXYT
}
export interface IGAValidate {
  Pin: string;
  SecretCode: string;
}
export default class GoogleAuth {
  get SecretCode(): string {
    const str: string[] = [];
    while (str.length < 12) {
      const s = String.fromCharCode(this.Random);
      if (str.indexOf(s) < 0) {
        str.push(s);
      }
    }
    return str.join("");
  }
  get Random() {
    // 48-57 => 0-9
    // 65-90 => A-Z
    const min = 48;
    const max = 90;
    let rnd;
    do {
      rnd = this.myRandom(min, max);
    } while (rnd > 57 && rnd < 65);
    return rnd;
  }
  private PAIR_URL = "https://www.authenticatorApi.com/pair.aspx";
  private VALID_URL = "https://www.authenticatorApi.com/Validate.aspx"; // ?Pin=123456&SecretCode=12345678BXYT
  private Optons: https.RequestOptions = {
    headers: {Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"}
  };
  private curData: IParamForGoogleAuth|undefined;
  public async getIMG(pfga: IParamForGoogleAuth): Promise<string|undefined> {
    /*
    const param: string[] = [];
    Object.keys(pfga).map((key) => {
      param.push(`${key}=${pfga[key]}`);
    });
    */
    const sparam = this.rgParam(pfga);
    // const url: string = `${this.pair_url}?${param.join("&")}`;
    const url: string = `${this.PAIR_URL}?${sparam}`;
    return new Promise((resolve, reject) => {
      https.get(url, this.Optons, (res) => {
        res.setEncoding("binary");
        // const data: any[] = [];
        res.on("data", (d) => {
          console.log("Receive from SendMsg:", d);
          // data.push(Buffer.from(d, "binary"));
          resolve(d);
        }).on("error", (err) => {
          console.log("Error is raised by SendMsg:", err);
          reject(err);
        });
      });
    });
  }
  public async Validate(gav: IGAValidate) {
    const sparam = this.rgParam(gav);
    // const url: string = `${this.pair_url}?${param.join("&")}`;
    const url: string = `${this.VALID_URL}?${sparam}`;
    // console.log("Validate", url);
    return new Promise((resolve, reject) => {
      https.get(url, this.Optons, (res) => {
        res.setEncoding("binary");
        // const data: any[] = [];
        res.on("data", (d) => {
          console.log("Receive from SendMsg:", d);
          // data.push(Buffer.from(d, "binary"));
          resolve(d);
        }).on("error", (err) => {
          console.log("Error is raised by SendMsg:", err);
          reject(err);
        });
      });
    });
  }
  public myRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  private rgParam(kv: any): string {
    const param: string[] = [];
    Object.keys(kv).map((key) => {
      param.push(`${key}=${kv[key]}`);
    });
    return param.join("&");
  }
}
