import * as Network from './network'
import * as Modules from './modules'
import { Base } from "./base";
import { sdpHelper } from "./helper/sdp";
import { Config, ECodecs, EPlatform } from "./config";
import { WebRTC } from "./webrtc";
import { Input } from "./input";

export enum ERTCPeerEvents {
    onconnectionstatechange = 'connectionstatechange',
    ondatachannel = 'datachannel',
    onicecandidate = 'icecandidate',
    onicecandidateerror = 'icecandidateerror',
    oniceconnectionstatechange = 'iceconnectionstatechange',
    onicegatheringstatechange = 'icegatheringstatechange',
    onnegotiationneeded = 'negotiationneeded',
    onsignalingstatechange = 'signalingstatechange',
    onstatsended = 'statsended',
    ontrack = 'track',
    onstream = 'stream',
    onaddstream = 'addstream',
    onrecvstream = 'onrecvstream',
    onrecvstreaminactive = 'onrecvstreaminactive',
    onsendstreaminactive = 'onsendstreaminactive',
}
export enum EPeerEvents {
    ongetconfig = 'ongetconfig'    
}

export class Peer extends Base {
    config: Config;
    user: Modules.IUser
    streams: Modules.Streams;
    datachannels: Modules.DataChannels;
    input: Input;
    private _rtcevents;
    private _rtc: RTCPeerConnection    
    constructor(user: Modules.IUser) {
        super()
        this.config = new Config();
        this.streams = new Modules.Streams(this);
        this.datachannels = new Modules.DataChannels(this);
        this.input = new Input(this.datachannels);
        this._rtcevents = {};
        this.user = user;        
        this.initEvents();
    }
    destroy() {      
        this.datachannels.close();
        this._rtc && this._rtc.close();
        this.unInitEvents();
        this.input.destroy();
        this.datachannels.destroy();
        this.streams.destroy();     
   
        delete this._rtcevents;
        delete this._rtc;
        delete this.user;
        delete this.config;
        delete this.streams;
        delete this.input;
        delete this.datachannels;        
        super.destroy();
    }
    close() {
        this._rtc && this._rtc.close();
    }    
    initEvents() {        
        // 信令事件
        this.eventEmitter.addListener(Network.ESignalerMessageType.offer, this.onOffer)
        this.eventEmitter.addListener(Network.ESignalerMessageType.answer, this.onAnswer)
        this.eventEmitter.addListener(Network.ESignalerMessageType.candidate, this.onCandidate)
        this.eventEmitter.addListener(Network.ESignalerMessageType.icecomplete, this.onIceComplete)

        this.eventEmitter.addListener(ERTCPeerEvents.ontrack, this.onTrack)
        this.eventEmitter.addListener(ERTCPeerEvents.onstream, this.onStream)        
        this.eventEmitter.addListener(ERTCPeerEvents.onaddstream, this.onAddStream)      
        this.eventEmitter.addListener(ERTCPeerEvents.onicecandidate, this.onIceCandidate)   
        
        //流状态事件
        this.streams.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream)
        
