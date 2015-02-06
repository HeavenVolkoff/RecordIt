(function(){
	'use strict';

	var controller = {
		/**
		 * DOMContentLoaded Listener
		 */
		domLoaded: function(){
			$(".button-collapse").sideNav({edge: 'left'});
			$('.collapsible').collapsible();

			for(var storage in app.storages){
				if(app.storages.hasOwnProperty(storage)){
					$('#slide-out').append( '<li>' +
												'<a href="#" class="waves-effect waves-light">' +
													'<i class="' + (new RegExp('Internal').test(storage)? 'mdi-device-storage' : 'mdi-device-sd-storage') + '"></i>'+
													storage +
												'</a>' +
											'</li>');
				}
			}

			var files = app.storages['Internal Memory'].enumerate();

			files.onsucess = function(){
				console.log(this.result);
				if(this.result){
					console.log(this.result.name);
					this.continue();
				}
			};
		}
	};

	var app = {
		/**
		 * Initialize App Base Function
		 */
		initialize: function(){
			this.storages = {};
			var storages = navigator.getDeviceStorages('sdcard');

			for(var i = 0; i < storages.length; i++){
				if(i === 0){
					this.storages['Internal Memory'] = storages[i];
				}else if(i === 1 && i === storages.length - 1){
					this.storages['SD Card'] = storages[i];
				}else{
					this.storages['SD Card ' + i] = storages[i];
				}
			}

			this.bindEvents();
		},

		/**
		 * Bind Events to Controller Listeners
		 */
		bindEvents: function(){
			window.addEventListener('DOMContentLoaded', controller.domLoaded);
		}
	};

	app.initialize(); //app Initializer
})();
