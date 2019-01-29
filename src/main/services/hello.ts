import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { ServiceUser } from "./user";
import { Debug } from "../cmds/common/helper";

var Tag = 'ServiceHello';
export class ServiceHello extends Cmds.Common.Base {
    static sayHello(instanceId: string, user: Cmds.IUser) {
        let cmd = new Cmds.CommandHelloReq({instanceId: instanceId});
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

    static respHello(reqCmd: Cmds.CommandHelloReq, user: Cmds.IUser) {
        let data = reqCmd.data;
        let instanceId = reqCmd.instanceId;
        let cmd = new Cmds.CommandHelloResp({instanceId: instanceId});
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

    // static Rooms = {
    //     onDispatched: {
    //         req(rooms: Modules.IRooms, cmd: Cmds.CommandHelloReq) {
    //             console.log(Tag, 'Rooms', 'onDispatched', 'Req', cmd.data);                   
    //         },
    //         resp(rooms: Modules.IRooms, cmd: Cmds.CommandHelloResp) {
    //             console.log(Tag, 'Rooms', 'onDispatched', 'Resp', cmd.data);               
    //         }  
    //     }
    // }

    static Room = {
        onDispatched: {
            req(room: Modules.IRoom, cmd: Cmds.CommandHelloReq) {
                console.log(Tag, 'Room', 'onDispatched', 'Req', cmd.data);   
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let us = data.props.user;
                    let user = room.getUser(us);
                    let me = room.me().item;
                    ServiceHello.respHello(cmd, me);
                }                
            },
            resp(room: Modules.IRoom, cmd: Cmds.CommandHelloResp) {
                console.log(Tag, 'Room', 'onDispatched', 'Resp', cmd.data);                
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let us = data.props.user;
                    let user = room.getUser(us);                
                }            
            }  
        }
    }    


}