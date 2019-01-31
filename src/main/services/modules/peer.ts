import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as Helper from '../../helper/index'
import * as ServiceCmds from '../cmds/index'
import { Config, EPlatform } from "../../config";


var Tag = "Service-Module-Peer"
export class Peer{
    static createOffer(peer: Modules.IPeer): Promise<any> {        
        return new Promise((resolve, reject) => {
            peer.getRtc().createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            }).then((sdp) => {
                let codec = peer.config.codec || Modules.ECodecs.default;
                let bandwidth = peer.config.bandwidth || 0;
                if (codec !== Modules.ECodecs.default) {
                    sdp.sdp = Helper.SdpHelper.preferCodec(sdp.sdp, codec);
                }
                if (bandwidth > 0) {                     
                    sdp.sdp = Helper.SdpHelper.setVideoBitrates(sdp.sdp, {start: bandwidth, min:bandwidth, max: bandwidth})
                }
                // sdp.sdp = sdpHelper.disableNACK(sdp.sdp);
                peer.getRtc().setLocalDescription(sdp)
                .then(() => {
                    resolve(sdp)
                })           
                .catch((err) => {
                    console.error(err)
                    reject(err)
                })             
            }).catch((err) => {
                console.error(err)
                reject(err)
            })
        })
    }  
    static createAnswer(peer: Modules.IPeer): Promise<any> {        
        switch(Config.platform) {
            case EPlatform.reactnative :
                return this.createAnswer_reactnative(peer);
                break;
            default:
                return this.createAnswer_browser(peer);
                break            
        }
    }  
    static createAnswer_reactnative(peer: Modules.IPeer): Promise<any> {
        return new Promise((resolve, reject) => {
            peer.getRtc().createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            }).then((sdp) => {
                peer.getRtc().setLocalDescription(sdp)
                .then(() => {
                    resolve(sdp)
                })           
                .catch((err) => {
                    console.error(err)
                    reject(err)
                })             
            }).catch((err) => {
                console.error(err)
                reject(err)
            })
        })
    }  
    static createAnswer_browser(peer: Modules.IPeer): Promise<any> {
        return new Promise((resolve, reject) => {
            let rtc = peer.getRtc() as any;
            let createAnswerSuccess = (sdp) => {
                console.log('createAnswerSuccess', sdp)
                let setLocalDescriptionSuccess = () => {
                    resolve(sdp)
                }
                let setLocalDescriptionFailed = (err) => {
                    console.log('createAnswerFailed', err)
                    reject(err);
                }
                rtc.setLocalDescription(sdp, setLocalDescriptionSuccess, setLocalDescriptionFailed)
            }
            let createAnswerFailed = (err) => {
                console.log('createAnswerFailed', err)
                reject(err)
            }
            rtc.createAnswer(createAnswerSuccess, createAnswerFailed);
        })
    }    
    
    
    static setOffer(peer: Modules.IPeer, data: any): Promise<any> {
        switch(Config.platform) {
            case EPlatform.reactnative :
                return this.setOffer_reactnative(peer, data);
                break;
            default:
                return this.setOffer_browser(peer, data);
                break            
        }
    }   
    static setOffer_browser(peer: Modules.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(Tag, 'setOffer_browser')
            let rtc = peer.getRtc() as any;
            let setRemoteDescriptionSuccess = () => {
                console.log('setRemoteDescriptionSuccess');
                resolve()
            }
            let setRemoteDescriptionFailed = (err) => {
                console.log('setRemoteDescriptionFailed', err)
                reject(err)    
            }
            rtc.setRemoteDescription(data, setRemoteDescriptionSuccess, setRemoteDescriptionFailed)
        })
    } 
    static setOffer_reactnative(peer: Modules.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(Tag, 'setOffer_reactnative');
            peer.getRtc().setRemoteDescription(new Modules.WebRTC.RTCSessionDescription(data))
            .then(() => {
                resolve()        
            })
            .catch(err => {
                console.log('Error',err)
                reject()
            })
        })
    }       

    static setAnswer(peer: Modules.IPeer, data: any): Promise<any>  {
        switch(Config.platform) {
            case EPlatform.reactnative :
                return this.setAnswer_reactnative(peer, data);
                break;
            default:
                return this.setAnswer_browser(peer, data);
                break            
        }
    }   
    static setAnswer_browser(peer: Modules.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(Tag, 'setAnswer_browser')
            let rtc = peer.getRtc() as any;
            let setRemoteDescriptionSuccess = () => {
                resolve()
            }
            let setRemoteDescriptionFailed = (err) => {
                console.log('setRemoteDescriptionFailed', err)
                reject(err)    
            }
            rtc.setRemoteDescription(data, setRemoteDescriptionSuccess, setRemoteDescriptionFailed)
        })

    }    
    static setAnswer_reactnative(peer: Modules.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(Tag, 'setAnswer_reactnative')
            peer.getRtc().setRemoteDescription(new Modules.WebRTC.RTCSessionDescription(data))
            .then(() => {
                resolve()
            })
            .catch(err => {
                console.log('Error',err)
                reject(err)
            })
        })

    }       
    
    static setCandidate(peer: Modules.IPeer,data: any) {
        switch(Config.platform) {
            case EPlatform.reactnative :
                return this.setCandidate_reactnative(peer, data);
                break;
            default:
                return this.setCandidate_browser(peer, data);
                break            
        }
    }
    static setCandidate_browser(peer: Modules.IPeer, data: any) {
        peer.getRtc().addIceCandidate(data)
        .catch(err => {
            console.log('add Ic eCandidate error:', err)
        })
    }    
    static setCandidate_reactnative(peer: Modules.IPeer, data: any) {
        peer.getRtc().addIceCandidate(new Modules.WebRTC.RTCIceCandidate(data))
        .catch(err => {
            console.log('add IceCandidate error:', err)
        })
    }       

}