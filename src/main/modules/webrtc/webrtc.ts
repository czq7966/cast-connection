var WebRTC: any = {};
function AssignWebRTC(rnWebRTC) {
    Object.keys(rnWebRTC).forEach(key => { WebRTC[key] = rnWebRTC[key] });    
}

export { WebRTC, AssignWebRTC}

