import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { RoomHello } from "./room-hello";

var Tag = 'Service-Cmds-Hello';
export class Hello extends Cmds.Common.Base {
    static hello(instanceId: string, fromUser: Cmds.IUser, toUser?: Cmds.IUser) {
        let cmd = new Cmds.CommandHelloReq({instanceId: instanceId});
        RoomHello.hello(instanceId, fromUser, toUser, cmd)
        cmd.destroy();
        cmd = null;
    }
    static respHello(reqCmd: Cmds.CommandHelloReq, user: Cmds.IUser) {
        let instanceId = reqCmd.instanceId;
        let cmd = new Cmds.CommandHelloResp({instanceId: instanceId});
        RoomHello.respHello(reqCmd, user, cmd)
        cmd.destroy();
        cmd = null;
    }        
    static Room = {
        onBeforeRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandHelloReq) {
                console.log(Tag, 'Room',  room.item.id ,'onBeforeRoot', 'Req', cmd.data); 
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let respCmd = new Cmds.CommandHelloResp({instanceId: room.instanceId});  
                    RoomHello.Room.onBeforeRoot.req(room, cmd, respCmd);
                }                
            },
            resp(room: Modules.IRoom, cmd: Cmds.CommandHelloResp) {
                console.log(Tag, 'Room',  room.item.id ,'onBeforeRoot', 'Resp', cmd.data);                
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    RoomHello.Room.onBeforeRoot.resp(room, cmd);
                }            
            }  
        }
    } 
}