
export interface ISdpInfo {
    videoCodecNumbers?: Array<string>,
    videoCodecNumbersOriginal?: string
    vp8LineNumber?: string
    vp9LineNumber?: string
    h264LineNumber?: string
    vp8LineNumbers?: Array<string>
    vp9LineNumbers?: Array<string>
    h264LineNumbers?: Array<string>

}

export interface IVideoBitrate {
    start?: number,
    min?: number,
    max?: number
}

export interface IOpusAttributes {
    stereo?: string
    'sprop-stereo'?: string
    maxaveragebitrate?: number
    maxplaybackrate?: number
    cbr?: string
    useinbandfec?: string
    usedtx?: string
    maxptime?: string
}

export interface IVp8Attributes {
    max_fr: number
    max_recv_width: number
    max_recv_height: number
}

export class SdpHelper {
    static preferCodec(sdp: string, codecName: string) {
        var info = this.splitLines(sdp);

        if (!info.videoCodecNumbers) {
            return sdp;
        }

        // if (codecName === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
        //     return sdp;
        // }

        // if (codecName === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
        //     return sdp;
        // }

        // if (codecName === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
        //     return sdp;
        // }

        sdp = this.preferCodecHelper(sdp, codecName, info);

        return sdp;
    }

    static preferCodecHelper(sdp: string, codec: string, info: ISdpInfo, ignore?: boolean) {
        var preferCodecNumber = '';
        var preferCodecNumbers = [];

        if (codec === 'vp8') {
            if (!info.vp8LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.vp8LineNumber;
            preferCodecNumbers = info.vp8LineNumbers;
        }

        if (codec === 'vp9') {
            if (!info.vp9LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.vp9LineNumber;
            preferCodecNumbers = info.vp9LineNumbers;
        }

        if (codec === 'h264') {
            if (!info.h264LineNumber) {
                return sdp;
            }

            preferCodecNumber = info.h264LineNumber;
            preferCodecNumbers = info.h264LineNumbers;
        }

        var newLine = info.videoCodecNumbersOriginal.split('SAVPF')[0] + 'SAVPF ';

        var newOrder = [preferCodecNumber];
        var newOrders = preferCodecNumbers;

        if (ignore) {
            newOrder = [];
            newOrders = [];
        }

        info.videoCodecNumbers.forEach(function(codecNumber) {
            // if (codecNumber === preferCodecNumber) return;
            if (newOrder.indexOf(codecNumber) < 0)
                newOrder.push(codecNumber);
            if (newOrders.indexOf(codecNumber) < 0)
                newOrders.push(codecNumber);

        });

        // newLine += newOrder.join(' ');
        newLine += newOrders.join(' ');

        sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
        return sdp;
    }


    static splitLines(sdp: string): ISdpInfo {
        var info: ISdpInfo  = {};
        sdp.split('\n').forEach(line => {
            if (line.indexOf('m=video') === 0) {
                info.videoCodecNumbers = [];
                info.vp8LineNumbers = [];
                info.vp9LineNumbers = [];
                info.h264LineNumbers = [];
                line.split('SAVPF')[1].split(' ').forEach(codecNumber => {
                    codecNumber = codecNumber.trim();
                    if (!codecNumber || !codecNumber.length) return;
                    info.videoCodecNumbers.push(codecNumber);
                    info.videoCodecNumbersOriginal = line;
                });
            }

            // if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
            if (line.indexOf('VP8/90000') !== -1) {
                info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
                info.vp8LineNumbers.push(info.vp8LineNumber);
            }

            // if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
            if (line.indexOf('VP9/90000') !== -1) {
                info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
                info.vp9LineNumbers.push(info.vp9LineNumber);
            }

            // if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {                
            if (line.indexOf('H264/90000') !== -1) {
                info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
                // if (info.h264LineNumbers.indexOf("125") < 0)
                //     info.h264LineNumbers.push("125");    
                if (info.h264LineNumbers.indexOf(info.h264LineNumber) < 0) {
                    info.h264LineNumbers.push(info.h264LineNumber);
                }
            }
        });

        info.vp8LineNumber = info.vp8LineNumbers.length > 0 ? info.vp8LineNumbers[0] : null;
        info.vp9LineNumber = info.vp9LineNumbers.length > 0 ? info.vp9LineNumbers[0] : null;
        info.h264LineNumber = info.h264LineNumbers.length > 0 ? info.h264LineNumbers[0] : null;

        return info;
    }

    static removeVPX(sdp: string) {
        var info = this.splitLines(sdp);

        // last parameter below means: ignore these codecs
        sdp = this.preferCodecHelper(sdp, 'vp9', info, true);
        sdp = this.preferCodecHelper(sdp, 'vp8', info, true);

        return sdp;
    }

    static disableNACK(sdp: string) {
        if (!sdp || typeof sdp !== 'string') {
            throw 'Invalid arguments.';
        }

        sdp = sdp.replace('a=rtcp-fb:126 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 pli\r\n');
        sdp = sdp.replace('a=rtcp-fb:97 nack\r\n', '');
        sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 pli\r\n');

        return sdp;
    }   

    static prioritize(codecMimeType: string, peer: RTCPeerConnection) {
        if (!peer || !peer.getSenders || !peer.getSenders().length) {
            return;
        }

        if (!codecMimeType || typeof codecMimeType !== 'string') {
            throw 'Invalid arguments.';
        }

        peer.getSenders().forEach( sender => {
            var params = sender.getParameters();
            for (var i = 0; i < params.codecs.length; i++) {
                if (params.codecs[i].mimeType == codecMimeType) {                    
                    params.codecs.unshift(params.codecs.splice(i, 1) as any);
                    break;
                }
            }
            sender.setParameters(params);
        });
    }    

    static removeNonG722(sdp: string) {
        return sdp.replace(/m=audio ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g, 'm=audio $1 RTP\/SAVPF 9');
    }

    // setBAS(sdp: string, bandwidth, isScreen) {
    //     if (!bandwidth) {
    //         return sdp;
    //     }

    //     if (typeof isFirefox !== 'undefined' && isFirefox) {
    //         return sdp;
    //     }

    //     if (isScreen) {
    //         if (!bandwidth.screen) {
    //             adhoc_cast_connection_console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
    //         } else if (bandwidth.screen < 300) {
    //             adhoc_cast_connection_console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
    //         }
    //     }

    //     // if screen; must use at least 300kbs
    //     if (bandwidth.screen && isScreen) {
    //         sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
    //         sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
    //     }

    //     // remove existing bandwidth lines
    //     if (bandwidth.audio || bandwidth.video) {
    //         sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
    //     }

    //     if (bandwidth.audio) {
    //         sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
    //     }

    //     if (bandwidth.screen) {
    //         sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
    //     } else if (bandwidth.video) {
    //         sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.video + '\r\n');
    //     }

    //     return sdp;
    // }

    // Find the line in sdpLines that starts with |prefix|, and, if specified,
    // contains |substr| (case-insensitive search).
    static findLine(sdpLines: Array<string>, prefix: string, substr?: string) {
        return this.findLineInRange(sdpLines, 0, -1, prefix, substr);
    }

    // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
    // and, if specified, contains |substr| (case-insensitive search).
    static findLineInRange(sdpLines: Array<string>, startLine: number, endLine: number, prefix: string, substr?: string) {
        var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
        for (var i = startLine; i < realEndLine; ++i) {
            if (sdpLines[i].indexOf(prefix) === 0) {
                if (!substr ||
                    sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                    return i;
                }
            }
        }
        return null;
    }    

    // Gets the codec payload type from an a=rtpmap:X line.
    static getCodecPayloadType(sdpLine: string) {
        var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        var result = sdpLine.match(pattern);
        return (result && result.length === 2) ? result[1] : null;
    }    

    static setBandwidth(sdp: string, value: number) {
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + value + '\r\n');
        return sdp;
    }    

    static setVideoBitrates(sdp: string, params?: IVideoBitrate) {
        params = params || {};
        if (params.start) {
            sdp = this.setBandwidth(sdp, params.start)
        }
        
        var xgoogle_min_bitrate = params.min;
        var xgoogle_max_bitrate = params.max;

        var sdpLines = sdp.split('\r\n');

        // VP8
        var vp8Index = this.findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
        var vp8Payload;
        if (vp8Index) {
            vp8Payload = this.getCodecPayloadType(sdpLines[vp8Index]);
        }

        if (!vp8Payload) {
            return sdp;
        }

        var rtxIndex = this.findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
        var rtxPayload;
        if (rtxIndex) {
            rtxPayload = this.getCodecPayloadType(sdpLines[rtxIndex]);
        }

        if (!rtxIndex) {
            return sdp;
        }

        var rtxFmtpLineIndex = this.findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
        if (rtxFmtpLineIndex !== null) {
            var appendrtxNext = '\r\n';
            appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
            sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
            sdp = sdpLines.join('\r\n');
        }

        return sdp;
    }

    static setOpusAttributes(sdp: string, params: IOpusAttributes) {
        params = params || {};

        var sdpLines = sdp.split('\r\n');

        // Opus
        var opusIndex = this.findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = this.getCodecPayloadType(sdpLines[opusIndex]);
        }

        if (!opusPayload) {
            return sdp;
        }

        var opusFmtpLineIndex = this.findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (opusFmtpLineIndex === null) {
            return sdp;
        }

        var appendOpusNext = '';
        appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
        appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

        if (typeof params.maxaveragebitrate != 'undefined') {
            appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
        }

        if (typeof params.maxplaybackrate != 'undefined') {
            appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
        }

        if (typeof params.cbr != 'undefined') {
            appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
        }

        if (typeof params.useinbandfec != 'undefined') {
            appendOpusNext += '; useinbandfec=' + params.useinbandfec;
        }

        if (typeof params.usedtx != 'undefined') {
            appendOpusNext += '; usedtx=' + params.usedtx;
        }

        if (typeof params.maxptime != 'undefined') {
            appendOpusNext += '\r\na=maxptime:' + params.maxptime;
        }

        sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }
    static getFmtpAttributes(sdp: string, playloadName: string): Object {
        let params = {};

        var sdpLines = sdp.split('\r\n');
        var index = this.findLine(sdpLines, 'a=rtpmap', playloadName);
        var payload;
        if (index) {
            payload = this.getCodecPayloadType(sdpLines[index]);
        }     
        if (payload) {
            var fmtpLineIndex = this.findLine(sdpLines, 'a=fmtp:' + payload.toString());
            if (fmtpLineIndex !== null) {
                let fmtpLine = sdpLines[index];
                let fmtpSecs = fmtpLine.split(' ');
                for (let idx = 1; idx < fmtpSecs.length; idx++) {
                    const fmtpSec = fmtpSecs[idx];
                    let fmtpParams = fmtpSec.split(';');
                    fmtpParams.forEach(fmtpParam => {                    
                        let param = fmtpParam.split('=')
                        if (param.length == 2) {
                            let key = param[0].trim()
                            let value = param[1].trim()
                            params[key] = value;
                        }
                    })                    
                }    
            }   
        }     
     
        return params;
    }
    static setFmtpAttributes(sdp: string, playloadName: string, params: Object): string {
        params = params || {};

        var sdpLines = sdp.split('\r\n');

        // vp8
        var index = this.findLine(sdpLines, 'a=rtpmap', playloadName);
        var payload;
        if (index) {
            payload = this.getCodecPayloadType(sdpLines[index]);
        }

        if (!payload) {
            return sdp;
        }

        var fmtpLineIndex = this.findLine(sdpLines, 'a=fmtp:' + payload.toString());
        let fmtpParams = [];
        Object.keys(params).forEach(key => {
            let value = params[key]
            fmtpParams.push(key + '=' + value);
        })
        let appendNext = fmtpParams.join(';');

        var fmtpLine = 'a=fmtp:' + payload.toString();
        if (appendNext.length > 0)
            fmtpLine += ' ' + appendNext;

        if (fmtpLineIndex) {
            sdpLines[fmtpLineIndex] = fmtpLine;
        } else {
            sdpLines[index] = sdpLines[index].concat('\r\n'+fmtpLine);    
        }    

        sdp = sdpLines.join('\r\n');
        return sdp;
    }    

    static removeBandwidthRestriction(sdp: string): string {
        return sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '');
    }    
    static updateBandwidthRestriction(sdp: string, bandwidth: number): string { //bindwidth is Kbps
        let modifier = 'AS';
        // bandwidth = (bandwidth >>> 0) * 1000;
        if (sdp.indexOf('b=' + modifier + ':') === -1) {
            // insert b= after c= line.
            sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
        } else {
            sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
        }
        return sdp;
    }

}

// var sdpHelper = new SdpHelper()
// export { sdpHelper }