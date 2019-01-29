import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { Debug } from "../cmds/common/helper";
import { ServiceUser } from "./user";

var Tag = "ServiceRoomHello"
export class ServiceRoomHello extends Cmds.Common.Base {
    static sayHello(instanceId: string, user: Cmds.IUser) {
        let cmd = new Cmds.CommandRoomHelloReq({instanceId: instanceId});
        cmd.data = {
            to: {type: 'room', id: user.room.id},
            props: {
                user: user
            }    
        }
        cmd.sendCommand();        
        cmd.destroy();
        cmd = null;
    }
 
    static respHello(reqCmd: Cmds.CommandRoomHelloReq, user: Cmds.IUser) {
        let data = reqCmd.data;
        let instanceId = reqCmd.instanceId;
        let cmd = new Cmds.CommandRoomHelloResp({instanceId: instanceId});
        cmd.data = {
            type: Cmds.ECommandType.resp,
            to: data.from,
            props: {
                user: user
            }    
        }
        cmd.sendCommand();        
        cmd.destroy();
        cmd = null;
    }     


    static Room = {
        onDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloReq) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Req', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let us = data.props.user;
                    let user = room.getUser(us);
                    let me = room.me().item;
                    ServiceRoomHello.respHello(cmd, me);
                }                  
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloResp) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Resp', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let us = data.props.user;
                    let user = room.getUser(us);                
                }                  
            }            
        }  
    }    


}