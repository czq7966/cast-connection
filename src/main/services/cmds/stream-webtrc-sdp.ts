import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'

var Tag = "Service-Cmds-StreamWebrtcSdp"
export class StreamWebrtcSdp {
    static req(instanceId: string, toUser: Cmds.IUser, sdp: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let cmd = new Cmds.CommandStreamWebrtcSdpReq({instanceId: instanceId})
            let user = Object.assign({}, toUser);
            user.extra = sdp;
            cmd.data = {
                to: {type: 'user', id: toUser.id},
                props: {
                    user: user
                },
                onResp: (cmdResp: Cmds.CommandStreamWebrtcSdpResp) => {                
                    let data = cmdResp.data;
                    if (data.props.result) {
                        Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onBeforeDispatched);
                        Cmds.Common.CmdDispatcher.dispatch(cmdResp , Cmds.ECommandEvents.onDispatched);
                        resolve(data);
                    } else {
                        console.error('login error', cmdResp.data.props.msg);
                        reject(data)
                    }
                },
                onRespTimeout: (data:  Cmds.ICommandData<Cmds.ICommandRespDataProps>) => {
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
    static resp(reqCmd: Cmds.CommandStreamWebrtcSdpReq, fromUser: Cmds.IUser, sdp: any, msg?: string): Promise<any> {
        let data = reqCmd.data;
        let instanceId = reqCmd.instanceId;
        let cmd =  new Cmds.CommandStreamWebrtcSdpResp({instanceId: instanceId});
        let user = Object.assign({}, fromUser);
        user.extra = sdp;
        let respData = Object.assign({}, data, {
            type: Cmds.ECommandType.resp,
            to: data.from,
            props: {
                result: msg ? false : true,
                msg: msg,
                user: user
            }
        })
        cmd.data = respData;
        let promise = cmd.sendCommand();        
        cmd.destroy();
        cmd = null;
        return promise;
    }       

    static offer(mUser: Modules.IUser): Promise<any> {
        return new Promise((resolve, reject) => {
            let peer = mUser.getPeer();
            ServiceModules.Peer.createOffer(peer)
            .then(sdp => {
                this.req(mUser.instanceId, mUser.item, sdp)
                .then(data => {
                    resolve(data)
                })
                .catch(data => {
                    reject(data)
                })
            })
            .catch(err => {
                reject(err)
            })
        })
    }
    static answer(mUser: Modules.IUser, reqCmd: Cmds.CommandStreamWebrtcSdpReq): Promise<any> {
        return new Promise((resolve, reject) => {
            let peer = mUser.getPeer();
            let user = mUser.item;
            ServiceModules.Peer.createAnswer(peer)
            .then(sdp => {
                this.resp(reqCmd, user, sdp)
                .then(data => {
                    resolve(data)
                })
                .catch(data => {
                    reject(data)
                })
            })
            .catch(err => {
                reject(err)
            })
        })
    }   

    static User = {
        onDispatched: {
            req(mUser: Modules.IUser, cmd: Cmds.CommandStreamWebrtcSdpReq) {
                let data = cmd.data;
                if (mUser.item.id === data.props.user.id && mUser.item.room.id === data.props.user.room.id) {
                    console.log(Tag, 'User', mUser.item.room.id , 'onDispatched', 'Req', cmd.data);
                    mUser.getPeer();
                }                  
            },
            resp(mUser: Modules.IUser, cmd: Cmds.CommandStreamWebrtcSdpResp) {
                let data = cmd.data;
                if (mUser.item.id === data.props.user.id && mUser.item.room.id === data.props.user.room.id) {
                    console.log(Tag, 'User', mUser.item.room.id , 'onDispatched', 'Resp', cmd.data);
                }                  
            }                      
        },        
    } 
    static Peer = {
        onDispatched: {
            req(peer: Modules.IPeer, cmd: Cmds.CommandStreamWebrtcSdpReq) {
                let data = cmd.data;
                let mUser = peer.user;
                let user = data.props.user;
                if (mUser.item.id === user.id && mUser.item.room.id === user.room.id) {
                    console.log(Tag, 'Peer', mUser.item.room.id , 'onDispatched', 'Req', cmd.data);                    
                    let sdp = user.extra;
                    ServiceModules.Peer.setOffer(peer, sdp)
                    .then(() => {
                        StreamWebrtcSdp.answer(mUser, cmd)
                    })
                    .catch(err => {
                        StreamWebrtcSdp.resp(cmd, user, null, err)
                    })
                }                  
            },
            resp(peer: Modules.IPeer, cmd: Cmds.CommandStreamWebrtcSdpResp) {
                let data = cmd.data;
                let mUser = peer.user;
                let user = data.props.user;
                if (mUser.item.id === user.id && mUser.item.room.id === user.room.id) {
                    console.log(Tag, 'Peer', mUser.item.room.id , 'onDispatched', 'Resp', cmd.data);
                    let sdp = user.extra;
                    ServiceModules.Peer.setAnswer(peer, sdp);
                }                   
            }                      
        },        
    }      

}