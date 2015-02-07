(function(){
	'use strict';

	var controller = {
		/**
		 * DOMContentLoaded Listener
		 */

		reader: new window.FileReader(),

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
			app.Microfone.recorder = new MediaStreamRecorder(stream);
			app.Microfone.recorder.mimeType = app.audioType;
			app.Microfone.recorder.ondataavailable = this.audioData;
			app.Microfone.recorder.start(160000);

			$('#micBtn').find('i').removeClass("mdi-av-mic").addClass('mdi-av-mic-off');
			$('.record-text').text('Recording...');
		},

		audioData: function(blob){
			var noRecords = $('.noRecords');

			async.waterfall(
				[
					function(callback){
						if(typeof app.Microfone.currentRecord === 'undefined'){
							var fileRequest = app.sdCard.getEditable(app.Microfone.currentRecordName);

							fileRequest.onsuccess = function(fileHandler){
								app.Microfone.currentRecord = fileHandler.open('readwrite');
								callback(null, app.Microfone.currentRecord);
							};

							fileRequest.onerror = function(){
								app.sdCard.addNamed(blob, app.folderName + app.Microfone.currentRecordName);
								callback(null, null);
							};
						}else{
							callback(null, app.Microfone.currentRecord);
						}
					},
					function(record, callback){
						if(record){
							if(record.active){
								var writeHandler = app.Microfone.currentRecord.append(blob);

								writeHandler.onProgress(function(status){
									console.log('Appending audio chunk to file.\n Chunk size: ' + status.total + ' bytes, already saved: ' + status.loaded + ' bytes');
								});

								writeHandler.onsuccess(function(){
									callback();
								});

								writeHandler.onerror(function(){
									callback(this.error);
								});
							}
						}else{
							callback();
						}
					}
				]
			);

			controller.reader.onloadend = function() {
				var audioURL = controller.reader.result;

				console.log(audioURL);

				if(){

				}else{
					ConcatenateBlobs([currentRecord.attr('src'), blob], app.audioType, function(concatenated) {
						currentRecord.attr('src', concatenated);
					});
				}
			};
			controller.reader.readAsDataURL(blob);
		},

		stopRecording: function(error){
			app.Microfone.recorder.stop();
			$('#micBtn').find('i').removeClass('mdi-av-mic-off').addClass("mdi-av-mic");
			$('.record-text').text('Record Stopped');

			var changeRecordText = setTimeout(function(){
				$('.record-text').text('Start Record');
			}, 1000);
		}
	};

	var app = {
		sdCard: navigator.getDeviceStorage("sdcard"),

		folderName: 'records/',

		audioType: 'audio/ogg',

		today: new Date(),

		/**
		 * Initialize App Base Function
		 */
		initialize: function(){
			this.Microfone = {
				waveSurfer: Object.create(WaveSurfer),
				waveMic: Object.create(WaveSurfer.Microphone),
				recorder: undefined,
				currentRecord: null,
			};

			Object.defineProperties(this.Microfone, {
				currentRecordName: {
					get: function () {
						return 'record-' + app.today.getDate() + '-' +
							app.today.getMonth() + 1 + '-' +
							app.today.getYear() + '-' +
							app.today.getHours() + '-' +
							app.today.getMinutes() + '-' +
							app.today.getSeconds() + '.ogg';
					}
				},
				recording: {
					get: function(){
						if(app.Microfone.recorder){

						}else{
							return false;
						}
					}
				}
			});

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