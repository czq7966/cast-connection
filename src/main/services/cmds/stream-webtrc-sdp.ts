import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'

var Tag = "Service-Cmds-StreamWebrtcSdp"
export class StreamWebrtcSdp {
    static req(instanceId: string, toUser: Cmds.IUser,  sdp: any): Promise<any> {
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
                    if (data.respResult) {
                        Cmds.Common.Dispatcher.dispatch(cmdResp , Cmds.ECommandDispatchEvents.onDispatched);
                        resolve(data);
                    } else {
                        console.error('login error', cmdResp.data.respMsg);
                        reject(data)
                    }
                },
                onRespTimeout: (data:  Cmds.ICommandData<Cmds.ICommandRespDataProps>) => {
                    console.log('onTimeout', data)
                    data.respResult = false;
                    data.respMsg = 'time out!'                    
                    reject(data);
                }    
            }
            cmd.sendCommand();   
            cmd.destroy();
            cmd = null;     
        })

    }
    static resp(reqCmd: Cmds.CommandStreamWebrtcSdpReq, toUser: Cmds.IUser, sdp: any, msg?: string): Promise<any> {
        let data = reqCmd.data;
        let instanceId = reqCmd.instanceId;
        let cmd =  new Cmds.CommandStreamWebrtcSdpResp({instanceId: instanceId});
        let user = Object.assign({}, toUser);
        user.extra = sdp;
        let respData: Cmds.ICommandData<Cmds.ICommandRespDataProps> = Object.assign({}, data, {
            type: Cmds.ECommandType.resp,
            from: null,
            to: data.from,
            props: {
                user: user
            },
            respResult: msg ? false : true,
            respMsg: msg,            
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
            ServiceModules.Webrtc.Peer.createOffer(peer)
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
            ServiceModules.Webrtc.Peer.createAnswer(peer)
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
        onBeforeRoot: {
            req(mUser: Modules.IUser, cmd: Cmds.CommandStreamWebrtcSdpReq) {
                let data = cmd.data;
                if (mUser.item.id === data.props.user.id && mUser.item.room.id === data.props.user.room.id) {
                    console.log(Tag, 'User', mUser.item.room.id , 'onBeforeRoot', 'Req', cmd.data);
                    mUser.getPeer();
                }                  
            },
            resp(mUser: Modules.IUser, cmd: Cmds.CommandStreamWebrtcSdpResp) {
                let data = cmd.data;
                if (mUser.item.id === data.props.user.id && mUser.item.room.id === data.props.user.room.id) {
                    console.log(Tag, 'User', mUser.item.room.id , 'onBeforeRoot', 'Resp', cmd.data);
                }                  
            }                      
        },        
    } 
    static Peer = {
        onBeforeRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandStreamWebrtcSdpReq) {
                let data = cmd.data;
                let mUser = peer.user;
                let user = data.props.user;
                if (mUser.item.id === user.id && mUser.item.room.id === user.room.id) {
                    console.log(Tag, 'Peer', mUser.item.room.id , 'onBeforeRoot', 'Req', cmd.data);                    
                    let sdp = user.extra;
                    ServiceModules.Webrtc.Peer.setOffer(peer, sdp)
                    .then(() => {
                        cmd = new Cmds.CommandStreamWebrtcSdpReq({instanceId: peer.instanceId});
                        cmd.assignData(data);
                        StreamWebrtcSdp.answer(mUser, cmd)
                        .then(() => {
                            cmd.destroy()
                        })
                        .catch(err => {
                            cmd.destroy()
                        })
                    })
                    .catch(err => {
                        StreamWebrtcSdp.resp(cmd, user, null, err)
                    })
                }                  
            },
            resp(peer: Modules.Webrtc.IPeer, cmd: Cmds.CommandStreamWebrtcSdpResp) {
                let data = cmd.data;
                let mUser = peer.user;
                let user = data.props.user;
                if (mUser.item.id === user.id && mUser.item.room.id === user.room.id) {
                    console.log(Tag, 'Peer', mUser.item.room.id , 'onBeforeRoot', 'Resp', cmd.data);
                    let sdp = user.extra;
                    ServiceModules.Webrtc.Peer.setAnswer(peer, sdp);
                }                   
            }                      
        },        
    }      

}