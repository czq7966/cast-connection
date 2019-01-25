import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { Debug } from "../cmds/common/helper";

var Tag = "ServiceNetwork"
export class ServiceNetwork extends Cmds.Common.Base {

    static Disconnect = {
        Room: {
            onBeforeDispatched: {
                req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                    room.clearUser()                
                }
            }
            
        }  
    }


  


}