import * as Cmds from "../../cmds";
import * as Modules from '../../../modules'
import * as Helper from '../../../helper/index'



var Tag = "Service-Module-Peer"
export class Peer{
    static createOffer(peer: Modules.Webrtc.IPeer): Promise<any> {        
        return new Promise((resolve, reject) => {
            let rtc = peer.getRtc();            
            rtc.createOffer({
                iceRestart: true,
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            }).then((sdp) => {
                let config = peer.getConfig('offer');
                let codec = config.codec || Modules.Webrtc.ECodecs.default;
                let bandwidth = config.bandwidth || 0;
                if (codec !== Modules.Webrtc.ECodecs.default) {
                    sdp.sdp = Helper.SdpHelper.preferCodec(sdp.sdp, codec);
                }
                if (bandwidth > 0) {                     
                    // sdp.sdp = Helper.SdpHelper.setVideoBitrates(sdp.sdp, {start: bandwidth, min:bandwidth, max: bandwidth})
                    sdp.sdp = Helper.SdpHelper.updateBandwidthRestriction(sdp.sdp, bandwidth);
                } else {
                    sdp.sdp = Helper.SdpHelper.removeBandwidthRestriction(sdp.sdp);
                }
                // sdp.sdp = sdpHelper.disableNACK(sdp.sdp);
                rtc.setLocalDescription(sdp)
                .then(() => {
                    resolve(sdp)
                })           
                .catch((err) => {
                    adhoc_cast_connection_console.error(err)
                    reject(err)
                })             
            }).catch((err) => {
                adhoc_cast_connection_console.error(err)
                reject(err)
            })
        })
    }  
    static createAnswer(peer: Modules.Webrtc.IPeer): Promise<any> {        
        switch(Modules.Webrtc.Config.platform) {
            case Modules.Webrtc.EPlatform.reactnative :
                return this.createAnswer_reactnative(peer);
                break;
            default:
                return this.createAnswer_browser(peer);
                break            
        }
    }  
    static createAnswer_reactnative(peer: Modules.Webrtc.IPeer): Promise<any> {
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
                    adhoc_cast_connection_console.error(err)
                    reject(err)
                })             
            }).catch((err) => {
                adhoc_cast_connection_console.error(err)
                reject(err)
            })
        })
    }  
    static createAnswer_browser(peer: Modules.Webrtc.IPeer): Promise<any> {
        return new Promise((resolve, reject) => {
            let rtc = peer.getRtc() as any;
            let createAnswerSuccess = (sdp) => {
                adhoc_cast_connection_console.log('createAnswerSuccess', sdp)
                let setLocalDescriptionSuccess = () => {
                    resolve(sdp)
                }
                let setLocalDescriptionFailed = (err) => {
                    adhoc_cast_connection_console.log('createAnswerFailed', err)
                    reject(err);
                }
                rtc.setLocalDescription(sdp, setLocalDescriptionSuccess, setLocalDescriptionFailed)
            }
            let createAnswerFailed = (err) => {
                adhoc_cast_connection_console.log('createAnswerFailed', err)
                reject(err)
            }
            rtc.createAnswer(createAnswerSuccess, createAnswerFailed);
        })
    }    
    
    
    static setOffer(peer: Modules.Webrtc.IPeer, data: any): Promise<any> {
        switch(Modules.Webrtc.Config.platform) {
            case Modules.Webrtc.EPlatform.reactnative :
                return this.setOffer_reactnative(peer, data);
                break;
            default:
                return this.setOffer_browser(peer, data);
                break            
        }
    }   
    static setOffer_browser(peer: Modules.Webrtc.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            adhoc_cast_connection_console.log(Tag, 'setOffer_browser')
            let rtc = peer.getRtc() as any;
            let setRemoteDescriptionSuccess = () => {
                adhoc_cast_connection_console.log('setRemoteDescriptionSuccess');
                resolve()
            }
            let setRemoteDescriptionFailed = (err) => {
                adhoc_cast_connection_console.log('setRemoteDescriptionFailed', err)
                reject(err)    
            }
            rtc.setRemoteDescription(data, setRemoteDescriptionSuccess, setRemoteDescriptionFailed)
        })
    } 
    static setOffer_reactnative(peer: Modules.Webrtc.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            adhoc_cast_connection_console.log(Tag, 'setOffer_reactnative');
            peer.getRtc().setRemoteDescription(new Modules.Webrtc.WebRTC.RTCSessionDescription(data))
            .then(() => {
                resolve()        
            })
            .catch(err => {
                adhoc_cast_connection_console.log('Error',err)
                reject()
            })
        })
    }       

    static setAnswer(peer: Modules.Webrtc.IPeer, data: any): Promise<any>  {
        data.sdp =  Helper.SdpHelper.removeBandwidthRestriction(data.sdp);
        switch(Modules.Webrtc.Config.platform) {
            case Modules.Webrtc.EPlatform.reactnative :
                return this.setAnswer_reactnative(peer, data);
                break;
            default:
                return this.setAnswer_browser(peer, data);
                break            
        }
    }   
    static setAnswer_browser(peer: Modules.Webrtc.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            adhoc_cast_connection_console.log(Tag, 'setAnswer_browser')
            let rtc = peer.getRtc() as any;
            let setRemoteDescriptionSuccess = () => {
                resolve()
            }
            let setRemoteDescriptionFailed = (err) => {
                adhoc_cast_connection_console.log('setRemoteDescriptionFailed', err)
                reject(err)    
            }
            rtc.setRemoteDescription(data, setRemoteDescriptionSuccess, setRemoteDescriptionFailed)
        })

    }    
    static setAnswer_reactnative(peer: Modules.Webrtc.IPeer, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            adhoc_cast_connection_console.log(Tag, 'setAnswer_reactnative')
            peer.getRtc().setRemoteDescription(new Modules.Webrtc.WebRTC.RTCSessionDescription(data))
            .then(() => {
                resolve()
            })
            .catch(err => {
                adhoc_cast_connection_console.log('Error',err)
                reject(err)
            })
        })

    }       
    
    static setCandidate(peer: Modules.Webrtc.IPeer,data: any) {
        switch(Modules.Webrtc.Config.platform) {
            case Modules.Webrtc.EPlatform.reactnative :
                return this.setCandidate_reactnative(peer, data);
                break;
            default:
                return this.setCandidate_browser(peer, data);
                break            
        }
    }
    static setCandidate_browser(peer: Modules.Webrtc.IPeer, data: any) {
        peer.getRtc().addIceCandidate(data)
        .catch(err => {
            adhoc_cast_connection_console.log('add Ic eCandidate error:', err)
        })
    }    
    static setCandidate_reactnative(peer: Modules.Webrtc.IPeer, data: any) {
        peer.getRtc().addIceCandidate(new Modules.Webrtc.WebRTC.RTCIceCandidate(data))
        .catch(err => {
            adhoc_cast_connection_console.log('add IceCandidate error:', err)
        })
    }       
    static async setSenderMaxBitrate(peer: Modules.Webrtc.IPeer, maxBitrate: number) {
        let promises = [];
        let rtc = peer && peer.rtc;
        rtc && rtc.getSenders().forEach(sender => {
            let parameters = sender.getParameters();            
            parameters.encodings.forEach(encoding => {
                delete encoding.maxBitrate;
                encoding.maxBitrate = maxBitrate;
            })
            promises.push(sender.setParameters(parameters));
        })
        await Promise.all(promises);
    }    
}