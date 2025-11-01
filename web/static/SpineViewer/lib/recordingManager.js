export class RecordingManager {
    constructor(canvas, fps = 60) {
        this.canvas = canvas;
        this.fps = fps;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
    }

    startRecording() {
        if (this.isRecording) {
            console.warn('[RecordingManager] Already recording');
            return;
        }

        this.recordedChunks = [];
        
        try {
            const stream = this.canvas.captureStream(this.fps);
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000
            };

            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm';
            }

            this.mediaRecorder = new MediaRecorder(stream, options);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            console.log('[RecordingManager] Recording started with mime type:', options.mimeType);
        } catch (error) {
            console.error('[RecordingManager] Failed to start recording:', error);
        }
    }

    stopRecordingAndDownload(filename = 'animation.webm') {
        if (!this.isRecording || !this.mediaRecorder) {
            console.warn('[RecordingManager] Not recording');
            return;
        }

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('[RecordingManager] Video downloaded:', filename);
        };

        this.mediaRecorder.stop();
        this.isRecording = false;
    }
}
