import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { Hello } from "./hello";

var Tag = 'Service-Cmds-Login'
export class Login extends Cmds.Common.Base {
    static isLogin(instanceId: string): boolean {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data;
        return !!(data.props && data.props.user)
    }
    static login(instanceId: string, user: Cmds.IUser): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandLoginReq({instanceId: instanceId})
            cmd.data = {
                props: {
                    user: user
                },
                onResp: (cmdResp: Cmds.CommandLoginResp) => {                
                    let data = cmdResp.data;
                    if (data.props.result) {
                        let instance = cmdResp.getInstance<Cmds.CommandLoginResp>();                        
                        instance.assignData(data);
                        Hello.hello(instanceId, data.props.user);
                        Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                        Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                        resolve(data);
                    } else {
                        console.error('login error', cmdResp.data.props.msg);
                        reject(data)
                    }
                },
                onRespTimeout: (data:  Cmds.ICommandData<Cmds.ICommandLoginRespDataProps>) => {
                    console.log('onTimeout', data)
                    data.props.result = false;
                    data.props.msg = 'time out!'                    
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
                console.log(Tag, 'Rooms', 'onDispatched', 'Resp', cmd.data)
                let data = cmd.data;
                if (data.props.result){
                    let us = data.props.user;
                    let room = rooms.getRoom(us.room.id);
                    if (!room) {
                        room = rooms.getRoom({id: us.room.id});
                        console.log(rooms)
                    }
                }
            }
        }
    }
    static Room = {
        onDispatched: {
            resp(room: Modules.IRoom, cmd: Cmds.CommandLoginResp) {
                console.log(Tag, 'Room', room.item.id , 'onDispatched', 'Resp', cmd.data)
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