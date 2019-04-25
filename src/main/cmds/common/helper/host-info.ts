var isNode = !!(process && process.argv0 && process.argv0 == 'node')
var isMobileDevice = !isNode && !!(/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent || ''));

var isEdge = !isNode &&  navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

var isOpera = !isNode &&  (!!window["opera"] || navigator.userAgent.indexOf(' OPR/') >= 0);
var isFirefox = !isNode &&  typeof window["InstallTrigger"] !== 'undefined';
var isSafari = !isNode &&  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var isChrome = !isNode &&  !!window["chrome"] && !isOpera;
var isIE = !isNode &&  typeof document !== 'undefined' && !!document["documentMode"] && !isEdge;

function getHostInfo() {
    if (isNode) {
        return {
            fullVersion: 0,
            version: 0,
            name: 0,
            isPrivateBrowsing: false
        };
    }
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // both and safri and chrome has same userAgent
    if (isSafari && !isChrome && nAgt.indexOf('CriOS') !== -1) {
        isSafari = false;
        isChrome = true;
    }

    // In Opera, the true version is after 'Opera' or after 'Version'
    if (isOpera) {
        browserName = 'Opera';
        try {
            fullVersion = navigator.userAgent.split('OPR/')[1].split(' ')[0];
            majorVersion = fullVersion.split('.')[0] as any;
        } catch (e) {
            fullVersion = '0.0.0.0';
            majorVersion = 0;
        }
    }
    // In MSIE version <=10, the true version is after 'MSIE' in userAgent
    // In IE 11, look for the string after 'rv:'
    else if (isIE) {
        verOffset = nAgt.indexOf('rv:');
        if (verOffset > 0) { //IE 11
            fullVersion = nAgt.substring(verOffset + 3);
        } else { //IE 10 or earlier
            verOffset = nAgt.indexOf('MSIE');
            fullVersion = nAgt.substring(verOffset + 5);
        }
        browserName = 'IE';
    }
    // In Chrome, the true version is after 'Chrome' 
    else if (isChrome) {
        verOffset = nAgt.indexOf('Chrome');
        browserName = 'Chrome';
        fullVersion = nAgt.substring(verOffset + 7);
    }
    // In Safari, the true version is after 'Safari' or after 'Version' 
    else if (isSafari) {
        verOffset = nAgt.indexOf('Safari');

        browserName = 'Safari';
        fullVersion = nAgt.substring(verOffset + 7);

        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
            fullVersion = nAgt.substring(verOffset + 8);
        }

        if (navigator.userAgent.indexOf('Version/') !== -1) {
            fullVersion = navigator.userAgent.split('Version/')[1].split(' ')[0];
        }
    }
    // In Firefox, the true version is after 'Firefox' 
    else if (isFirefox) {
        verOffset = nAgt.indexOf('Firefox');
        browserName = 'Firefox';
        fullVersion = nAgt.substring(verOffset + 8);
    }

    // In most other browsers, 'name/version' is at the end of userAgent 
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browserName = nAgt.substring(nameOffset, verOffset);
        fullVersion = nAgt.substring(verOffset + 1);

        if (browserName.toLowerCase() === browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }

    if (isEdge) {
        browserName = 'Edge';
        fullVersion = navigator.userAgent.split('Edge/')[1];
        // fullVersion = parseInt(navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)[2], 10).toString();
    }

    // trim the fullVersion string at semicolon/space/bracket if present
    if ((ix = fullVersion.search(/[; \)]/)) !== -1) {
        fullVersion = fullVersion.substring(0, ix);
    }

    majorVersion = parseInt('' + fullVersion, 10);

    if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    return {
        fullVersion: fullVersion,
        version: majorVersion,
        name: browserName,
        isPrivateBrowsing: false
    };
}

var info = getHostInfo();

export class HostInfo {
    static IsNode = isNode;
    static IsMobileDevice = isMobileDevice;
    static IsEdge = isEdge;    
    static IsOpera = isOpera;
    static IsFirefox = isFirefox;
    static IsSafari = isSafari;
    static IsChrome = isChrome;
    static IsIE = isIE;
    static FullVersion = info.fullVersion;
    static Version = info.version;
    static Name = info.name
}