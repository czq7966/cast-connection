import * as ADHOCCAST from "./dts"
declare var process: {
    env: {
        NODE_ENV: string,
        LIBRARY_TARGET: string
    }
}
let exp: Object;
switch(process.env.LIBRARY_TARGET) {
    case 'umd':
        exp = { ADHOCCAST }
        break;
    default: 
        exp = ADHOCCAST;
        break;
}

export = exp;


adhoc_cast_connection_console.log('1111111111111111111', adhoc_cast_connection_console)