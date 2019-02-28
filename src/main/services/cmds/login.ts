import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import { Hello } from "./hello";
import { RoomJoin } from "./room-join";

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
                        // Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onBeforeDispatched);
                        Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
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
            cmd.sendCommand().catch(err => reject(err));   
            cmd.destroy();
            cmd = null;     
        })
    }
    static Rooms = {
        onBeforeRoot: {
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandLoginResp) {
                console.log(Tag, 'Rooms', 'onBeforeRoot', 'Resp', cmd.data);
                RoomJoin.Rooms.onBeforeRoot.resp(rooms, cmd);
            }
        }
    }
    static Room = {
        onBeforeRoot: {
            resp(room: Modules.IRoom, cmd: Cmds.CommandLoginResp) {
                console.log(Tag, 'Room', room.item.id , 'onBeforeRoot', 'Resp', cmd.data)
                RoomJoin.Room.onBeforeRoot.resp(room, cmd);
            }
        }
    }    
}