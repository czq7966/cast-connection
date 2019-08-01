if (global['MediaStream']) 
(MediaStream as any).prototype.stop = (MediaStream as any).prototype.stop || function() {
    this.getTracks().forEach(track => {
        track.stop()        
    });
}