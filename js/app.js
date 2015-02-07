/**
 * Get Browser name
 * @link: http://stackoverflow.com/questions/2400935/browser-detection-in-javascript
 */
navigator.sayswho= (function(){
	var ua= navigator.userAgent, tem,
		M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if(/trident/i.test(M[1])){
		tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE '+(tem[1] || '');
	}
	if(M[1]=== 'Chrome'){
		tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
		if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
	}
	M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
	return M;
})();

(function(){
	'use strict';

	var controller = {
		changeText: null,

		/**
		 * DOMContentLoaded Listener
		 */

		domLoaded: function() {
			/*SideBar init*/
			$(".button-collapse").sideNav();
			$('.collapsible').collapsible();

			/* WaveForm init */
			app.Mic.waveSurfer.init({
				container     : '#waveform',
				waveColor     : '#080808',
				interact      : false,
				cursorWidth   : 0,
				pixelRatio: 1,
				height: 215
			});

			/* WaveForm Mic Plugin Init */
			app.Mic.waveMic.init({
				wavesurfer: app.Mic.waveSurfer
			});
		},

		startRecording: function(stream){
			if(this.changeText){
				window.clearTimeout(this.changeText);
			}

			app.Mic.audioStream = stream;

			/* Recorder Init */
			app.Mic.recorder = new MediaStreamRecorder(app.Mic.audioStream);
			app.Mic.recorder.mimeType = app.audioType;
			app.Mic.recorder.ondataavailable = this.audioData;
			app.Mic.recorder.start(160000);

			$('#micBtn').find('i').removeClass("mdi-av-mic").addClass('mdi-av-mic-off');
			$('.record-text').text('Recording...');
		},

		audioData: function(chunk){
			if(app.sdCard){
				async.waterfall(
					[
						function(callback){
							if(typeof app.Mic.currentRecord === 'undefined'){
								var request = app.sdCard.addNamed(chunk, app.folderName + app.Mic.currentRecordName);

								request.onsuccess = function(){
									window.console.log('File "' + this.result.name + '" successfully wrote on the sdcard storage area');
									app.Mic.currentRecord = this.result.open('readwrite');
									callback(null, null);

								};

								request.onerror = function(){
									window.console.error('Unable to write the file: ' + this.error);
									callback(this.error);
								};
							}else{
								callback(null, app.Mic.currentRecord, true);
							}
						},
						function(record, callback){
							if(record){
								if(record.active){
									var writeHandler = app.Mic.currentRecord.append(chunk);

									writeHandler.onProgress(function(status){
										window.console.log('Appending audio chunk to file.\n Chunk size: ' + status.total + ' bytes, already saved: ' + status.loaded + ' bytes');
									});

									writeHandler.onsuccess(function(){
										window.console.log('Finish appending audio to file');
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
					],
					function(error){
						if(error){
							window.console.trace();
							window.console.error(error);

							controller.stopRecording(error);
						}
					}
				);
			}else{
				window.console.log(chunk);
			}
		},

		stopRecording: function(error){
			delete app.Mic.currentRecord;
			delete app.Mic.audioStream;

			app.Mic.currentRecord = undefined;
			app.Mic.audioStream = undefined;

			app.Mic.waveSurfer.empty();

			$('#micBtn').find('i').removeClass('mdi-av-mic-off').addClass("mdi-av-mic");
			$('.record-text').text('Record Stopped');

			this.changeText = setTimeout(function(){
				controller.changeText = null;
				$('.record-text').text('Start Recording');
			}, 2000);
		},

		log: function(args, type) {
			if(typeof app.console !== 'undefined' && app.debug){
				if(app.console.hasOwnProperty(type)){
					app.console[type].apply(app.console, args);
				}else{
					if(args.length > 1){
						app.console.log.apply(app.console, args);
					}else if(args.length === 1 && typeof args[0] !== 'undefined' && args[0] !== null && args[0] !== ''){
						app.console.log.apply(app.console, args);
					}
				}
			}
		}
	};

	var app = {
		sdCard: typeof navigator.getDeviceStorage !== 'undefined'? navigator.getDeviceStorage("sdcard") : undefined,

		folderName: 'records/',

		audioType: 'audio/ogg',

		debug: true,

		console: window.console,

		/**
		 * Initialize App Base Function
		 */
		initialize: function(){
			if(navigator.sayswho[0].toLowerCase() === 'firefox'){
				window.console = {
					__noSuchMethod__: function(id, args){
						controller.log(args, id);
					}
				};
			}

			this.Mic = {
				waveSurfer: Object.create(WaveSurfer),
				waveMic: Object.create(WaveSurfer.Microphone),
				recorder: undefined,
				currentRecord: undefined,
				audioStream: undefined
			};

			Object.defineProperties(this.Mic, {
				currentRecordName: {
					get: function () {
						var now = new Date();

						return 'record-' +
							now.getDate() + '-' +
							now.getMonth()+1 + '-' +
							now.getYear() + '-' +
							now.getHours() + '-' +
							now.getMinutes() + '-' +
							now.getSeconds() + '.ogg';
					}
				},
				recording: {
					get: function(){
						if(app.Mic.recorder){

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
				if(app.Mic.waveMic.active){
					app.Mic.waveMic.stop();
					controller.stopRecording();
				}else{
					window.console.info('Start Microphone');
					app.Mic.waveMic.start();
				}
			});

			/* Microphone Events */
			this.Mic.waveMic.on('deviceReady', function(stream) {
				window.console.info('Device ready and Streaming');
				controller.startRecording(stream);
			});
			this.Mic.waveMic.on('deviceError', function(code) {
				window.console.warn('Device error: ' + code);
			});
		}
	};

	app.initialize(); //app Initializer
})();