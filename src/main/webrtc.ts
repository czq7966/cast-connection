// import { EPlatform } from "./config";


// var isBrowser = false;

// export interface IWebRTC {
//     platform: EPlatform;
//     RTCPeerConnection: RTCPeerConnection
//     RTCIceCandidate: RTCIceCandidate
//     RTCSessionDescription: RTCSessionDescription
//     RTCView: any
//     MediaStream: MediaStream
//     MediaStreamTrack: MediaStreamTrack
//     getUserMedia: any
// }


// if(isBrowser) {
//     WebRTC = {
//         platform: EPlatform.browser,
//         MediaStreamTrack: window['MediaStreamTrack'],
//         getUserMedia: window.navigator.getUserMedia,
//         RTCPeerConnection: window['RTCPeerConnection'],
//         RTCSessionDescription: window['RTCSessionDescription'],
//         RTCIceCandidate: window['RTCIceCandidate'],
//         RTCView: null,
//         MediaStream: window['MediaStream']
//     }
// } else {
//     WebRTC = {
//         platform: EPlatform.reactnative
//     } as IWebRTC;
// }

var WebRTC: any = {};
function AssignWebRTC(rnWebRTC) {
    Object.keys(rnWebRTC).forEach(key => { WebRTC[key] = rnWebRTC[key] });    
}

export { WebRTC, AssignWebRTC}

