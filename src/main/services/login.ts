import * as Cmds from "../cmds";
import { ServiceHello } from "./hello";
import { IRooms } from "../rooms";
import { Dispatcher } from "../dispatcher";
import { IRoom } from "../room";

export class ServiceLogin extends Cmds.Base {
    static isLogin(instanceId: string): boolean {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data;
        return !!(data.props && data.props.user)
    }
    static login(instanceId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandLoginReq({instanceId: instanceId})
            cmd.data = {
                props: {
                    user: { 
                        id: Cmds.Helper.uuid()
                    }
                },
                onResp: (cmdResp: Cmds.CommandLoginResp) => {                
                    if (cmdResp.data.props.result) {
                        let instance = cmdResp.getInstance<Cmds.CommandLoginResp>();
                        instance.assignData(cmdResp.data);
                        instance.instanceEventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmdResp);                     
                        Dispatcher.getInstance(instanceId).eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmdResp); 
                        resolve(cmdResp);
                    } else {
                        console.error('login error', cmdResp.data.props.msg);
                        reject(cmdResp)
                    }
                    cmd.destroy();
                   
                },
                onRespTimeout: (cmd) => {
                    console.log('onTimeout', cmd)
                    reject(cmd);
                }    
            }
            cmd.sendCommand();        
        })

    }

    static Rooms = {
        onDispatched: {
            resp(rooms: IRooms, cmd: Cmds.CommandLoginResp) {
                let data = cmd.data;
                if (data.props.result){
                    let rm = data.props.user.room;            
                    let room = rooms.getRoom(rm.id);
                    if (!room) {
                        room = rooms.getRoom(rm);
                        console.log(rooms)
                    }
                }
            }
        }
    }
    static Room = {
        onDispatched: {
            resp(room: IRoom, cmd: Cmds.CommandLoginResp) {
                //other room , return
                if (room.item.id !== cmd.data.props.user.room.id) {
                    return;
                }
        
                let data = cmd.data;
                if (data.props.result){
                    let us = data.props.user;
                    let user = room.getUser(us.id);
                    if (!user) {
                        user = room.getUser(us);
                    }
                }
            }
        }
    }    
}