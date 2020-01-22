import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules'

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
            let promise: Promise<any>
            if (toUser)
                promise = cmd.sendCommandForResp();
            else 
                promise = cmd.sendCommand();        

            !reqCmd && cmd.destroy();
            cmd = null;
            return promise;

                
        // return new Promise((resolve, reject) => {
        //     let cmd = reqCmd || new Cmds.CommandRoomHelloReq({instanceId: instanceId});
        //     let to: Cmds.IAddressData = {
        //         type: toUser ? 'user': 'room',
        //         id: toUser ? toUser.id: fromUser.room.id
        //     }
        //     cmd.data = {
        //         to: to,
        //         props: {
        //             user: fromUser
        //         },            
        //         onResp: toUser? (cmdResp: Cmds.CommandRoomHelloResp) => {
        //             let data = cmdResp.data;
        //             Cmds.Common.EDCoder.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
        //             resolve(data);    
        //         } : null ,
        //         onRespTimeout: toUser? (data: Cmds.ICommandData<Cmds.ICommandRoomHelloRespDataProps>) => {
        //             data.respResult = false;
        //             data.respMsg = 'time out!'
        //             reject(data)    
        //         }: null
    
        //     }
        //     let promise = cmd.sendCommand();        
        //     !reqCmd && cmd.destroy();
        //     cmd = null;
        //     return promise;
        // })
        
    }
 
    static respHello(reqCmd: Cmds.CommandRoomHelloReq, user: Cmds.IUser, respCmd?: Cmds.Common.ICommand): Promise<any> {
        let data = reqCmd.data;
        let instanceId = reqCmd.instanceId;
        let cmd = respCmd || new Cmds.CommandRoomHelloResp({instanceId: instanceId});
        let respData = Object.assign({}, data, {
            type: Cmds.ECommandType.resp,
            from: null,
            to: data.from,
            props: {
                user: user
            },
            respResult: true
        })
        cmd.data = respData;
        let promise = cmd.sendCommand();        
        !respCmd && cmd.destroy();
        cmd = null;
        return promise;
    }     

    static Room = {
        onBeforeRoot: {
            req(room: Modules.IRoom, cmd: Cmds.CommandRoomHelloReq, respCmd?: Cmds.Common.ICommand) {
                adhoc_cast_connection_console.log(Tag, 'Room', room.item.id , 'onBeforeRoot', 'Req', cmd.data)
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
                adhoc_cast_connection_console.log(Tag, 'Room', room.item.id , 'onBeforeRoot', 'Resp', cmd.data)
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