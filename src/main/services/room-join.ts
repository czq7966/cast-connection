import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { Debug } from "../cmds/common/helper";
import { ServiceUser } from "./user";
import { ServiceRoomHello } from "./room-hello";

var Tag = "ServiceRoomJoin"
export class ServiceRoomJoin extends Cmds.Common.Base {
    static join(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomJoinReq({instanceId: instanceId});    
            let currUser = ServiceUser.CurrentUser(instanceId); 
            let user = Object.assign({}, currUser);
            user.room = room;
            cmd.data = {
                props: {
                    user: user
                },
                onResp: (cmdResp: Cmds.CommandRoomJoinResp) => {
                    let data = cmdResp.data;
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                    ServiceRoomHello.sayHello(instanceId, data.props.user);
                    if (cmdResp.data.props.result) {
                        resolve(cmdResp.data);    
                    } else {
                        reject(cmdResp.data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandRoomJoinRespDataProps>) => {
                    data.props.result = false;
                    data.props.msg = 'time out!';                    
                    reject(data);    
                }
            }
            cmd.sendCommand();        
            cmd.destroy();
            cmd = null;
        })

    }

 

    static Rooms = {
        onDispatched: {
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomJoinResp) {
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
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomJoinResp) {
                console.log(Tag, 'Room' , room.item.id , 'onDispatched', 'Resp', cmd.data);
                let data = cmd.data;                
                if (data.props.result && room.item.id === data.props.user.room.id) {                    
                    let user = data.props.user;
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