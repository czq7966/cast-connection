import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-ExtensionCapture"
export class ExtensionCapture {
    static areYouReady(instanceId: string): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.extension_capture_are_you_ready,
            respTimeout: 2 * 1000
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
                                        mandatory?:{frameRate?: number} 
                                    } 
                                ): Promise<any> {
        return new Promise((resolve, reject) => {
            options = options || {}
            this.getCustomSourceId(instanceId, options.sources)
            .then((data: Cmds.ICommandData<any>) => {
                let media:  Cmds.IDesktopMediaStream = data.extra;
                if (media && media.sourceId) {
                    options.mandatory = options.mandatory || {};
                    options.mandatory.frameRate = options.mandatory.frameRate || 20;
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
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: media.sourceId,
                                minFrameRate: options.mandatory.frameRate / 2,
                                maxFrameRate: options.mandatory.frameRate
                            },
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