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
		fileReader: new FileReader(),

		changeText: null,

		audioListHtml: function(title){
			return  '<li class="audioItem" data-title="' + title + '">' +
						'<div  class="collapsible-header"><i class="mdi-device-multitrack-audio"></i>' + title + '</div>' +
						'<div class="collapsible-body center-align">' +
							'<div id="' + title + '-wave"></div>' +
							'<button class="btn waves-effect waves-light audioPlayBtn amber darken-4" type="submit" name="action">Play' +
								'<i class="mdi-av-play-arrow right"></i>' +
							'/button>' +
						'</div>' +
					'</li>';
		},

		loadingHtml:    '<div class="loading full-size valign-wrapper" style="position: absolute; background-color: white;top: 0;z-index: 100000;">' +
							'<div class="valign center-align">' +
								'<div class="preloader-wrapper small active" style="margin-top: 13px; margin-right: 10px; float:left">' +
									'<div class="spinner-layer spinner-blue">' +
										'<div class="circle-clipper left">' +
											'<div class="circle"></div>' +
											'</div><div class="gap-patch">' +
											'<div class="circle"></div>' +
											'</div><div class="circle-clipper right">' +
											'<div class="circle"></div>' +
										'</div>' +
									'</div>' +
									'<div class="spinner-layer spinner-red">' +
										'<div class="circle-clipper left">' +
											'<div class="circle"></div>' +
											'</div><div class="gap-patch">' +
											'<div class="circle"></div>' +
											'</div><div class="circle-clipper right">' +
											'<div class="circle"></div>' +
										'</div>' +
									'</div>' +
									'<div class="spinner-layer spinner-yellow">' +
										'<div class="circle-clipper left">' +
											'<div class="circle"></div>' +
											'</div><div class="gap-patch">' +
											'<div class="circle"></div>' +
											'</div><div class="circle-clipper right">' +
											'<div class="circle"></div>' +
										'</div>' +
									'</div>' +
									'<div class="spinner-layer spinner-green">' +
										'<div class="circle-clipper left">' +
											'<div class="circle"></div>' +
											'</div><div class="gap-patch">' +
											'<div class="circle"></div>' +
											'</div><div class="circle-clipper right">' +
											'<div class="circle"></div>' +
										'</div>' +
									'</div>' +
								'</div>' +
								'<h4 style="float: left">Loading...</h4>' +
							'</div>' +
						'</div>',

		/**
		 * DOMContentLoaded Listener
		 */

		domLoaded: function() {
			/* Dragend init */
			$("main").find('.container').dragend();

			/* SideBar init */
			$(".button-collapse").sideNav();
			$('.collapsible').collapsible();

			/* Hammer Events (need to be after Dragend init) */
			$('#micBtn').hammer().on('tap', function(){
				console.log();
				if(app.Mic.waveMic.active){
					controller.stopRecording();
				}else{
					window.console.info('Start Microphone');
					app.Mic.waveMic.start();
				}
			});

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

			/* Check if it already has recordings in folder */

			//if(app.sdCard){
			//	var request = app.sdCard.enumerate(app.folder);
			//
			//	request.onsucess = function(){
			//		if(this.result){
			//			var file =
			//		}
			//	};
			//
			//	request.onerror = function(){
			//
			//	}
			//}
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
						}else{
							console.trace();
							console.error(error);
						}
					}
				);
			}else{
				window.console.log(chunk);
			}
		},

		stopRecording: function(error){
			app.Mic.recorder.stop();
			delete app.Mic.currentRecord;
			delete app.Mic.audioStream;

			app.Mic.currentRecord = undefined;
			app.Mic.audioStream = undefined;

			app.Mic.waveMic.stop();
			app.Mic.waveSurfer.empty();

			var noRecords = $('.noRecord');
			if(noRecords.length > 0){
				noRecords.remove();
			}

			var recordName = app.Mic.currentRecordName;
			var recordHtml = $(controller.audioListHtml(recordName)).data('recordName', recordName);
			window.console.log(recordHtml);

			$('.audioList').append(recordHtml);
			$('.audioItem').hammer().off('tap').hammer().on('tap', controller.requestFile);

			$('#micBtn').find('i').removeClass('mdi-av-mic-off').addClass("mdi-av-mic");
			$('.record-text').text('Record Stopped');

			this.changeText = setTimeout(function(){
				controller.changeText = null;
				$('.record-text').text('Start Recording');
			}, 2000);
		},

		requestFile: function(){
			if(app.sdCard){
				var self = $(this);
				var fileName = self.data('title');
				self.find('.collapsible-body').append(controller.loadingHtml);

				if(app.audio.init){
					app.audio.waveSurfer.destroy();
				}else{
					app.audio.init = true;
				}

				window.console.log('#'+fileName+'-wave');

				app.audio.waveSurfer.init({
					container     : '#'+fileName+'-wave',
					waveColor     : '#080808',
					pixelRatio: 1
				});

				async.waterfall(
					[
						function(callback){
							var fileHandler = app.sdCard.getEditable(app.folderName + fileName);

							fileHandler.onsuccess = function(){
								callback(null, this.result);
							};

							fileHandler.onerror = function () {
								callback(this.error);
							};
						},
						function(file, callback){
							var request = file.getFile();

							request.onsuccess = function(){
								callback(null, controller.fileReader.readAsDataURL(this.result));
							};

							request.onerror = function(){
								callback(this.error);
							};
						}
					],
					function(error, fileURL){
						if(!error){
							app.audio.waveSurfer.load(fileURL);
						}else{

						}
					}
				);
			}
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

			this.audio = {
				waveSurfer: Object.create(WaveSurfer),
				init: false
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