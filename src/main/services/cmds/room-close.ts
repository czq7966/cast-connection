import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { User } from "./user";

var Tag = "Service-Cmds-RoomClose"
export class RoomClose extends Cmds.Common.Base {
    static close(instanceId: string, room: Cmds.IRoom): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandRoomCloseReq({instanceId: instanceId});   
            let currUser = User.CurrentUser(instanceId);   
            let user = Object.assign({}, currUser);
            user.room = room;           
            cmd.data = {
                props: {
                    user: user
                },
                onResp: (cmdResp: Cmds.CommandRoomCloseResp) => {
                    Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onBeforeDispatched);
                    Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                    if (cmdResp.data.props.result) {
                        resolve(cmdResp.data);    
                    } else {
                        reject(cmdResp.data)
                    } 
                },
                onRespTimeout: (data: Cmds.ICommandData<Cmds.ICommandRoomCloseRespDataProps>) => {
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
            req(rooms: Modules.IRooms, cmd: Cmds.CommandRoomCloseReq) {
                console.log(Tag, 'Rooms',  'onAfterRoot', 'Req', cmd.data)
                let data = cmd.data;
                rooms.delRoom(data.props.user.room.id);
            },            
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandRoomCloseResp) {
                console.log(Tag, 'Rooms', 'onAfterRoot', 'Resp', cmd.data)                    
                let data = cmd.data;
                if (data.props.result) {                    
                    rooms.delRoom(data.props.user.room.id);
                } 
            }          
        }        
    }

    static Room = {
        onAfterRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomCloseReq) {
                console.log(Tag, 'Room', room.item.id , 'onAfterRoot', 'Req', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {                    
                    room.clearUser();
                }
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomCloseResp) {
                console.log(Tag, 'Room', room.item.id , 'onAfterRoot', 'Resp', cmd.data)
                let data = cmd.data;
                if (data.props.result && room.item.id === data.props.user.room.id) {                    
                    room.clearUser();
                } 
            }            
        }  
    }    


}