import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { User } from "./user";

var Tag = "Service-Cmds-RoomJoin"
export class RoomJoin extends Cmds.Common.Base {
    static join(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomJoinReq({instanceId: instanceId});    
            let currUser = User.CurrentUser(instanceId); 
            let user = Object.assign({}, currUser);
            user.room = room;
            cmd.data = {
                props: {
                    user: user
                },
                onResp: (cmdResp: Cmds.CommandRoomJoinResp) => {
                    let data = cmdResp.data;
                    Cmds.Common.EDCoder.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                    if (data.respResult) {
                        resolve(data);    
                    } else {
                        reject(data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandRoomJoinRespDataProps>) => {
                    data.respResult = false;
                    data.respMsg = 'time out!';                    
                    reject(data);    
                }
            }
            cmd.sendCommand();        
            cmd.destroy();
            cmd = null;
        })

    }

 

    static Rooms = {
        onBeforeRoot: {
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomJoinResp) {
                console.log(Tag, 'Rooms', 'onBeforeRoot', 'Resp', cmd.data)
                let data = cmd.data;
                if (data.respResult) {
                    let room = rooms.getRoom(data.props.user.room);
                    let pRoom =  room.getParent();
                    pRoom && room.eventRooter.setParent(pRoom.subEventRooter)
                }
            }
        }
    }

    static Room = {
        onBeforeRoot: {
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomJoinResp) {
                console.log(Tag, 'Room' , room.item.id , 'onBeforeRoot', 'Resp', cmd.data);
                let data = cmd.data;                
                if (data.respResult && room.item.id === data.props.user.room.id) {                    
                    let user = data.props.user;
                    let us = Object.assign({}, user);
                    us.room = room.item;
                    room.getUser(us);
                }
            }  
        }
    }    


}