import * as Cmds from "../cmds";
import { IRooms } from "../rooms";
import { IRoom } from "../room";

export class ServiceHello extends Cmds.Base {
    static sayHello(instanceId: string) {
        let cmd = new Cmds.CommandHelloReq({instanceId: instanceId});
        let user = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data.props.user;
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

    static respHello(reqCmd: Cmds.CommandHelloReq) {
        let instanceId = reqCmd.instanceId;
        let cmd = new Cmds.CommandHelloResp({instanceId: instanceId});
        let user = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data.props.user;
        cmd.data = {
            type: Cmds.ECommandType.resp,
            to: {type: 'room', id: user.room.id},
            props: {
                user: user
            }    
        }
        cmd.sendCommand();        
        cmd.destroy();
        cmd = null;
    }    

    static Rooms = {
        onDispatched: {
            req(rooms: IRooms, cmd: Cmds.CommandHelloReq) {
                console.log('Rooms_onDispatched_Req', cmd)
                ServiceHello.respHello(cmd);
            },
            resp(rooms: IRooms, cmd: Cmds.CommandHelloResp) {
                console.log('Rooms_onDispatched_Resp', cmd)
                
            }  
        }
    }

    static Room = {
        onDispatched: {
            req(room: IRoom, cmd: Cmds.CommandHelloReq) {
                console.log('Room_onDispatched_Req', cmd);
                let us = cmd.data.props.user;
                let user = room.getUser(us);
            },
            resp(room: IRoom, cmd: Cmds.CommandHelloResp) {
                console.log('Room_onDispatched_Resp', cmd);
                let us = cmd.data.props.user;
                let user = room.getUser(us);                
            }  
        }
    }    


}