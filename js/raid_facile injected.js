/* test encodage
ces caractère doivent être ben accentués et bien écrits, sinon c'est qu'il y a un problème
aâàã eéêè iîì ñ oôòõ uûù €
*/
(function(){

var injectScript = function() {
"use strict";
/** classe de communication avec le script *///{
var Intercom = function() {
	this.listen();
};
Intercom.prototype = {
	send: function(action, data){
		if (data === undefined) {
			data = {};
		}
		data.fromPage = true;
		data.namespace = 'Raid facile';
		data.action = action;
		window.postMessage(data, '*');
	},
	listen: function(){
		window.addEventListener('message', this.received.bind(this), false);
	},
	received: function(event){
		if (event.data.namespace !== 'Raid facile' || event.data.fromPage === true) {
			return;
		}
		var data = event.data.data;
		switch(event.data.action) {
		case 'ogame style':
			// Affichage des select et des boutons façon Ogame
			$('#div_raide_facile select').ogameDropDown();
			$('#div_raide_facile input[type="submit"]').button();
			break;
		case 'tooltip':
			var tooltipSettings = {
				hideOn: [
					{ element: 'self', event: 'mouseleave' },
					{ element: 'tooltip', event: 'mouseenter' }
				],
				skin: 'cloud'
			};
			for (var prop in data.settings) {
				tooltipSettings[prop] = data.settings[prop];
			}
			var elems = $(data.selector);
			if (data.htmlTooltip) {
				for (var i = 0; i < elems.length; ++i) {
					Tipped.create(elems[i], $('>.tooltipTitle', elems[i])[0], tooltipSettings);
				}
			} else {
				for (var j = 0; j < elems.length; ++j) {
					Tipped.create(elems[j], tooltipSettings);
				}
			}
			break;
		}
	}
};
var intercom = new Intercom();
intercom.send('loaded');
//}
};

// injection du script
var script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.innerHTML = '('+injectScript.toString()+')();';
document.head.appendChild(script);

})();

// console.profileEnd('Raid facile');
