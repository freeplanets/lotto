import CryptoJS from "crypto-js";

export default class EncDecString {
    private key: string;
    private opt: CryptoJS.CipherOption;
    constructor(tkey: string= "") {
        if (!tkey) {
            tkey = CryptoJS.MD5("keyforthepassword").toString();
        }
        console.log("EncDecString", tkey);
        this.key = CryptoJS.enc.Utf8.parse(tkey);
        this.opt = {
            keySize: 128 / 8,
            iv: this.key,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.AnsiX923
        };
    }
    public Encrypted(str: string): string {
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(str), this.key, this.opt).toString();
    }
    public Decrypted(str: string): string {
        return CryptoJS.AES.decrypt(str, this.key, this.opt).toString(CryptoJS.enc.Utf8);
    }
    get KeyString(): string {
        const s: string = new Date().getTime() + "rr" + Math.random();
        return CryptoJS.MD5(s).toString();
    }
}
