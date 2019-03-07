import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules'

var Tag = "Service-Cmds-RoomHello"
export class RoomHello extends Cmds.Common.Base {
    static hello(instanceId: string, fromUser: Cmds.IUser, toUser?: Cmds.IUser, reqCmd?: Cmds.Common.ICommand): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = reqCmd || new Cmds.CommandRoomHelloReq({instanceId: instanceId});
            let to: Cmds.IAddressData = {
                type: toUser ? 'user': 'room',
                id: toUser ? toUser.id: fromUser.room.id
            }
            cmd.data = {
                to: to,
                props: {
                    user: fromUser
                },            
                onResp: toUser? (cmdResp: Cmds.CommandRoomHelloResp) => {
                    let data = cmdResp.data;
                    Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                    resolve(data);    
                } : null ,
                onRespTimeout: toUser? (data: Cmds.ICommandData<Cmds.ICommandRoomHelloRespDataProps>) => {
                    data.respResult = false;
                    data.respMsg = 'time out!'
                    reject(data)    
                }: null
    
            }
            let promise = cmd.sendCommand();        
            !reqCmd && cmd.destroy();
            cmd = null;
            return promise;
        })
        
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
        onBeforeRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloReq, respCmd?: Cmds.Common.ICommand) {
                console.log(Tag, 'Room', room.item.id , 'onBeforeRoot', 'Req', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let user = data.props.user;
                    let states = user.states;
                    user.states = Cmds.EUserState.none;
                    let mUser = room.getUser(user);
                    user.states = states;
                    ServiceModules.User.update(mUser, user)
                    let me = room.me().item;
                    RoomHello.respHello(cmd, me, respCmd);
                }                  
            },            
            resp(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloResp) {
                console.log(Tag, 'Room', room.item.id , 'onBeforeRoot', 'Resp', cmd.data)
                let data = cmd.data;
                if (room.item.id === data.props.user.room.id) {
                    let user = data.props.user;
                    let states = user.states;
                    user.states = Cmds.EUserState.none;
                    let mUser = room.getUser(user);
                    user.states = states;
                    ServiceModules.User.update(mUser, user)
                }                  
            }            
        }  
    }    


}