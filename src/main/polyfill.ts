if (global['MediaStream']) 
MediaStream.prototype.stop = MediaStream.prototype.stop || function() {
    this.getTracks().forEach(track => {
        track.stop()        
    });
}