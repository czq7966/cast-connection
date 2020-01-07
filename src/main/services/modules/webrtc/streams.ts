import * as Cmds from "../../../cmds";
import * as Modules from '../../../modules'
import * as ServiceCmds from '../../cmds/index'



var Tag = "Service-Module-Streams"
export class Streams{
    static addSendStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        streams.sends.add(stream.id, stream);
        streams.resolutions.add(stream.id, this.getStreamResolution(stream));
        let onInactive = (ev) => {
            stream.removeEventListener('inactive', onInactive);              
            streams.notDestroyed && streams.sends.exist(stream.id) &&
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, Cmds.ECommandId.stream_webrtc_onsendstreaminactive, null, null, stream);
        }
        stream.addEventListener('inactive', onInactive);           
    }
    static delSendStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            streams.sends.del(id);
            streams.resolutions.del(id);
        } else {
            streams.sends.keys().forEach(key => {
                this.delSendStream(streams, streams.sends.get(key).id)
            })
        }
    }    

    static addRecvStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        streams.recvs.add(stream.id, stream);
        let onInactive = (ev) => {
            stream.removeEventListener('inactive', onInactive);              
            streams.notDestroyed &&  streams.recvs.exist(stream.id) &&
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, Cmds.ECommandId.stream_webrtc_onrecvstreaminactive, null, null, stream);
        }
        stream.addEventListener('inactive', onInactive);   
    }
    static delRecvStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            streams.recvs.del(id);
            streams.resolutions.del(id);
        } else {
            streams.recvs.keys().forEach(key => {
                this.delRecvStream(streams, streams.sends.get(key).id)
            })
        }
    }      
    static closeRecvStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            let stream = streams.recvs.get(id);
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                })
            }

        } else {
            streams.recvs.keys().forEach(key => {
                this.closeRecvStream(streams, key)
            })
        }
    }    
    
    static getStreamResolution(stream: MediaStream): Modules.Webrtc.IStreamResolution {
        let resolution: Modules.Webrtc.IStreamResolution;
        let videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
            let videoTrack = videoTracks[0]
            if (videoTrack.getCapabilities) {
                let capb = videoTrack.getCapabilities();
                resolution = {width: (capb.width && capb.width['max'] || capb.width) as any, height: (capb.height && capb.height['max'] || capb.height) as any}
            }
        }        
        return resolution;
    }
    static async applyStreamsVideoConstraints(streams:  Modules.Webrtc.IStreams, constraints: MediaTrackConstraints) {
        let promises = [];
        streams && constraints && 
        streams.sends.keys().forEach(key => {
            let stream = streams.sends.get(key);
            promises.push(this.applyStreamVideoConstraints(stream, constraints));
        });
        await Promise.all(promises);
    }

    static async applyStreamVideoConstraints(stream: MediaStream, constraints: MediaTrackConstraints) {
        let promises = [];

                
        stream.getVideoTracks().forEach(track => {
            let newConstraints = JSON.parse(JSON.stringify(constraints));

            let capabilities =  track.getCapabilities() as any;
            newConstraints = this.changeMediaTrackConstraintSetToCapability(newConstraints, capabilities);
            newConstraints.advanced && newConstraints.advanced.forEach((value, idx) => {
                newConstraints.advanced[idx] = this.changeMediaTrackConstraintSetToCapability(value, capabilities);
            })

            promises.push(track.applyConstraints(newConstraints));
        });
        await Promise.all(promises);
    }       

    static changeMediaTrackConstraintSetToCapability(constraint: MediaTrackConstraintSet, capabilities: MediaTrackCapabilities): MediaTrackConstraintSet {
        if (constraint) {
            if (!constraint.width) {
                constraint.width = {min: 1, max: 9999};
            } else {
                if (typeof(constraint.width) == "number") {
                    let value = constraint.width;
                    constraint.width = {min: value, max: value};
                }
            }

            if (!constraint.height) {
                constraint.height = {min: 1, max: 9999};
            } else {
                if (typeof(constraint.height) == "number") {
                    let value = constraint.height;
                    constraint.height = {min: value, max: value};
                }
            }            

            // if (constraint.width && constraint.height) {
            //     let range = Cmds.Common.Helper.calResolutionRange(
            //             capabilities.width['max'], capabilities.height['max'], 
            //             constraint.width['min'], constraint.height['min'],
            //             constraint.width['max'], constraint.height['max']);                
            //     constraint.width = {min: range[0], max: range[2]};
            //     constraint.height = {min: range[1], max: range[3]};
            // }
        }

        return constraint;
    }
}