(function(){
	'use strict';

	var controller = {
		/**
		 * DOMContentLoaded Listener
		 */
		domLoaded: function() {
			/*SideBar init*/
			$(".button-collapse").sideNav();
			$('.collapsible').collapsible();

			/* WaveForm init */
			app.Microfone.waveSurfer.init({
				container     : '#waveform',
				waveColor     : '#080808',
				interact      : false,
				cursorWidth   : 0
			});

			/* WaveForm Mic Plugin Init */
			app.Microfone.waveMic.init({
				wavesurfer: app.Microfone.waveSurfer
			});
		},

		startRecording: function(stream){
			/* Recorder Init */
			app.Microfone.recorder = RecordRTC(stream);
			app.Microfone.recorder.startRecording();
			$('#micBtn').find('i').removeClass("mdi-av-mic").addClass('mdi-av-mic-off');
			$('.record-text').text('Recording...');
		},

		stopRecording: function(){
			app.Microfone.recorder.stopRecording(function(audioURL){
				$('#micBtn').find('i').removeClass('mdi-av-mic-off').addClass("mdi-av-mic");
				$('.record-text').text('Record Stoped');

				var changeRecordText = setTimeout(function(){
					$('.record-text').text('Start Record');
				}, 1000);


				$('.noRecords').remove();
				$('.records').append($('<li>').addClass('collection-item').append($('<audio>').attr('src', audioURL).prop('controls', true)));
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
					controller.stopRecording();
				}else{
					console.info('Start Microphone');
					app.Microfone.waveMic.start();
				}
			});

			/* Microphone Events */
			this.Microfone.waveMic.on('deviceReady', function(stream) {
				console.info('Device ready and Streaming');
				controller.startRecording(stream);
			});
			this.Microfone.waveMic.on('deviceError', function(code) {
				console.warn('Device error: ' + code);
			});
		}
	};

	app.initialize(); //app Initializer
})();