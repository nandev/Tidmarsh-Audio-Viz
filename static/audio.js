class AudioSource{
	constructor(audioElement){
		this.audioElement = audioElement;
		
		// create audio context (for legacy browsers)
		let AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new AudioContext();
	
		// analyzer
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 32;
		this.analyserBufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.analyserBufferLength);
	
		// pass it into the audio context
		this.track = this.audioContext.createMediaElementSource(this.audioElement);

		// add gain node
		this.gainNode = this.audioContext.createGain();
		
		// create a bandpass filder node
		let coefs = 
		[	
			{	name: "bandpass wp = [0.05, 0.25] ws = [0.001, 0.3]",
				feedforward: [0.00672709, -0.05285259,  0.19853036, -0.4791963,  
					0.84126811, -1.14964787,  1.27034242, -1.14964787,  0.84126811, 
					-0.4791963, 0.19853036, -0.05285259,  0.00672709],
				feedback: [1.,  -10.1093273 ,   47.88742976, -140.58683816, 284.92741527, 
					-419.99254805,  461.69555317, -381.37521159, 234.93874721, 
					-105.26567646,   32.56445247,   -6.2457378, 0.56174403]
			},
			{	name: "highpass wp = 0.05 ws = 0.001",
				feedforward: [0.82242664, -1.64478801,  0.82242664],
				feedback: [1.        , -1.83516742,  0.85587082]
			},
			{	name: "highpass wp = 0.1 ws = 0.001",
				feedforward: [0.75543232, -1.51062183,  0.75543232],
				feedback: [1.        , -1.65657472,  0.73358885]
			}
		]
		let filterIndex = 2;
		let feedForward = coefs[filterIndex].feedforward,
			feedBack = coefs[filterIndex].feedback;
		this.iirfilter = this.audioContext.createIIRFilter(feedForward, feedBack);
	
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
		this.noiseGain1.gain.value = 0.3
		// create gain for second noise source
		this.noiseGain2 = this.audioContext.createGain();
		this.noiseGain2.gain.value = 0.01
		// start noise source
		this.noisegraph1 = this.noise.connect(this.lowpass).connect(this.noiseGain1)
		this.noisegraph2 = this.noise.connect(this.bandpass).connect(this.noiseGain2)
		// start noise source
	    this.noise.start();
	
		// create splitter and merger to route noise and audio sources
		this.merger = this.audioContext.createChannelMerger(3);
		this.splitter = new ChannelSplitterNode(this.audioContext, {
			numberOfOutputs : 2 });
			
		// create output destination
		this.dest = this.audioContext.destination;
	
		// connect graph
		this.noisegraph2.connect(this.merger, 0, 0)
		this.noisegraph2.connect(this.merger, 0, 1)
		this.noisegraph1.connect(this.merger, 0, 0)
		this.noisegraph1.connect(this.merger, 0, 1)
		this.track.connect(this.iirfilter).connect(this.analyser).connect(this.splitter)
		this.splitter.connect(this.merger, 1, 1)
		this.splitter.connect(this.merger, 0, 0)
	}

	play(){
		// check if context is in suspended state (autoplay policy)
		if (this.audioContext.state === 'suspended') {
	        this.audioContext.resume();
	    }
		// create dest
		this.merger.connect(this.gainNode).connect(this.dest);
		// start audio
		this.audioElement.play();
	}
	
	pause(){
		// pause audio
		this.audioElement.pause();
		this.noise.disconnect()
	}
	
	analyse(){
		// frequency analysis
		this.analyser.getByteFrequencyData(this.dataArray);
		return this.dataArray;
	}
}
	
	
function initUI(audio, audioElement) {
	// UI
	const playButton = document.querySelector('button');
	const volumeControl = document.querySelector('#volume');
	const pannerControl = document.querySelector('#panner');
	const filterButton = document.querySelector('.button-filter');
	
	volumeControl.addEventListener('input', function() {
	  gainNode.gain.value = this.value;
	}, false);
	
	playButton.addEventListener('click', function() {
		if (this.dataset.playing === 'false') {
			audio.play();
			// set ui attributes
            this.setAttribute('data-playing', 'true');
			this.setAttribute('aria-pressed', 'true');
			this.innerText = 'Pause';
			filterButton.removeAttribute('disabled');
		} else {
			audio.pause();
			// set ui attributes
			this.setAttribute('data-playing', 'false');
			this.setAttribute('aria-pressed', 'false');
			this.innerText = 'Play';
			filterButton.disabled = 'true';
		}

	}, false);
	
	audioElement.addEventListener('ended', () => {
		playButton.dataset.playing = 'false';
	}, false);
	
	
}