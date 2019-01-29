import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { Debug } from "../cmds/common/helper";
import { ServiceUser } from "./user";

var Tag = "ServiceRoomOpen"
export class ServiceRoomOpen extends Cmds.Common.Base {
    static open(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomOpenReq({instanceId: instanceId});
            let currUser = ServiceUser.CurrentUser(instanceId);  
            let user = Object.assign({}, currUser);
            user.room = room;
            cmd.data = {
                props: {
                    user: user                    
                },
                onResp: (cmdResp: Cmds.CommandRoomOpenResp) => {
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                    if (cmdResp.data.props.result) {
                        resolve(cmdResp.data);    
                    } else {
                        reject(cmdResp.data)
                    }
                    
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandRoomOpenRespDataProps>) => {
                    data.props.result = false;
                    data.props.msg = 'time out!'
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
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomOpenResp) {
                console.log(Tag, 'Rooms', 'onDispatched', 'Resp', cmd.data)
                let data = cmd.data;                
                if (data.props.result) {
                    if (!rooms.existRoom(data.props.user.room.id)) {
                        let room = rooms.getRoom(data.props.user.room)
                    }
                }
            }
        }
    }

    static Room = {
        onDispatched: {
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomOpenResp) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Resp', cmd.data)
                let data = cmd.data;                
                if (data.props.result && room.item.id === data.props.user.room.id) {
                    let user = data.props.user
                    let us = Object.assign({}, user);
                    us.room = room.item;
                    if (!room.getUser(us.id)) {
                        room.getUser(us);
                        console.log(room.users)
                    }
                }
            }  
        }
    }    


}