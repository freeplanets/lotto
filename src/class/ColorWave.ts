const ColorWave: number[] = [];
for (let i = 1; i < 50; i++) {
    ColorWave[i] = colorWave(i);
}
export default ColorWave;

function colorWave(v: number): number {
    /*
    let v:number;
    if(typeof num ==='string'){
        v = parseInt(num,10);
    } else {
        v = num;
    }
    */
    const color = [2, 0, 0, 1, 1, 2];
    const key = Math.floor((v - 1) / 10);
    return color[(v + key) % 6 ];
}
