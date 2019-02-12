import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { User } from "./user";

var Tag = "Service-Cmds-RoomLeave"
export class RoomLeave extends Cmds.Common.Base {
    static leave(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomLeaveReq({instanceId: instanceId}); 
            let currUser = User.CurrentUser(instanceId);   
            let user = Object.assign({}, currUser);
            user.room = room;           
            cmd.data = {
                props: {
                    user: user
                },
                onResp: (respCmd: Cmds.CommandRoomLeaveResp) => {
                    let data = respCmd.data;
                    // Cmds.Common.Dispatcher.dispatch(respCmd , Cmds.ECommandDispatchEvents.onBeforeDispatched);
                    Cmds.Common.Dispatcher.dispatch(respCmd , Cmds.ECommandDispatchEvents.onDispatched);
                    if (data.props.result) {
                        resolve(data);    
                    } else {
                        reject(data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandRoomLeaveRespDataProps>) => {
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
        onAfterRoot: {
            req(rooms: Modules.IRooms, cmd: Cmds.CommandRoomLeaveReq) {
                console.log(Tag, 'Rooms', 'onAfterRoot', 'Req', cmd.data);
                let data = cmd.data;                
                let room = rooms.getRoom(data.props.user.room.id);
                if (room && room.users.count() == 0) {                    
                    rooms.delRoom(room.item.id)
                }    
            },            
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomLeaveResp) {
                console.log(Tag, 'Rooms', 'onBeforeDispatched', 'Resp', cmd.data);
                let data = cmd.data;                
                let room = rooms.getRoom(data.props.user.room.id);
                if (room && room.users.count() == 0) {                    
                    rooms.delRoom(room.item.id)
                }                
            }          
        }        
    }

    static Room = {
        onAfterRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomLeaveReq) {
                console.log(Tag, 'Room', room.item.id ,'onAfterRoot', 'Req', cmd.data);
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {                    
                    let me = room.me();                    
                    if (me && me.item.id === data.props.user.id) {
                        room.clearUser();
                    } else {
                        room.delUser(data.props.user.id);
                    }
                }
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomLeaveResp) {
                console.log(Tag, 'Room', room.item.id , 'onAfterRoot', 'Resp', cmd.data)
                let data = cmd.data;
                if (data.props.result && room.item.id === data.props.user.room.id) {                    
                    let me = room.me();                    
                    if (me && me.item.id === data.props.user.id) {
                        room.clearUser();
                    } else {
                        room.delUser(data.props.user.id);
                    }
                } 
            }            
        }  
    }    


}