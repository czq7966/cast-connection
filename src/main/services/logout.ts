import * as Cmds from "../cmds";
import { IRooms } from "../rooms";
import { IRoom } from "../room";

export class ServiceLogout extends Cmds.Base {
    static logout(instanceId: string): Promise<any> {
        let cmd = new Cmds.CommandLogoutReq({instanceId: instanceId});
        let user = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data.props.user;
        cmd.data = {
            props: {
                user: user
            }    
        }
        let promise = cmd.sendCommand();        
        cmd.destroy();
        cmd = null;
        return promise
    }

 

    static Rooms = {
        onDispatched: {
            req(rooms: IRooms, cmd: Cmds.CommandLogoutReq) {
                console.log('Rooms_onDispatched_Req', cmd)

            }
        }
    }

    static Room = {
        onDispatched: {
            req(room: IRoom, cmd: Cmds.CommandLogoutReq) {
                console.log('Room_onDispatched_Req', cmd);
            }  
        }
    }    


}