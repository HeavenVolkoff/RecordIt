(function(){
	'use strict';

	var controller = {
		/**
		 * DOMContentLoaded Listener
		 */
		domLoaded: function() {
			$(".button-collapse").sideNav({edge: 'left'});
			$('.collapsible').collapsible();

			console.log('hahahhah');

			/* WaveForm init */
			app.Microfone.waveSurfer.init({
				container     : '#waveform',
				waveColor     : '#fefefe',
				interact      : false,
				cursorWidth   : 0
			});

			/* WaveForm Mic Plugin Init */
			app.Microfone.waveMic.init({
				wavesurfer: app.Microfone.waveSurfer
			});
			app.Microfone.waveMic.on('deviceReady', function() {
				console.info('Device ready!');
			});
			app.Microfone.waveMic.on('deviceError', function(code) {
				console.warn('Device error: ' + code);
			});
		}
	};

	var app = {
		/**
		 * Initialize App Base Function
		 */
		initialize: function(){
			this.Microfone = {
				waveSurfer: Object.create(WaveSurfer),
				waveMic: Object.create(WaveSurfer.Microphone),
				recorder: undefined
			};

			this.bindEvents();
		},

		/**
		 * Bind Events to Controller Listeners
		 */
		bindEvents: function(){
			window.addEventListener('DOMContentLoaded', controller.domLoaded);

			$('#micBtn').hammer().bind('tap', function(){
				if(app.Microfone.waveMic.active){
					app.Microfone.waveMic.stop();
				}else{
					console.log('Start Microphone');
					app.Microfone.waveMic.start();
				}
			});
		}
	};

	app.initialize(); //app Initializer
})();
