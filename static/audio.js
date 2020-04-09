class AudioSource{
	constructor(){
		this.audioElement = creatAudioElement("advAudio");
		
		// create audio context (for legacy browsers)
		let AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new AudioContext();
		
		// pass it into the audio context
		this.track = this.audioContext.createMediaElementSource(this.audioElement);
		
		// add gain node
		this.gainNode = this.audioContext.createGain();
		
		// create output destination
		this.dest = this.audioContext.destination;
		
		// set analyser to null
		this.analyser = null;
	}
	
	generateAdvGraph(){
		this.noisegraph1 = this.noise.connect(this.lowpass).connect(this.noiseGain1)
		this.noisegraph2 = this.noise.connect(this.bandpass).connect(this.noiseGain2)
		this.noisegraph2.connect(this.merger, 0, 0);
		this.noisegraph2.connect(this.merger, 0, 1);
		this.noisegraph1.connect(this.merger, 0, 0);
		this.noisegraph1.connect(this.merger, 0, 1);
		this.track.connect(this.iirfilter).connect(this.analyser).connect(this.splitter);
		this.splitter.connect(this.merger, 1, 1);
		this.splitter.connect(this.merger, 0, 0);
		return this.merger.connect(this.gainNode).connect(this.dest); 
	}
	
	advanced(){
		// analyzer
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 32;
		this.analyserBufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.analyserBufferLength);
		
		// create a bandpass filder node
		let coefs = {	
				feedforward: [0.75543232, -1.51062183,  0.75543232],
				feedback: [1.        , -1.65657472,  0.73358885]
			}
		this.iirfilter = this.audioContext.createIIRFilter(coefs.feedforward, coefs.feedback);
		
		// create noise source 
	    this.noiseBufferSize = this.audioContext.sampleRate * 2; 
	    this.buffer = this.audioContext.createBuffer(1, this.noiseBufferSize, this.audioContext.sampleRate); 
	    let data = this.buffer.getChannelData(0);
	    // fill the buffer with noise
	    for (let i = 0; i < this.noiseBufferSize; i++) {
	        data[i] = Math.random() * 2 - 1;
	    }
	    // create a buffer source for our created data
	    this.noise = this.audioContext.createBufferSource();
	    this.noise.buffer = this.buffer;
		this.noise.loop = true;
		// create bandpass for noise source
	    this.bandpass = this.audioContext.createBiquadFilter();
	    this.bandpass.type = 'bandpass';
	    this.bandpass.frequency.value = 200;
		// creat low pass for noise source
	    this.lowpass = this.audioContext.createBiquadFilter();
	    this.lowpass.type = 'lowpass';
	    this.lowpass.frequency.value = 35;
		// create gain for noise source
		this.noiseGain1 = this.audioContext.createGain();
		this.noiseGain1.gain.value = 0.5
		// create gain for second noise source
		this.noiseGain2 = this.audioContext.createGain();
		this.noiseGain2.gain.value = 0.01		
		// start noise source
	    this.noise.start();
		
		// create splitter and merger to route noise and audio sources
		this.merger = this.audioContext.createChannelMerger(3);
		this.splitter = this.audioContext.createChannelSplitter(2);
	}
	
	simple(){
		this.graph = this.track.connect(this.gainNode).connect(this.dest);
	}
	
	play(){
		// check if context is in suspended state (autoplay policy)
		if (this.audioContext.state === 'suspended') {
	        this.audioContext.resume();
	    }
		// start audio
		this.audioElement.play();
		if(audio_status==1) {
			this.graph = this.generateAdvGraph();
		}
	}
	
	pause(){
		// pause audio
		this.audioElement.pause();
		if(audio_status==1) {
			this.noise.disconnect();
		}
	}
	
	analyse(){
		// frequency analysis
		if(this.analyser!=null){
			this.analyser.getByteFrequencyData(this.dataArray);
			return this.dataArray;
		}
		return null;
	}
	
	cleanup(){
		this.track.disconnect();
	}
}