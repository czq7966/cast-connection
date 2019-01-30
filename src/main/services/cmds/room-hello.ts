import * as Cmds from "../../cmds";
import * as Modules from '../../modules'

var Tag = "Service-Cmds-RoomHello"
export class RoomHello extends Cmds.Common.Base {
    static hello(instanceId: string, fromUser: Cmds.IUser, toUser?: Cmds.IUser, reqCmd?: Cmds.Common.ICommand): Promise<any> {
        let cmd = reqCmd || new Cmds.CommandRoomHelloReq({instanceId: instanceId});
        let to: Cmds.IAddressData = {
            type: toUser ? 'user': 'room',
            id: toUser ? toUser.id: fromUser.room.id
        }
        cmd.data = {
            to: to,
            props: {
                user: fromUser
            }    
        }
        let promise = cmd.sendCommand();        
        !reqCmd && cmd.destroy();
        cmd = null;
        return promise;
    }
 
    static respHello(reqCmd: Cmds.CommandRoomHelloReq, user: Cmds.IUser, respCmd?: Cmds.Common.ICommand) {
        let data = reqCmd.data;
        let instanceId = reqCmd.instanceId;
        let cmd = respCmd || new Cmds.CommandRoomHelloResp({instanceId: instanceId});
        let respData = Object.assign({}, data, {
            type: Cmds.ECommandType.resp,
            to: data.from,
            props: {
                user: user
            }
        })
        cmd.data = respData;
        cmd.sendCommand();        
        !respCmd && cmd.destroy();
        cmd = null;
    }     

    static Room = {
        onDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloReq, respCmd?: Cmds.Common.ICommand) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Req', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let us = data.props.user;
                    let user = room.getUser(us);
                    Object.assign(user.item, us);                    
                    let me = room.me().item;
                    RoomHello.respHello(cmd, me, respCmd);
                }                  
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloResp) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Resp', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let us = data.props.user;
                    let user = room.getUser(us);         
                    Object.assign(user.item, us);
                }                  
            }            
        }  
    }    


}