import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { User } from "./user";
import { RoomLeave } from "./room-leave";

var Tag = "Service-Cmds-Logout"
export class Logout extends Cmds.Common.Base {
    static logout(instanceId: string): Promise<any> {
        return new Promise((resolve, reject) => { 
            let cmd = new Cmds.CommandLogoutReq({instanceId: instanceId});
            let currUser = User.CurrentUser(instanceId);   
            cmd.data = {
                props: {
                    user: currUser
                },
                onResp: (cmdResp: Cmds.CommandLoginResp) => {
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                    Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                    if (cmdResp.data.props.result) {
                        resolve(cmdResp.data);    
                    } else {
                        reject(cmdResp.data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandLogoutRespDataProps>) => {
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
        onBeforeDispatched: {
            req(rooms: Modules.IRooms, cmd: Cmds.CommandRoomLeaveReq) {
                console.log(Tag, 'Rooms', 'onBeforeDispatched', 'Req', cmd.data);
                RoomLeave.Rooms.onBeforeDispatched.req(rooms, cmd);
                // let data = cmd.data;                
                // let room = rooms.getRoom(data.props.user.room.id);
                // if (room && room.users.count() == 0) {                    
                //     rooms.delRoom(room.item.id)
                // }    
            },            
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomLeaveResp) {
                console.log(Tag, 'Rooms', 'onBeforeDispatched', 'Resp', cmd.data);
                RoomLeave.Rooms.onBeforeDispatched.resp(rooms, cmd);
                // let data = cmd.data;                
                // let room = rooms.getRoom(data.props.user.room.id);
                // if (room && room.users.count() == 0) {                    
                //     rooms.delRoom(room.item.id)
                // }                
            } 
        }
    }

    static Room = {
        onBeforeDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandLogoutReq) {
                console.log(Tag, 'Room', room.item.id, 'onBeforeDispatched', 'Req', cmd.data)
                let user = cmd.data.props.user;
                let me = room.me();
                if (me && user.id === me.item.id) {
                    room.clearUser()
                } else {
                    room.delUser(user.id)
                }
            },
            resp(room: Modules.IRoom, cmd: Cmds.CommandLogoutResp) {
                console.log(Tag, 'Room', room.item.id, 'onBeforeDispatched', 'Resp', cmd.data)
                let user = cmd.data.props.user;
                let me = room.me();
                if (me && user.id === me.item.id) {
                    room.clearUser()
                } else {
                    room.delUser(user.id)
                }
            },            
        }
    }    


}