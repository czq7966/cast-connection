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
                    if (data.respResult) {
                        let instance = cmdResp.getInstance<Cmds.CommandLoginResp>();                        
                        instance.assignData(data);
                        Hello.hello(instanceId, data.props.user);
                        Cmds.Common.EDCoder.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                        resolve(data);
                    } else {
                        adhoc_cast_connection_console.error('login error', cmdResp.data.respMsg);
                        reject(data)
                    }
                },
                onRespTimeout: (data:  Cmds.ICommandData<Cmds.ICommandLoginRespDataProps>) => {
                    adhoc_cast_connection_console.log('onTimeout', data)
                    data.respResult = false;
                    data.respMsg = 'time out!'                    
                    reject(data);
                },
                // respTimeout: 30 * 1000   
            }
            cmd.sendCommand().catch(err => reject(err));   
            cmd.destroy();
            cmd = null;     
        })
    }
    static Rooms = {
        onBeforeRoot: {
            resp(rooms: Modules.IRooms, cmd: Cmds.CommandLoginResp) {
                adhoc_cast_connection_console.log(Tag, 'Rooms', 'onBeforeRoot', 'Resp', cmd.data);
                RoomJoin.Rooms.onBeforeRoot.resp(rooms, cmd);
            }
        }
    }
    static Room = {
        onBeforeRoot: {
            resp(room: Modules.IRoom, cmd: Cmds.CommandLoginResp) {
                adhoc_cast_connection_console.log(Tag, 'Room', room.item.id , 'onBeforeRoot', 'Resp', cmd.data)
                RoomJoin.Room.onBeforeRoot.resp(room, cmd);
            }
        }
    }    
    static Connection = {
        onBeforeRoot: {
            resp(connection: Modules.IConnection, cmd: Cmds.CommandLoginResp) {
                adhoc_cast_connection_console.log(Tag, 'Connection', 'onBeforeRoot', 'Resp', cmd.data)
                let data = cmd.data;
                if (data.respResult && data.extra) {
                    Object.assign(connection.params, data.extra);
                    Object.assign(Modules.Webrtc.Config.Default, data.extra);
                }
            }
        }        
    }
}