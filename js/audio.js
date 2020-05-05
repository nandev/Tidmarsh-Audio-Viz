class AudioSource{
	constructor(audioElement){
		this.audioElement = audioElement;
		// create audio context (for legacy browsers)
		let AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new AudioContext();
		// pass it into the audio context
		this.track = this.audioContext.createMediaElementSource(this.audioElement);
		// create output destination
		this.dest = this.audioContext.destination;
		// set analyser to null
		this.analyser = null;
	}

	advanced(){
        // added this line to test whether advanced audio processing is really supported
        // createIIRFilter should fail if not
        const iirFilter = this.audioContext.createIIRFilter([0.1,0.1,0.1], [1,-1,0.1]);
		// analyzer
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 64;
		this.analyserBufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.analyserBufferLength);
        this.track.connect(this.analyser).connect(this.dest);
	}

	play(){
		// check if context is in suspended state (autoplay policy)
		if (this.audioContext.state === 'suspended') {
	        this.audioContext.resume();
	    }
		// start audio
		this.audioElement.play();
	}

	pause(){
		// pause audio
		this.audioElement.pause();
	}

	analyse(){
		// frequency analysis
		if(this.analyser!=null){
            console.log("Analysing Audio")
			this.analyser.getByteFrequencyData(this.dataArray);
			return this.dataArray;
		}
		return null;
	}

    cleanup(){
        this.audioContext.close()
    }

}
