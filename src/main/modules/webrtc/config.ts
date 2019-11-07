export enum ECodecs {
    default = 'default',
    vp8 = 'vp8',
    vp9 = 'vp9',
    h264 = 'h264'
}
export enum EPlatform {
    reactnative = 'reactnative',
    browser = 'browser',
    node = 'node'
}
export interface IConfig {
    bandwidth: number
    codec: string
    rtcConfig: RTCConfiguration    
}
export class Config implements IConfig {
    static platform: EPlatform = EPlatform.browser;
    static Default: Config = new Config(0, ECodecs.default, {
                                                iceTransportPolicy: "all",
                                                iceServers: [
                                                    {
                                                        'urls': [
                                                            'stun:servicediscovery.mypromethean.com:3478',
                                                            'stun:servicediscovery.mypromethean.com?transport=udp',
                                                        ]
                                                    },
                                                    {
                                                        'urls': [
                                                            'turn:servicediscovery.mypromethean.com:3478',
                                                            // 'turn:adhoc-turn.101.com:3478?transport=tcp',
                                                            // 'turn:adhoc-turn.101.com:3478?transport=udp',
                                                        ],
                                                        'username': 'u1',
                                                        'credential': 'p1' 
                                                    },          
                                                ]
                                            }
                                        );
    bandwidth: number
    codec: string
    rtcConfig: RTCConfiguration

    constructor(bandwidth?: number, codec?: ECodecs, rtcConfig?: RTCConfiguration) {
        this.bandwidth = bandwidth != null ? bandwidth : Config.Default.bandwidth;
        this.codec = codec != null ? codec : Config.Default.codec;
        this.rtcConfig = rtcConfig != null ? rtcConfig : Config.Default.rtcConfig;
    }

    static setPlatform(platform: EPlatform, webrtc?: any) {
        switch(platform) {
            case EPlatform.node:
                global['MediaStream'] = webrtc.MediaStream;
            default:
                this.platform = platform;
        }
        
    }    
}