        //Log监视RTC状态变化
        /*
        this.eventEmitter.addListener(ERTCPeerEvents.onconnectionstatechange, (ev) => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.onconnectionstatechange+':', this.rtc().connectionState, this.user.socketId)
        })
        this.eventEmitter.addListener(ERTCPeerEvents.ondatachannel, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.ondatachannel+':', ev, this.user.socketId)
        })
        this.eventEmitter.addListener(ERTCPeerEvents.onicecandidate, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.onicecandidate+':', ev.candidate && ev.candidate.candidate, this.user.socketId)
        })
        this.eventEmitter.addListener(ERTCPeerEvents.onicecandidateerror, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.onicecandidateerror+':', ev.errorText, this.user.socketId)
        })
        this.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.oniceconnectionstatechange+':', this.rtc().iceConnectionState, this.user.socketId)
        })
        this.eventEmitter.addListener(ERTCPeerEvents.onicegatheringstatechange, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.onicegatheringstatechange+':', this.rtc().iceGatheringState, this.user.socketId)
        })    
        this.eventEmitter.addListener(ERTCPeerEvents.onnegotiationneeded, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.onnegotiationneeded+':')
        })   
        this.eventEmitter.addListener(ERTCPeerEvents.onsignalingstatechange, ev => {
            this._rtc && 
            console.log('on'+ERTCPeerEvents.onsignalingstatechange+':', this.rtc().signalingState, this.user.socketId, this.user.socketId)
        })  
        this.eventEmitter.addListener(ERTCPeerEvents.onstatsended, ev => {
            console.log('on'+ERTCPeerEvents.onstatsended+':', this.user.socketId)
        })
        this.eventEmitter.addListener(ERTCPeerEvents.ontrack, ev => {            
            console.warn('ontrack:', this.user.socketId);
        })  
        */
    }
    unInitEvents() {
        this.unInitRTCEvents(this._rtc);
        this.eventEmitter.removeListener(Network.ESignalerMessageType.offer, this.onOffer)
        this.eventEmitter.removeListener(Network.ESignalerMessageType.answer, this.onAnswer)
        this.eventEmitter.removeListener(Network.ESignalerMessageType.candidate, this.onCandidate)
        this.eventEmitter.removeListener(Network.ESignalerMessageType.icecomplete, this.onIceComplete)   

        this.eventEmitter.removeListener(ERTCPeerEvents.ontrack, this.onTrack)
        this.eventEmitter.removeListener(ERTCPeerEvents.onstream, this.onStream)        
        this.eventEmitter.removeListener(ERTCPeerEvents.onaddstream, this.onAddStream)      
        this.eventEmitter.removeListener(ERTCPeerEvents.onicecandidate, this.onIceCandidate)           
        
        //流状态事件
        this.streams.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream)
    }
    initRTCEvents(rtc: RTCPeerConnection) {
        rtc &&
        [ERTCPeerEvents].forEach(events => {
            Object.keys(ERTCPeerEvents).forEach(key => {
                let value = events[key];
                let event = (...args: any[]) => {
                    // console.log('PeerEvent:', value, ...args)
                    this.eventEmitter.emit(value, ...args)
                }
                this._rtcevents[value] = event;
                rtc.addEventListener(value, event)
            })
        })      
    }
    unInitRTCEvents(rtc: RTCPeerConnection) {
        rtc &&
        Object.keys(this._rtcevents).forEach(key => {
            let value = this._rtcevents[key];
            this.rtc().removeEventListener(key, value)
        })
    }    
    rtc() {
        if (!this._rtc) {
            switch(Config.platform) {
                case EPlatform.reactnative:
                    this._rtc = new WebRTC.RTCPeerConnection(this.getConfig().rtcConfig)
                    break;
                default :
                    this._rtc = new RTCPeerConnection(this.getConfig().rtcConfig);
                    break;
            }
            this.initRTCEvents(this._rtc);
        }
        return this._rtc
    }


    doICE(stream: MediaStream): Promise<any> {
        if (this.addSendStream(stream)) {            
            this.createDataChannels()             
            return this.createOffer();     
        }
    }
    addSendStream(stream: MediaStream): boolean {    
        if (stream && !this.streams.getSendStream(stream.id)) {
            this.streams.addSendStream(stream);
            (this.rtc() as any).addStream(stream)
            return true;
        }
        return false;
    }

    getConfig(): Config {
        this.eventEmitter.emit(EPeerEvents.ongetconfig, this.config);
        return this.config;
    }
    createDataChannels() {
        this.datachannels.createDataChannels();
    }

    createOffer(): Promise<any> {        
        return new Promise((resolve, reject) => {
            this.rtc().createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            }).then((sdp) => {
                let codec = this.config.codec || ECodecs.default;
                let bandwidth = this.config.bandwidth || 0;
                if (codec !== ECodecs.default) {
                    sdp.sdp = sdpHelper.preferCodec(sdp.sdp, codec);
                }
                if (bandwidth > 0) {                     
                    sdp.sdp = sdpHelper.setVideoBitrates(sdp.sdp, {start: bandwidth, min:bandwidth, max: bandwidth})
                }
                // sdp.sdp = sdpHelper.disableNACK(sdp.sdp);
                this.rtc().setLocalDescription(sdp)
                .then(() => {
                    this.sendOffer(sdp)
                    .then(() => {
                        resolve();
                    })
                    .catch(err => {
                        reject(err)
                    })
                    
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
    sendOffer(sdp?: RTCSessionDescriptionInit): Promise<any> {
        sdp = sdp || this.rtc().localDescription.toJSON();
        let msg: Network.ISignalerMessage = {
            type: Network.ESignalerMessageType.offer,
            data: sdp
        }
        // return this.user.sendMessage(msg)
        return
    }
 
    createAnswer(): Promise<any> {        
        switch(Config.platform) {
            case EPlatform.reactnative :
                return this.createAnswer_reactnative();
                break;
            default:
                return this.createAnswer_browser();
                break            
        }
    }  
    createAnswer_reactnative(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.rtc().createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            }).then((sdp) => {
                this.rtc().setLocalDescription(sdp)
                .then(() => {
                    this.sendAnswer(sdp)
                    .then(() => {
                        resolve();
                    })
                    .catch(err => {
                        reject(err);
                    })                    
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
    createAnswer_browser(): Promise<any> {
        return new Promise((resolve, reject) => {
            let rtc = this.rtc() as any;
            let createAnswerSuccess = (sdp) => {
                console.log('createAnswerSuccess', sdp)
                let setLocalDescriptionSuccess = () => {
                    this.sendAnswer(sdp)
                    .then(() => {
                        resolve();
                    })
                    .catch(err => {
                        reject(err);
                    })  
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

    sendAnswer(sdp?: RTCSessionDescriptionInit): Promise<any> {
        sdp = sdp || this.rtc().localDescription.toJSON();
        let msg: Network.ISignalerMessage = {
            type: Network.ESignalerMessageType.answer,
            data: sdp
        }
        // return this.user.sendMessage(msg)
        return
    }

    onIceCandidate = (ev: RTCPeerConnectionIceEvent): Promise<any> => {
        if (ev.candidate) {
            let msg: Network.ISignalerMessage = {
                type: Network.ESignalerMessageType.candidate,
                data: ev.candidate.toJSON()
            }            
            // return this.user.sendMessage(msg)
            return
        } else {
            let msg: Network.ISignalerMessage = {
                type: Network.ESignalerMessageType.icecomplete,
            }
            // return this.user.sendMessage(msg)
            return
        }
    }

    stopSharing(): Promise<any> {
        return this.streams.stopSendStreams();
    }

    //网络事件
    onOffer = (data: any) => {
        switch(Config.platform) {
            case EPlatform.reactnative :
            return this.onOffer_reactnative(data);
                break;
            default:
                return this.onOffer_browser(data);
                break            
        }
    }   
    onOffer_browser = (data: any) => {
        console.log('on offer')
        let rtc = this.rtc() as any;
        let setRemoteDescriptionSuccess = () => {
            console.log('setRemoteDescriptionSuccess');
            this.createAnswer()
        }
        let setRemoteDescriptionFailed = (err) => {
            console.log('setRemoteDescriptionFailed', err)

        }
        rtc.setRemoteDescription(data, setRemoteDescriptionSuccess, setRemoteDescriptionFailed)
    }    

    onOffer_reactnative = (data: any) => {
        console.log('on offer')
        this.rtc().setRemoteDescription(new WebRTC.RTCSessionDescription(data))
        .then(() => {
            this.createAnswer()
            .catch((err => {
                console.log('Error', err)
            }))         
        })
        .catch(err => {
            console.log('Error',err)
        })
    }      

    onAnswer = (data: any) => {
        switch(Config.platform) {
            case EPlatform.reactnative :
            return this.onAnswer_reactnative(data);
                break;
            default:
                return this.onAnswer_browser(data);
                break            
        }
    }   
    onAnswer_browser = (data: any) => {
        console.log('on answer')
        let rtc = this.rtc() as any;
        let setRemoteDescriptionSuccess = () => {
            console.log('setRemoteDescriptionSuccess');
        }
        let setRemoteDescriptionFailed = (err) => {
            console.log('setRemoteDescriptionFailed', err)

        }
        rtc.setRemoteDescription(data, setRemoteDescriptionSuccess, setRemoteDescriptionFailed)
    }    
    onAnswer_reactnative = (data: any) => {
        console.log('on answer')
        this.rtc().setRemoteDescription(new WebRTC.RTCSessionDescription(data))
        .catch(err => {
            console.log('Error',err)
        })
    }           

    onCandidate = (data: any) => {
        switch(Config.platform) {
            case EPlatform.reactnative :
                return this.onCandidate_reactnative(data);
                break;
            default:
                return this.onCandidate_browser(data);
                break            
        }
    }
    onCandidate_browser = (data: any) => {
        // console.log('add candidate', data, this.user.socketId)
        this.rtc().addIceCandidate(data)
        .catch(err => {
            console.log('add Ic eCandidate error:', err)
        })
    }    
    onCandidate_reactnative = (data: any) => {
        // console.log('add candidate', data, this.user.socketId)
        this.rtc().addIceCandidate(new WebRTC.RTCIceCandidate(data))
        .catch(err => {
            console.log('add IceCandidate error:', err)
        })
    }    
    onIceComplete = () => {
        // console.log()
    }    
    onTrack = (ev: RTCTrackEvent) => {
        let streams = ev.streams;
        streams.forEach(stream => {            
            this.streams.addRecvStream(stream)
        })
    }
    onStream = (ev: any) => {
        let stream = ev.stream as MediaStream;
        this.streams.addRecvStream(stream);
    }
    onAddStream = (ev: Event) => {
        let stream = ev['stream'] as MediaStream;
        this.streams.addRecvStream(stream);    
    }    
    onRecvStream = (stream: MediaStream) => {
        this.eventEmitter.emit(ERTCPeerEvents.onrecvstream, stream, this);
    } 
}