import * as Cmds from "../cmds";
import * as Services from '../services'
import * as Modules from '../modules'

export class ServiceLogin extends Cmds.Common.Base {
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
                        id: Cmds.Common.Helper.uuid()
                    }
                },
                onResp: (cmdResp: Cmds.CommandLoginResp) => {                
                    if (cmdResp.data.props.result) {
                        let instance = cmdResp.getInstance<Cmds.CommandLoginResp>();
                        instance.assignData(cmdResp.data);
                        Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                        Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                        resolve(cmdResp.data);
                    } else {
                        console.error('login error', cmdResp.data.props.msg);
                        reject(cmdResp.data)
                    }
                    cmd.destroy();
                   
                },
                onRespTimeout: (data) => {
                    console.log('onTimeout', data)
                    reject(data);
                }    
            }
            cmd.sendCommand();   
            cmd.destroy();
            cmd = null;     
        })

    }

    static Rooms = {
        onDispatched: {
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandLoginResp) {
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
            resp(room: Modules.IRoom, cmd: Cmds.CommandLoginResp) {
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