import https from "https";
import zip from "zlib";
export interface IParamForGoogleAuth {
  AppName: string;         // program name
  AppInfo: string;         // user name
  SecretCode: string;     // 12345678BXYT
}
export default class GoogleAuth {
  private url = "https://www.authenticatorApi.com/pair.aspx";
  private curData: IParamForGoogleAuth|undefined;
  public async getIMG(pfga: IParamForGoogleAuth): Promise<string|undefined> {
    const Optons: https.RequestOptions = {
      headers: {Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"}
    };
    const param: string[] = [];
    Object.keys(pfga).map((key) => {
      param.push(`${key}=${pfga[key]}`);
    });
    const url: string = `${this.url}?${param.join("&")}`;
    return new Promise((resolve, reject) => {
      https.get(url, Optons, (res) => {
        res.setEncoding("binary");
        const data: any[] = [];
        res.on("data", (d) => {
          console.log("Receive from SendMsg:", d);
          data.push(Buffer.from(d, "binary"));
          resolve(d);
        }).on("error", (err) => {
          console.log("Error is raised by SendMsg:", err);
          reject(err);
        });
      });
    });
  }
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
  public myRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
