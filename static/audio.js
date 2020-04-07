function initAudio(){
	
	// create audio context (for legacy browsers)
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	const audioContext = new AudioContext();
	
	// get the audio element
	const audioElement = document.querySelector('audio');
	audioElement.crossorigin = 'anonymous'

	// pass it into the audio context
	const track = audioContext.createMediaElementSource(audioElement);

	// add gain node
	const gainNode = audioContext.createGain();

	// create a compressor node
	const compressor = audioContext.createDynamicsCompressor();
	compressor.threshold.setValueAtTime(-20, audioContext.currentTime);
	compressor.knee.setValueAtTime(40, audioContext.currentTime);
	compressor.ratio.setValueAtTime(10, audioContext.currentTime);
	compressor.attack.setValueAtTime(0, audioContext.currentTime);
	compressor.release.setValueAtTime(0, audioContext.currentTime);
	
	// create a bandpass filder node
	let bandPassCoefs = 
	[	
		{	name: "bandpass wp = [0.05, 0.25] ws = [0.001, 0.3]",
			feedforward: [0.00672709, -0.05285259,  0.19853036, -0.4791963 ,  0.84126811,
       -1.14964787,  1.27034242, -1.14964787,  0.84126811, -0.4791963 ,
        0.19853036, -0.05285259,  0.00672709],
			feedback: [1.        ,  -10.1093273 ,   47.88742976, -140.58683816,
        284.92741527, -419.99254805,  461.69555317, -381.37521159,
        234.93874721, -105.26567646,   32.56445247,   -6.2457378 ,
          0.56174403]
		},
		{	name: "highpass wp = 0.05 ws = 0.001",
			feedforward: [0.82242664, -1.64478801,  0.82242664],
			feedback: [1.        , -1.83516742,  0.85587082]
		},
		{
			name: "highpass wp = 0.1 ws = 0.001",
			feedforward: [0.75543232, -1.51062183,  0.75543232],
			feedback: [1.        , -1.65657472,  0.73358885]
			
		}
	]
	
	let filterIndex = 2;
	let feedForward = bandPassCoefs[filterIndex].feedforward,
		feedBack = bandPassCoefs[filterIndex].feedback;

	const iirfilter = audioContext.createIIRFilter(feedForward, feedBack);
	
	// create noise source 
    const bufferSize = audioContext.sampleRate * 2; 
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate); 
    let data = buffer.getChannelData(0);
    // fill the buffer with noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    // create a buffer source for our created data
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
	// create bandpass for noise source
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 200;
	// creat low pass for noise source
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 35;
	// create gain for noise source
	const noiseGain = audioContext.createGain();
	noiseGain.gain.value = 0.3
	// create gain for noise source
	const noiseGain2 = audioContext.createGain();
	noiseGain2.gain.value = 0.01
	// start noise source
	const noisegraph = noise.connect(lowpass).connect(noiseGain)
	const noisegraph2 = noise.connect(bandpass).connect(noiseGain2)
	noise.loop = true;
    noise.start();
	
	// create splitter and merger to route noise and audio sources
	var merger = audioContext.createChannelMerger(3);
	var splitter = new ChannelSplitterNode(audioContext, {
		numberOfOutputs : 2 });
	var dest = audioContext.destination;
	
	// connect graph
	noisegraph2.connect(merger, 0, 0)
	noisegraph2.connect(merger, 0, 1)
	noisegraph.connect(merger, 0, 0)
	noisegraph.connect(merger, 0, 1)
	track.connect(splitter)
	splitter.connect(merger, 1, 1)
	splitter.connect(merger, 0, 0)
	
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
			// check if context is in suspended state (autoplay policy)
			if (audioContext.state === 'suspended') {
		        audioContext.resume();
		    }
			// create dest
			merger.connect(gainNode).connect(dest);
			// start audio
			audioElement.play();
			// set ui attributes
            this.setAttribute('data-playing', 'true');
			this.setAttribute('aria-pressed', 'true');
			this.innerText = 'Pause';
			filterButton.removeAttribute('disabled');
		} else {
			// pause audio
			audioElement.pause();
			noise.disconnect()
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
	
	// on turn on filter connect iir
	filterButton.addEventListener('click', function() {
		if (this.dataset.filteron === 'false') {
			// turn on filter
			track.disconnect();
			track.connect(iirfilter).connect(splitter);
			// set ui attributes
			this.setAttribute('data-filteron', 'true');
			this.setAttribute('aria-pressed', 'true');
			this.innerText = 'Filter On';
		} else {
			// turn off filter
			track.disconnect();
			track.connect(splitter);
			// set ui attributes
			this.setAttribute('data-filteron', 'false');
			this.setAttribute('aria-pressed', 'false');
			this.innerText = 'Filter Off';
		}

	}, false);
}	