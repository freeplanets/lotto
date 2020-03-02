import {ILunar, Lunar} from "./LunarYear";
export interface IZadicC {
    [key: string]: string;
}
export interface IZadicMap {
    [key: string]: number;
}

export const ZMap: IZadicMap = {};
const Zadic: IZadicC = getAnimals();

export default Zadic;
function getAnimals(): IZadicC {
    const BASE_YEAR: number = 1900;
    const LOOPER: number = 12;
    const ANIMALS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const lunar: ILunar = Lunar(new Date());
    const y: number = lunar.year as number;
    const base: number = (y - BASE_YEAR) % LOOPER;
    const NEW_ANIMALS: number[] = [];
    let animal = ANIMALS[base];
    for (let i = 0; i < LOOPER; i++) {
        NEW_ANIMALS.push(animal);
        animal = animal - 1;
        if (animal === 0) {
            animal = animal + LOOPER;
        }
    }
    const a = {};
    NEW_ANIMALS.map((n, idx) => {
    for (let i = 1; i < 50; i++) {
        if ((i - 1) % LOOPER === idx) {
            if (typeof a[n] === "undefined" ) {
                a[n] = [];
            }
            let tmp = "";
            if (i < 10) {
                tmp = "0" + i;
            } else {
                tmp = tmp + i;
            }
            a[n].push(tmp);
            ZMap[i] = n;
        }
    }
    });
    // console.log("ZMap", ZMap, NEW_ANIMALS);
    const z: IZadicC = {};
    Object.keys(a).map((key) => {
        z[key] = a[key].join(",");
    });
    return z;
}
