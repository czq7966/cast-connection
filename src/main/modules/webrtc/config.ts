export enum ECodecs {
    default = 'default',
    vp8 = 'vp8',
    vp9 = 'vp9',
    h264 = 'h264'
}
export enum EPlatform {
    reactnative = 'reactnative',
    browser = 'browser'
}
export class Config {
    static platform: EPlatform = EPlatform.browser;
    bandwidth: number
    codec: string
    iceServers: RTCIceServer[]
    rtcConfig: RTCConfiguration

    constructor() {
        this.bandwidth = 0;
        this.codec = ECodecs.default;
        this.iceServers = [
            {
                'urls': [
                    'stun:adhoc-turn.101.com:3478',
                    'stun:adhoc-turn.101.com:3478?transport=udp',
                ]
            },      
            {
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455?transport=udp', // restund udp

                    'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
                    'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
              
            // {
            //     urls: ['turn:numb.viagenie.ca'],
            //     credential: 'muazkh',
            //     username: 'webrtc@live.com'
            // },
            // {
            //     urls: ['turn:turn.bistri.com:80'],
            //     credential: 'homeo',
            //     username: 'homeo'                         
            // }
            // {
            //     'urls': [
            //         'stun:webrtcweb.com:7788', // coTURN
            //         'stun:webrtcweb.com:7788?transport=udp', // coTURN
            //     ],
            //     'username': 'muazkh',
            //     'credential': 'muazkh'
            // },
            // {
            //     'urls': [
            //         'turn:webrtcweb.com:7788', // coTURN 7788+8877
            //         'turn:webrtcweb.com:4455?transport=udp', // restund udp

            //         'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
            //         'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
            //     ],
            //     'username': 'muazkh',
            //     'credential': 'muazkh'
            // },
            // {
            //     'urls': [
            //         'stun:stun.l.google.com:19302',
            //         'stun:stun.l.google.com:19302?transport=udp',
            //     ]
            // }            
        ]
        this.rtcConfig = {
            iceServers: this.iceServers,
            iceTransportPolicy: "all"
        }
    }
}
