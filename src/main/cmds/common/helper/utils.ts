export function calResolutionRange(x: number, y: number, x1: number, y1: number, x2: number, y2: number): Array<number> {
    let _x1 = x1, _x2 = x2, _y1 = y1, _y2 = y2;
    x1 = _x1 > _x2 ? _x2 : _x1;
    x2 = _x1 > _x2 ? _x1 : _x2;
    y1 = _y1 > _y2 ? _y2 : _y1;
    y2 = _y1 > _y2 ? _y1 : _y2;

    let z = x / y;
    let z1 = x1 / y2;
    let z2 = x2 / y1;
    if (z < z1) {
        _x1 = x / y * y2;
        _x1 = _x1 > x ? x : _x1;
        _y2 = _x1 * y / x;
        _x2 = x2 - (x1-_x1);
        _y1 = y1 - (y2 - _y2);            
    } else if (z >= z1 && z <= z2) {
        let xoff = 0;
        let yoff = 0;
        if ( x < x1) {
            xoff = x1 - x;
            yoff = y1 - y;                
        }
        _x1 = x1 - xoff;
        _x2 = x2 - xoff;
        _y1 = y1 - yoff;
        _y2 = y2 - yoff;            
    } else if (z > z2 ) {
        _y1 = x2 / x * y;
        _y1 = _y1 > y ? y : _y1;
        _x2 = _y1 * x / y;
        _x1 = x1 - (x2 - _x2);
        _y2 = y2 - (y1 - _y1);        
    }
    return [_x1, _y1, _x2, _y2]

}
export function versionToCode(version: string, byteLen?: number): number {
    byteLen = byteLen || 2;
    version = version || '0';
    version = version + '.0.0.0.0'
    let versions = version.split('.');
    let code: number = 0;
    let major = parseInt(versions[0]) << 8 * byteLen * 3;
    let minor = parseInt(versions[1]) << 8 * byteLen * 2;
    let patch = parseInt(versions[2]) << 8 * byteLen * 1;
    let build = parseInt(versions[3]) << 8 * byteLen * 0;
    code = major + minor + patch + build;
    return code;
}