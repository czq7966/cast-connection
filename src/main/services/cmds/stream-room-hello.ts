import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { RoomHello } from "./room-hello";

var Tag = "Service-Cmds-StreamRoomHello"
export class StreamRoomHello extends Cmds.Common.Base {
    static hello(instanceId: string, fromUser: Cmds.IUser, toUser?: Cmds.IUser): Promise<any> {
        let cmd = new Cmds.CommandStreamRoomHelloReq({instanceId: instanceId});
        let promise = RoomHello.hello(instanceId, fromUser, toUser, cmd)
        cmd.destroy();
        cmd = null;
        return promise
    }
 
    static respHello(reqCmd: Cmds.CommandStreamRoomHelloReq, user: Cmds.IUser) {
        let instanceId = reqCmd.instanceId;
        let cmd = new Cmds.CommandStreamRoomHelloResp({instanceId: instanceId});
        RoomHello.respHello(reqCmd, user, cmd)
        cmd.destroy();
        cmd = null;
    }     


    static Room = {
        onDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloReq) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Req', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let respCmd = new Cmds.CommandStreamRoomHelloResp({instanceId: room.instanceId});
                    RoomHello.Room.onDispatched.req(room, cmd, respCmd);
                    respCmd.destroy()
                    respCmd = null;
                }                  
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloResp) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Resp', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    RoomHello.Room.onDispatched.resp(room, cmd)
                }                  
            }            
        }  
    }    


}