import { HostInfo } from "./host-info";

export class Debug {
    public static enabled = false;
    public static log(...args: any[]) {
        this.enabled && console.log(...args);
    }
    public static warn(...args: any[]) {
        this.enabled && console.warn(...args);
    }    
    public static dir(...args: any[]) {
        this.enabled && console.dir(...args);
    }
    public static trace(...args: any[]) {
        this.enabled && console.trace(...args);
    }
    public static error(...args: any[]) {
        this.enabled && console.error(...args)
    }
    
}
let _global
if (HostInfo.IsNode)
    _global = global
else 
    _global = window
_global["adhoc_cast_connection_console"] = Debug