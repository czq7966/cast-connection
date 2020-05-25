import * as Cmds from "../../../../cmds";
import * as Modules from '../../../../modules'
import * as ServiceCmds from '../../../cmds/index'



var Tag = "Service-Module-IO-Signaler"
export class Signaler{
    static async sendCommand(signaler: Modules.Webrtc.IO.ISignaler, cmd: Cmds.ICommandData<any>): Promise<any> {
       return true
    }
    static dispatchCommand(signaler: Modules.Webrtc.IO.ISignaler, cmd: Cmds.ICommandData<any>) {
        signaler.peer.user.room.rooms.dispatcher.onCommand(cmd);
   }
}