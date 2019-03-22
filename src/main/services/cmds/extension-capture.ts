import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-ExtensionCapture"
export class ExtensionCapture {
    static areYouReady(instanceId: string): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.extension_capture_are_you_ready,
            respTimeout: 1 * 1000
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
    static getCustomSourceId(instanceId: string, sources?: string[] ): Promise<any> {
        let _getCustomSourceId = () => {
            sources = sources || ['screen', 'audio']
            let cmd = new Cmds.CommandReq({instanceId: instanceId})            
            cmd.data = {
                cmdId: Cmds.ECommandId.extension_capture_get_custom_sourceId,
                respTimeout: 120 * 1000,
                extra: sources
            }
            let promise = cmd.sendCommandForResp();
            cmd.destroy();
            cmd = null;  
            return promise;
        }


        return new Promise((reslove, reject) => {
            this.areYouReady(instanceId)
            .then(() => {
                _getCustomSourceId()
                .then(data => {
                    reslove(data)
                })
                .catch(err => {
                    reject(err)
                })
            })
            .catch(err => {
                reject(err)
            })
        })
    }
    static getCustomSourceStream(   instanceId: string, 
                                    options?: {
                                        sources?: string[], 
                                        mandatory?:{
                                            maxWidth?: number
                                            minWidth?: number
                                            maxHeight?: number
                                            minHeight?: number
                                            maxFrameRate?: number
                                            minFrameRate?: number
                                        } 
                                    } 
                                ): Promise<any> {
        return new Promise((resolve, reject) => {
            options = options || {}
            this.getCustomSourceId(instanceId, options.sources)
            .then((data: Cmds.ICommandData<any>) => {
                let media:  Cmds.IDesktopMediaStream = data.extra;
                if (media && media.sourceId) {
                    let mandatory = Object.assign({}, options.mandatory || {}) as any;
                    mandatory.maxWidth = mandatory.maxWidth || 1920;
                    mandatory.minWidth = mandatory.minWidth || 1;
                    mandatory.maxHeight = mandatory.maxHeight || 1080;
                    mandatory.minHeight = mandatory.minHeight || 1;                    
                    mandatory.maxFrameRate = mandatory.maxFrameRate || 20;
                    mandatory.minFrameRate = mandatory.minFrameRate || 10;
                    mandatory.chromeMediaSource = 'desktop';
                    mandatory.chromeMediaSourceId = media.sourceId;
                    
                    let constraints = {
                        audio: !( media.canRequestAudioTrack === true) ? false : {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: media.sourceId,
                                echoCancellation: true
                            },
                            optional: [{
                                googDisableLocalEcho: false 
                            }]                        
                        },
                        video: {
                            mandatory: mandatory,
                            optional: []
                        }
                    }
                    navigator.getUserMedia(constraints as any, (stream: MediaStream) => {
                        media.stream = stream;
                        resolve(data)
                    }, (err) => {
                        reject(err)
                    })
            
                } else {
                    reject('source id is null')
                }  
            })
            .catch(err => {
                reject(err)
            })
        })

    }

  
}