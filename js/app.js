(function(){
	'use strict';

	var controller = {
		/**
		 * DOMContentLoaded Listener
		 */
		domLoaded: function() {
			$(".button-collapse").sideNav({edge: 'left'});
			$('.collapsible').collapsible();
		}
	};

	var app = {
		/**
		 * Initialize App Base Function
		 */
		initialize: function(){
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
