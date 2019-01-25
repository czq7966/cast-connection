import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { Debug } from "../cmds/common/helper";

var Tag = "ServiceRoomOpen"
export class ServiceRoomOpen extends Cmds.Common.Base {
    static open(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomOpenReq({instanceId: instanceId});
            let user = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data.props.user;
            cmd.data = {
                props: {
                    room: room
                },
                onResp: (cmdResp: Cmds.CommandRoomOpenResp) => {
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                    resolve(cmd.data);    
                },
                onRespTimeout: (data) => {
                    reject(data)    
                }
            }
            cmd.sendCommand();        
            cmd.destroy();
            cmd = null;
        })

    }

 

    static Rooms = {
        onDispatched: {
            req(rooms: Modules.IRooms, cmd: Cmds.CommandLogoutReq) {
                Debug.log(Tag, 'Rooms', 'onDispatched', cmd.data)

            }
        },
        onBeforeDispatched: {
            req(rooms: Modules.IRooms, cmd: Cmds.CommandLogoutReq) {
                Debug.log(Tag, 'Rooms', 'onBeforeDispatched', cmd.data)
            }
        }
    }

    static Room = {
        onDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                Debug.log('Room_onDispatched_Req', cmd);
            }  
        },
        onBeforeDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                Debug.log(Tag, 'Room', 'onBeforeDispatched', cmd.data)
                let user = cmd.data.props.user;
                let you = room.you();
                if (you && user.id === you.item.id) {
                    room.clearUser()
                } else {
                    room.delUser(user.id)
                }
                Debug.log(room.users.count())
            }
        }
    }    


}