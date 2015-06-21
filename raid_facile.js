// ==UserScript==
// @name           Raide Facile [modified by Deberron]
// @namespace      Snaquekiller
// @version        8.5.1
// @author         Snaquekiller + Autre + Deberron + Alu
// @creator        snaquekiller
// @description    Raide facile
// @homepage       http://lastworld.etenity.free.fr/ogame/raid_facile
// @updateURL      http://lastworld.etenity.free.fr/ogame/raid_facile/userscript.header.js
// @downloadURL    http://lastworld.etenity.free.fr/ogame/raid_facile/72438.user.js
// @include        http://*.ogame.gameforge.com/game/index.php?page=*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=buddies*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=notices*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=search*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=combatreport*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=eventList*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=jump*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=phalanx*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=techtree*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=techinfo*
// @exclude        http://*.ogame.gameforge.com/game/index.php?page=globalTechtree*
// ==/UserScript==


// Sujet sur le forum officiel : http://board.ogame.fr/index.php?page=Thread&threadID=978693
/* Pour éditer ce fichier je conseille un de ces éditeurs
	lien: https://code.visualstudio.com/
	lien: http://www.sublimetext.com/
	lien: http://notepad-plus-plus.org/fr
*/
/* test encodage
ces caractère doivent être ben accentués et bien écrits, sinon c'est qu'il y a un problème
aâàã eéêè iîì ñ oôòõ uûù €
*/

/// <reference path="typings/greasemonkey/greasemonkey.d.ts"/>
/* global XPathResult */
/* global chrome */

/** Logger **///{region
	function Logger() {
		this.logs = [];
		this.errors = [];
	}
	Logger.prototype.log = function(message) {
		if (info && !info.args.raidFacileDebug) {
			return;
		}
		var messageParts = [];
		for (var i = 0; i < arguments.length; i++) {
			messageParts.push(arguments[i]);
		}
		this.logs.push(messageParts);
		console.debug.apply(console, ['[raid facile]'].concat(messageParts));
	};
	Logger.prototype.error = function(message) {
		var messageParts = [];
		for (var i = 0; i < arguments.length; i++) {
			messageParts.push(arguments[i]);
		}
		this.errors.push(messageParts);
		console.error.apply(console, ['[raid facile]'].concat(messageParts));
	};
	var logger = new Logger();
//}endregion
logger.log('Salut :)');

/** Variables utilitaires **///{region
	// Si jQuery n'est pas dans le scope courant c'est qu'il est dans le scope de l'unsafeWindow
	if (typeof $ === 'undefined') {
		var $ = unsafeWindow.$;
	}
	// Variable contenant tout un tas d'informations utiles, pour ne pas laisser les variables dans le scope global.
	var info;
	/** Initialise et rempli la variable info */
	var remplirInfo = function () {
		var parseOgameMeta = function () {
			var content, name;
			var metaVars = $('meta[name^=ogame-]', document.head);

			info.ogameMeta = {};
			for (var i = 0; i < metaVars.length; ++i) {
				name = metaVars[i].getAttribute('name');
				content = metaVars[i].getAttribute('content');
				info.ogameMeta[name] = content;
			}
		};
		info = {
			siteUrl: 'http://lastworld.etenity.free.fr/ogame/raid_facile/',
			firefox: navigator.userAgent.indexOf("Firefox") > -1 || navigator.userAgent.indexOf("Iceweasel") > -1,
			chrome: navigator.userAgent.indexOf("Chrome") > -1,
			opera: navigator.userAgent.indexOf('Opera') > -1,
			url: location.href,
			serveur: location.hostname,
			univers: location.hostname.replace('ogame.', ''),
			date: new Date(),
			startTime: (new Date()).getTime(),
			session: $('meta[name=ogame-session]').attr('content') || location.href.replace(/^.*&session=([0-9a-f]*).*$/i, "$1"),
			pseudo: $('meta[name=ogame-player-name]').attr('content'),
			playerId: $('meta[name=ogame-player-id]').attr('content')
			// version
			// Tampermonkey
			// ogameMeta
			// args
			// hash
		};
		parseUrl();
		parseOgameMeta();
		if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
			// pour les extensions Chrome
			info.version = chrome.runtime.getManifest().version;
			info.tampermonkey = false;
		}
		if (typeof GM_info !== 'undefined') {
			// pour greasemonkey et ceux qui ont GM_info (greasemonkey et tampermonkey)
			info.version = GM_info.script.version;
			info.tampermonkey = GM_info.scriptHandler === "Tampermonkey";
		}
	};
	/** Parsing des paramètres situé après le "?" dans l'url, stoque les résultat dans info */
	var parseUrl = function () {
		info.args = {};
		info.hash = {};
		var argString = location.search.substring(1).split('&');
		var i, arg, kvp;
		if (argString[0] !== '') {
			for (i = 0; i < argString.length; i++) {
				arg = decodeURIComponent(argString[i]);
				if (arg.indexOf('=') === -1) {
					info.args[arg] = true;
				} else {
					kvp = arg.split('=');
					info.args[kvp[0]] = kvp[1];
				}
			}
		}
		if (location.hash.length > 0) {
			var hashString = location.hash.substring(1).split('&');
			for (i = 0; i < hashString.length; i++) {
				arg = decodeURIComponent(hashString[i]);
				if (arg.indexOf('=') === -1) {
					info.args[arg] = true;
					info.hash[arg] = true;
				} else {
					kvp = arg.split('=');
					info.args[kvp[0]] = kvp[1];
					info.hash[kvp[0]] = kvp[1];
				}
			}
		}
	};
//}endregion

/** Fonctions de compatibilité **///{region
	// Si ces fonctions n'existent pas, elle sont créées
	if (typeof GM_getValue === 'undefined') {
		GM_getValue = function (key, defaultValue) {
			var retValue = localStorage.getItem(key);
			if (!retValue) {
				retValue = defaultValue;
			}
			return retValue;
		};
	}
	if (typeof GM_setValue === 'undefined') {
		GM_setValue = function (key, value) {
			localStorage.setItem(key, value);
		};
	}
	if (typeof GM_deleteValue === 'undefined') {
		GM_deleteValue = function (key) {
			localStorage.removeItem(key);
		};
	}
	if (typeof GM_addStyle === 'undefined') {
		var addStyle = function (css, url) {
			if (url) {
				$('<link rel="stylesheet" type="text/css" media="screen" href="' + url + '">').appendTo(document.head);
			} else {
				$('<style type="text/css">' + css + '</style>').appendTo(document.head);
			}
		};
	} else {
		var addStyle = function (css, url) {
			if (url) {
				$('<link rel="stylesheet" type="text/css" media="screen" href="' + url + '">').appendTo(document.head);
			} else {
				GM_addStyle(css);
			}
		};
	}
//}endregion

/** Classe gérant le stockage de données **///{region
	function Stockage(namespace) {
		this.storageKeyName = 'RaidFacile ' + info.univers + ' ' + info.ogameMeta['ogame-player-id'] + ' ' + namespace;
		/* Le mapping sert à :
			- ce que ça prenne moins de place dans le stockage, mais qu'on ait toujours un texte compréhensible dans le code
			- définir la valeur par défaut au cas ou rien n'est encore stocké
		*/
		this.mapping = {
			// 'nom complet': ['nom court', 'valeur par défaut']
			'attaquer nouvel onglet': ['a', 1],
			'couleur attaque': ['b', '#c7050d'],
			'couleur attaque retour': ['c', '#e75a4f'],
			'couleur attaque2': ['d', '#c7050d'],
			'couleur attaque2 retour': ['e', '#e75a4f'],
			'couleur espionnage': ['f', '#FF8C00'],
			'couleur espionnage retour': ['f_r', ''],
			'touche raid suivant': ['trs', 80], // touche P
			'langue': ['l', navigator.language],
			'popup duration': ['mt', 1000],
		};
		if (!this.checkMappingCount()) {
			throw 'Erreur de mapping, ya pas le bon nombre!';
		}
	}
	Stockage.prototype = {
		/** Renvoie la valeur d'une donnée en mémoire */
		get: function (nom) {
			var key = this.mapping[nom][0];
			if (this.data.hasOwnProperty(key)) {
				return this.data[key];
			} else {
				return this.mapping[nom][1];
			}
		},
		/** Change la valeur en mémoire d'une donnée */
		set: function (nom, valeur) {
			this.data[this.mapping[nom][0]] = valeur;
			return this;
		},
		/** Charge en mémoire les données du stockage */
		load: function () {
			this.data = JSON.parse(GM_getValue(this.storageKeyName, '{}'));
			return this;
		},
		/** Sauvegarde dans le stockage les données en mémoire */
		save: function () {
			GM_setValue(this.storageKeyName, JSON.stringify(this.data));
			return this;
		},
		/** Vérification qu'il n'y a pas eu d'erreur de mapping (que chaque valeur n'est utilisée qu'une fois) */
		checkMappingCount: function () {
			var mappingCount = 0;
			var mappingCountCheck = 0;
			var mappingKeys = {};
			for (var prop in this.mapping) {
				if (this.mapping.hasOwnProperty(prop)) {
					++mappingCount;
					mappingKeys[this.mapping[prop][0]] = true;
				}
			}
			for (prop in mappingKeys) {
				if (mappingKeys.hasOwnProperty(prop)) {
					++mappingCountCheck;
				}
			}
			return mappingCount === mappingCountCheck;
		}
	};
	var stockageOption;
	var stockageData;
//}endregion

/** Classe de communication avec la page **///{region
	var Intercom = function () {
		this.loaded = false;
		this.listeAttente = [];
		this.listen();
	};
	Intercom.prototype = {
		/**	send envoie un message à l'autre classe Intercom
			action (string) le nom de l'action
			data (object)(facultatif) les données à transmettre
		*/
		send: function (action, data) {
			// Si l'autre intercom n'est pas encore chargé on met les messages en attente
			if (this.loaded === false) {
				this.listeAttente.push([action, data]);
				return;
			}
			var données = {
				fromPage: false,
				namespace: 'Raid facile',
				action: action,
				data: data === undefined ? {} : data
			};
			window.postMessage(données, '*');
		},
		/** Permet de recevoir les messages de l'autre intercom */
		listen: function () {
			window.addEventListener('message', this.received.bind(this), false);
		},
		/** Défini les actions à effectuer en cas de message reçu */
		received: function (message) {
			// On s'assure que le message est bien pour nous
			if (message.data.namespace !== 'Raid facile' || message.data.fromPage === false) {
				return;
			}
			switch (message.data.action) {
				case 'loaded':
					// l'autre intercom est chargé, on peut donc traiter les messages en attente
					this.loaded = true;
					this.traiterListeAttente();
					break;
				default:
					var handler = eventHandlers[message.data.action];
					if (!handler) {
						logger.error('No handler for action :', message.data.action);
						break;
					}
					handler(message.data);
			}
		},
		traiterListeAttente: function () {
			// On envoie tous les messages de la liste d'attente puis on vide la liste
			for (var i = 0; i < this.listeAttente.length; ++i) {
				this.send.apply(this, this.listeAttente[i]);
			}
			this.listeAttente = [];
		}
	};
	var intercom;
//}endregion

/** Classe d'internationalisation  **///{region
	function I18n() {
		this.fr = {};
		this.en = {};
		this.ro = {};
		this.es = {};
	}
	I18n.prototype = {
		get: function (key) {
			var local = this[langue][key];
			if (local === undefined && key !== 'missing_translation') {
				logger.error(i18n('missing_translation') + ' : "' + key + '"');
			}
			if (local === undefined && langue !== 'en') {
				local = this.en[key];
			}
			if (local === undefined && langue !== 'fr') {
				local = this.fr[key];
			}
			return local || '##' + key + '##';
		},
		exporter: function (langue) {
			return this[langue];
		},
		importer: function (langue, data) {
			this[langue] = data;
		}
	};
	var i18n;
//}endregion

/** Fonctions de correction **///{region

	/** Ajuste la taille de la "box" d'ogame, au cas où le tableau prend trop de place pour le menu */
	function ajusterTailleBox() {
		var tailleBox = $('#box').width();
		var tailleMenuGauche = $('#links').outerWidth(true);
		var tailleMenuPlanetes = $('#rechts').outerWidth(true);
		var tailleRaidFacile = $('#div_raide_facile').outerWidth(true);
		var changementTaille = (tailleMenuGauche + tailleMenuPlanetes + tailleRaidFacile) - tailleBox;
		if (changementTaille > 0) {
			$('#box').width(tailleBox + changementTaille);
			$('#contentWrapper').width($('#contentWrapper').width() + changementTaille);

			var bannerSkyscraperLeft = parseInt($('#banner_skyscraper').css('left').slice(0, -2)) + changementTaille;
			$('#banner_skyscraper').css('left', bannerSkyscraperLeft);
		}
	}

	/** Certains select s'affichent façon ogame mais avec une largeur de 0px, cette fonction corrige le problème
	 * en paramètre la fonction prend un objet jQuery contenant 1 ou plusieurs select
	 */
	function ogameStyleSelectFix(selects) {
		var ok = false;
		for (var i = 0; i < selects.length; ++i) {
			var select = $(selects[i]);
			var span = select.next();
			if (span.width() === 0) {
				span.remove();
				select.removeClass('dropdownInitialized');
				ok = true;
			}
			select.addClass('fixed');
		}
		if (ok) {
			intercom.send('ogame style');
		}
	}
//}endregion

/** Fonctions utilitaires **///{region

	/** un des première fonction à être appelée, initialise un peu tout */
	function init() {
		remplirInfo();
		logger.log('Version', info.version);
		setPage();
		if (info.page === 'optionsRaidFacile') { // impossible d'afficher la page options au départ on affiche donc le tableau
			info.hash.raidFacile = 'tableau';
		}
		rebuildHash();
		logger.log('Page', info.page);
		logger.log('Navigateur', JSON.stringify({ chrome: info.chrome, firefox: info.firefox, opera: info.opera, tampermonkey: info.tampermonkey }));

		intercom = new Intercom();

		stockageOption = new Stockage('options');
		stockageData = new Stockage('données');
		stockageOption.load();
		stockageData.load();

		i18n = instanciateAsFunction(I18n, 'get');

		window.addEventListener('hashchange', onHashChange, false);
		window.addEventListener('keyup', keyShortcut, false);

		plusTard(checkUpdate);
		logger.log('Init ok');
	}
	function init2() {
		logger.log('Init 2');
		afficher_lien();
		logger.log('Init 2 ok');
	}

	/** Fait l'action appropiée quand une touche du clavier est appuyée */
	function keyShortcut(eventObject) {
		// console.log(eventObject.type , eventObject.which, String.fromCharCode(eventObject.which));
		if (eventObject.which === stockageOption.get('touche raid suivant')) {
			if (info.page === 'tableauRaidFacile') {
				eventObject.preventDefault();
				eventObject.stopPropagation();
				var ligneAttaquer = $('#corps_tableau2 > tr:not(.attaque):eq(0)');
				var lienAttaquer = $('> td.boutonAttaquer > a', ligneAttaquer);
				lienAttaquer[0].click();
				ligneAttaquer.addClass('attaque');
			}
		}
	}

	/** Instancie une classe mais en mode fonction (comme jQuery)
	 * mainMethod correspond à la méthode qui sera utilisé en mode raccourci
	 * exemple : i18n(...) est identique à i18n.get(...) si mainMethod = 'get'
	 */
	function instanciateAsFunction(ClassObject, mainMethod) {
		var instance = new ClassObject();
		var func = instance[mainMethod].bind(instance);
		for (var method in ClassObject.prototype) {
			func[method] = instance[method].bind(instance);
		}
		return func;
	};

	/** Permet d'exécuter une fonction, mais plus tard */
	function plusTard(callback, temps) {
		if (temps === undefined) {
			temps = Math.random() * 1000 + 1500; // entre 1.5s et 2.5s
		}
		window.setTimeout(callback, temps);
	}

	/** Met à jour le hash et les variables correspondantes
	 * Supprime le "go" du hash s'il est présent
	 */
	function rebuildHash() {
		var lengthDiff = 0;
		if (info.hash.go !== undefined) {
			delete info.hash.go;
			lengthDiff++;
		}
		var newHash = [];
		for (var key in info.hash) {
			if (info.hash[key] === true) {
				newHash.push(key);
			} else {
				newHash.push(key + '=' + info.hash[key]);
			}
		}
		if (newHash.length === 0 && lengthDiff === 0) {
			return;
		}
		location.hash = newHash.join('&');
		parseUrl();
	}

	/** Fait l'action appropriée quand le hash de la page change */
	function onHashChange(/*eventObject*/) {
		parseUrl();
		if (info.hash.go !== undefined) {
			rebuildHash();
			location.reload();
		}
	}

	/** met à jour info.page en fonction de l'URL */
	function setPage() {
		info.page = info.args.page;
		if (info.args.raidefacil === 'scriptOptions' || info.args.raidFacile === 'tableau') {
			info.page = 'tableauRaidFacile';
		}
		else if (info.args.raidFacile === 'options') {
			info.page = 'optionsRaidFacile';
		}
	}

	/** Affiche ou masque les options
		si elle sont déjà affichées elles seront masquées et le tableau des scans sera affiché,
		si elle sont masquée elle seront affichées et le tableau des scans sera masqué
	*/
	function afficherMasquerOptions(eventObject) {
		eventObject.preventDefault();
		if ($('#option_script').css('display') === 'none') {
			info.hash.raidFacile = 'options';
		} else {
			info.hash.raidFacile = 'tableau';
		}
		$('#option_script, #div_tableau_raide_facile').toggle();
		rebuildHash();
	}

	/** Affiche le lien de Raid facile */
	function afficher_lien() {
		var selector;
		// si on est sur la page mouvements on prend l'url de la page flotte, sinon celle de la page mouvements
		if (info.args.page === 'movement') {
			selector = '#menuTable > li:nth-child(8) > a.menubutton';
		} else {
			selector = '#menuTable > li:nth-child(8) > .menu_icon > a';
		}

		var url = new Url(document.querySelector(selector).getAttribute('href')).hashes(info.hash);
		var li = $('<li id="raide-facile"></li>');
		if (info.page === 'tableauRaidFacile' || info.page === 'optionsRaidFacile') {
			li.append('<span class="menu_icon"><a href="' + url.hashes({ raidFacile: 'options' }) + '" title="' + i18n.get('options de') + ' ' + i18n.get('raid facile') + '"><div class="menuImage traderOverview"></div></a></span>');
			$('.menu_icon a', li).click(afficherMasquerOptions);
		}
		li.append('<a href="' + url.hashes({ raidFacile: 'tableau' }) + '" class="menubutton" id="lien_raide"><span class="textlabel">' + i18n.get('raid facile') + '</span></a>');
		if (!GM_getValue("aJours_d", true)) {
			$('.textlabel', li).css('color', 'orange');
		}
		li.appendTo('#menuTableTools');
		logger.log('Lien ajouté dans le menu');
		if (info.page === 'tableauRaidFacile' || info.page === 'optionsRaidFacile') {
			// On déselectionne le lien sélectionné
			$('#menuTable .menubutton.selected').removeClass('selected');
			$('#menuTable .menuImage.highlighted').removeClass('highlighted');
			// On sélectionne le lien de Raid facile
			$('.menubutton', li).addClass('selected');
			$('.menuImage', li).addClass('highlighted');
			intercom.send('tooltip', {
				selector: '#raide-facile .menu_icon a',
				settings: {
					hook: 'rightmiddle'
				}
			});
		}
	}

	/** Colore les lignes en fonction des missions en cours */
	function showAttaque(data) {
		var traiteFlotte = function (elem) {
			var destination = $.trim($('.destCoords a', elem).text());
			var missionType = elem.data('mission-type');
			var retour = elem.data('return-flight') ? 1 : 0;
			if (missions[destination] === undefined) {
				missions[destination] = {};
			}
			if (missions[destination][missionType] === undefined) {
				missions[destination][missionType] = [0, 0];
			}
			missions[destination][missionType][retour]++;
		};
		var missions = {};
		var html = $($.trim(data));
		// On va chercher toutes les flottes (allers + retours)
		var flottes = $('#eventContent .eventFleet', html[0]);
		for (var i = 0; i < flottes.length; ++i) {
			traiteFlotte($(flottes[i]));
		}
		var couleur;
		var classe;
		var cible;
		var lignes;
		for (var destination in missions) {
			couleur = null;
			classe = '';
			cible = missions[destination];

			// On récupère les lignes du tableau de raid facile qui correspondent (il peut y en avoir plusieurs quand on ne supprime pas l'ancien scan)
			lignes = $(document.getElementsByClassName(destination));

			/* cf l'api http://uni116.ogame.fr/api/localization.xml pour les nombres
				1 Attaquer - 2 Attaque groupée - 3 Transporter - 4 Stationner - 5 Stationner - 6 Espionner - 7 Coloniser - 8 Recycler - 9 Détruire - 15 Expédition */
			if (cible[9]) { // Détruire
				if (cible[9][0]) { // aller
					lignes.addClass('detruire');
					couleur = col_dest;
				}
				else { // retour
					lignes.addClass('detruireRet');
					couleur = col_dest_r;
				}
			}
			else if (cible[2]) { // Attaque groupée
				if (cible[2][0]) { // aller
					lignes.addClass('attaqueGr');
					couleur = col_att_g;
				} else { // retour
					lignes.addClass('attaqueGrRet');
					couleur = col_att_g_r;
				}
			}
			else if (cible[1]) { // Attaquer
				if (cible[1][0] >= 2) {
					lignes.addClass('attaque').addClass('attaque2');
					couleur = stockageOption.get('couleur attaque2');
				} else if (cible[1][1] >= 2) {
					lignes.addClass('attaqueRet').addClass('attaque2Ret');
					couleur = stockageOption.get('couleur attaque2 retour');
				} else {
					if (cible[1][0]) { // aller
						lignes.addClass('attaque');
						couleur = col_att;
					} else { // retour
						lignes.addClass('attaqueRet');
						couleur = col_att_r;
					}
				}
			}
			else if (cible[6] && cible[6][0]) { // Espionner, mais pas les retour
				lignes.addClass('espio');
				couleur = stockageOption.get('couleur espionnage');
			}
			var titre = 'Mission actuellement en cours<div class="splitLine"></div>';
			for (var typeMission in cible) {
				titre += '<p>' + localization.missions[typeMission] + ' : ' + cible[typeMission][0] + ' +' + (cible[typeMission][1] - cible[typeMission][0]) + ' retour' + '</p>';
			}
			$('.nombreAttaque', lignes).attr('title', titre);
		}
		intercom.send('tooltip', { selector: '#corps_tableau2 .nombreAttaque[title]' });
	}

	/** Permet de récupérer un objet contenant toutes les options */
	function exportOptions(target) {
		var optionExport = {};
		optionExport.optionNew = {
			data: stockageOption.data,
			keyName: stockageOption.storageKeyName
		};
		optionExport.optionOld = {
			option1: GM_getValue('option1' + info.serveur, '0/0/0/0/0/0/x:xxx:x/4000/0.3/0/1'),
			option2: GM_getValue('option2' + info.serveur, '0/100/100/0/12/1/0/4320/1/1/0/1/1/1/2/0/0'),
			option3: GM_getValue('option3' + info.serveur, '#C7050D/#025716/#FFB027/#E75A4F/#33CF57/#EFE67F'),
			option4: GM_getValue('option4' + info.serveur, '1/0/0/0/1/1/1/1/0/0/0/1/0/0/0/0/1/0/1/1/0/0/0/1/1/1/1/1/x/x/0/1/1/1'),
		};
		var exportTxt = JSON.stringify(optionExport);
		$(target).val(exportTxt);
	}
	function importOptions(source) {
		try {
			var importData = JSON.parse($(source).val());
		} catch(e) {
			fadeBoxx(i18n('erreur'), true);
			return;
		}
		if (!importData.optionNew || !importData.optionOld) {
			fadeBoxx(i18n('erreur'), true);
			return;
		}
		stockageOption.data = importData.optionNew.data;
		stockageOption.save();
		GM_setValue('option1' + info.serveur, importData.optionOld.option1);
		GM_setValue('option2' + info.serveur, importData.optionOld.option2);
		GM_setValue('option3' + info.serveur, importData.optionOld.option3);
		GM_setValue('option4' + info.serveur, importData.optionOld.option4);
		$(source).val('');
		fadeBoxx(i18n('ok'));
	}

	/** Renvoie un objet contenant toutes les données utiles pour les statistiques */
	var getStatData = function () {
		var data = {
			id: info.ogameMeta['ogame-player-id'],
			univers: info.ogameMeta['ogame-universe']
		};
		return data;
	};

	/** Affiche qu'il y a une mise à jour de disponible */
	function mise_a_jour(version) {
		if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
			// La version ne ressemble pas à 8.4.4
			return;
		}
		if (version.split('.') <= info.version.split('.')) {
			// pas de mise à jour
			return;
		}
		var popup = $('<div title="' + i18n.get('raid facile') + ' - Mise à jour">' +
			'<p>La version <b>'+version+'</b> est maintenant disponible.</p><br>' +
			'<p>Vous avez actuelement la version <b>'+info.version+'</b><br>' +
			'Voulez vous installer la mise à jour ?</p>'
			//+'<p>Prochain rappel dans 6h.</p></div>'
		).dialog({
			width: 500,
			// modal: true,
			// resizable: false,
			buttons: {
				"Installer": function () {
					// preference.get()['lastUpdateCheck'] = info.now;
					// preference.save();
					location.href = info.siteUrl;
					// popup.html('<iframe src="'+info.siteUrl+'" style="width:100%; height:98%"></iframe>').css({
						// width:'590px', height:'400px'
					// }).parent().css({
						// width:'auto', height:'auto'
					// });
					GM_setValue("date_mise_ajours", '' + info.startTime + '');
					popup.dialog('destroy');
				},
				"Changelog": function () {
					location.href = info.siteUrl + '?changelog';
					// popup.html('<iframe src="'+info.siteUrl+'?changelog" style="width:100%; height:98%"></iframe>');
				},
				"Plus tard": function () {
					// preference.get()['lastUpdateCheck'] = info.now;
					// preference.save();
					popup.dialog('destroy');
					GM_setValue("date_mise_ajours", '' + (info.startTime + 1000 * 60 * 60 * 24 * 7) + '');
				}
			}
		});
		popup.css({
			background: 'initial'
		}).parent().css({
			'z-index': '3001',
			background: 'black url(http://gf1.geo.gfsrv.net/cdn09/3f1cb3e1709fa2fa1c06b70a3e64a9.jpg) -200px -200px no-repeat'
		});
	}

	/** Vérifie s'il y a une mise à jour */
	function checkUpdate() {
		var lastUpdateDate = GM_getValue("date_mise_ajours", "0");
		if ((info.startTime - parseInt(lastUpdateDate)) > 1000 * 60 * 60 * 6) { // vérification toutes les 6h
			var params = getStatData();
			params.check = true;
			var url = new Url(info.siteUrl).params(params).toString();
			if (typeof GM_xmlhttpRequest === 'undefined') {
				$.get(url, mise_a_jour);
			} else {
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
					onload: function (response) {
						mise_a_jour(response.responseText);
					}
				});
			}
		}
	}

	/** Converti des nombres en affichage numérique et en affichage court (ex: 10k) */
	var numberConverter = {
		toInt: function (number, useShortNotation) {
			var str = number.toString();
			if (useShortNotation) {
				str = str.replace(/mm/i, '000 000 000').replace(/g/i, '000 000 000').replace(/m/i, '000 000').replace(/k/i, '000');
			}
			str = str.replace(/ /g, '');
			return parseInt(str, 10);
		},
		shortenNumber: function (number, factor) {
			return Math.round(number / factor);
		},
		toPrettyString: function (number) {
			var k = 1000;
			var m = 1000000;
			var g = 1000000000;
			if (number >= g * 100) {
				return this.shortenNumber(number, g) + 'G';
			}
			if (number >= m * 100) {
				return this.shortenNumber(number, m) + 'M';
			}
			if (number >= k * 100) {
				return this.shortenNumber(number, k) + 'k';
			}
			return number;
		}
	};

	/** Construit une URL */
	function Url(url) {
		this.parse(url);
	}
	Url.prototype = {
		parse: function (url) {
			this._params = {};
			this._hashes = {};

			var hash = url.split('#')[1] || '';
			hash = hash.split('&');
			url = url.split('#')[0];
			var params = url.split('?')[1] || '';
			params = params.split('&');
			this.url = url.split('?')[0];

			var i, arg, kvp;
			if (params[0] !== '') {
				for (i = 0; i < params.length; i++) {
					arg = decodeURIComponent(params[i]);
					if (arg.indexOf('=') === -1) {
						this._params[arg] = true;
					} else {
						kvp = arg.split('=');
						this._params[kvp[0]] = kvp[1];
					}
				}
			}
			if (hash[0] !== '') {
				for (i = 0; i < hash.length; i++) {
					arg = decodeURIComponent(hash[i]);
					if (arg.indexOf('=') === -1) {
						this._hashes[arg] = true;
					} else {
						kvp = arg.split('=');
						this._hashes[kvp[0]] = kvp[1];
					}
				}
			}
		},
		params: function (params) {
			for (var key in params) {
				this._params[encodeURIComponent(key)] = encodeURIComponent(params[key]);
			}
			return this;
		},
		hashes: function (hashes) {
			for (var key in hashes) {
				this._hashes[encodeURIComponent(key)] = encodeURIComponent(hashes[key]);
			}
			return this;
		},
		toString: function () {
			var url = this.url;

			var params = [];
			for (var pkey in this._params) {
				if (this._params[pkey] === 'true') {
					params.push(pkey);
				} else {
					params.push(pkey + '=' + this._params[pkey]);
				}
			}
			if (params.length) {
				url += '?' + params.join('&');
			}

			var hash = [];
			for (var hkey in this._hashes) {
				if (this._hashes[hkey] === 'true') {
					hash.push(hkey);
				} else {
					hash.push(hkey + '=' + this._hashes[hkey]);
				}
			}
			if (hash.length) {
				url += '#' + hash.join('&');
			}

			return url;
		}
	};

	/** Demande à l'utilisateur d'appuyer sur une touche du clavier et détecte laquelle */
	function findKey(options) {
		var which = options.defaultValue;
		function findKeyCallback(eventData) {
			eventData.preventDefault();
			eventData.stopPropagation();
			which = eventData.which;
			$('#which', popup).text(which);
		}
		var buttons = {};
		buttons[i18n.get('ok')] = function () {
			if (which) {
				popup.dialog('close');
				options.callback(which);
			}
		};
		buttons[i18n.get('cancel')] = function () {
			popup.dialog('close');
			options.callback();
		};
		var popupHtml = [
			'<div title="' + i18n.get('raid facile') + '">',
			'<p>' + i18n.get('quelle_touche') + '</p><br>',
			'<p>Le code de la touche choisie est : <span id="which">' + which + '</span></p>',
			'</div>'
		].join('');
		var popup = $(popupHtml).dialog({
			width: 500,
			modal: true,
			buttons: buttons,
			close: function () {
				$(document).off('keyup', findKeyCallback);
				popup.dialog('destroy');
			}
		});
		popup.css({
			background: 'initial'
		}).parent().css({
			background: 'black url(http://gf1.geo.gfsrv.net/cdn09/3f1cb3e1709fa2fa1c06b70a3e64a9.jpg) -200px -200px no-repeat'
		});

		$(document).on('keyup', findKeyCallback);
	}
//}endregion

init();

/** initialisation des variables d'option **///{region

	/* Explication des options
	x/x/x/x/x/.... signifie
	arme/bouclier/protect/combus/impul/hyper/coordonee/date/option/ressource/classement/sauvegard auto/temps garde scan/exversion/coul_att/coul_att_g/coul_dest/lien/remplace/lien esp/rec/itesse/tps_vol/nom_j/nom_p/coord_q/prod_h/ress_h
	*/
	var option1 = GM_getValue('option1' + info.serveur, '0/0/0/0/0/0/x:xxx:x/4000/0.3/0/1');
	var option2 = GM_getValue('option2' + info.serveur, '0/100/100/0/12/1/0/4320/1/1/0/1/1/1/2/0/0');
	var option3 = GM_getValue('option3' + info.serveur, '#C7050D/#025716/#FFB027/#E75A4F/#33CF57/#EFE67F');
	var option4 = GM_getValue('option4' + info.serveur, '1/0/0/0/1/1/1/1/0/0/0/1/0/0/0/0/1/0/1/1/0/0/0/1/1/1/1/1/x/x/0/1/1/1');
	var langue = stockageOption.get('langue');

	var option1_split = option1.split('/');
	var option2_split = option2.split('/');
	var option3_split = option3.split('/');
	var option4_split = option4.split('/');

	//votre compte
	/**option1_mon_compte**/{

		//Vos techno :
		var tech_arme_a = option1_split[0];
		var tech_bouclier_a = option1_split[1];
		var tech_protect_a = option1_split[2];

		var tech_combus_a = option1_split[3];
		var tech_impul_a = option1_split[4];
		var tech_hyper_a = option1_split[5];

		// Autre :
		var pos_depart = option1_split[6];
		var vaisseau_lent = option1_split[7];
		var pourcent_cdr = parseFloat(option1_split[8]);
		var pourcent_cdr_def = parseFloat(option1_split[9]);
		var vitesse_uni = parseInt(info.ogameMeta['ogame-universe-speed']);
	}

	//choix
	/**option2_variable**/{
		//Selection de scan :
		var nb_scan_accpte = option2_split[0];// valeur de ressource a partir de laquel il prend le scan
		var valeur_cdr_mini = option2_split[1];// valeur de cdr a partir de laquel il prend le scan
		var valeur_tot_mini = option2_split[2];// valeur de total a partir de laquel il prend le scan
		var type_prend_scan = option2_split[3];// choix entre les 3options du haut a partir de laquel il prend le scan

		//Classement :
		var classement = option2_split[4];//0 date ; 1 coordonee ; 2 joueur ; 3 nom ^planette ; 4 ressource  metal; 5 cristal ; 6 deut ; 7 activite  ; 8 cdr possible ; 9 vaisseau; 10 defense ; 11 idrc ; 12 ressource total,13 reherche , 14 type de planette (lune ou planette)
		var reverse = option2_split[9];
		var q_taux_m = (option2_split[11] !== undefined) ? option2_split[11] : 1;
		var q_taux_c = (option2_split[12] !== undefined) ? option2_split[12] : 1;
		var q_taux_d = (option2_split[13] !== undefined) ? option2_split[13] : 1;

		//Options de sauvegarde de scan :
		var scan_preenrgistre = option2_split[5];// si le scan est enregistre lorsqu'on le regarde ou seulement quand on clique sur enregistre.
		var scan_remplace = option2_split[6];
		var nb_minutesgardescan = option2_split[7];
		var minutes_opt = Math.floor(parseInt(nb_minutesgardescan) % 60);
		var nb_minutesgardescan2 = parseInt(nb_minutesgardescan) - minutes_opt;
		var heures_opt = Math.floor(Math.floor(nb_minutesgardescan2 / 60) % 24);
		nb_minutesgardescan2 = nb_minutesgardescan2 - heures_opt * 60;
		var jours_opt = Math.floor(nb_minutesgardescan2 / 60 / 24);
		var nb_ms_garde_scan = nb_minutesgardescan * 60 * 1000;
		var nb_max_def = option2_split[10] !== undefined ? option2_split[10] : 0;

		//Autre :
		var import_q_rep = option2_split[8];
		var lien_raide_nb_pt_gt = (option2_split[14] !== undefined) ? option2_split[14] : 2;
		var nb_pourcent_ajout_lien = (option2_split[15] !== undefined) ? parseInt(option2_split[15]) : 0;
		var nb_ou_pourcent = (option2_split[16] !== undefined) ? option2_split[16] : 0;
	}

	//couleur
	/**option3_couleur**/{
		var col_att = option3_split[0];
		var col_att_g = option3_split[1];
		var col_dest = option3_split[2];
		var col_att_r = option3_split[3];
		var col_att_g_r = option3_split[4];
		var col_dest_r = option3_split[5];
	}

	//afichage
	/**option4_variable**/{
		//Changement dans les colonnes :
		var q_date_type_rep = option4_split[8];
		var cdr_q_type_affiche = option4_split[2];

		//Changement dans boutons de droites :
		var simulateur = option4_split[11];
		var q_mess = option4_split[12];
		var espionnage_lien = option4_split[1];
		var q_lien_simu_meme_onglet = (option4_split[25] !== undefined) ? option4_split[25] : 1;

		//Affichage de Colonne :
		var q_compteur_attaque = option4_split[21] !== undefined ? option4_split[21] : 0;
		var q_vid_colo = (option4_split[17] !== undefined) ? option4_split[17] : 0;
		var question_rassemble_col = option4_split[14];
		var prod_h_q = option4_split[9];
		var prod_gg = option4_split[10];
		var prod_min_g = Math.floor(parseInt(prod_gg) % 60);
		var nb_minutesgardescan3 = parseInt(prod_gg) - prod_min_g;
		var prod_h_g = Math.floor(Math.floor(nb_minutesgardescan3 / 60) % 24);
		nb_minutesgardescan3 = nb_minutesgardescan3 - prod_h_g * 60;
		var prod_j_g = Math.floor(nb_minutesgardescan3 / 60 / 24);
		var date_affiche = option4_split[7];//0 date non affiche, 1 date affiche
		var tps_vol_q = option4_split[3];
		var nom_j_q_q = option4_split[4];
		var nom_p_q_q = option4_split[5];
		var coor_q_q = option4_split[6];
		var defense_question = (option4_split[26] !== undefined) ? option4_split[26] : 1;
		var vaisseau_question = (option4_split[27] !== undefined) ? option4_split[27] : 1;
		var pt_gt = (option4_split[32] !== undefined) ? option4_split[32] : 1;
		var tech_q = (option4_split[33] !== undefined) ? option4_split[33] : 1;

		//Affichage Global :
		var q_galaxie_scan = (option4_split[22] !== undefined) ? option4_split[22] : 0;
		var galaxie_demande = (option4_split[23] !== undefined) ? option4_split[23] : 1;
		var galaxie_plus_ou_moins = (option4_split[31] !== undefined) ? parseInt(option4_split[31]) : 1;
		var afficher_seulement = (option4_split[24] !== undefined) ? option4_split[24] : 0;
		var q_def_vis = (option4_split[19] !== undefined) ? option4_split[19] : 1;
		var q_flo_vis = (option4_split[18] !== undefined) ? option4_split[18] : 1;
		var nb_scan_page = parseInt(option4_split[13]);

		//Autre :
		var q_techzero = option4_split[15];
		var tableau_raide_facile_value = (option4_split[30] !== undefined) ? option4_split[30] : 100;
		var q_icone_mess = option4_split[16];
}
//}endregion

/** initialisation des filtres **///{region
	var filtre_actif_inactif = 0;
	var filtre_joueur = '';
//}endregion

/** option initialisation bbcode **///{region
	var option_bbcode_split = GM_getValue('option_bbcode' + info.serveur, '#872300/#EF8B16/#DFEF52/#CDF78B/#6BD77A/#6BD7AC/#6BC5D7/#6B7ED7/1/1/0/1').split('/');
	var center_typeq = option_bbcode_split[7];
	var q_url_type = option_bbcode_split[8];
	var q_centre = option_bbcode_split[9];
	var q_cite = option_bbcode_split[10];

	var couleur2 = [];
	var bbcode_baliseo = [];
	var bbcode_balisem = [];
	var bbcode_balisef = [];

	couleur2[1] = option_bbcode_split[0];
	couleur2[2] = option_bbcode_split[1];
	couleur2[3] = option_bbcode_split[2];
	couleur2[4] = option_bbcode_split[3];
	couleur2[5] = option_bbcode_split[4];
	couleur2[6] = option_bbcode_split[5];
	couleur2[7] = option_bbcode_split[6];

	bbcode_baliseo[0] = '[b]';
	bbcode_balisef[0] = '[/b]';

	bbcode_baliseo[1] = '[i]';
	bbcode_balisef[1] = '[/i]';

	bbcode_baliseo[2] = '[u]';
	bbcode_balisef[2] = '[/u]';

	bbcode_baliseo[3] = '[u]';
	bbcode_balisef[3] = '[/u]';

	bbcode_baliseo[4] = '[quote]';
	bbcode_balisef[4] = '[/quote]';

	if (option_bbcode_split[8] == 1) {
		bbcode_baliseo[5] = '[url=\'';
		bbcode_balisem[5] = '\']';
		bbcode_balisef[5] = '[/url]';
	}
	else {
		bbcode_baliseo[5] = '[url=';
		bbcode_balisem[5] = ']';
		bbcode_balisef[5] = '[/url]';
	}

	if (option_bbcode_split[7] == 1) {
		bbcode_baliseo[10] = '[align=center';
		bbcode_balisem[10] = ']';
		bbcode_balisef[10] = '[/align]';
	} else {
		bbcode_baliseo[10] = '[center';
		bbcode_balisem[10] = ']';
		bbcode_balisef[10] = '[/center]';
	}

	bbcode_baliseo[8] = '[color=';
	bbcode_balisem[8] = ']';
	bbcode_balisef[8] = '[/color]';
//}endregion

/** Variables de langues **///{region
	var text;
	text = {
		//{ Global
		'raid facile': 'Raid Facile',
		missing_translation: 'Traduction manquante',
		//}
		//{ Menu de gauche
		'options de': 'Options de',
		//}
		//option mon compte
			moncompte:'Mon compte ',
			vos_techno:'Vos technologies : ',
			q_coord:'Coordonnées de départ de vos raids',
			q_vaisseau_min:'Quel est le vaisseau le plus lent de votre flotte lors des raids ?',
			pourcent:'Pourcentage de débris de vaisseaux dans le cdr de votre univers',
			pourcent_def:'Pourcentage de débris de défense dans le cdr de votre univers',

		// option variable
		choix_certaine_vari:'Choix pour certaines variables',
		selec_scan_st:'Sélection de scan',
			q_apartir:'Butin',
			q_cdrmin:'CDR ',
			q_totmin:'CDR + Butin',
			q_prend_type:'Ne prendre les rapports avec ',
				rep_0_prend1:' Un CDR > ',
				rep_0_prend2:' ou un butin > ',
				rep_1_prend1:' Un CDR > ',
				rep_1_prend2:' et un butin > ',
				rep_2_prend:' Un CDR + butin > ',

		classement_st:'Classement',
			q_class:'Classer le tableau par ',
				c_date:'Date',
				c_coo:'Coordonnées',
				c_nj:'Nom de Joueur',
				c_np:'Nom de Planète',
				c_met:'Métal',
				c_cri:'Cristal',
				c_deu:'Deut',
				c_acti:'Activité',
				c_cdr:'Cdr possible',
				c_nbv:'Nb Vaisseau',
				c_nbd:'Nb Défense',
				c_ress:'Ressources Totales',
				c_type:'Type (lune ou planète)',
				c_cdrress:'Ressources + CDR',
				ressourcexh:'Ressources dans x heures',
				prod_classement:'Production',
				/*newe*/
				c_vaisseau_valeur:'Valeur d\'attaque totale des vaisseaux',
				c_defense_valeur:'Valeur d\'attaque totale des défenses',
				/* news*/
			q_reverse:'Classer par ordre',
				descroissant:' décroissant',
				croissant:' croissant',
			taux_classement_ressource:'Donner le taux pour le classement par ressources.',
				taux_m:'Taux M : ',
				taux_c:'Taux C : ',
				taux_d:'Taux D : ',

		option_save_scan_st:'Options de sauvegarde de scan',
			q_sae_auto:'Sauvegarde automatique des scans dès leur visionnage?',
			remp_scn:'Remplacer automatiquement les scans sur une même planète ?',
			q_garde:'Ne pas sauvegarder et supprimer les scans vieux de plus',
				jours:'jours',
				heures:'heures',
				min:'minutes',
			q_nb_max_def:'Nombre max de défense au-delà duquel le script ne prend pas les scans ?(0 = désactivé)',

		other_st:'Autre',
			import_q:'Lors de l\'importation, les scans',
				import_remplace:'remplacent les autres',
				import_rajoute:' sont ajoutés aux autres',
			lien_raide_nb_pt_gt:'Voulez-vous en appuyant sur le lien attaquer, préselectionner soit',
				//nb_pt:'Le nb de PT',
				//nb_gt:'Le nb de GT',
				rien:'rien',
			lien_raide_ajout_nb_pourcent:"Rajouter au nombre de PT/GT preselectionner de base",

		raccourcis:'Raccourcis',
			shortcut_attack_next:'Raccourci pour attaquer la cible suivante',
			modifier: 'Modifier',
			ce_nombre_est_keycode: 'Ce nombre correspond au code de la touche choisie',

		//couleur ligne
		couleur_ligne:'Couleur ligne ',
			q_color:' Couleur de la ligne d\'une cible si une flotte  effectue une mission en mode',
				attt:'Attaquer',
				ag:'Attaque Groupée ',
				det:'Détruire',
				att_r:'Attaquer (R)',
				ag_r:'Attaque Groupée (R)',
				det_r:'Détruire (R)',

		//option affichage
		option_affichage:'Option d\'affichage ',
		affichage_changement_colonne:'Changement dans les colonnes',
			q_date_type:'Pour la date, on affiche ?',
				date_type_chrono:'Un chrono',
				date_type_heure:'L\'heure du scan',
			cdr_q:'Le comptage de cdr est affiché',
				recyclc:' en nombre de recycleurs',
				ressousrce:'en nombre de ressources',

		changement_boutondroite:'Changement dans les boutons de droite',
			question_afficher_icone_mess:'Voulez-vous affichez les icônes dans la partie messages ?',
			q_simul:'Quel simulateur voulez-vous utiliser ?',
				drago:'Dragosim',
				speed:'Speedsim',
				ogwinner:'Ogame-Winner',
				simu_exte:'Exporter le rapport d\'espionnage au format texte pour une autre utilisation',
			mess_q:'Afficher un lien vers le véritable message ?',
			lienespi:'Le lien d\'espionnage vous redirige',
				page_f:'Sur la page Flotte',
				page_g:'Sur la page Galaxie',
			q_lien_simu_meme_onglet:'Voulez-vous que les liens de simulations dirige sur',
				rep_onglet_norm:'Un nouvel onglet à chaque fois.',
				rep_onglet_autre:'Le même onglet sera rechargé.',

		affichage_colonne:'Affichage de Colonne :',
			q_inactif:'Afficher une colone pour marquer si le joueur est inactif ?',
			q_compteur_attaque:'Afficher une colonne qui donne le nombre de rapports de combat sur la planète en 24h ?',
			q_afficher_dernier_vid_colo:'Afficher l\'heure du dernier vidage de la colonie(approximatif) ?',
			question_rassemble_cdr_ress:'Voulez-vous rassembler les colonnes de ressources et de cdr ?',
			q_pt_gt:'Afficher le nombre de PT et de GT ?',
			q_prod:'Afficher la production par heure de la planète ?',
			q_ress_h:'Afficher les ressources dans (0 = pas affiché)',
			q_date:'Afficher la date dans le tableau ?',
			tps_vol:'Afficher le temps de vol ?',
			nom_j_q:'Afficher le nom du joueur ?',
			nom_p_q:'Afficher le nom de la planète ?',
				autre_planette:'Supprimer le nom de la planète mais l\'afficher en passant la souris sur les coordonnées',
			coor_q:'Afficher les coordonnées de la planète ?',
			defense_q:'Afficher les infos sur la défense ?',
			vaisseau_q:'Afficher les infos sur la flotte ?',
				defense_nb:'oui, son nombre',
				defense_valeur:'oui, sa valeur d\'attaque',
			q_tech: 'Afficher les tech.',

		affichage_global:'Affichage Global :',
			q_galaxie_scan:'Voulez-vous afficher seulement les scans de la galaxie de la planète sélectionnée ?',
				other:' autres',
				galaxie_plus_ou_moins:'Galaxie en cours + ou -',
			afficher_seulement:'Afficher seulement',
				toutt:'Tout',
				planete_sel:'Planète',
				lune:'Lune',
			filtrer : 'Filtrer',
			filtre_actif : 'Actif',
			filtre_inactif : 'Inactif',
			q_afficher_ligne_def_nvis:'Afficher la ligne si la défense n\'est pas visible ?',
			q_afficher_ligne_flo_nvis:'Afficher la ligne si la flotte n\'est pas visible ?',
			page:'Combien de scan voulez-vous afficher par page ? (0=tous)',


		//other_st:'Autre',
			q_techn_sizero:'Voulez-vous mettre vos techno à 0 si celles de la cible sont inconnues ?',
			lienraide:'Mettre le lien Raide-Facile',
				En_haut:'En haut',
				gauche:'A Gauche',
			/** news **/
			banner_sky:'Position de la banniere de pub',
			myPlanets:'Position de la liste des planettes',
			tableau_raide_facile:'Taille du tableau raide-facile',
			/** news **/

		//global
			oui:'oui',
			non:'non',
			ok: 'Ok',
			erreur: 'Erreur',
			cancel: 'Annuler',

		//option langue
		option_langue:'Language',
			q_langue:'Dans quelle langue voulez-vous le script ?',
				francais:'Français',
				anglais:'English',
				spagnol:'Español',
				roumain:'Roumain',


		//option bbcode
			text_centre:'Voulez-vous centrer le bbcode ?',
			text_cite:'Voulez-vous mettre en citation le bbcode ?',
			balise_centre:'Quelle balise utilisez-vous pour centrer le texte ?',
				balise1_center:'[align=center]',
				balise2_center:'[center]',
			balise_url:'Quelle balise utilisez-vous pour les url ?',
				balise1_url:'[url=\'adress\']',
				balise2_url:'[url=adresse]',
			color:'couleur',

		// tableau icone et autre
			// titre tableau
			th_nj:'Joueur',
			th_np:'Planète',
			th_coo:'Coordonnées',
			dated:'Date',
			tmp_vol_th:'Temps de Vol',
			prod_h_th:'Prod/h',
			th_h_vidage:'Heure vidage',
			ressource_xh_th:'Ressource x Heures',
			th_ress:'Butin',
			th_fleet:'PT/GT',
			th_ress_cdr_col:'CDR+Butin',
			nb_recycl:'Nb Recyleurs',
			th_nv:'Flottes',
			th_nd:'Défense',
			th_tech:'Tech.',

			// bouton de droite
			espionner:'Espionner',
			eff_rapp:'Effacer ce rapport',
			att:'Attaquer',
			simul:'Simuler',

			// entete
			mise_jours:'Mise à jour possible pour Raide-Facile',

			// interieur avec acronyme
			cdr_pos:'Cdr poss',
			metal:'M',
			cristal:'C',
			deut:'D',
			met_rc:'M',
			cri_rc:'C',
			nb_rc:'Recy.',
			nb_pt:'PT',
			nb_gt:'GT',
			retour_f:'Retour ',
			arriv_f:'Arrivée ',
			batiment_non_visible:'Batiment non visible',

		//message de pop up
			q_reset:'Voulez-vous remettre à zéro toutes les variables de raide?',
			reset:'Remise à zéro effectuée. Actualisez la page pour voir la différence.',
			q_reset_o:'Voulez-vous remetre à zéro toute les options ?',
			reset_s:'Remise à zéro effectuée. Actualisez la page pour voir la différence.',
			option_sv:'Options de Raide-Facile sauvegardées',
			del_scan:'Scans supprimés, rafraîchissement de la page',
			rep_mess_supri:'Messages Supprimés',
			quelle_touche: 'Quelle touche veux-tu utiliser ?',

		// ecrit dans les scans en pop up
			del_scan_d:'Effacer ce message',
			del_scan_script:'Effacer le message et le scan',
			del_script:'Effacer le scan',
			enleve_script:'Enlever le scan',
			add_scan:'Ajouter le scan',
			add_scan_d:'Ajouter le scan',

		// boutons
			save_optis:'Sauvegarder les options',
			remis_z:'Remise à zéro.',
			supr_scan_coche:'Supprimer les scans cochés',
			supr_scan_coche_nnslec:'Supprimer les scans non cochés',

		//import / export
			export_scan_se:'Exporter les scans sélectionnés',
			export_scan_nnse:'Exporter les scans non sélectionnés',
			export_options:'Exporter les options',
			import_options:'Importer les options',
			importer_scan:'Importer les scans',
			import_rep:'Scan importé et ajouté à votre base de données',
			importt:'Import :',
			exportt:'Export :',

		//bouton messages
			spr_scrptscan_a:'Supprimer Scan et Scan script affiché',
			spr_scrptscan_ns:'Supprimer Scan et Scan script non sélectionné',
			spr_scrptscan_s:'Supprimer Scan et Scan script sélectionné',
			spr_scan_a:'Supprimer Scan script affiché',
			spr_scan_ns:'Supprimer Scan script non sélectionné',
			spr_scan_s:'Supprimer Scan script sélectionné',
			add_scan_a:'Ajouter Scan Affiché ',
			add_scan_ns:'Ajouter Scan Non Sélectionné',
			add_scan_s:'Ajouter Scan Sélectionné',
			rep_mess_add:'Scan ajoutés',

		lm: 'Lanceur de missiles', lle: 'Artillerie laser légère', llo: 'Artillerie laser lourde', gauss: 'Canon de Gauss', ion: 'Artillerie à ions', pla: 'Lanceur de plasma', pb: 'Petit bouclier', gb: 'Grand bouclier', mic: 'Missile d`interception', mip: 'Missile Interplanétaire'
	};
	i18n.importer('fr', text);
	if (langue == 'ro') {
		text = {
			//option mon compte
			moncompte:'Contul meu ',
			vos_techno:'Tehnologiile tale : ',
			q_coord:'Coordonatele flotei plecate',
			q_vaisseau_min:'Care este cea mai lenta nava în flota pe care o folosesti',
				pourcent:'Ce procent din flota ta este convertita în CR în universul tau ?',
				pourcent_def:'Ce procent din apararea ta este convertit în CR în universul tau ?',

			// option variable
			choix_certaine_vari:'Alege câteva variabile',
			q_apartir:'ia rapoarte de spionaj din',
			q_cdrmin:'Câmp de Ramasite minim ',
			q_totmin:'Câmp de Ramasite + minimum de Resurse recuperabile ',
			q_prend_type:'Ia doar scanari cu ',
				rep_0_prend1:' Câmp de Ramasite>',
				rep_0_prend2:' sau resurse >',
				rep_1_prend1:'Câmp de Ramasite>',
				rep_1_prend2:' si resurse > ',
				rep_2_prend:' Câmp de Ramasite + resurse > ',
			q_class:'Sorteaza tabelul dupa',
				c_date:'Date',
				c_coo:'Coordonate',
				c_nj:'Numele jucatorului',
				c_np:'Numele planetei',
				c_met:'Metal',
				c_cri:'Cristal',
				c_deu:'Deuteriu',
				c_acti:'Activitate',
				c_cdr:'Posibil Câmp de Ramasite',
				c_nbv:'Numarul de nave',
				c_nbd:'Numarul de aparare',
				c_ress:'Totalul resurselor',
				c_type:'Tip (luna sau planeta)',
				c_cdrress:'Resurse+CR',
				prod_classement:'Productie',
				ressourcexh:'resurse în x ore',
				c_vaisseau_valeur:' Puterea totala de atac a tuturor navelor',
				c_defense_valeur:' Puterea totala de atac a tuturor unitatilor de aparare',
			q_reverse:'clasamentul va fi în ordine :',
			  descroissant:' descrescatoare',
			  croissant:' crescatoare',
			q_sae_auto:'Automatic backup al rapoartele de spionaj când sunt vazute ? ',
			remp_scn:'Înlocuire automata a raportului de spionaj daca este de pe aceasi planeta ? ',
			q_garde:'Nu sterge rapoartele de spionaj mai vechi de ',
				jours:'zile',
				heures:'ore',
				min:'minute',
			import_q:'Când importeaza, fiecare scan ',
				import_remplace:' înlocuieste celelalte ',
				import_rajoute:' sunt adaugate la celelalte ',
			/***news **/
			q_nb_max_def:'Numarul maxim de aparare dincolo de care script-ul nu scaneaza ?(0 = dezactiveaza) ',
			lien_raide_nb_pt_gt:'Vrei, când selectezi butonul de atac sa preselecteze fie una ori alta :',
			//nb_pt:'Numarul de transportatoare mici',
			//nb_gt:'Numarul de transportatoare mari',
			rien:'Nimic',
			/**fin news **/


			//couleur ligne
			couleur_ligne:'Coloarea liniei ',
			q_color:' Culoarea linii tintei daca flota ta este în modul de',
			attt:'Atac',
			ag:'Atac ACS',
			det:'Distruge',
			att_r:'Atac (R)',
			ag_r:' Atac ACS (R)',
			det_r:'Distruge(R)',

			//option affichage
			option_affichage:'Optiuni de afisare ',
			lienraide:' Pune linkul de la Raide-Facile ',
				En_haut:'În top',
				gauche:'La stanga',
			lienespi:'Limkul din raportul de spionaj te va duce la :',
				page_f:'Vedere flota',
				page_g:'Vedere galaxie',
			cdr_q:'Cantitatea de câmp de ramasite este afisata : ',
				recyclc:' în numarul de Reciclatoare ',
				ressousrce:'în numarul de resurse',
			tps_vol:'Arata timpul de zbor?',
			nom_j_q:'Arata numele jucatorului ?',
			nom_p_q:'Arata numele plantei ?',
			autre_planette:'Nu-mi arata numele direct, dar arata-mi când dau click pe coordonate',
			coor_q:'Arata coordonatele planetei ?',
			defense_q:'Arata informatii despre aparare ?',
			vaisseau_q:'Arata informatii despre flota ?',
				defense_nb:'da, numarul lor.',
				defense_valeur:'da, puterea de atac',
			q_date:'Arata datele în tabel ?',
			q_date_type:'Pentru data aratam ?',
				date_type_chrono:'Timpul curent',
				date_type_heure:'Timpul rapoartelor de spionaj',
			q_prod:'Arata productia pe ora pe planeta',
			q_ress_h:'Arata resursele (0 = Nu arata)',
			mess_q:'Arata un link  catre mesaje ?',
			q_simul:'Ce simulator de timp vrei sa folosesti ?',
				drago:'Dragosim',
				speed:'Speedsim',
				ogwinner:'Ogame-Winner',
			q_tech: 'Arata tech.',
		simu_exte:'sau ia raportul de spionaj în zona pentru export pentru alt simulator',
			page:'Câte scanari vrei sa fie afisate pe pagina ?(0=toate)',
			question_rassemble_cdr_ress:'Vrei sa aduni resursele si câmpul de ramasite ?',
			q_pt_gt:'Afiseaza ct/ht ?',
			q_techn_sizero:'Vrei sa îti pui tehnologiile pe 0 când raportul de spionaj nu arata tehnologiile oponentului ?',
			question_afficher_icone_mess:'Vrei sa afisezi icoanele ?',
			q_afficher_dernier_vid_colo:'Afiseaza timpul ultimelor raiduri (aproximativ) ?',
		/** news **/
		q_afficher_ligne_def_nvis:'Afiseaza linia daca apararea nu este aparenta?',
		q_afficher_ligne_flo_nvis:'Afiseaza linia daca flota nu este aparenta ?',
		q_inactif:'Afiseaza o coloana pentru a arata ca jucatorul este inactiv ?',
		q_compteur_attaque:'Afiseaza o coloana care da numarul de rapoarte de batalie pe planea în 24H ?',
		q_galaxie_scan:'Vrei sa arati doar rapoartele de spionaj din galaxie pe planeta selectata ?',
		taux_classement_ressource:'Give the resources rate for the rainking by resources.',
		taux_m:'Rate M : ',
		taux_c:'Rate C : ',
		taux_d:'Rate D : ',
		other:' others',
		afficher_seulement:'Arata doar : ',
		toutt:'Toate',
		planete_sel:'Planeta',
		lune:'Luna',

		filtrer : 'Filter',
		filtre_actif : 'Active',
		filtre_inactif : 'Inactive',

		q_lien_simu_meme_onglet:'Vrei ca linkul de la simulator sa te duca la : ',
		rep_onglet_norm:'Un nou aratat de fiecare data.',
		rep_onglet_autre:'Acelasi tabel va fi reîncarcat.',

		affichage_global:'Afisare Generala :',
		affichage_colonne:'Afisare columna :',
		affichage_changement_colonne:'Schimba în coloane :',
		changement_boutondroite:'Schimbarea butoanelor din bara laterala în partea dreapta :',
		/** fin news **/

			//option bbcode
			text_centre:'Vrei sa centrezi bbcode ?',
			text_cite:'Vrei BBcode în quotes ?',
			balise_centre:'Ce tag-uri vrei sa folosesti pentru centrare text ?',
			balise1_center:'[align=center]',
			balise2_center:'[center]',
			balise_url:'Ce tag-uri vrei sa folosesti "URL" ?',
			balise1_url:'[url=\'address\']',
			balise2_url:'[url=address]',
			color:'color',

		//sous titre pour separer les options
		other_st:'Alte',
		option_save_scan_st:'Backup options al rapoartele de spionaj',
		classement_st:'Clasament',
		selec_scan_st:'Selectare rapoartele de spionaj',

			// tableau icone et autre
			espionner:'spioneaza',
			eff_rapp:'Sterge acest raport de spionaj',
			att:'Ataca',
			simul:'Simuleaza',
			mise_jours:'Posibil Update al Raid Facile',
			cdr_pos:'Câmp de ramasite',
			dated:'Date',
			th_nj:'Jucator',
			th_coo:'Coordonate',
			th_np:'Planeta',
			th_ress:'Resurse',
			th_fleet:'ct/ht',
			th_nv:'flota',
			th_nd:'Aparare',
			th_tech:'',
			metal:'Metal',
			met_rc:'Metal Reciclat',
			cristal:'Cristal',
			cri_rc:'Cristal Reciclat',
			nb_rc:'reci.',
			nb_pt:'ct',
			nb_gt:'ht',
			deut:'Deut',
			nb_recycl:'Numarul de Reciclatoare',
			retour_f:'Întoarcere ',
			arriv_f:'Ajunge ',
			tmp_vol_th:'Timpul de zbor',
			prod_h_th:'Output/h',
			ressource_xh_th:'Resurse x Ore',
			th_ress_cdr_col:'DF+Res',
			th_h_vidage:'Timpul Raidului',

			//autre messages.
			q_reset:'Vrei sa resetezi toate variabilele  si optiunile ?',
			reset:'Resetare terminata.Reîmprospateaza pagina ca sa vezi rezultatele.',
			q_reset_o:'Vrei sa resetezi toate optiunile ?',
			reset_s:'Resetare terminata. Reîmprospateaza pagina ca sa vezi rezultatele.',
			option_sv:'Optiunile Raide-Facile salvate',
			del_scan:'Rapoartele de spionare sterse, reîmprospateaza pagina',
			del_scan_d:'| sterge aceast mesaj',
			del_scan_script:'sterge mesaj + scanare script',
			del_script:'sterge scanarea de la script',
			enleve_script:'|sterge rapoartele de spionaj dar nu si scriptul',
			add_scan:'|Adauga rapoartele de spionaj de la script',
			add_scan_d:'Adauga scriptul la aceste rapoarte de spionaj',
			save_optis:'Salveaza optiunile',
			remis_z:'Reseteaza.',
			supr_scan_coche:'Sterge rapoartele de spionaj selectate',
			supr_scan_coche_nnslec:'Sterge rapoartele de spionaj neselectate',
			oui:'da',
			non:'nu',
			batiment_non_visible:'Nu arata Cladirile',
			rep_mess_supri:'Posturi sterse',

			//import / export
			export_scan_se:'Exporta rapoartele de spionaj selectate',
			export_scan_nnse:'Exporta rapoartele de spionaj neselectate',
			importer_scan:'Importa rapoarte de spionaj',
			import_rep:'Rapoarte de spionaj importate si adaugate la baza ta',
			importt:'Importa :',
			exportt:'Exporta :',

			//bouton messages
			spr_scrptscan_a:'Sterge raportul de spionaj si scanarea de script afisata',
			spr_scrptscan_ns:'Sterge raportul de spionaj si scanul de script neselectat',
			spr_scrptscan_s:'Delete esp report and selected Scan script',
			spr_scan_a:'Sterge scanul de script afisat',
			spr_scan_ns:'Sterge scanul de script neselectat',
			spr_scan_s:'Sterge scanul de script selectat ',

			add_scan_a:'Adauga raportul de spionaj afisat',
			add_scan_ns:'Adauga raportulde spionaj neselectat',
			add_scan_s:'Adauga raportul de spionaj selectat',
			rep_mess_add:'Raport de spionaj adaugat',

			//option langue
			option_langue:'Limba',
			q_langue:'În ce limba vrei sa folosesti scriptul? ?',
			francais:'Franceza',
			anglais:'Engleza',
			spagnol:'Español',
			roumain:'Rumano',
			autre:'Alte'
		};
		i18n.importer('ro', text);
	}
	else if (langue == 'es') {
		text = {
			//option mon compte
				moncompte:'Mi Cuenta',
				vos_techno:'Tus tecnologías : ',
				q_coord:'Coordenadas de salida de tu flota',
				q_vaisseau_min:'Cuál es tu nave más lenta en la flota que utilizas',
				pourcent:'¿Qué porcentaje de escombros genera tu flota al ser destruida en tu Universo?',
				pourcent_def:'¿Qué porcentaje de escombros generan tus defensas al ser destruidas en tu Universo?',

			// option variable
			choix_certaine_vari:'Selecciona algunas variables',
			selec_scan_st:'Selección del informe de espionaje',
				q_apartir:'leer el informe de espionaje de',
				q_cdrmin:'Escombros mínimo ',
				q_totmin:'Escombros + Recursos mínimos recuperables ',
				q_prend_type:'Leer sólo lecturas con ',
					rep_0_prend1:'Escombros>',
					rep_0_prend2:'o recursos >',
					rep_1_prend1:'Escombros>',
					rep_1_prend2:'and resources > ',
					rep_2_prend:'Escombrosd + recursos > ',

			classement_st:'Ranking',
				q_class:'Ordenar la tabla por',
					c_date:'Fecha',
					c_coo:'Coordenadas',
					c_nj:'Nombre del Jugador',
					c_np:'Nombre del Planeta',
					c_met:'Metal',
					c_cri:'Cristal',
					c_deu:'Deut',
					c_acti:'Actividad',
					c_cdr:'Posibles Escombros',
					c_nbv:'Nº de Naves',
					c_nbd:'Nº de Defensas',
					c_ress:'Recursos totales',
					c_type:'Tipo (luna o planeta)',
					c_cdrress:'Recursos+Escombros',
					prod_classement:'Producción',
					ressourcexh:'recursos en x horas',
				q_reverse:'el ranking se mostrará en orden :',
					descroissant:'descendente',
					croissant:'ascendente',
				taux_classement_ressource:'Dar los ratios de recursos al ordenar por recursos.',
					taux_m:'Ratio M : ',
					taux_c:'Ratio C : ',
					taux_d:'Ratio D : ',

			option_save_scan_st:'Guardar opciones del informe de espionaje',
				q_sae_auto:'¿Guardar automáticamente el informe de espionaje al verlo? ',
				remp_scn:'¿Actualizar automáticamente del informe de espionaje anterior cuando sea del mismo planeta? ',
				q_garde:'No hacerlo y borrar el informe de espionaje anterior',
					jours:'días',
					heures:'horas',
					min:'minutos',

			other_st:'Otro',
				import_q:'Al importar cada sondeo',
					import_remplace:'reemplazará el anterior',
					import_rajoute:'será añadido a los anteriores',
				q_nb_max_def:'¿Número máximo de defensas a partir del cual el script no almacenará los informes?(0 = desactivado) ',
				lien_raide_nb_pt_gt:'¿Quieres que al seleccionar el botón Atacar, se preseleccione una nave u otra :',
					//nb_pt:'Número de NPC',
					//nb_gt:'Número de NGC',
					rien:'Nada',


			//couleur ligne
			couleur_ligne:'Línea de color',
				q_color:'Color de la línea del objetivo si tu tipo de floa es',
					attt:'Ataque',
					ag:'SAC',
					det:'Destruir',
					att_r:'Ataque (R)',
					ag_r:' SAC (R)',
					det_r:'Destruir (R)',

			//option affichage
			option_affichage:'Mostrar opciones',
			affichage_changement_colonne:'Cambiar entre columnas:',
				q_date_type:'¿Mostrar por fecha?',
					date_type_chrono:'Hora actual',
					date_type_heure:'Hora del informe de espionaje',
				cdr_q:'Cantidad de Escombros se muestra: ',
					recyclc:'por número de Recicladores',
					ressousrce:'por números de recursos',

			changement_boutondroite:'Cambiar los botones del menu lateral derecho:',
				question_afficher_icone_mess:'¿Quieres mostrar iconos?',
				q_simul:'¿Qué simulador quieres utilizar?',
					drago:'Dragosim',
					speed:'Speedsim',
					ogwinner:'Ogame-Winner',
					simu_exte:'o coger el informe de espionaje para exportarlo a otro simulador',
				mess_q:'¿Mostrar un enlace a los mensajes?',
				lienespi:'En enlace en el informe de espionaje te lleva a :',
					page_f:'Vista de Flota',
					page_g:'Vista de Galaxia',
				q_lien_simu_meme_onglet:'¿Quieres que los enlaces a los simuladores se abran: ',
					rep_onglet_norm:'en una nueva pestaña cada vez.',
					rep_onglet_autre:'La misma pestaña se actualizarál.',


			affichage_colonne:'Mostrar Columna:',
				q_inactif:'¿Mostrar una columna si que muestre si un jugador está inactivo?',
				q_compteur_attaque:'¿Mostrar una columna que indique el número de Informe de Batallas en el planeta en las últimas 24h?',
				q_afficher_dernier_vid_colo:'¿Mostrar la hora de los ultimos saqueos (aproximadamente)?',
				question_rassemble_cdr_ress:'¿Quieres recursos y Escombros quieres reunir?',
				q_pt_gt:'Mostrar ct/ht ?',
				q_prod:'Mostrar la producción por horas del planeta',
				q_ress_h:'Mostrar los recursos (0 = No mostrar)',
				q_date:'¿Mostrar fecha en la tabla?',
				tps_vol:'¿Mostrar tiempo de vuelo?',
				nom_j_q:'¿Mostrar en nombre del jugador?',
				nom_p_q:'¿Mostrar el nombre del planeta?',
					autre_planette:'¿No mostrar el nombre directamente pero mostrar el clickar sobre las coordenadas',
				coor_q:'¿Mostrar las coordenadas del planeta?',
				q_tech: '¿Mostrar tech.',

			affichage_global:'Visió General:',
				q_galaxie_scan:'¿Quieres mostrar sólo los informes de espionaje de la galaxía del planeta seleccionado?',
					other:' otros',
				afficher_seulement:'Mostrar sólo: ',
					toutt:'Todo',
					planete_sel:'Planeta',
					lune:'Luna',
				filtrer : 'Filter',
				filtre_actif : 'Active',
				filtre_inactif : 'Inactive',
				q_afficher_ligne_def_nvis:'¿Mostrar la línea si las defensas no aparecen?',
				q_afficher_ligne_flo_nvis:'¿Mostrar la línea si la flota no aparece?',
				page:'¿Cuántos sondeos quieres mostrar por página?(0=todos)',

			//other_st:'Otro',
				q_techn_sizero:'¿Quieres poner tus tecnologías a 0 cuando el informe de espionaje del enemigo no muestre sus tecnologías?',
				lienraide:'Poner el enlace de Raide-Facile',
					En_haut:'En la parte superior',
					gauche:'En la izquierda',

			//global
				oui:'si',
				non:'no',

			//option langue
			option_langue:'Idioma',
				q_langue:'¿En qué idioma quieres usar el Script?',
					francais:'Francés',
					anglais:'Inglés',
					spagnol:'Español',
					roumain:'Rumano',


			//option bbcode
			text_centre:'¿Quieres centrar el bbcode?',
			text_cite:'¿Quieres el BBcode en las citas?',
			balise_centre:'¿Qué código quieres usar para centrar el texto?',
				balise1_center:'[align=center]',
				balise2_center:'[center]',
			balise_url:'¿Qué código quieres usar para una URL?',
				balise1_url:'[url=\'address\']',
				balise2_url:'[url=address]',
			color:'color',


			// tableau icone et autre
				// titre tableau
				th_nj:'Jugador',
				th_np:'Planeta',
				th_coo:'Coordenadas',
				dated:'Fecha',
				tmp_vol_th:'Tiempo de vuelo',
				prod_h_th:'Output/h',
				th_h_vidage:'Tiempo del Saqueo',
				ressource_xh_th:'Recursos x hora',
				th_ress:'Recursos',
				th_fleet:'ct/ht',
				th_ress_cdr_col:'Escombros+Recursos',
				nb_recycl:'Nº de Recicladores',
				th_nv:'flota',
				th_nd:'Defensa',
				th_tech:'',

				// bouton de droite
				espionner:'Espiar',
				eff_rapp:'Eliminar el informe de espionaje',
				att:'Atacar',
				simul:'Simular',

			// entete
			mise_jours:'Actualizar Raid Facile',

			// interieur avec acronyme
			cdr_pos:'Escombros',
			metal:'Metal',
			deut:'Deut',
			cristal:'Cristal',
			met_rc:'Metal Reciclable',
			cri_rc:'Cristal Reciclable',
			nb_rc:'reci.',
			nb_pt:'ct',
			nb_gt:'ht',
			retour_f:'Retorno ',
			arriv_f:'Llegada ',
			batiment_non_visible:'Construcción no mostrada',

			//message de pop up
			q_reset:'¿quieres resetear todas las variables y opciones?',
			reset:'Reseteo hecho. Actualiza la página para ver el resultado.',
			q_reset_o:'QUieres resetear todas las opciones?',
			reset_s:'Reseteo hecho. Actualiza la página para ver el resultado.',
			option_sv:'Opciones de Raide-Facile guardadas',
			del_scan:'Informes de espionaje borrados, páginas actualizadas',
			rep_mess_supri:'Posts eliminados',

			// ecrit dans les scans en pop up
			del_scan_d:'|borrar este mensaje',
			del_scan_script:'eliminar fallos + revisar el script',
			del_script:'eliminar script',
			enleve_script:'|eliminar el informe de espionaje pero no el script',
			add_scan:'|Añadir el informe de espionaje desde el script',
			add_scan_d:'Añadir el script desde este informe de espionaje',

			// boutons
			save_optis:'Guardar opciones',
			remis_z:'Resetear.',
			supr_scan_coche:'Eliminar los informes de espionaje seleccionados',
			supr_scan_coche_nnslec:'Eliminar los informes de espionaje no seleccionados',


			//import / export
			export_scan_se:'Exportar los informes de espionaje seleccionados',
			export_scan_nnse:'Exportar los informes de espionaje no seleccionados',
			importer_scan:'Importar informes de espionaje',
			import_rep:'informe de espionaje y añadido a la Base de Datos',
			importt:'Import :',
			exportt:'Export :',

			//bouton messages
			spr_scrptscan_a:'Eliminar informe de espionaje mostrado',
			spr_scrptscan_ns:'Eliminar informe de espionaje no seleccionado',
			spr_scrptscan_s:'Eliminar informe de espionaje seleccionado',
			spr_scan_a:'Eliminar el Scan script mostrado',
			spr_scan_ns:'Eliminar el Scan script no seleccionado',
			spr_scan_s:'Eliminar el Scan script seleccionado',
			add_scan_a:'Añadir informe de espionaje mostrado',
			add_scan_ns:'Añadir informe de espionaje no seleccionado',
			add_scan_s:'Añadir informe de espionaje seleccionado',
			rep_mess_add:'Informe de espionaje añadido'
		};
		i18n.importer('es', text);
	}
	else if (langue !== 'fr') { /* anglais */
		text = {
			//{ Global
			'raid facile': 'Easy Raid',
			missing_translation: 'Missing translation',
			//}
			//{ Menu de gauche
			'options de': 'Options of',
			//}
			//option mon compte
				moncompte:'My account ',
				vos_techno:'Your technologies : ',
				q_coord:'Coordinates of departure fleet',
				q_vaisseau_min:'What\'s your slowest ship in your fleet that you use',
				pourcent:'What percentage of your fleet is converted to DF in your universe?',
				pourcent_def:'What percentage of your defense is converted to DF in your universe?',

			// option variable
			choix_certaine_vari:'Choice for some variables',
			selec_scan_st:'Selection of espionage report',
				q_apartir:'take espionage report from',
				q_cdrmin:'Minimal Debris field ',
				q_totmin:'Debris Field + minimum of Resources recoverable ',
				q_prend_type:'Take only scans with ',
					rep_0_prend1:' Debris Field>',
					rep_0_prend2:' or resources >',
					rep_1_prend1:'Debris Field>',
					rep_1_prend2:' and resources > ',
					rep_2_prend:' Debris Field + resources > ',

			classement_st:'Ranking',
				q_class:'Sort the table by',
					c_date:'Date',
					c_coo:'Coordinates',
					c_nj:'Name of Player',
					c_np:'Name of  Planet',
					c_met:'Metal',
					c_cri:'Crystal',
					c_deu:'Deut',
					c_acti:'Activity',
					c_cdr:'Possible Debris Field',
					c_nbv:'Nr of ships',
					c_nbd:'Nr of Defense',
					c_ress:'Total resources',
					c_type:'Type (moon or planet)',
					c_cdrress:'Resource+DF',
					prod_classement:'Production',
					ressourcexh:'resources in x hours',
					c_vaisseau_valeur:'Total Attack Strength of all Ships',
					c_defense_valeur:'Total Attack Strength of all defense units',
				q_reverse:'the ranking will be in order :',
				  descroissant:' decreasing',
				  croissant:' increasing',
				taux_classement_ressource:'Give the resources rate for the rainking by resources.',
					taux_m:'Rate M : ',
					taux_c:'Rate C : ',
					taux_d:'Rate D : ',

			option_save_scan_st:'Backup options of espionage report',
				q_sae_auto:'Automatic backup of espionage report where they are viewed ? ',
				remp_scn:'Automatic replacement of espionage report if they are from the same planet ? ',
				q_garde:'Do not make and erase espionage report older than ',
					jours:'days',
					heures:'hours',
					min:'minutes',
				q_nb_max_def:'Maximum nomber of defense beyond which the script doesn\'t take espionnage reports ?(0= desactivate)',

			other_st:'Other',
				import_q:'When importing, each scan ',
					import_remplace:' replaces the other ',
					import_rajoute:' are added to the others ',
				lien_raide_nb_pt_gt:'Do you want, when selecting Attack boutton, preselect either or either :',
					//nb_pt:'Number of SC',
					//nb_gt:'Number of LC',
					rien:'Nothing',

			raccourcis: 'Shortcuts',
				shortcut_attack_next: 'Shortcut to attack the next target',
				modifier: 'Modify',
				ce_nombre_est_keycode: 'This number correspond to the keycode of the chosen key',

			//couleur ligne
			couleur_ligne:'Colour line ',
				q_color:' Color of the line of the target if your fleet mode is',
					attt:'Attack',
					ag:'ACS attack ',
					det:'Destroy',
					att_r:'Attack (R)',
					ag_r:' ACS attack (R)',
					det_r:'Destroy (R)',

			//option affichage
			option_affichage:'Display Options ',
			affichage_changement_colonne:'Change in the columns :',
					q_date_type:'For the date we show ?',
				date_type_chrono:'Current time',
				date_type_heure:'Time of the espionage report',
					cdr_q:'The amount of Debris Field is displayed : ',
				recyclc:' in numbers of Recyclerss ',
				ressousrce:'in numbers of resource',

			changement_boutondroite:'Change in the right sidebar buttons :',
				question_afficher_icone_mess:'Do you want to display icons ?',
				q_simul:'What flight Simulator do you want to use ?',
					drago:'Dragosim',
					speed:'Speedsim',
					ogwinner:'Ogame-Winner',
					simu_exte:'or take the espionage report in area for export in other simulator',
				mess_q:'Show a link to messages ?',
				lienespi:'The link in the spy-report takes you to :',
					page_f:'The fleet view',
					page_g:'The galaxy view',
				q_lien_simu_meme_onglet:'Do you want the simulators links to lead you to : ',
					rep_onglet_norm:'A new tab shown every time.',
					rep_onglet_autre:'The same tab will reloaded.',

			affichage_colonne:'Column Display :',
				q_inactif:'Display a column to show that the player is inactif ?',
				q_compteur_attaque:'Display a column that give the number of Combat Reports on the planet in 24H ?',
				q_afficher_dernier_vid_colo:'Display the time of the last raids (approximate) ?',
				question_rassemble_cdr_ress:'Do you want to gather resources and Debris Fields ?',
				q_pt_gt:'Show ct/ht ?',
				q_prod:'Show the hourly production of the planet',
				q_ress_h:'Show the resource (0 = Not shown)',
				q_date:'Show date in the table ?',
				tps_vol:'Show flight time?',
				nom_j_q:'Show name of the player ?',
				nom_p_q:'Show name of the planet ?',
					autre_planette:'Don\'t show the name directly but it show when you click on the coordinates',
				coor_q:'Show of the coordinates of the panet ?',
			defense_q:'Display infos about the defense ?',
			vaisseau_q:'Display infos about the fleet ?',
				defense_nb:'yes, its number.',
				defense_valeur:'yes, its attack strength',
				q_tech: 'Show tech.',

			affichage_global:'Global Display :',
				q_galaxie_scan:'Do you want to show only the spy reports of the galaxy of the selected planet ?',
					other:' others',
				afficher_seulement:'Display only : ',
					toutt:'All',
					planete_sel:'Planet',
					lune:'Moon',
				filtrer : 'Filter',
				filtre_actif : 'Active',
				filtre_inactif : 'Inactive',
				q_afficher_ligne_def_nvis:'Display the line if the défense isn\'t apparent?',
				q_afficher_ligne_flo_nvis:'Display the line if the fleet isn\'t apparent ?',
				page:'How many scans you want to display per page ?(0=all)',


			//other_st:'Other',
				q_techn_sizero:'Do you want to put your tech to 0 when the espionage report do not display the opponent\'s tech ?',
				lienraide:' Put the link of Raide-Facile ',
					En_haut:'On the top',
					gauche:'At the left',

		   //global
				oui:'yes',
				non:'no',
				ok: 'Ok',
				erreur: 'Error',
				cancel: 'Cancel',

			//option langue
			option_langue:'Language',
				q_langue:'In what Language do you want to use the script ?',
					francais:'Français',
					anglais:'English',
					spagnol:'Español',
					roumain:'Romanian',

			//option bbcode
			text_centre:'Do you want to center the bbcode ?',
			text_cite:'Do you want the BBcode in quotes ?',
			balise_centre:'What tags do you use for center text ?',
				balise1_center:'[align=center]',
				balise2_center:'[center]',
			balise_url:'What tags do you use for the "URL" ?',
				balise1_url:'[url=\'address\']',
				balise2_url:'[url=address]',
			color:'color',

			// tableau icone et autre
			// titre tableau
			th_nj:'Player',
			th_np:'Planet',
			th_coo:'Coordinates',
			dated:'Date',
			tmp_vol_th:'Flight time',
			prod_h_th:'Output/h',
			th_h_vidage:'Raid Time',
			ressource_xh_th:'Resource x Hours',
			th_ress:'Resource',
			th_fleet:'ct/ht',
			th_ress_cdr_col:'DF+Res',
			th_nv:'fleet',
			th_nd:'Defense',
			th_tech:'Tech.',

			// bouton de droite
			espionner:'spying',
			eff_rapp:'Remove this espionage report',
			att:'Attack',
			simul:'Simulate',

			// entete
			mise_jours:'Possible Update of Raid Facile',

			// interieur avec acronyme
			cdr_pos:'Debris Field',
			metal:'Metal',
			cristal:'Crystal',
			deut:'Deut',
			met_rc:'Metal Recyclable',
			cri_rc:'Crystal Recyclable',
			nb_rc:'recy.',
			nb_pt:'ct',
			nb_gt:'ht',
			nb_recycl:'Nr of Recyclers',
			retour_f:'Return ',
			arriv_f:'Arrival ',
			batiment_non_visible:'Building not shown',

			//message de pop up
			q_reset:'Do you want to reset all variables and options ?',
			reset:'Reset done. Refresh the page to see the result.',
			q_reset_o:'Do you want to reset all options ?',
			reset_s:'Reset done. Refresh the page to see the result.',
			option_sv:'Options of Raide-Facile saved',
			del_scan:'Spying reports deleted, pages refresh',
			rep_mess_supri:'Posts deleted',
			quelle_touche: 'What key do you want to use ?',

			// ecrit dans les scans en pop up
			del_scan_d:'|delete this message',
			del_scan_script:'delete mess + scan script',
			del_script:'delete scan script',
			enleve_script:'|delete the espionage report but not the script',
			add_scan:'|Add the esp report from the script',
			add_scan_d:'Add the script from this spying reports',

			// boutons
			save_optis:'Save options',
			remis_z:'Reset.',
			supr_scan_coche:'Delete selected esp reports',
			supr_scan_coche_nnslec:'Delete unselected esp reports',

			//import / export
			export_scan_se:'Export selected esp reports',
			export_scan_nnse:'Export unselected esp reports',
			export_options:'Export options',
			import_options:'Import options',
			importer_scan:'Import esp reports',
			import_rep:'esp report imported and added to your Database',
			importt:'Import :',
			exportt:'Export :',

			//bouton messages
			spr_scrptscan_a:'Delete esp report and displayed Scan script',
			spr_scrptscan_ns:'Delete esp report and unselected Scan script',
			spr_scrptscan_s:'Delete esp report and selected Scan script',
			spr_scan_a:'Delete displayed Scan script',
			spr_scan_ns:'Delete unselected Scan script',
			spr_scan_s:'Delete selected Scan script ',
			add_scan_a:'Add displayed esp report ',
			add_scan_ns:'Add unselected esp report',
			add_scan_s:'Add selected esp Report',
			rep_mess_add:'esp Report added',

			lm: 'Rocket Launcher',
			lle: 'Light Laser',
			llo: 'Heavy Laser',
			gauss: 'Gauss Cannon',
			ion: 'Ion Cannon',
			pla: 'Plasma Turret',
			pb: 'Small Shield Dome',
			gb: 'Large Shield Dome',
			mic: 'Anti-Ballistic Missiles',
			mip: 'Interplanetary Missiles'
		};
		i18n.importer('en', text);
	}

	var vari, localization;
	if (info.ogameMeta['ogame-language'] === 'fr') {
		localization = {
			missions: {
				'1': 'Attaquer',
				'2': 'Attaque groupée',
				'3': 'Transporter',
				'4': 'Stationner',
				'5': 'Stationner',
				'6': 'Espionner',
				'7': 'Coloniser',
				'8': 'Recycler le champ de débris',
				'9': 'Détruire',
				'15': 'Expédition'
			}
		};
		vari = {
			sur: 'sur ',
			de: ' de ',
			pt: 'Petit transporteur', gt: 'Grand transporteur', cle: 'Chasseur léger', clo: 'Chasseur lourd', cro: 'Croiseur', vb: 'Vaisseau de bataille', vc: 'Vaisseau de colonisation', rec: 'Recycleur', esp: 'Sonde d`espionnage', bb: 'Bombardier', sat: 'Satellite solaire', dest: 'Destructeur', edlm: 'Étoile de la mort', tra: 'Traqueur',
			lm: 'Lanceur de missiles', lle: 'Artillerie laser légère', llo: 'Artillerie laser lourde', gauss: 'Canon de Gauss', ion: 'Artillerie à ions', pla: 'Lanceur de plasma', pb: 'Petit bouclier', gb: 'Grand bouclier', mic: 'Missile d`interception', mip: 'Missile Interplanétaire',
			tech_arm: 'Technologie Armes', tech_bouc: 'Technologie Bouclier', tech_pro: 'Technologie Protection des vaisseaux spatiaux',
			tech_com: 'Technologie Combustion', tech_imp: 'Technologie Impulsion', tech_hyp: 'Technologie Hyper-Espace',
			mine_m: 'Mine de métal',
			mine_c: 'Mine de cristal',
			mine_d: 'Synthétiseur de deutérium',

			lang_speedsin: 'fr',
			lang_dragosin: 'french'
		};
	}
	else if (location.href.indexOf('pl.ogame', 0) >= 0) {
		localization = {
			missions: {
				'1': 'Atakuj',
				'2': 'Atak zwiazku',
				'3': 'Transportuj',
				'4': 'Stacjonuj',
				'5': 'Zatrzymaj',
				'6': 'Szpieguj',
				'7': 'Kolonizuj',
				'8': 'Recykluj pola zniszczen',
				'9': 'Niszcz',
				'15': 'Ekspedycja'
			}
		};
		vari = {
			sur: 'na ',
			de: ' z ',
			tech_arm: 'Technologia bojowa', tech_bouc: 'Technologia ochronna', tech_pro: 'Opancerzenie',
			tech_hyp: 'Naped nadprzestrzenny', tech_com: 'Naped spalinowy', tech_imp: 'Naped impulsowy',
			pt: 'Maly transporter', gt: 'Duzy transporter', cle: 'Lekki mysliwiec', clo: 'Ciezki mysliwiec', cro: 'Krazownik', vb: 'Okret wojenny', vc: 'Statek kolonizacyjny', rec: 'Recykler', esp: 'Sonda szpiegowska', bb: 'Bombowiec', sat: 'Satelita sloneczny ', dest: 'Niszczyciel', edlm: 'Gwiazda Smierci', tra: 'Pancernik',
			lm: 'Wyrzutnia rakiet', lle: 'Lekkie dzialo laserowe ', llo: 'Ciezkie dzialo laserowe', gauss: 'Dzialo Gaussa', ion: 'Dzialo jonowe', pla: 'Wyrzutnia plazmy', pb: 'Mala powloka ochronna', gb: 'Duza powloka ochronna', mic: 'Przeciwrakieta', mip: 'Rakieta miedzyplanetarna',

			mine_m: 'Kopalnia metalu',
			mine_c: 'Kopalnia krysztalu',
			mine_d: 'Ekstraktor deuteru',

			lang_speedsin: 'en',
			lang_dragosin: 'english'
		};
	}
	else if (location.href.indexOf('es.ogame', 0) >= 0 || location.href.indexOf('.ogame.com.ar', 0) >= 0) {
		localization = {
			missions: {
				'1': 'Atacar',
				'2': 'Ataq. confederación',
				'3': 'Transporte',
				'4': 'Desplegar',
				'5': 'Mantener posición',
				'6': 'Espionaje',
				'7': 'Colonizar',
				'8': 'Reciclar campo de escombros',
				'9': 'Destruir',
				'15': 'Expedición'
			}
		};
		vari = {
			sur: 'en ',
			de: ' desde ',
			tech_arm: 'Tecnología Militar', tech_bouc: 'Tecnología de Defensa', tech_pro: 'Tecnología de Blindaje',
			tech_hyp: 'Propulsor Hiperespacial', tech_com: 'Motor de Combustible', tech_imp: 'Motor de Impulso',
			pt: 'Nave Pequeña de Carga', gt: 'Nave Grande de Carga', cle: 'Cazador Ligero', clo: 'Cazador Pesado', cro: 'Crucero', vb: 'Nave de Batalla', vc: 'Nave de Colonia', rec: 'Reciclador', esp: 'Sonda de Espionaje', bb: 'Bombardero', sat: 'Satélite Solar', dest: 'Destructor', edlm: 'Estrella de la Muerte', tra: 'Acorazado',
			lm: 'Lanzamisiles', lle: 'Láser Pequeño', llo: 'Láser Grande', gauss: 'Cañón de Gauss', ion: 'Cañón Iónico', pla: 'Cañón de Plasma', pb: 'Cúpula Pequeña de Protección', gb: 'Cúpula Grande Protección', mic: 'Misiles Antibalísticos', mip: 'Misiles Interplanetarios',

			mine_m: 'Mina de Metal',
			mine_c: 'Mina de Cristal',
			mine_d: 'Sintetizador de Deuterio',

			lang_speedsin: 'en',
			lang_dragosin: 'english'
		};
	}
	else if (location.href.indexOf('ro.ogame', 0) >= 0) {// thanks Lao Tzi
		localization = {
			missions: {
				'1': 'Atac',
				'2': 'Atac SAL',
				'3': 'Transport',
				'4': 'Desfasurare',
				'5': 'Aparare SAL',
				'6': 'Spionaj',
				'7': 'Colonizare',
				'8': 'Recicleaza campul de ramasite',
				'9': 'Distrugerea Lunii',
				'15': 'Expeditie'
			}
		};
		vari = {
			sur: 'la ',
			de: ' de la ',
			tech_arm: 'Tehnologia Armelor', tech_bouc: 'Tehnologia Scuturilor', tech_pro: 'Tehnologia Armurilor',
			tech_hyp: 'Motor Hiperspatial', tech_com: 'Motor de Combustie', tech_imp: 'Motor pe impuls',
			pt: 'Transportator mic', gt: 'Transportator mare', cle: 'Vânator Usor', clo: 'Vânator Greu', cro: 'Crucisator', vb: 'Nava de razboi', vc: 'Nava de colonizare', rec: 'Reciclator', esp: 'Proba de spionaj', bb: 'Bombardier', sat: 'Satelit Solar', dest: 'Distrugator', edlm: 'RIP', tra: 'Interceptor',
			lm: 'Lansatoare de Rachete', lle: 'Lasere usoare', llo: 'Lasere Grele', gauss: 'Tunuri Gauss', ion: 'Tunuri Magnetice', pla: 'Turele de Plasma', pb: 'Scut planetar mic', gb: 'Scut planetar mare', mic: 'Rachete Anti-Balistice', mip: 'Rachete Interplanetare',

			mine_m: 'Mina de Metal',
			mine_c: 'Mina de Cristal',
			mine_d: 'Sintetizator de Deuteriu',

			lang_speedsin: 'en',
			lang_dragosin: 'english'
		};
	}
	else if (location.href.indexOf('it.ogame', 0) >= 0) {// thanks Tharivol
		localization = {
			missions: {
				'1': 'Attacco',
				'2': 'Attacco federale',
				'3': 'Trasporto',
				'4': 'Schieramento',
				'5': 'Stazionamento',
				'6': 'Spionaggio',
				'7': 'Colonizzazione',
				'8': 'Ricicla campo detriti',
				'9': 'Distruzione Luna',
				'15': 'Spedizione'
			}
		};
		vari = {
			sur: 'su ',
			de: ' di ',
			tech_arm: 'Tecnologia delle Armi', tech_bouc: 'Tecnologia degli Scudi', tech_pro: 'Tecnologia delle Corazze',
			tech_hyp: 'Propulsore Iperspaziale', tech_com: 'Propulsore a Combustione', tech_imp: 'Propulsore a Impulso',
			pt: 'Cargo Leggero', gt: 'Cargo Pesante', cle: 'Caccia Leggero', clo: 'Caccia Pesante', cro: 'Incrociatore', vb: 'Nave da Battaglia', vc: 'Colonizzatrice', rec: 'Riciclatrice', esp: 'Sonda spia', bb: 'Bombardiere', sat: 'Satellite Solare', dest: 'Corazzata', edlm: 'Morte Nera', tra: 'Incrociatore da Battaglia',
			lm: 'Lanciamissili', lle: 'Laser Leggero', llo: 'Laser Pesante', gauss: 'Cannone Gauss', ion: 'Cannone Ionico', pla: 'Cannone al Plasma', pb: 'Cupola Scudo', gb: 'Cupola Scudo Potenziata', mic: 'Missili Anti Balistici', mip: 'Missili Interplanetari',

			mine_m: 'Miniera di Metallo',
			mine_c: 'Miniera di Cristalli',
			mine_d: 'Sintetizzatore di Deuterio',

			lang_speedsin: 'it',
			lang_dragosin: 'italian'
		};
	}
	else if (location.href.indexOf('gr.ogame', 0) >= 0) {// Traduit par faethnskonhmou http://userscripts.org/users/499485
		localization = {
			missions: {
				'1': 'Επίθεση',
				'2': 'Επίθεση ACS',
				'3': 'Μεταφορά',
				'4': 'Παράταξη',
				'5': 'Άμυνα ACS',
				'6': 'Κατασκοπεία',
				'7': 'Αποίκιση',
				'8': 'Ανακυκλώστε το πεδίο συντριμμιών',
				'9': 'Καταστροφή Φεγγαριού',
				'15': 'Αποστολή'
			}
		};
		vari = {
			sur: 'στο ',
			de: ' απο ',
			tech_arm: 'Τεχνολογία Όπλων', tech_bouc: 'Τεχνολογία Ασπίδων', tech_pro: 'Τεχνολογία Θωράκισης',
			tech_hyp: 'Προώθηση Καύσεως', tech_com: 'Ωστική Προώθηση', tech_imp: 'Υπερδιαστημική Προώθηση',
			pt: 'Μικρό Μεταγωγικό', gt: 'Μεγάλο Μεταγωγικό', cle: 'Ελαφρύ Μαχητικό', clo: 'Βαρύ Μαχητικό', cro: 'Καταδιωκτικό', vb: 'Καταδρομικό', vc: 'Σκάφος Αποικιοποίησης', rec: 'Ανακυκλωτής', esp: 'Κατασκοπευτικό Στέλεχος', bb: 'Βομβαρδιστικό', sat: 'Ηλιακοί Συλλέκτες', dest: 'Destroyer', edlm: 'Deathstar', tra: 'Θωρηκτό Αναχαίτισης',
			lm: 'Εκτοξευτής Πυραύλων', lle: 'Ελαφρύ Λέιζερ', llo: 'Βαρύ Λέιζερ', gauss: 'Κανόνι Gauss', ion: 'Κανόνι Ιόντων', pla: 'Πυργίσκοι Πλάσματος', pb: 'Μικρός Αμυντικός Θόλος', gb: 'Μεγάλος Αμυντικός Θόλος', mic: 'Αντι-Βαλλιστικοί Πύραυλοι', mip: 'Διαπλανητικοί Πύραυλοι',
			mine_m: 'Ορυχείο Μετάλλου',
			mine_c: 'Ορυχείο Κρυστάλλου',
			mine_d: 'Συνθέτης Δευτέριου'
		};
	}
	else /* anglais */ {
		localization = {
			missions: {
				'1': 'Attack',
				'2': 'ACS Attack',
				'3': 'Transport',
				'4': 'Deployment',
				'5': 'ACS Defend',
				'6': 'Espionage',
				'7': 'Colonization',
				'8': 'Recycle debris field',
				'9': 'Moon Destruction',
				'15': 'Expedition'
			}
		};
		vari = {
			sur: 'on ',
			de: ' from ',
			tech_arm: 'Weapons Technology', tech_bouc: 'Shielding Technology', tech_pro: 'Armour Technology',
			tech_hyp: 'Hyperspace Drive', tech_com: 'Combustion Drive', tech_imp: 'Impulse Drive',
			pt: 'Small Cargo', gt: 'Large Cargo', cle: 'Light Fighter', clo: 'Heavy Fighter', cro: 'Cruiser', vb: 'Battleship', vc: 'Colony Ship', rec: 'Recycler', esp: 'Espionage Probe', bb: 'Bomber', sat: 'Solar Satellite', dest: 'Destroyer', edlm: 'Deathstar', tra: 'Battlecruiser',
			lm: 'Rocket Launcher', lle: 'Light Laser', llo: 'Heavy Laser', gauss: 'Gauss Cannon', ion: 'Ion Cannon', pla: 'Plasma Turret', pb: 'Small Shield Dome', gb: 'Large Shield Dome', mic: 'Anti-Ballistic Missiles', mip: 'Interplanetary Missiles',

			// ressource:'Ressources',//pour antigame
			mine_m: 'Metal Mine',
			mine_c: 'Crystal Mine',
			mine_d: 'Deuterium Synthesizer',

			lang_speedsin: 'en',
			lang_dragosin: 'english'
		};
	}
//}endregion

/** fonction globale**///{region
	function strcmp(str1, str2) {
		//Accent ?
		//return (mini == str2 ? 1 : -1);
		var a = str1.toLowerCase();
		var b = str2.toLowerCase();
		if (a == b) {
			return 0;
		}
		return (a > b ? 1 : -1);
	}

	// separateur de milier
	function addPoints(nombre) {
		if (nombre === '?' || nombre === 0) {
			return nombre;
		}
		return nombre.toLocaleString();
	}

	function insertAfter(elem, after) {
		var dad = after.parentNode;
		if (dad.lastchild == after) {
			dad.appendChild(elem);
		} else {
			dad.insertBefore(elem, after.nextSibling);
		}
	}

	//suprimer les 0 devants.
	function supr0(number) {
		number = number.toString();
		var i = 0;
		for (; i < number.length - 1 && number[i] == '0'; ++i) {
			number[i] = '';
		}
		return number.substring(i, number.length);
	}

	//raccourcisseur de noms
	function raccourcir(nomAraccourcir) {
		// conditions ? si c'est vrai : si c'est faut
		return nomAraccourcir.length >= 10 ? nomAraccourcir.substring(0, 10) : nomAraccourcir;
	}

	/** Affiche un message sous forme de popup qui disparait avec le temps
	 * message - le message à afficher
	 * isError - true (pour afficher une erreur), false sinon
	 * duration - la durée d'affichage du message en millisecondes
	 */
	function fadeBoxx(message, isError, duration) {
		if (duration === undefined) {
			duration = stockageOption.get('popup duration');
		}
		$("#fadeBoxStyle").attr("class", isError ? "failed" : "success");
		$("#fadeBoxContent").html(message);
		$("#fadeBox").stop(true, true).fadeIn(0).delay(duration).fadeOut(500);
	}

	/** Affiche l'icône "new" avec un commentaire en "title" */
	function iconeNew(commentaire) {
		return '<img src="http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/iconeNew.png" alt="new" title="' + commentaire + '">';
	}
//}endregion

/** page de tableau **///{region
	function save_option(serveur) {
		/** checked -> 0, pas checked -> 1 */
		var checkedFromIdToInt = function (id) {
			var elem = document.getElementById(id);
			if (elem === null) {
				return 0;
			}
			return elem.checked === true ? 0 : 1;
		};

		{//mon compte
			// Vos technos
				var techno_arme = parseInt(document.getElementById('valeur_arme').value, 10);
				var techno_boulier = parseInt(document.getElementById('valeur_boulier').value, 10);
				var techno_protect = parseInt(document.getElementById('valeur_protection').value, 10);

				var techno_combu = parseInt(document.getElementById('valeur_combustion').value, 10);
				var techno_impu = parseInt(document.getElementById('valeur_impulsion').value, 10);
				var techno_hyper = parseInt(document.getElementById('valeur_hyper').value, 10);

			// Autre
				var coordonee_depart = document.getElementsByClassName('valeur_coordonee')[0].value;

				// vitesse du vaisseaux le plus lent.
				var vitesse_vaisseaux_plus_lent = document.getElementById('vaisseau_vite').value;

				// pourcentage de vaisseau dans le cdr
				var pourcent_cdr_q = document.getElementById('cdr_pourcent').value;
				pourcent_cdr_q = Math.round(parseFloat(pourcent_cdr_q) / 10);
				pourcent_cdr_q = pourcent_cdr_q / 10;

				// pourcentage de defense dans le cdr
				var pourcent_cdr_def_q = document.getElementById('cdr_pourcent_def').value;
				pourcent_cdr_def_q = Math.round(parseFloat(pourcent_cdr_def_q) / 10);
				pourcent_cdr_def_q = pourcent_cdr_def_q / 10;

			var option1 = techno_arme + '/' + techno_boulier + '/' + techno_protect + '/' + techno_combu + '/' + techno_impu +
				'/' + techno_hyper + '/' + coordonee_depart + '/' + vitesse_vaisseaux_plus_lent + '/' + pourcent_cdr_q + '/' + pourcent_cdr_def_q +
				'/' + vitesse_uni;
			GM_setValue('option1' + serveur, option1);
		}

		{//choix variable
			//Selection de scan :
			var ressource_prend = numberConverter.toInt(document.getElementById('val_res_min').value, true);
			var cdr_prend = numberConverter.toInt(document.getElementById('valeur_cdr_mini').value, true);
			var tot_prend = numberConverter.toInt(document.getElementById('valeur_tot_mini').value, true);

			var prend_type0 = document.getElementById("prend_type0").checked;
			var prend_type1 = document.getElementById("prend_type1").checked;
			var prend_type_x;
			if (prend_type0 === true) {
				prend_type_x = 0;
			} else if (prend_type1 === true) {
				prend_type_x = 1;
			} else {
				prend_type_x = 2;
			}

			//Classement :
			var selection_classement = document.getElementById('classement').value;
			var q_reverse_croissant = document.getElementById("q_reverse_croissant").checked;
			var q_reverse_c = q_reverse_croissant === true ? 0 : 1;

			var taux_m_rep = parseFloat(document.getElementById('q_taux_m').value, 10);
			var taux_c_rep = parseFloat(document.getElementById('q_taux_c').value, 10);
			var taux_d_rep = parseFloat(document.getElementById('q_taux_d').value, 10);

			//Options de sauvegarde de scan :
			var save_auto_scan_non_q = document.getElementById("save_auto_scan_non").checked;
			var save_auto_scan_rep = save_auto_scan_non_q === true ? 0 : 1;

			var scan_remplace_non = document.getElementById("scan_remplace_non").checked;
			var scan_remplace_rep = scan_remplace_non === true ? 0 : 1;

			var heures_suprime_scan = parseInt(document.getElementsByClassName('heures_suprime')[0].value) || 0;
			var jours_suprime_scan = parseInt(document.getElementsByClassName('jours_suprime')[0].value) || 0;
			var minutes_suprime_scan = parseInt(document.getElementsByClassName('minutes_suprime')[0].value) || 0;
			var minutes_total_suprime_scan = minutes_suprime_scan + 60 * (heures_suprime_scan + 24 * jours_suprime_scan);

			var nb_max_def_dans_scan = parseInt(document.getElementById('nb_max_def').value);

			// Autre :
			var import_remplace = document.getElementById("import_remplace").checked;
			var import_qq_rep = import_remplace === true ? 0 : 1;


			var nb_gt_preremplit = document.getElementById("lien_raide_nb_gt_remplit").checked;
			var nb_pt_preremplit = document.getElementById("lien_raide_nb_pt_remplit").checked;
			var nb_pt_ou_gt_preremplit;
			if (nb_gt_preremplit === true) {
				nb_pt_ou_gt_preremplit = 0;
			} else if (nb_pt_preremplit === true) {
				nb_pt_ou_gt_preremplit = 1;
			} else {
				nb_pt_ou_gt_preremplit = 2;
			}
			var nb_pourcent_ajout_lien_rep = document.getElementById('nb_pourcent_ajout_lien').value;
			var nb_ou_pourcent_rep = document.getElementById('nb_ou_pourcent').value;

			var option2 = ressource_prend + '/' + cdr_prend + '/' + tot_prend + '/' + prend_type_x + '/' +
				selection_classement + '/' + save_auto_scan_rep + '/' + scan_remplace_rep + '/' + minutes_total_suprime_scan +
				'/' + import_qq_rep + '/' + q_reverse_c + '/' + nb_max_def_dans_scan + '/' + taux_m_rep + '/' + taux_c_rep + '/' + taux_d_rep +
				'/' + nb_pt_ou_gt_preremplit + '/' + nb_pourcent_ajout_lien_rep + '/' + nb_ou_pourcent_rep;
			GM_setValue('option2' + serveur, option2);
		}

		//{ couleur ligne
		var coll_att = document.getElementById('att1').value;
		var coll_att_r = document.getElementById('att1_r').value;

		stockageOption.set('couleur attaque', document.getElementById('att1').value);
		stockageOption.set('couleur attaque retour', document.getElementById('att1_r').value);

		stockageOption.set('couleur attaque2', document.getElementById('att2').value);
		stockageOption.set('couleur attaque2 retour', document.getElementById('att2_r').value);
		stockageOption.set('couleur espionnage', document.getElementById('colEspio').value);

		var coll_att_g = document.getElementsByClassName('att_group')[0].value;
		var coll_att_g_r = document.getElementsByClassName('att_group_r')[0].value;

		var coll_dest = document.getElementsByClassName('det')[0].value;
		var coll_dest_r = document.getElementsByClassName('det_r')[0].value;

		var option3 = coll_att + '/' + coll_att_g + '/' + coll_dest + '/' + coll_att_r + '/' + coll_att_g_r + '/' + coll_dest_r;
		GM_setValue('option3' + serveur, option3);
		//}

		//{ Affichage
			//{ Changement dans les colonnes :
				var date_type_chrono = document.getElementById("date_type_chrono").checked;
				var qq_date_type_rep = date_type_chrono === true ? 0 : 1;

				var recycleur_type_affichage_ressource_rep = document.getElementById("recycleur_type_affichage_ressource").checked;
				var affichage_colone_recycleur_rep = recycleur_type_affichage_ressource_rep === true ? 0 : 1;
			//}

			//{ Changement dans boutons de droites :
				var qq_sim_q_dra = document.getElementById("sim_q_dra").checked;
				var qq_sim_q_speed1 = document.getElementById("sim_q_speed").checked;
				var qq_sim_q_ogwin = document.getElementById("sim_q_ogwin").checked;
				var qq_sim_q;
				if (qq_sim_q_dra === true) {
					qq_sim_q = 0;
				} else if (qq_sim_q_speed1 === true) {
					qq_sim_q = 1;
				} else if (qq_sim_q_ogwin === true) {
					qq_sim_q = 2;
				} else {
					qq_sim_q = 3;
				}

				var mess_origine_aff_non = document.getElementById("mess_origine_aff_non").checked;
				var qq_mess;
				if (mess_origine_aff_non === true) {
					qq_mess = 0;
				} else {
					qq_mess = 1;
				}

				var option_scan_espionn_gala = document.getElementById("espionn_galaxie").checked;
				var option_respon_lien_espi;
				if (option_scan_espionn_gala === true) {
					option_respon_lien_espi = 0;
				} else {
					option_respon_lien_espi = 1;
				}

				//{ Le lien attaquer s'ouvre dans
				stockageOption.set('attaquer nouvel onglet', parseInt($('#rf_attaquer_ouvredans').val()));
				//}

				//option de l'onglet simulateur.
				var qq_lien_simu_meme_onglet_oui = document.getElementById("q_lien_simu_meme_onglet_oui").checked;
				var q_rep_lien_simu_meme_onglet;
				if (qq_lien_simu_meme_onglet_oui === true) {
					q_rep_lien_simu_meme_onglet = 0;
				} else {
					q_rep_lien_simu_meme_onglet = 1;
				}
			//}

			//{ Affichage de Colonne :

				var q_rep_compteur_attaque = checkedFromIdToInt('compteur_attaque_aff_non');
				var q_vid_colo_rep = checkedFromIdToInt('aff_vid_colo_non');
				var rassemble_qrep = checkedFromIdToInt('rassemble_cdr_ress_non');
				var affiche_pt_gt = checkedFromIdToInt('q_pt_gt_non');
				var affiche_prod_h = checkedFromIdToInt('prod_h_aff_non');

				var ress_nb_j = parseInt(document.getElementsByClassName('ress_nb_j')[0].value);
				var ress_nb_h = parseInt(document.getElementsByClassName('ress_nb_h')[0].value);
				var ress_nb_min = parseInt(document.getElementsByClassName('ress_nb_min')[0].value);
				var ress_x_h = Math.floor(ress_nb_min + (ress_nb_h * 60) + (ress_nb_j * 60 * 24));

				var date_q_repons = checkedFromIdToInt('date_affi_non');
				var tps_vol_afficher_rep = checkedFromIdToInt('tps_vol_afficher_non');
				var affiche_nom_joueur = checkedFromIdToInt('nom_joueur_affi_non');
				var affiche_nom_planet = checkedFromIdToInt('nom_planet_affi_non');
				var affiche_coor_q = checkedFromIdToInt('coord_affi_non');

				var affiche_def_non = document.getElementById("defense_q_n").checked;
				var affiche_def_oui_nb = document.getElementById("defense_q_nb").checked;
				var affiche_def;
				if (affiche_def_non === true) {
					affiche_def = 0;
				} else if (affiche_def_oui_nb === true) {
					affiche_def = 1;
				} else {
					affiche_def = 2;
				}

				var affiche_flotte_non = document.getElementById("vaisseau_q_n").checked;
				var affiche_flotte_oui_nb = document.getElementById("vaisseau_q_nb").checked;
				var affiche_flotte;
				if (affiche_flotte_non === true) {
					affiche_flotte = 0;
				} else if (affiche_flotte_oui_nb === true) {
					affiche_flotte = 1;
				} else {
					affiche_flotte = 2;
				}

				var affiche_tech = checkedFromIdToInt('tech_aff_non');
			//}

			//{ Affichage Global :
				var scan_galaxie_cours_non = document.getElementById("scan_galaxie_cours_non").checked;
				var scan_galaxie_cours_oui = document.getElementById("scan_galaxie_cours_oui").checked;
				var scan_galaxie_plus_moin = document.getElementById("scan_galaxie_plus_ou_moin").checked;
				var q_galaxie_rep;
				if (scan_galaxie_cours_non === true) {
					q_galaxie_rep = 0;
				} else if (scan_galaxie_cours_oui === true) {
					q_galaxie_rep = 1;
				} else if (scan_galaxie_plus_moin === true) {
					q_galaxie_rep = 3;
				} else {
					q_galaxie_rep = 2;
				}
				var galaxie_demande_rep = parseInt(document.getElementById('galaxie_demande').value, 10);
				var galaxie_demande_plus_moin_text_rep = document.getElementById('galaxie_demande_plus_moin_text').value;

				var afficher_lune_planet = document.getElementById("afficher_lune_planet").checked;
				var afficher_planet_seul = document.getElementById("afficher_planet_seul").checked;
				var afficher_seulement_rep;
				if (afficher_lune_planet === true) {
					afficher_seulement_rep = 0;
				} else if (afficher_planet_seul === true) {
					afficher_seulement_rep = 1;
				} else {
					afficher_seulement_rep = 2;
				}

				var q_rep_def_vis = checkedFromIdToInt('aff_lign_def_invisible_non');
				var q_rep_flo_vis = checkedFromIdToInt('aff_lign_flot_invisible_non');

				var q_nb_scan_page = document.getElementById('nb_scan_page').value;
				if (q_nb_scan_page.replace(/[^0-9-]/g, "") === '') {
					q_nb_scan_page = 0;
				}
			//}

			//{ Autre :
				var qq_techzero = checkedFromIdToInt('q_techzero_non');

				var tableau_raide_facile_q = parseInt(document.getElementById('tableau_raide_facile_q').value, 10);

				var q_icone_mess_rep = checkedFromIdToInt('icone_parti_mess_non');
			//}

			var option4 = 'x/'+ option_respon_lien_espi +'/'+ affichage_colone_recycleur_rep +'/'+ tps_vol_afficher_rep + //0-3
				'/'+ affiche_nom_joueur +'/'+ affiche_nom_planet +'/'+ affiche_coor_q +'/'+ date_q_repons +//4-5-6-7
				'/'+ qq_date_type_rep +'/'+ affiche_prod_h +'/'+ ress_x_h +'/'+ qq_sim_q +//8-11
				'/'+ qq_mess +'/'+ q_nb_scan_page +'/'+ rassemble_qrep + '/'+ qq_techzero + '/'+ q_icone_mess_rep +//12-16
				'/'+ q_vid_colo_rep +'/'+ q_rep_flo_vis +'/'+ q_rep_def_vis +'/x/'+ q_rep_compteur_attaque +//17-21
				'/'+ q_galaxie_rep +'/'+ galaxie_demande_rep + '/'+ afficher_seulement_rep +'/'+ q_rep_lien_simu_meme_onglet +//22-25
				'/'+ affiche_def +'/'+ affiche_flotte +//26-27
				'/x/x/'+ tableau_raide_facile_q +'/'+ galaxie_demande_plus_moin_text_rep +//28-29-30-31
				'/'+affiche_pt_gt +'/'+ affiche_tech;//32-33

			GM_setValue('option4' + serveur, option4);
		//}

		// option de langue
		stockageOption.set('langue', document.getElementById('langue').value);

		stockageOption.save();
		fadeBoxx(i18n('option_sv'));
	}
	function save_optionbbcode(serveur) {
		var col1 = document.getElementById('col_1').value;
		var col2 = document.getElementById('col_2').value;
		var col3 = document.getElementById('col_3').value;
		var col4 = document.getElementById('col_4').value;
		var col5 = document.getElementById('col_5').value;
		var col6 = document.getElementById('col_6').value;
		var col7 = document.getElementById('col_7').value;

		var q_cite0 = document.getElementById("cite0").checked;
		var q_cite1 = document.getElementById("cite1").checked;
		var q_cite;
		if (q_cite0 === true) {
			q_cite = 0;
		} else if (q_cite1 === true) {
			q_cite = 1;
		}

		var q_centre0 = document.getElementById("centre0").checked;
		var q_centre1 = document.getElementById("centre1").checked;
		var q_centre;
		if (q_centre0 === true) {
			q_centre = 0;
		} else if (q_centre1 === true) {
			q_centre = 1;
		}

		var q_centre_type0 = document.getElementById("centre_type0").checked;
		var q_centre_type1 = document.getElementById("centre_type1").checked;
		var rep_center_type;
		if (q_centre_type0 === true) {
			rep_center_type = 0;
		} else if (q_centre_type1 === true) {
			rep_center_type = 1;
		}

		var q_url_type0 = document.getElementById("url_type0").checked;
		var q_url_type1 = document.getElementById("url_type1").checked;
		var q_url_type;
		if (q_url_type0 === true) {
			q_url_type = 0;
		} else if (q_url_type1 === true) {
			q_url_type = 1;
		}

		var option_save_bbcode = col1 + '/' + col2 + '/' + col3 + '/' + col4 + '/' + col5 + '/' + col6 + '/' + col7 + '/' +
			rep_center_type + '/' + q_url_type + '/' + q_centre + '/' + q_cite;
		GM_setValue('option_bbcode' + serveur, option_save_bbcode);
	}

	function reset(serveur) {
		var continuer = confirm(i18n('q_reset'));
		if (continuer === true) {
			GM_setValue('scan' + serveur, '');
			fadeBoxx(i18n('reset'), 0, 3000);
		}
	}

	//function pour connaitre les scans qui sont affiché.
	function connaitre_scan_afficher(serveur, nb_scan_page, url, nb) {
		// on regarde par rapport au nombre de scan par page et par rapport a la page ou on est pour savoir a partir de quel scan on affiche et on s'arrete ou .
		var nb_scan_deb;
		var nb_scan_fin;
		if (nb_scan_page !== 0) {
			var num_page;
			if (url.indexOf('&page_r=') != -1) {
				num_page = parseInt(url.split('&page_r=')[1].replace(/[^0-9-]/g, ""));
			} else {
				num_page = 1;
			}

			if (!num_page || num_page === 1) {
				nb_scan_deb = 0;
				nb_scan_fin = nb_scan_page;
			} else if (num_page >= 1) {
				nb_scan_deb = (parseInt(num_page) - 1) * nb_scan_page;
				nb_scan_fin = parseInt(num_page) * nb_scan_page;
			}
		} else {
			nb_scan_fin = nb;
			nb_scan_deb = 0;
		}
		var retour_scan = [nb_scan_fin, nb_scan_deb];
		return retour_scan;
	}

	// fonction pour creer un tableau html exportable
	function export_html(serveur, check, url, nb_scan_page) {
		var id_num;
		var tr_num;
		var scan_info = GM_getValue('scan' + serveur, '').split('#');
		var nb = scan_info.length;
		var export_html_2 = '';

		var nb_scan_deb_fin = connaitre_scan_afficher(serveur, nb_scan_page, url, nb);
		for (var p = nb_scan_deb_fin[1]; p < nb_scan_deb_fin[0]; p++) {
			id_num = 'check_' + p + '';
			if (scan_info[p]) {
				if (scan_info[p] !== '' && scan_info[p] !== ' ' && scan_info[p]) {
					if (document.getElementById(id_num)) {
						if (document.getElementById(id_num).checked == check) {
							tr_num = 'tr_' + p + '';
							export_html_2 = export_html_2 + '\n' + document.getElementById(tr_num).innerHTML.split('<td> <a href="http')[0] + '</tr>';
						}
					} else { nb_scan_deb_fin[0]++; }
				}
				else { nb_scan_deb_fin[0]++; }
			}
		}
		export_html_2 = '<table style="text-align:center;border: 1px solid black;font-size:10px;"><caption>Raide Facile. </caption><thead id="haut_table2"><tr>' + document.getElementById("haut_table2").innerHTML +
		'</thead><tbody id="export_html_textarea" >' + export_html_2 + '</tbody></table>';
		document.getElementById("text_html").innerHTML = export_html_2;
	}

	//function d'export des scans.
	function export_scan(check, target) {
		var id_num;
		var scan_info = GM_getValue('scan' + info.serveur, '').split('#');
		var nb = scan_info.length;
		var export_f = '';

		var nb_scan_deb_fin = connaitre_scan_afficher(info.serveur, nb_scan_page, info.url, nb);

		for (var p = nb_scan_deb_fin[1]; p < nb_scan_deb_fin[0]; p++) {
			id_num = 'check_' + p + '';
			if (scan_info[p]) {
				if (scan_info[p] !== '' && scan_info[p] !== ' ' && scan_info[p]) {
					if (document.getElementById(id_num)) {
						if (document.getElementById(id_num).checked == check) {
							export_f = export_f + '#' + scan_info[p];
						}
					} else { nb_scan_deb_fin[0]++; }
				}
				else { nb_scan_deb_fin[0]++; }
			}
		}
		$(target).val(export_f);
	}

	//function d'import des scans.
	function import_scan(variable_q, source) {
		var scan_info = GM_getValue('scan' + info.serveur, '');
		var scan_add = $(source).val();
		scan_add = scan_add.split('#');
		var scan_info3 = '';

		if (variable_q == 1) {
			for (var p = 0; p < scan_add.length; p++) {
				if (scan_add[p].split(';').length > 2)
				{ scan_info3 = scan_info3 + '#' + scan_add[p]; }
			}
		} else { // variable_q = 0
			for (var q = 0; q < scan_add.length; q++) {
				if (scan_add[q].split(';').length > 2) {
					if (q === 0) {
						scan_info3 = scan_info3 + scan_add[q];
					} else {
						scan_info3 = scan_info3 + '#' + scan_add[q];
					}
				}
			}
		}

		if (variable_q == 1) {
			scan_info = scan_info + scan_info3;
		}
		else { scan_info = scan_info3; }

		scan_info = scan_info.replace(/\#{2,}/g, "#");
		GM_setValue('scan' + info.serveur, scan_info);
		fadeBoxx(text.import_rep, 0, 3000);
	}

	// fonction pour savoir le nombre de pt et gt qu'il faut pour prendre le maximum de reosourcce en raidant
	function shipCount(m, k, d, cargo, pourcent) {
		return Math.ceil((Math.ceil(Math.max(m + k + d, Math.min(0.75 * (m * 2 + k + d), m * 2 + d))) * (pourcent / 100)) / cargo);
	}

	// pouvoir suprimer plusieurs scan. depuis raide-facile grace au checbox
	function del_scan_checkbox(serveur, check) {
		var id_num;
		var scan_info = GM_getValue('scan' + serveur, '').split('#');
		var nb = scan_info.length;

		// on regarde de quel scan on doit commencer et combien normalement on doit regarder
		var p;
		var nb_scan_fin;
		if (nb_scan_page !== 0) {
			var num_page = info.url.split('&page_r=')[1];

			if (num_page === undefined || num_page == 1) {
				p = 0;
				nb_scan_fin = nb_scan_page;
			} else if (num_page >= 1) {
				p = (parseInt(num_page) - 1) * nb_scan_page;
				nb_scan_fin = parseInt(num_page) * nb_scan_page;
			}
		} else {
			nb_scan_fin = nb;
			p = 0;
		}

		for (; p < nb_scan_fin; p++) {
			id_num = 'check_' + p + '';
			if (scan_info[p]) {
				// on verifie que le scan est bien afficher dans la colone sinon on rajoute +1 au nombre final pour verifier les scan afficher l(par rapport au nombre demander)
				if (scan_info[p] !== '' && scan_info[p] !== ' ' && scan_info[p].split(';')[4] && document.getElementById(id_num) !== null) {
					if (document.getElementById(id_num).checked == check) {
						scan_info[p] = '';
					}

				} else { nb_scan_fin++; }
			}
		}
		scan_info = scan_info.join('#');
		scan_info = scan_info.replace(/\#{2,}/g, "#");
		GM_setValue('scan' + serveur, scan_info);
		fadeBoxx(text.del_scan, 0, 3000);
	}

	//calcul la production en met/cri/deut par heure selon les coordonees , les mines et la temperature max.
	function calcule_prod(mine_m, mine_c, mine_d, coordonee, tmps_max) {
		var retour = {};
		if (mine_m != '?' && mine_m != '?' && mine_m != '?' && coordonee.split(':')[2] !== undefined) {
			var prod_m = Math.floor((30 * parseInt(mine_m) * Math.pow(1.1, parseInt(mine_m)) + 30) * vitesse_uni);
			retour.metal = prod_m;
			var prod_c = Math.floor((20 * parseInt(mine_c) * Math.pow(1.1, parseInt(mine_c)) + 15) * vitesse_uni);
			retour.cristal = prod_c;

			// on cherche la temperature de la planette grace au coordonée si on ne la connait pas
			if (tmps_max === '?' || tmps_max === ' ' || tmps_max === '') {
				var pos_planette = coordonee.split(':')[2].replace(/[^0-9-]/g, "");
				if (pos_planette <= 3) {
					tmps_max = 123;
				} else if (pos_planette <= 6) {
					tmps_max = 65;
				} else if (pos_planette <= 9) {
					tmps_max = 35;
				} else if (pos_planette <= 12) {
					tmps_max = 15;
				} else if (pos_planette <= 15) {
					tmps_max = -40;
				}
			}
			var prod_d = vitesse_uni * Math.floor(10 * parseInt(mine_d) * (Math.pow(1.1, parseInt(mine_d)) * (1.44 - (tmps_max * 0.004))));
				retour.deut = prod_d;

			return retour;
		}
		else {retour.metal = '?';retour.cristal = '?';retour.deut = '?';
			return retour;}
	}

	function vitesse_vaisseau(impulsion, hyper_h, combus, value_select) {
		if (!value_select) {
			return;
		}

		var vitesse_pt = parseInt(impulsion) >= 5 ? 10000 : 5000;
		var prop_pt = parseInt(impulsion) >= 5 ? 'imp' : 'comb';
		var vitesse_bb = parseInt(hyper_h) >= 8 ? 5000 : 4000;
		var prop_bb = parseInt(hyper_h) >= 8 ? 'hyp' : 'imp';
		var donnéesVaisseaux = [
			{ nom: vari.pt, vitesse: vitesse_pt, prop: prop_pt },
			{ nom: vari.gt, vitesse: 7500, prop: 'comb' },
			{ nom: vari.cle, vitesse: 12500, prop: 'comb' },
			{ nom: vari.clo, vitesse: 10000, prop: 'imp' },
			{ nom: vari.cro, vitesse: 15000, prop: 'imp' },
			{ nom: vari.vb, vitesse: 10000, prop: 'hyp' },
			{ nom: vari.vc, vitesse: 2500, prop: 'imp' },
			{ nom: vari.rec, vitesse: 2000, prop: 'comb' },
			{ nom: vari.esp, vitesse: 100000000, prop: 'comb' },
			{ nom: vari.bb, vitesse: vitesse_bb, prop: prop_bb },
			{ nom: vari.dest, vitesse: 5000, prop: 'hyp' },
			{ nom: vari.edlm, vitesse: 100, prop: 'hyp' },
			{ nom: vari.tra, vitesse: 10000, prop: 'hyp' },
		];

		// on regarde le vaisseau selectionner et on cherche sa vitesse minimale
		var vitesse_mini;
		if (donnéesVaisseaux[value_select].prop === "comb") {
			vitesse_mini = Math.round(donnéesVaisseaux[value_select].vitesse * (1 + (0.1 * parseInt(combus))));
		} else if (donnéesVaisseaux[value_select].prop === "imp") {
			vitesse_mini = Math.round(donnéesVaisseaux[value_select].vitesse * (1 + (0.2 * parseInt(impulsion))));
		} else if (donnéesVaisseaux[value_select].prop === "hyp") {
			vitesse_mini = Math.round(donnéesVaisseaux[value_select].vitesse * (1 + (0.3 * parseInt(hyper_h))));
		}
		return vitesse_mini;
	}

	function vaisseau_vitesse_mini(impulsion, hyper_h, combus, value_select, coordonee_cible) {
		/***************  Distance *********************/
		var planette_selec = info.ogameMeta['ogame-planet-coordinates'].split(':').map(function (pos) {
			return parseInt(pos);
		});
		var galaxie_j = planette_selec[0];
		var system_j = planette_selec[1];
		var planet_j = planette_selec[2];

		var coordonee_cible_split = coordonee_cible.split(':').map(function (pos) {
			return parseInt(pos);
		});
		var galaxie_c = coordonee_cible_split[0];
		var system_c = coordonee_cible_split[1];
		var planet_c = coordonee_cible_split[2];

		// on calcule la distance entre la cible et la planette d'attaque (de depart)
		var distance;
		if (galaxie_j !== galaxie_c) {
			distance = 20000 * Math.abs(galaxie_j - galaxie_c);
		} else if (system_j !== system_c) {
			distance = 2700 + 95 * Math.abs(system_j - system_c);
		} else {
			distance = 1000 + 5 * Math.abs(planet_j - planet_c);
		}


		/***************  Temps de vol  *********************/

		var vitesse_mini = vitesse_vaisseau(impulsion, hyper_h, combus, value_select);
		var temps_de_vol_sec = 10 + ((35000 / 100) * (Math.sqrt((distance * 1000) / vitesse_mini)));
		temps_de_vol_sec = Math.round(temps_de_vol_sec / vitesse_uni);

		var minutes = Math.floor(temps_de_vol_sec / 60);
		var heures = Math.floor(minutes / 60);
		var jours = Math.floor(heures / 24);
		var secondes = Math.floor(temps_de_vol_sec % 60);
		minutes = Math.floor(minutes % 60);
		heures = Math.floor(heures % 24);

		var temp_vol = jours + 'j ' + heures + 'h ' + minutes + 'min' + secondes + 's';
		var sec_arrive = info.startTime + temps_de_vol_sec * 1000;
		var date_arrive = new Date();
		date_arrive.setTime(parseInt(sec_arrive));
		var date_arrive_f = date_arrive.getDate() + '/' + date_arrive.getMonth() + '/' + date_arrive.getFullYear() + ' à ' + date_arrive.getHours() + 'h ' + date_arrive.getMinutes() + 'min' + date_arrive.getSeconds() + 's';

		var sec_retour = info.startTime + temps_de_vol_sec * 2000;
		var date_retour = new Date();
		date_retour.setTime(sec_retour);
		var date_retour_f = date_retour.getDate() + '/' + date_retour.getMonth() + '/' + date_retour.getFullYear() + ' à ' + date_retour.getHours() + 'h ' + date_retour.getMinutes() + 'min' + date_retour.getSeconds() + 's';

		var acconyme_temps = '<acronym title=" ' + text.arriv_f + ' : ' + date_arrive_f + ' | ' + text.retour_f + ' : ' + date_retour_f + '">' + temp_vol + '</acronym>';

		return acconyme_temps;
	}

	function calcul_dernier_vidage(metal, cristal, deut, prod_m, prod_c, prod_d, heure_scan, mine_m) {
		if (mine_m !== '?' && prod_m !== 0 && prod_m !== '?') {
			//prod_par_h on change en prod par minutes.
			var prod_m_sec = parseInt(prod_m) / 3600;
			var prod_c_sec = parseInt(prod_c) / 3600;
			var prod_d_sec = parseInt(prod_d) / 3600;

			// on cherche le nombre de seconde pour produire le metal/cristal/deut sur la planette
			var nb_sec_m = Math.round(parseInt(metal) / prod_m_sec);
			var nb_sec_c = Math.round(parseInt(cristal) / prod_c_sec);
			var nb_sec_d = Math.round(parseInt(deut) / prod_d_sec);

			// on trie
			var sortNumber = function (a, b) { return a - b; };
			var array_nb_sec = [nb_sec_m, nb_sec_c, nb_sec_d];
			array_nb_sec.sort(sortNumber);

			// on prend le temps le plus grand
			var heure_dernier_vidage = parseInt(heure_scan) - array_nb_sec[0] * 1000;

			var datecc = new Date();
			datecc.setTime(heure_dernier_vidage);
			var date_final = datecc.getDate() + '/' + (datecc.getMonth() + 1) + '/' + datecc.getFullYear() + ' ' +
				datecc.getHours() + ':' + datecc.getMinutes() + ':' + datecc.getSeconds();

			return date_final;
		}
		else {
			return '?';
		}
	}

	//suprime les attaque comptabilisé il y a plus de 24h .
	function suprimmer_attaque_24h_inutile() {
		var attaque_deja = GM_getValue('attaque_24h', '');
		var attaque_deja_split = attaque_deja.split('#');
		var attaque_heure;
		var heure_moin24h = info.startTime - 24 * 60 * 60 * 1000;
		for (var t = 0; t < attaque_deja_split.length; t++) {
			attaque_heure = attaque_deja_split[t].split('/')[0];
			if (attaque_heure < heure_moin24h)// alors l'attaque etait fait il y a plus de 24h donc on s'en fou
			{
				attaque_deja_split[t] = '';
			}
		}
		attaque_deja = attaque_deja_split.join('#').replace(/\#{2,}/g, "#");
		GM_setValue('attaque_24h', attaque_deja);
	}
//}endregion

// page des messages
var scan = {
	parsePreview: function (html) {
		var msg_contents = $('.msg_content > span', html);
		return {
			id: $(html).data('msg-id'),
			coord: $('.msg_head .msg_title a', html).text(),
			timestamp: new Date($('.msg_head .msg_date ', html).text()).getTime(),
			resources: scan.parseRessource($(msg_contents[0]).text()),
			fleets: $(msg_contents[1]).text().replace('Fleets: ', ''),
			loot: $(msg_contents[2]).text().replace('Loot: ', '')
		};
	},
	parseRessource: function (ressources) {
		var match = ressources.match(/([0-9.]+[MCD])/g);
		var metal = match.filter(function (res) { return res[res.length - 1] === 'M'; })[0] || '0M';
		var cristal = match.filter(function (res) { return res[res.length - 1] === 'C'; })[0] || '0C';
		var deut = match.filter(function (res) { return res[res.length - 1] === 'D'; })[0] || '0D';
		return {
			metal: parseFloat(metal.slice(0, -1)),
			cristal: parseFloat(cristal.slice(0, -1)),
			deut: parseFloat(deut.slice(0, -1))
		};
	},
};

var eventHandlers = {
    messageEspionnageLoaded: function (data) {
		var messages = $('>li', data.text);
		for (var i = 0; i < messages.length; i++) {
			console.log(scan.parsePreview(messages[i]));
		}
    }
};

/** page de combat report **///{region
	//recupere les informations des rapports de combat pour que le compteur d'attaque
	function getDate(fullDate) {
		var fullDateSplit = fullDate.split(' ');
		var date = fullDateSplit[0].split('.').map(function (s) { return parseInt(s); });
		var heure = fullDateSplit[1].split(':').map(function (s) { return parseInt(s); });
		return new Date(date[2], date[1] - 1, date[0], heure[2], heure[1], heure[0]);
	}
	function get_info_combat() {
		if (document.getElementById('battlereport')) {
			//recupere la date du combat.
			var date_complet_combat = document.getElementsByClassName('infohead')[0].getElementsByTagName('td')[3].textContent;//exemple : 28.06.2015 10:13:14
			var date_combat_ms = getDate(date_complet_combat).getTime();

			if (date_combat_ms > (info.startTime - 24 * 60 * 60 * 1000)) {//on verifie que cela fait moin de 24h que l'attaque a eu lieu
				var attaque_deja = GM_getValue('attaque_24h', '');
				if (attaque_deja.indexOf(date_combat_ms) == -1) {// si le combat n'est pas déja enregistré

					// recuperer les coordonées du combats.
					var info_head = document.getElementsByClassName('infohead')[0].getElementsByTagName('tr')[2].getElementsByTagName('td')[0].innerHTML;
					var coordonee_combat = info_head.split('[')[1].split(']')[0];

					// on prend le pseudo des joueurs pour connaitre de quelle coté est le joueur
					var pseudo_de;
					if (info.pseudo.indexOf(vari.de) != -1) {
						pseudo_de = info.pseudo.split(vari.de)[0];
					} else {
						pseudo_de = info.pseudo;
					}

					var bloc_combatants = document.getElementById("combatants").children;
					var bloc_attaquant = bloc_combatants[0].children;
					var attaquant = [];
					for (var k = 0; k < bloc_attaquant.length; k++) {
						attaquant[k] = bloc_attaquant[k].firstElementChild.textContent;
					}

					var bloc_defenseur = bloc_combatants[2].children;
					var defenseur = [];
					for (var l = 0; l < bloc_defenseur.length; l++) {
						defenseur[l] = bloc_defenseur[l].firstElementChild.textContent;
					}

					if ($.inArray(pseudo_de, attaquant) !== -1) {
						// le joueur est un des attaquants
						var attaque_news = date_combat_ms + '/' + coordonee_combat;
						attaque_deja = attaque_deja + '#' + attaque_news;
						attaque_deja = attaque_deja.replace(/\#{2,}/g, "#");
						GM_setValue('attaque_24h', attaque_deja);
					}
				}
			}
		}
	}
//}endregion



/************************* PAGE DE MESSAGE *************************///{
	// function suprimer un scan depuis le pop-up
	function supr_scan1(serveur) {
		var dateCombat = $('div.showmessage[data-message-id] .infohead tr:eq(3) td').text().match(/(\d+)\.(\d+)\.(\d+) (\d+):(\d+):(\d+)/);
		if (dateCombat.length != 7) {
			logger.error('Erreur n°15045');
		}
		var date_scan = new Date(dateCombat[3], parseInt(dateCombat[2]) - 1, dateCombat[1], dateCombat[4], dateCombat[5], dateCombat[6]).getTime();

		var scan_info = GM_getValue('scan' + serveur, '').split('#');
		var listeDateRC;
		var suppr = 0;
		for (var i = 0; i < scan_info.length; i++) {
			listeDateRC = scan_info[i].split(';')[0];
			if (listeDateRC == date_scan) {
				scan_info[i] = '';
				++suppr;
			}
		}
		scan_info = scan_info.join('#');
		scan_info = scan_info.replace( /\#{2,}/g, "#");

		GM_setValue('scan' + serveur, scan_info);
		fadeBoxx(suppr + ' ' +text.rep_mess_supri, 0, 3000);
	}

	function save_scan(serveur, id_rc, popup, afficherResultat) {
		if (!id_rc) return;

		var date_combat_total = "";
		var document_spatio;

		if (popup) {// on se place dans le scan en pop up
			document_spatio = $('div.showmessage[data-message-id="'+id_rc+'"]').get(0);
			date_combat_total = document_spatio.getElementsByClassName('infohead')[0].innerHTML;
		} else { // on se place dans la partie du scan(partie pour les scans pré-ouverts)
			var nom_spatio = 'spioDetails_'+ id_rc;
			document_spatio = document.getElementById(nom_spatio);
			var document_entete = document.getElementById(id_rc + 'TR');
			if (!document_entete) // Pour la version 5.0.0
				document_entete = document.getElementById('TR' + id_rc);
			date_combat_total = document_entete.getElementsByClassName('date')[0].innerHTML;
		}

		// heure du scans
		var date_combat = date_combat_total.match(/(\d+)\.(\d+)\.(\d+) (\d+):(\d+):(\d+)/i);
		var jours = parseInt(date_combat[1]);
		var mois = parseInt(date_combat[2]) - 1;
		var annee = parseInt(date_combat[3]);
		var heure = parseInt(date_combat[4]);
		var min = parseInt(date_combat[5]);
		var sec = parseInt(date_combat[6]);
		var date_scan = new Date(annee, mois, jours, heure, min, sec).getTime();

		// nom de planette et coordoné et nom joueurs

		var planette_et_joueur_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[0].innerHTML;

		var spans = document_spatio.getElementsByClassName('material spy')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[0].getElementsByTagName('span');
		var nom_joueur = spans[spans.length - 1].innerHTML;
		// si antigame est installé et interfere dans le nom du joueurs
		if (nom_joueur.indexOf('war-riders.de') !== -1) {
			nom_joueur = document_spatio.getElementsByClassName('material spy')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[0].getElementById("player_name").innerHTML;
		}

		var coordonnee = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('area')[0].getElementsByTagName('a')[0].innerHTML;
		var nom_plannette = '?';
		if (planette_et_joueur_scan.indexOf('<span>') >= 0) {
			nom_plannette = planette_et_joueur_scan.split(' <span>')[0];
			nom_plannette = nom_plannette.split(vari.sur)[1];
		}
		else {
			nom_plannette = planette_et_joueur_scan.split(' <a')[0];
			// normalement il y a une balise <figure> entre le "sur" et le nom de la planète
			// nom_plannette = nom_plannette.split(vari.sur)[1];
			nom_plannette = nom_plannette.split('</figure>')[1];
		}
				//si le nom de planete a un # on le remplace pour pas qu'il interfere dans le split plus tard
		if (nom_plannette.indexOf('#') >= 0) {
			nom_plannette = nom_plannette.replace(/\#/g, "1diez1");
		}

		// type de joueur
		var typeJoueur = "";
		var pourcent = 50;
		if (planette_et_joueur_scan.indexOf('status_abbr_active') >= 0)
			typeJoueur = "";
		else if (planette_et_joueur_scan.indexOf('status_abbr_honorableTarget') >= 0) {
			typeJoueur = "ph";
			pourcent = 75;
		}
		else if (planette_et_joueur_scan.indexOf('status_abbr_outlaw') >= 0)
			typeJoueur = "o";
		else if (planette_et_joueur_scan.indexOf('status_abbr_inactive') >= 0)
			typeJoueur = "i";
		else if (planette_et_joueur_scan.indexOf('status_abbr_longinactive') >= 0)
			typeJoueur = "I";
		else if (planette_et_joueur_scan.indexOf('status_abbr_strong') >= 0)
			typeJoueur = "f";
		else if (planette_et_joueur_scan.indexOf('status_abbr_vacation') >= 0)
			typeJoueur = "v";
		// else if(planette_et_joueur_scan.indexOf('status_abbr_ally_own')>= 0)
		// else if(planette_et_joueur_scan.indexOf('status_abbr_ally_war')>= 0)
		// type de joueur
		var typeHonor = "";
		if (planette_et_joueur_scan.indexOf('rank_bandit1') >= 0) {
			typeHonor = "b1";
			pourcent = 100;
		}
		else if (planette_et_joueur_scan.indexOf('rank_bandit2') >= 0) {
			typeHonor = "b2";
			pourcent = 100;
		}
		else if (planette_et_joueur_scan.indexOf('rank_bandit3') >= 0) {
			typeHonor = "b3";
			pourcent = 100;
		}
		else if (planette_et_joueur_scan.indexOf('rank_starlord1') >= 0)
			typeHonor = "s1";
		else if (planette_et_joueur_scan.indexOf('rank_starlord2') >= 0)
			typeHonor = "s2";
		else if (planette_et_joueur_scan.indexOf('rank_starlord3') >= 0)
			typeHonor = "s3";

		// on recupere l'id du rc
		var idRC;
		if (info.url.indexOf('index.php?page=messages') >= 0) {//si on est dans les scan preouvert
			idRC = id_rc;
		}
		else {// si on est dans la page pop up
			idRC = info.url.split('&msg_id=')[1];
			if (info.url.indexOf('&mids') === -1) {
				idRC = idRC.split('&cat')[0];
			}
			else { idRC = idRC.split('&mids')[0]; }
		}

//modif deberron // on recupere avec le lien pour attaquer si c'est un lune ou une planette
		var type_planette = document_spatio.getElementsByClassName('defenseattack spy')[0].getElementsByClassName('attack')[0].innerHTML.match(/type=(\d+)/i);
		type_planette = type_planette ? type_planette[1] : 1;

		// on verifie si le scan est nouveau
			var newscan = GM_getValue('scan' + serveur, '').indexOf(idRC) === -1;

		// on verifie si le scan  peut etre enregistré par rapport a sa date d'expiration(parametre d'option) et si il est nouveau
		if (newscan && (info.startTime - nb_ms_garde_scan) < date_scan) {
			// on recupere les ressources de la planettes
			var ressource_m_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('fragment spy2')[0].getElementsByTagName('td')[1].innerHTML.replace(/[^0-9-]/g, "");
			var ressource_c_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('fragment spy2')[0].getElementsByTagName('td')[3].innerHTML.replace(/[^0-9-]/g, "");
			var ressource_d_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('fragment spy2')[0].getElementsByTagName('td')[5].innerHTML.replace(/[^0-9-]/g, "");

			// on cherche si il y a eu de l'activité et combien de temps
			var activite_scan = document_spatio.getElementsByClassName('aktiv spy')[0].innerHTML;
			activite_scan = activite_scan.split('</div></div></span>')[1].replace(/[^0-9-]/g, "");
			if (activite_scan == '') { activite_scan = 'rien'; }

			// on creer des array par rapport a ce que l'on veut recupere
			var vaisseau = new Array(vari.pt, vari.gt, vari.cle, vari.clo, vari.cro, vari.vb, vari.vc, vari.rec, vari.esp, vari.bb, vari.sat, vari.dest, vari.edlm, vari.tra);
			var defense = new Array(vari.lm, vari.lle, vari.llo, vari.gauss, vari.ion, vari.pla, vari.pb, vari.gb, vari.mic, vari.mip);
			var recherche = new Array(vari.tech_arm, vari.tech_bouc, vari.tech_pro);
			var mine = new Array(vari.mine_m, vari.mine_c, vari.mine_d);

			// array de perte d'unité par rapport au vaisseau/defense
			var vaisseau_perte = new Array("4000", "12000", "4000", "10000", "27000", "60000", "30000", "16000", "1000", "75000", "2000", "110000", "9000000", "70000");
			var vaisseau_perte_m = new Array("2000", "6000", "3000", "6000", "20000", "45000", "10000", "10000", "0", "50000", "0", "60000", "5000000", "30000");
			var vaisseau_perte_c = new Array("2000", "6000", "1000", "4000", "7000", "15000", "20000", "6000", "1000", "25000", "2000", "50000", "4000000", "40000");

			var def_perte = new Array("2000", "2000", "8000", "35000", "8000", "100000", "20000", "100000", "0", "0");
			var def_perte_m = new Array("2000", "1500", "6000", "20000", "2000", "50000", "10000", "50000", "0", "0");
			var def_perte_c = new Array("0", "500", "2000", "15000", "6000", "50000", "10000", "50000", "0", "0");

			//valeur de base d'attaque pour vaissea/défense
			var valeur_attaque_vaisseau = new Array("5", "5", "50", "150", "400", "1000", "50", "1", "1", "1000", "1", "2000", "200000", "700");
			var valeur_attaque_defense = new Array("80", "100", "250", "1100", "150", "3000", "1", "1", "0", "0");

			//on initialise tout ce qu'on a besoin.
			var cdr_possible_def = 0;
			var cdr_possible_def_m = 0;
			var cdr_possible_def_c = 0;

			var cdr_possible = 0;
			var cdr_possible_m = 0;
			var cdr_possible_c = 0;

			var valeur_attaque_def = 0;
			var valeur_attaque_flotte = 0;

			var nb_vaisseau_s = 0;
			var nb_def_s = 0;
			var vaisseau_scan = new Array("0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0");
			var defense_scan = new Array("0", "0", "0", "0", "0", "0", "0", "0", "0", "0");
			var recherche_scan = new Array("0", "0", "0");
			var mine_scan = new Array("0", "0", "0");
			var nb_def_type = ' ';
			var nb_recherche = '';
			var nb_mine = '';

			/******* RECHERCHE *******/ // j'ai la mit la recherche avant alors que c'est apres a cause du besoin de recherche pour calculer la valeur de flotte/def
			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[3]) {
				var flotte_inter3 = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].innerHTML;
			} else { flotte_inter3 = ''; }

			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[3] && flotte_inter3.indexOf('area plunder', 0) == -1) {
				// on compte le nombre de type de recherche affiché.
				var nb_type_recherche = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].getElementsByClassName('key').length;
				for (var j = 0; j < nb_type_recherche; j++) {
					var type_recherche = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].getElementsByClassName('key')[j].innerHTML;//23.03.2010 22:27:56
					for (var k = 0; k < recherche.length; k++) {
						//on recupere le type de recherche et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
						if (type_recherche == recherche[k]) {
							nb_recherche = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].getElementsByClassName('value')[j].innerHTML;
							recherche_scan[k] = parseInt(nb_recherche);
						}
					}
				}
			} else {
				//sinon elle existe pas alors on le voit pas donc ?
				nb_recherche = '?';
				recherche_scan = new Array("?", "?", "?");
			}

			var recherche_pour_valeur = (recherche_scan[0] == "?") ? new Array(0, 0, 0) : recherche_scan;

			/******* VAISSEAU + CDR *******/// on recupere les vaisseaux et le cdr creables.
			var flotte_inter = (document_spatio.getElementsByClassName('fleetdefbuildings spy')[0]) ? document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].innerHTML : '';

			// on verifie que l'on voit bien la flotte
			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[0] && flotte_inter.indexOf('area plunder', 0) == -1) {

				// on compte le nombre de type de vaisseau affiché.
				var nb_type_vaisseau = document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].getElementsByClassName('key').length;
				for (var j = 0; j < nb_type_vaisseau; j++) {
					//on recupere le type du vaisseau et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
					var type_vaisseau = document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].getElementsByClassName('key')[j].innerHTML;
					for (var k = 0; k < vaisseau.length; k++) {
						if (type_vaisseau == vaisseau[k]) {
							var nb_vaisseau_type = parseInt(document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].getElementsByClassName('value')[j].textContent.replace(/[^0-9-]/g, ''));
							valeur_attaque_flotte = valeur_attaque_flotte + nb_vaisseau_type * parseInt(valeur_attaque_vaisseau[k]) * (1 + 0.1 * recherche_pour_valeur[0]);

							cdr_possible = cdr_possible + parseInt(vaisseau_perte[k]) * nb_vaisseau_type;
							cdr_possible_m = cdr_possible_m + parseInt(vaisseau_perte_m[k]) * nb_vaisseau_type;
							cdr_possible_c = cdr_possible_c + parseInt(vaisseau_perte_c[k]) * nb_vaisseau_type;

							vaisseau_scan[k] = parseInt(vaisseau_scan[k]) + nb_vaisseau_type;
							nb_vaisseau_s = nb_vaisseau_s + nb_vaisseau_type;
						}
					}

				}
			}
			else {
				cdr_possible = '?';
				valeur_attaque_flotte = '?';
				vaisseau_scan = new Array("?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?");
				nb_vaisseau_s = -1;
			}
			if (cdr_possible == '' || cdr_possible == ' ') { cdr_possible = 0; }

		/******* DEFENSE *******/
			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[1]) {
				var flotte_inter1 = document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].innerHTML;
			} else { flotte_inter1 = ''; }

			// on verifie que l'on voit bien la def et on verifie que ce que je prenne c'est pas le tableau d'antigame
			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[1] && flotte_inter1.indexOf('area plunder', 0) == -1) {
				// on compte le nombre de type de vaisseau affiché.
				var nb_type_def = document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].getElementsByClassName('key').length;
				for (var j = 0; j < nb_type_def; j++) {
					//on recupere le type de la defense et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
					var type_def = document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].getElementsByClassName('key')[j].innerHTML;//23.03.2010 22:27:56
					for (var k = 0; k < defense.length; k++) {
						if (type_def == defense[k]) {
							nb_def_type = (document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].getElementsByClassName('value')[j].innerHTML).replace(/[^0-9-]/g, "");
							valeur_attaque_def = valeur_attaque_def + parseInt(nb_def_type) * parseInt(valeur_attaque_defense[k]) * (1 + 0.1 * recherche_pour_valeur[0]);// +t pour faire fonctionner la fonction replace

							defense_scan[k] = parseInt(defense_scan[k]) + parseInt(nb_def_type);
							nb_def_s = nb_def_s + parseInt(nb_def_type);

							cdr_possible_def = cdr_possible_def + parseInt(def_perte[k]) * parseInt(nb_def_type);
							cdr_possible_def_m = cdr_possible_def_m + parseInt(def_perte_m[k]) * parseInt(nb_def_type);
							cdr_possible_def_c = cdr_possible_def_c + parseInt(def_perte_c[k]) * parseInt(nb_def_type);

						}
					}

				}
				var cdr_def = cdr_possible_def + '/' + cdr_possible_def_m + '/' + cdr_possible_def_c;
			}
			else {
				nb_def_type = '?';
				valeur_attaque_def = '?';
				defense_scan = new Array("?", "?", "?", "?", "?", "?", "?", "?", "?", "?");
				nb_def_s = -1;
				var cdr_def = '?/?/?';
			}

		/******* Batiment (MINE) *******/
			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[2]) {
				var flotte_inter2 = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].innerHTML;
			} else {
				flotte_inter2 = '';
			}

			// on verifie que l'on voit le batiment et que ce n'est pas antigame
			if (document_spatio.getElementsByClassName('fleetdefbuildings spy')[2] && flotte_inter2.indexOf('area plunder', 0) == -1) {
				// on compte le nombre de type de batiment affiché.
				var nb_type_mine = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].getElementsByClassName('key').length;
				for (var jj = 0; jj < nb_type_mine; jj++) {
					//on recupere le type de la batiment et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
					var type_mine = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].getElementsByClassName('key')[jj].innerHTML;//23.03.2010 22:27:56
					for (var kk = 0; kk < mine.length; kk++) {
						if (type_mine == mine[kk]) {
							nb_mine = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].getElementsByClassName('value')[jj].innerHTML;
							mine_scan[kk] = parseInt(nb_mine);
						}
					}
				}
			}//si on elle existe pas alors on le voit pas donc ?
			else {
				nb_mine = '?';
				mine_scan = new Array("?", "?", "?");
			}


		/* ******* INFO FINAL ********* */
			// on verifie que l'on peut enregistré selon toute les options
			var ressource_pillable = parseInt(ressource_m_scan) + parseInt(ressource_c_scan) + parseInt(ressource_d_scan);
			var cdr_possible2 = Math.round((cdr_possible !== '?' ? cdr_possible : 0) * pourcent_cdr) + Math.round((cdr_possible_def !== '?' ? cdr_possible_def : 0) * pourcent_cdr_def);
			// les trois premiere ligne c'est selon le type d'enregistrement par rapport au ressource /cdr ou les deux. / la derniere ligne pour savoir par rapport a la def et que on voit bien les coordonées

			if (((type_prend_scan == 0 && (cdr_possible2 >= parseInt(valeur_cdr_mini) || (ressource_pillable * pourcent / 100) >= parseInt(nb_scan_accpte)))
				|| (type_prend_scan == 1 && cdr_possible2 >= parseInt(valeur_cdr_mini) && (ressource_pillable * pourcent / 100) >= parseInt(nb_scan_accpte))
				|| (type_prend_scan == 2 && (cdr_possible2 + (ressource_pillable * pourcent / 100)) >= valeur_tot_mini))
				&& coordonnee != '' && (nb_max_def == 0 || nb_max_def > nb_def_s))
			{
				var info_final = date_scan + ';' + coordonnee + ';' + nom_joueur + ';' + nom_plannette //0-1-2-3
					+ ';' + ressource_m_scan + ';' + ressource_c_scan + ';' + ressource_d_scan + ';' //4-5-6
					+ activite_scan + ';' + cdr_possible + ';' + vaisseau_scan.join('/') //7-8-9
					+ ';' + defense_scan.join('/') + ';' + idRC + ';' + ressource_pillable //10-11-12
					+ ';' + recherche_scan.join('/') + ';' + type_planette /*13/14*/
					+ ';' + cdr_possible_m + ';' + cdr_possible_c + ';' + nb_vaisseau_s + ';' + nb_def_s //15-16-17-18
					+ ';' + mine_scan.join('/') + ';x' + ';' + cdr_def //19-20-21
					+ ';' + valeur_attaque_flotte + ';' + valeur_attaque_def //22-23
					+ ';' + typeJoueur + ';' + typeHonor; //24-25

				var scan_info = GM_getValue('scan' + serveur, '').split('#');

				//alert(info_final);
				// on suprime les scan trop vieux
				if (nb_ms_garde_scan != 0) {
					for (var i = 0; i < scan_info.length; i++) {
						var scan_info25 = scan_info[i].split(';');
						if (info.startTime - nb_ms_garde_scan > parseInt(scan_info25[0])) {
							scan_info[i] = '';
						}
					}
				}

				// puis on sauvegarde si on remplace les scan de la meme planette et qu'il existe un scan avec les meme coordonées
				var scan_info2;
				if (GM_getValue('scan' + serveur, '').indexOf(coordonnee) > -1 && scan_remplace == 1) {
					var scan_remplacer_q = 0;// on boucle par rapport au nombre de scan
					for (var p = 0; p < scan_info.length; p++) {
						var scan_test = scan_info[p].split(';');
						// on verifie que le scan existe et on cherche si c'est les meme coordonées, si oui alors on regarde si il est plus récent, et si c'est bien le meme type (lune/planette)
						if (scan_test[9]) {
							if (scan_info[p].indexOf(coordonnee) != -1 && scan_test[14] == type_planette) {
								scan_remplacer_q = 1;
								if (parseInt(scan_test[0]) < date_scan) {
									// on vient d'ajouter un scan plus récent pour le même endroit
									scan_info[p] = info_final;
								}
							}
						}
					}
					// on regarde si il a remplacer ou pas le scan par un ancien, si non alors on l'ajoute
					scan_info2 = scan_info.join('#');
					if (scan_remplacer_q == 0) {
						scan_info2 += '#' + info_final;
					}

					scan_info2 = scan_info2.replace(/\#{2,}/g, "#");

					if (scan_info2 == '' || scan_info2 == '#') {
						GM_setValue('scan' + serveur, '');
					}
					else {
						GM_setValue('scan' + serveur, scan_info2);
					}
				}// si on remplace pas alors on ajoute sans reflechir et on suprime les scan ''
				else {
					scan_info2 = scan_info.join('#').replace(/\#{2,}/g, "#");

					if (scan_info2 == '' || scan_info2 == '#') {
						GM_setValue('scan' + serveur, info_final);
					}
					else {
						GM_setValue('scan' + serveur, scan_info2 + '#' + info_final);
					}
				}
				if (afficherResultat) {
					fadeBoxx('1 ' + text.rep_mess_add, 0, 1000);
				}
				return true;
			}
		}
		if (afficherResultat) {
			fadeBoxx('0 ' + text.rep_mess_add, 0, 500);
		}
		return false;
	}

	function bouton_supr_scan_depuis_mess() {
		if (document.getElementById('Bouton_Rf') == null && document.getElementById('mailz')) {
			var style_css = ' <style type="text/css">'
				+ '.Buttons_scan_mess input {'
				+ '	-moz-background-inline-policy:continuous;'
				+ '	border:0 none; cursor:pointer;'
				+ '	height:32px; text-align:center; width:35px;'
				+ '}</style>';

			// document.getElementById.getElementsByClassName('infohead')[0].getElementsByTagName('td')[0].innerHTML;
			var lien_dossier_icone = 'http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/';
			var bouton_supr_mess_et_scan = '<BR /><div class="Buttons_scan_mess"> <input type="button" title="'+ text.spr_scrptscan_a +'" style=\'background:url("'+ lien_dossier_icone +'supscan2aff.png") no-repeat scroll transparent;\' id="scan_mess_a" mod="9"/>'
										+ '<input type="button" title="'+ text.spr_scrptscan_ns +'" style=\'background:url("'+ lien_dossier_icone +'supscan2nsel.png") no-repeat scroll transparent;\' id="scan_mess_ns" mod="10" />'
										+ '<input type="button" title="'+ text.spr_scrptscan_s +'" style=\'background:url("'+ lien_dossier_icone +'supscan2sel.png") no-repeat scroll transparent;\'  id="scan_mess_s" mod="7"/>';

			var bouton_supr_scan = ' '+ ' '+'<input type="button" title="'+ text.spr_scan_a +'" style=\'background:url("'+ lien_dossier_icone +'supscanaff.png") no-repeat scroll transparent;\' id="scan_a" />'
										+ '<input type="button" title="'+ text.spr_scan_ns +'" style=\'background:url("'+ lien_dossier_icone +'supscannsel.png") no-repeat scroll transparent;\'  id="scan_ns" />'
										+ '<input type="button" title="'+ text.spr_scan_s +'" style=\'background:url("'+ lien_dossier_icone +'supscansel.png") no-repeat scroll transparent;\'  id="scan_s" />';

			var bouton_add_scan = ' '+ ' '+'<input type="button" title="'+ text.add_scan_a +'" style=\'background:url("'+ lien_dossier_icone +'ajscanaff2.png") no-repeat scroll transparent;\' id="scan_add_a" />'
										+ '<input type="button" title="'+ text.add_scan_ns +'" style=\'background:url("'+ lien_dossier_icone +'ajscannsel2.png") no-repeat scroll transparent;\'  id="scan_add_ns" />'
										+ '<input type="button" title="'+ text.add_scan_s +'" style=\'background:url("'+ lien_dossier_icone +'ajscansel2.png") no-repeat scroll transparent;\'  id="scan_add_s" /></div>';


			var texte_a_affichers = style_css + bouton_supr_mess_et_scan + bouton_supr_scan + bouton_add_scan;

			var sp1 = document.createElement("span"); // on cree une balise span
			sp1.setAttribute("id", "Bouton_Rf"); // on y ajoute un id
			sp1.innerHTML = texte_a_affichers;
			var element_avant_lenotre = document.getElementById('mailz');
			insertAfter(sp1, element_avant_lenotre);


			// merci a sylvercloud pour les icones
			document.getElementById("scan_mess_a").addEventListener("click", function (event) { supr_scan_dep_mess(1, true); if (info.firefox) { unsafeWindow.mod = 9; } else { window.mod = 9; } document.getElementsByClassName('buttonOK deleteIt')[0].click(); }, true);
			document.getElementById("scan_mess_s").addEventListener("click", function (event) { supr_scan_dep_mess(2, true); if (info.firefox) { unsafeWindow.mod = 7; } else { window.mod = 7; } document.getElementsByClassName('buttonOK deleteIt')[0].click(); }, true);
			document.getElementById("scan_mess_ns").addEventListener("click", function (event) { supr_scan_dep_mess(2, false); if (info.firefox) { unsafeWindow.mod = 10; } else { window.mod = 10; } document.getElementsByClassName('buttonOK deleteIt')[0].click(); }, true);

			document.getElementById("scan_a").addEventListener("click", function (event) { supr_scan_dep_mess(1, true); }, true);
			document.getElementById("scan_s").addEventListener("click", function (event) { supr_scan_dep_mess(2, true); }, true);
			document.getElementById("scan_ns").addEventListener("click", function (event) { supr_scan_dep_mess(2, false); }, true);

			document.getElementById("scan_add_a").addEventListener("click", function (event) { add_scan_dep_mess(1, true); }, true);
			document.getElementById("scan_add_s").addEventListener("click", function (event) { add_scan_dep_mess(2, true); }, true);
			document.getElementById("scan_add_ns").addEventListener("click", function (event) { add_scan_dep_mess(2, false); }, true);
		}
	}

	function add_scan_dep_mess(type_clique, check_q) {
		//type_clique 1=affiche, 2 = select juste supr scan script , 3/4 idem mais script +scan
		var nb_scan_total_a_enr = document.getElementsByClassName('material spy').length;

		var tout_mess = document.getElementById('messageContent').innerHTML;
		tout_mess = tout_mess.split('switchView(\'spioDetails_');
		var nb_scan_plus_un = tout_mess.length;
		var nb_scan_enregistre = 0;

		if (type_clique == 2) {
			for (var nb_scan_s = 1; nb_scan_s < nb_scan_plus_un; nb_scan_s++) {

				var id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if (document.getElementById(id_rc).checked == check_q) {
					if (save_scan(info.serveur, id_rc, false))
						nb_scan_enregistre = nb_scan_enregistre + 1;
				}

			}
		}
		else if (type_clique == 1) {
			for (var nb_scan_s = 1; nb_scan_s < nb_scan_plus_un; nb_scan_s++) {
				var id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if (save_scan(info.serveur, id_rc, false))
					nb_scan_enregistre = nb_scan_enregistre + 1;
			}
		}
		else {
			fadeBoxx(i18n('erreur'), true);
			nb_scan_enregistre = 0;
		}
		debugger;
		fadeBoxx(nb_scan_enregistre + ' ' + i18n('rep_mess_add'));
	}

	function supr_scan_dep_mess(type_clique, check_q) {
		//type_clique 1=affiche, 2 = select juste supr scan script , 3/4 idem mais script +scan
		var info_scan = GM_getValue('scan' + info.serveur, '');
		var info_scan_i = info_scan.split('#');
		var nb_scan_total_a_enr = document.getElementsByClassName('material spy').length;

		var tout_mess = document.getElementById('messageContent').innerHTML;
		tout_mess = tout_mess.split('switchView(\'spioDetails_');
		var nb_scan_plus_un = tout_mess.length;
		var id_rc;

		if (type_clique == 2) {
			for (var nb_scan_s = 1; nb_scan_s < nb_scan_plus_un; nb_scan_s++) {
				id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if (info_scan.indexOf(id_rc) >= 0 && document.getElementById(id_rc).checked == check_q) {
					for (var p = 0; p < info_scan_i.length; p++) {
						if (info_scan_i[p].indexOf(id_rc, 0) >= 0) { info_scan_i[p] = ''; }
					}
				}
			}
		}
		else if (type_clique == 1) {
			for (var nb_scan_s = 1; nb_scan_s < nb_scan_plus_un; nb_scan_s++) {
				id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if (info_scan.indexOf(id_rc, 0) >= 0) {
					for (var p = 0; p < info_scan_i.length; p++) {
						if (info_scan_i[p].indexOf(id_rc, 0) >= 0) { info_scan_i[p] = ''; }
					}
				}
			}
		}
		info_scan_i = info_scan_i.join('#');
		info_scan_i = info_scan_i.replace(/\#{2,}/g, "#");
		GM_setValue('scan' + info.serveur, info_scan_i);
		fadeBoxx(text.rep_mess_supri, 0, 3000);
	}

	function scan_pop_up() {
		var pop_up = $('div.showmessage[data-message-id]');
		if (!pop_up.length) {
			// il n'y a pas de popup
			return;
		}
		if (info.chrome) {
			$('.contentPageNavi a', pop_up).click(function () {
				setTimeout(waitAjaxSuccessPopup, 333);
			});
		}
		var msg_id = pop_up.attr('data-message-id');
		if ($('.textWrapper .material.spy', pop_up).length) {
			if (scan_preenrgistre == 1) {
				save_scan(info.serveur, msg_id, true, true);
			}
			var tout_supr = '';
			// tout_supr += '<li class="delete" ><a class="tips2 action" id="2" href=""><span class="icon icon_trash float_left" id="RF_icon_delMEssScan"></span><span class="text"  id="RF_delMEssScan">'+ text.del_scan_script +'</span></a></li>';
			tout_supr += '<li class="delete" ><a class="tips2 action" href=""><span class="icon icon_trash float_left" id="RF_icon_delScan"></span><span class="text"  id="RF_delScan">' + text.del_script + '</span></a></li>';
			tout_supr += '<li class="delete" ><a href=""><span class="icon float_left" style="background-position: 0 -64px; id="RF_icon_addScan"></span><span class="text" id="RF_addScan">' + text.add_scan_d + '</span></a></li>';
			var newElement = $(tout_supr);
			// $('#RF_delMEssScan', newElement).closest('a').click(function(e){supr_scan1(info.serveur);});
			$('#RF_delScan', newElement).closest('a').click(function (e) {
				e.preventDefault();
				supr_scan1(info.serveur);
			});
			$('#RF_addScan', newElement).closest('a').click(function (e) {
				e.preventDefault();
				save_scan(info.serveur, msg_id, true, true);
			});
			newElement.insertBefore('.toolbar .delete', pop_up);
		}
	}
//}

/*######################################### SCRIPT  ################################################## */

init2();

/////////////////// Scan des Rapports d'espionnage ///////////////////
if (info.page === 'messages') {
	function sauve_option2() {
		if (document.getElementById('messageContent')) {
			var scans = $('#mailz > tbody > tr[id^="spioDetails"]');
			if (!scans.length) {
				// pas de rapport d'espionnage disponible
				return;
			}
			// "Afficher le rapport d`espionnage complet" est coché
			// On a au moins un rapport d'espionnage
			var nb_scan_enregistre = 0;
			for (var i = 0; i < scans.length; i++) {
				if (scan_preenrgistre == 1) {
					if (save_scan(info.serveur, scans[i].id.replace('spioDetails_', ''), false)) {
						++nb_scan_enregistre;
					}
				}
			}
			if (nb_scan_enregistre > 0) {
				fadeBoxx(nb_scan_enregistre + ' ' + i18n('rep_mess_add'));
			}
		}
	}

	function safeWrap(f) {
		return function () {
			setTimeout.apply(window, [f, 0].concat([].slice.call(arguments)));
		};
	}

	// switch des actions suivant la catégorie
	function switchCat(cat) {
		switch (cat) {/*7 espionner , 5combat , 6joueur , 8expe,2 alli, 4 divers ^^*/
			case "9":
			case "7":
			case "10":
				sauve_option2();
				if (q_icone_mess == 1) { bouton_supr_scan_depuis_mess(); }
				break;
		}
	}

	// SCAN PREVOUERT
	if (info.firefox) {
		unsafeWindow.$(document).ajaxSuccess(safeWrap(function (e, xhr, settings) {
			//l'url de la requête ajax contient page=messages
			if (settings.url.indexOf("page=messages") == -1) return;
			if (settings.data.indexOf("displayPage") == -1) return;
			// on affiche l'onglet charge
			var cat = settings.data.replace(/^.*displayCategory=([\d-]*).*$/, "$1");
			switchCat(cat);
		}));
	} else if (info.chrome) {
		var waitAjaxSuccessPreouvert = function () {
			// on vérifie si l'image de chargement est encore là
			if ($('#messageContent>img').length) {
				console.log('[raid facile] Attente des messages');
				setTimeout(waitAjaxSuccessPreouvert, 333);
			} else {
				var form = $('#messageContent>form');
				// si on est sur le carnet d'adresse on ne fait rien
				if (!form.length) return;
				// récupération de la catégorie
				var cat = $('#messageContent>form').attr('action').replace(/^.*displayCategory=([\d-]*).*$/, "$1");
				switchCat(cat);
			}
		};
		// en cas de clic on attend que l'action se fasse
		$('.mailWrapper, #tab-msg').on('click keypress', function (e) {
			setTimeout(waitAjaxSuccessPreouvert, 333);
		});
		waitAjaxSuccessPreouvert();
	} else {
		alert('[raid facile] Erreur n°154000');
	}

	// SCAN POPUP
	if (info.firefox) {
		unsafeWindow.$(document).ajaxSuccess(safeWrap(function (e, xhr, settings) {
			//l'url de la requête ajax contient page=showmessage
			if (settings.url.indexOf("page=showmessage") == -1) return;
			scan_pop_up();
		}));
	} else if (info.chrome) {
		var waitAjaxSuccessPopup = function () {
			// on vérifie si l'image de chargement est encore là
			if ($('#messageContent>img').length) {
				console.log('[raid facile] Attente de la popup');
				setTimeout(waitAjaxSuccessPopup, 333);
			} else {
				var form = $('#messageContent>form');
				// si on est sur le carnet d'adresse on ne fait rien
				if (!form.length) return;
				scan_pop_up();
			}
		};
		// en cas de clic on attend que l'action se fasse
		$('.mailWrapper, #tab-msg').on('click keypress', function (e) {
			setTimeout(waitAjaxSuccessPopup, 333);
		});
		waitAjaxSuccessPopup();
	} else {
		alert('[raid facile] Erreur n°714452');
	}
}

/////////////////// TABLEAU ///////////////////
else if (info.page === 'tableauRaidFacile' || info.page === 'optionsRaidFacile') {
	var planetes = document.querySelectorAll('a.planetlink, a.moonlink');
	for (var i = 0; i < planetes.length; ++i) {
		planetes[i].setAttribute('href', planetes[i].getAttribute('href') + '#raidFacile=tableau&go');
	}

	/* ********************** On recupere les infos ************************/
	var url_2 = info.url.split('&raidefacil=scriptOptions')[0];
	var scanList = GM_getValue('scan' + info.serveur, '').split('#');
	var bbcode_export = ' ';

	if ((info.url.indexOf('&del_scan=', 0)) >= 0) {
		var numero_scan = info.url.split('del_scan=')[1].split('&')[0];
		scanList.splice(numero_scan, 1);
		GM_setValue('scan' + info.serveur, scanList.join('#'));
	}


/************************************** Trie du tableau ******************************************************/
	function trie_tableau(serveur, classementsecondaire, type_trie) {
		var scan_i = GM_getValue('scan' + serveur, '').split('#');
		var nb = scan_i.length;
		for (var h = 0; h < nb; h++) {// on split chaque scan en un tableau
			scan_i[h] = scan_i[h].split(';');
		}

		if (nb_scan_page != 0) {
			var num_page = info.url.split('&page_r=')[1];

			if (num_page == undefined || num_page == 1) {
				var nb_scan_deb = 0;
				var nb_scan_fin = nb_scan_page;
			}
			else if (num_page >= 1) {
				var nb_scan_deb = (parseInt(num_page) - 1) * nb_scan_page;
				var nb_scan_fin = parseInt(num_page) * nb_scan_page;
			}
		} else {
			var nb_scan_fin = nb;
			var nb_scan_deb = 0;
		}

		//("ccoordonee","cplanete","cdate","cprod_h","cressourcexh","cress","ccdr","ccdr_ress","cnb_v1","cnb_v2","cnb_d1","cnb_d2");
		//("1","3","0","20e","20d","12","8","20c","17","22","18","23");


		// pour classement par colone
		if (classementsecondaire != -1 && classementsecondaire != -2 && classementsecondaire != undefined)
			classement = classementsecondaire;

		if (parseInt(classement.replace(/[^0-9-]/g, "")) == 1) {//si le classement est par coordonee on fait que les coordonees soit classable
			for (var gh = 0; gh < nb; gh++) {
				if (scan_i[gh] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1) {
					if (scan_i[gh][9] != undefined && scan_i[gh][1].split(':')[1]) {

						//on recupere les coordonées
						var coordosplit = scan_i[gh][1].split(':');
						var galaxie = coordosplit[0].replace(/[^0-9-]/g, "");
						var systeme = coordosplit[1].replace(/[^0-9-]/g, "");
						var planette = coordosplit[2].replace(/[^0-9-]/g, "");

						// on fait ques les systeme  soit en 3 chiffre et les planetes soit en deux
						if (parseInt(systeme) < 100) {
							if (parseInt(systeme) < 10)
								systeme = '00' + '' + systeme;
							else
								systeme = '0' + '' + systeme;
						}
						if (parseInt(planette) < 10) {
							planette = '0' + '' + planette;
						}
						// on met les "nouvellle coordonée". avec '' pour bien que les system /galaxie ne se melange pas
						scan_i[gh][20] = parseInt(galaxie + '' + systeme + '' + planette);
					}
				}
			}
		}
		else if (classement == '20c') {//classement par cdr + ressources.
			for (var gh = 0; gh < nb; gh++) {
				if (scan_i[gh] != undefined) {
					if (scan_i[gh][9] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1) {
						//ressource
						var ressource_m = scan_i[gh][4];
						var ressource_c = scan_i[gh][5];
						var ressource_d = scan_i[gh][6];
						var ressource_total = parseInt(ressource_m) * q_taux_m + parseInt(ressource_c) * q_taux_c + parseInt(ressource_d) * q_taux_d;

						var pourcent = 50;
						if (scan_i[gh][24] == "ph")
							pourcent = 75;
						if (scan_i[gh][25] == "b1" || scan_i[gh][25] == "b2" || scan_i[gh][25] == "b3")
							pourcent = 100;

						//cdr possible avec flotte
						var cdr_possible_m = Math.round(parseInt(scan_i[gh][15]) * pourcent_cdr);
						var cdr_possible_c = Math.round(parseInt(scan_i[gh][16]) * pourcent_cdr);

						//cdr defense
						var cdr_def = scan_i[gh][21] ? scan_i[gh][21].split('/') : '?';
						if (cdr_def[0] != '?' && pourcent_cdr_def != 0 && cdr_def != 'undefined') {
							var cdr_possible_def_m = Math.round(parseInt(cdr_def[1]) * pourcent_cdr_def);
							var cdr_possible_def_c = Math.round(parseInt(cdr_def[2]) * pourcent_cdr_def);
						}
						else {//du a la transition des rapports qui ne comptait pas encore les cdr de defense
							var cdr_possible_def_m = 0;
							var cdr_possible_def_c = 0;
						}
						var cdr_possible_def_total = cdr_possible_def_m * q_taux_m + cdr_possible_def_c * q_taux_c;

						var cdr_ressource = ressource_total * (pourcent / 100) + cdr_possible_m * q_taux_m + cdr_possible_c * q_taux_c + cdr_possible_def_total;
						scan_i[gh][20] = cdr_ressource;
					}
					else {
						scan_i[gh][20] = '-1';
					}
				}
			}
		}
		else if (classement == '20d') {//classement des ressources dans x heures
			for (var gh = 0; gh < nb; gh++) {
				if (scan_i[gh] != undefined) {
					if (scan_i[gh][9] != undefined && scan_i[gh] != ';;;;;;;;;;;;;;;;;x;;' && scan_i[gh][1].split(':')[2]) {
						// batiment adversaire + prodh + resrrouce x h
						//+bat +prod/h
						var coordonee = scan_i[gh][1];
						var mine_array = scan_i[gh][19].split('/');
						var mine_m = mine_array[0];
						var mine_c = mine_array[1];
						var mine_d = mine_array[2];

						//ressource x h
						if (mine_array != '?/?/?' && coordonee) {
							var prod_t = calcule_prod(mine_m, mine_c, mine_d, coordonee, '?');
							var prod_m_h = prod_t.metal;
							var prod_c_h = prod_t.cristal;
							var prod_d_h = prod_t.deut;

							//ressource
							var ressource_m = scan_i[gh][4];
							var ressource_c = scan_i[gh][5];
							var ressource_d = scan_i[gh][6];
							var ressource_total = parseInt(ressource_m) + parseInt(ressource_c) + parseInt(ressource_d);

							var prod_m_xh = parseInt(prod_m_h) * (parseInt(prod_gg) / 60);
							var prod_c_xh = parseInt(prod_c_h) * (parseInt(prod_gg) / 60);
							var prod_d_xh = parseInt(prod_d_h) * (parseInt(prod_gg) / 60);

							var ressource_m_xh = parseInt(ressource_m) + prod_m_xh;
							var ressource_c_xh = parseInt(ressource_c) + prod_c_xh;
							var ressource_d_xh = parseInt(ressource_d) + prod_d_xh;
							var ressource_tt_xh = ressource_m_xh * q_taux_m + ressource_c_xh * q_taux_c + ressource_d_xh * q_taux_d;
							scan_i[gh][20] = ressource_tt_xh;
						}
						else {
							scan_i[gh][20] = '-1';
						}
					}
					else {
						scan_i[gh][20] = '-1';
					}
				}
			}
		}
		else if (classement == '20e') {//si c'est le classement par production par heure
			for (var gh = 0; gh < nb; gh++) {
				if (scan_i[gh] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1) {
					if (scan_i[gh][9] != undefined) {
						// batiment adversaire + prodh + resrrouce x h
						//+bat +prod/h
						var mine_array = scan_i[gh][19].split('/');
						var mine_m = mine_array[0];
						var mine_c = mine_array[1];
						var mine_d = mine_array[2];
						var coordonee = scan_i[gh][1];

						if (mine_array != '?/?/?') {
							var prod_t = calcule_prod(mine_m, mine_c, mine_d, coordonee, '?');

							var prod_m_h = prod_t.metal;
							var prod_c_h = prod_t.cristal;
							var prod_d_h = prod_t.deut;
							var prod_tot = parseInt(prod_m_h) * q_taux_m + parseInt(prod_c_h) * q_taux_c + parseInt(prod_d_h) * q_taux_d;

							scan_i[gh][20] = prod_tot;
						}
						else {
							scan_i[gh][20] = '-1';
						}
					}
					else {
						scan_i[gh][20] = '-1';
					}
				}
			}
		}
		else if (parseInt(classement.replace(/[^0-9-]/g, "")) == 12) {// classement par ressources
			for (var gh = 0; gh < nb; gh++) {
				if (scan_i[gh] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1) {
					if (scan_i[gh][9] != undefined) {
						//ressource
						var ressource_m = scan_i[gh][4];
						var ressource_c = scan_i[gh][5];
						var ressource_d = scan_i[gh][6];
						var ressource_total = parseInt(ressource_m) * q_taux_m + parseInt(ressource_c) * q_taux_c + parseInt(ressource_d) * q_taux_d;

						var pourcent = 50;
						if (scan_i[gh][24] == "ph")
							pourcent = 75;
						if (scan_i[gh][25] == "b1" || scan_i[gh][25] == "b2" || scan_i[gh][25] == "b3")
							pourcent = 100;

						scan_i[gh][20] = ressource_total * (pourcent / 100);
					}
					else {
						scan_i[gh][20] = '-1';
					}
				}
			}

		}

		if (classement == 2 || classement == 3) {			// si c'est un classement par rapport au nom de joueur ou de planète
			var sort_Info = function (a, b) {
				return strcmp(a[parseInt(classement.replace(/[^0-9-]/g, ""))], b[parseInt(classement.replace(/[^0-9-]/g, ""))]);
			};
		} else if (classement == 12 || classement == 1) { 	// si c'est par ressources ou par coordonnées
			var sort_Info = function (a, b) {
				return b[20] - a[20];
			};
		} else {
			var sort_Info = function (a, b) {
				return b[parseInt(classement.replace(/[^0-9-]/g, ""))] - a[parseInt(classement.replace(/[^0-9-]/g, ""))];
			};
		}

		if (parseInt(classement.replace(/[^0-9-]/g, "")) > -1)
			scan_i.sort(sort_Info);

		// si on a fait a coché la case reverse ou que l'on trie grace au colone
		if (reverse == '0' || type_trie == 'decroissant')
			scan_i.reverse();

		// On remet à x la valeur qui nous a servir pour le tri
		if (parseInt(classement.replace(/[^0-9-]/g, "")) == 20 || classement == 12 || classement == 1) {
			for (var gh = 0; gh < nb; gh++) {
				if (scan_i[gh] != undefined)
					scan_i[gh][20] = 'x';
			}
		}

		for (var h = 0; h < nb; h++) {
			scan_i[h] = scan_i[h].join(';');
		}
		GM_setValue('scan' + serveur, scan_i.join('#'));
	} // fin fonction trie_tableau

/*************************************************** ON AFFICHE LE TABLEAU ****************************************************************/

	function afficher_ligne_interieur_tab(serveur) {
		var scan_info = GM_getValue('scan' + serveur, '').split('#');
		var ligne_tableau = ' ';
		var nb = scan_info.length;

		var nb_scan_deb_fin = connaitre_scan_afficher(serveur, nb_scan_page, info.url, nb);
		var nb_scan_fin = nb_scan_deb_fin[0];
		var nb_scan_deb = nb_scan_deb_fin[1];

		var url_2 = info.url.split('&raidefacil=scriptOptions')[0];
		var bbcode_export = ' ';

		//var inactif_normal = GM_getValue('inactif', '');

		//on recupere les infos sur les attaques des 24h dernieres
		suprimmer_attaque_24h_inutile();
		var attaque_24h = GM_getValue('attaque_24h', '');
		var attaque_24h_split = attaque_24h.split('#');
		var attaque_24h_split2 = attaque_24h_split;
		for (var x = 0; x < attaque_24h_split.length; x++) {
			attaque_24h_split2[x] = attaque_24h_split[x].split('/');
		}

		// on regarde la planette selectionner(liste de droite des planettes)  pour connaitre la galaxie
		if (document.getElementsByName('ogame-planet-coordinates')[0]) {
			var coordonnee_slelec = document.getElementsByName('ogame-planet-coordinates')[0].content;
		}
		else {
			if (pos_depart != 'x:xxx:x') { var coordonnee_slelec = pos_depart; }
			else { var coordonnee_slelec = '0'; }
		}


		// on les utilises et les place
		var cptLigne = 0;
		for (var i = nb_scan_deb; i < nb_scan_fin; i++) {
			if (scan_info[i] != undefined && scan_info[i] != ';;;;;;;;;;;;;;;;;x;;') {
				var scan_info_i = scan_info[i].split(';');
				//on verifie si c'est ok pour l'afficher
				if (scan_info_i[9] != undefined && scan_info_i[1].split(':')[1] && (q_flo_vis == 1 || scan_info_i[9] != '?/?/?/?/?/?/?/?/?/?/?/?/?/') && (q_def_vis == 1 || scan_info_i[10] != '?/?/?/?/?/?/?/?/?/?')) {


					//on veut savoir si on n'affiche que les scan de la galaxie, si oui on vérifie la galaxie
					if((q_galaxie_scan == 1 &&  coordonnee_slelec.split(':')[0].replace( /[^0-9-]/g, "") == scan_info_i[1].split(':')[0].replace( /[^0-9-]/g, ""))
						|| q_galaxie_scan == 0
						|| (galaxie_demande == scan_info_i[1].split(':')[0].replace( /[^0-9-]/g, "") && q_galaxie_scan == 2)
						|| (q_galaxie_scan == 3 && (parseInt(coordonnee_slelec.split(':')[0].replace( /[^0-9-]/g, "")) + galaxie_plus_ou_moins) >= parseInt(scan_info_i[1].split(':')[0].replace( /[^0-9-]/g, "")) && (parseInt(coordonnee_slelec.split(':')[0].replace( /[^0-9-]/g, "")) - galaxie_plus_ou_moins) <= parseInt(scan_info_i[1].split(':')[0].replace( /[^0-9-]/g, "")))
						|| filtre_joueur != '' //si on filtre sur le joueur, on affiche toutes les coordonnées
					){

						//###### Gestion des filtres ######//
						var filtre = false;
						// on regarde ce qu'on affiche : planette + lune = 0, planette =1 , lune =2
						if(	(afficher_seulement == 0)
							|| (afficher_seulement == 1 && scan_info_i[14]== 1)
							|| (afficher_seulement == 2 && scan_info_i[14]!= 1)
						)
							// on regarde ce qu'on affiche : actif + inactif = 0, actif =1 , inactif =2
							if(	(filtre_actif_inactif == 0)
								|| (filtre_actif_inactif == 1 && scan_info_i[24]!= 'i' && scan_info_i[24]!= 'I' )
								|| (filtre_actif_inactif == 2 && (scan_info_i[24]== 'i' || scan_info_i[24]== 'I'))
							)
								// on regarde le joueur qu'on affiche
								if ((filtre_joueur == '') || (filtre_joueur != '' && filtre_joueur.toLowerCase() == scan_info_i[2].toLowerCase()))
									filtre = true;

						if (filtre) {
							// date
							var date_scan = scan_info_i[0];
							var datecc = new Date();
							datecc.setTime(date_scan);
							var date_final = datecc.getDate() + '/' + (datecc.getMonth() + 1) + '/' + datecc.getFullYear() + ' ' +
								datecc.getHours() + ':' + datecc.getMinutes() + ':' + datecc.getSeconds();


							// si la date est demander en chronos
							if (q_date_type_rep == 0) {
								var datecc2 = parseInt(info.startTime) - parseInt(date_scan);

								// Je peux avoir une diff de date entre l'heure de mon pc et celle du serveur
								if (document.getElementsByName('ogame-timestamp')[0])
									datecc2 = parseInt(document.getElementsByName('ogame-timestamp')[0].content) * 1000 - parseInt(date_scan);

								var seconde = Math.floor(datecc2 / 1000); // pour avoir le nb de seconde qui s'est ecouler depuis le scan.
								var minutes = Math.floor(seconde / 60);
								var heures = Math.floor(minutes / 60);
								var jours = Math.floor(heures / 24);
								seconde = Math.floor(seconde % 60);
								minutes = Math.floor(minutes % 60);
								heures = Math.floor(heures % 24);

								if (datecc2 != 0) {
									var date2 = '';
									if (jours > 0)
									{ date2 += jours + 'j '; }
									if (jours > 0 || heures > 0)
									{ date2 += ((heures < 10) ? '0' : '') + heures + 'h '; }
									if (jours > 0 || heures > 0 || minutes > 0)
									{ date2 += ((minutes < 10) ? '0' : '') + minutes + 'm '; }
									date2 += ((seconde < 10) ? '0' : '') + seconde + 's';
								}
								else { var date2 = '--:--:--'; }

							}
							else {
								var date2 = ((datecc.getDate() < 10) ? '0' : '') +
									datecc.getDate() + '/' +
									((datecc.getMonth() < 10) ? '0' : '') +
									(datecc.getMonth() + 1) + '/' +
									(datecc.getFullYear() - 2000) + ' ' +
									((datecc.getHours() < 10) ? '0' : '') +
									datecc.getHours() + ':' +
									((datecc.getMinutes() < 10) ? '0' : '') +
									datecc.getMinutes() + ':' +
									((datecc.getSeconds() < 10) ? '0' : '') +
									datecc.getSeconds();
							}


							// type de la planette
							var type_planette = scan_info_i[14];
							var l_q = '';
							if (type_planette != 1) { l_q = ' L'; }

							//nom joueur et planette
							var nom_joueur = scan_info_i[2];
							var nom_planete_complet = scan_info_i[3];
							if (nom_planete_complet.indexOf('1diez1') >= 0) {
								nom_planete_complet = nom_planete_complet.replace(/1diez1/g, "#");
							}
							var nom_planete = raccourcir(nom_planete_complet);

							//coordonee + url
							var coordonee = scan_info_i[1];
							var coordonee_split = coordonee.split(':');
							var galaxie = (coordonee_split[0]).replace(/[^0-9-]/g, "");
							var systeme = (coordonee_split[1]).replace(/[^0-9-]/g, "");
							var planette = (coordonee_split[2]).replace(/[^0-9-]/g, "");
							var url_galaxie = document.getElementById("menuTable").getElementsByClassName('menubutton ')[8].href;

							var url_fleet1 = document.getElementById("menuTable").getElementsByClassName('menubutton ')[7].href;
							if (espionnage_lien == 1) {
								var espionnage = url_fleet1 + '&galaxy=' + galaxie + '&system=' + systeme + '&position=' + planette + '&type=' + type_planette + '&mission=6';
							}
							else if (espionnage_lien == 0) {
								var espionnage = url_galaxie + '&galaxy=' + galaxie + '&system=' + systeme + '&position=' + planette + '&planetType=1&doScan=1';
							}

							var coordonee_fin = '<a href="' + url_galaxie + '&galaxy=' + galaxie + '&system=' + systeme + '&position=' + planette + '"';
							if (nom_j_q_q != 1 && nom_p_q_q != 1)
								coordonee_fin += ' title=" Planette: ' + nom_planete_complet.replace(/"/g, '&quot;') + ' | Joueur: ' + nom_joueur + '">';
							else if (nom_j_q_q != 1)
								coordonee_fin += ' title=" Joueur: ' + nom_joueur + '">';
							else if (nom_p_q_q != 1)
								coordonee_fin += ' title=" Planette: ' + nom_planete_complet.replace(/"/g, '&quot;') + '">';
							else
								coordonee_fin += '>';
							coordonee_fin += coordonee + l_q + '</a>';


							var pourcent = 50;
							var type_joueur = scan_info_i[24] ? scan_info_i[24] : '&nbsp';
							if (type_joueur == "ph") {
								type_joueur = '<span class="status_abbr_honorableTarget">' + type_joueur + '</span>';
								pourcent = 75;
							}
							else if (type_joueur == "o")
								type_joueur = '<span class="status_abbr_outlaw">' + type_joueur + '</span>';
							else if (type_joueur == "i")
								type_joueur = '<span class="status_abbr_inactive">' + type_joueur + '</span>';
							else if (type_joueur == "I")
								type_joueur = '<span class="status_abbr_longinactive">' + type_joueur + '</span>';
							else if (type_joueur == "f")
								type_joueur = '<span class="status_abbr_strong">' + type_joueur + '</span>';
							else if (type_joueur == "v")
								type_joueur = '<span class="status_abbr_vacation">' + type_joueur + '</span>';

							var type_honor = scan_info_i[25] ? scan_info_i[25] : '&nbsp';
							if (type_honor == "b1") {
								type_honor = '<span class="honorRank rank_bandit1"></span>';
								pourcent = 100;
							}
							else if (type_honor == "b2") {
								type_honor = '<span class="honorRank rank_bandit2"></span>';
								pourcent = 100;
							}
							else if (type_honor == "b3") {
								type_honor = '<span class="honorRank rank_bandit3"></span>';
								pourcent = 100;
							}
							else if (type_honor == "s1")
								type_honor = '<span class="honorRank rank_starlord1"></span>';
							else if (type_honor == "s2")
								type_honor = '<span class="honorRank rank_starlord2"></span>';
							else if (type_honor == "s3")
								type_honor = '<span class="honorRank rank_starlord3"></span>';

							//activite
							var activite = scan_info_i[7];
							if (activite == 'rien') {
								var activite_fin = ' ';
							} else {
								if (parseInt(activite) <= 15) {
									var activite_fin = '<img style="width: 12px; height: 12px;" src="http://gf1.geo.gfsrv.net/cdn12/b4c8503dd1f37dc9924909d28f3b26.gif" alt="' + activite + ' min " title="' + activite + ' min"/>';
								} else {
									var activite_fin = '<span style="background-color: #000000;border: 1px solid #FFA800;border-radius: 3px 3px 3px 3px;color: #FFA800;">' + activite + '</span>';
								}
							}

							//ressource
							var ressource_m = scan_info_i[4];
							var ressource_c = scan_info_i[5];
							var ressource_d = scan_info_i[6];
							var nb_pt = shipCount(parseInt(ressource_m), parseInt(ressource_c), parseInt(ressource_d), 5000, pourcent);
							var nb_gt = shipCount(parseInt(ressource_m), parseInt(ressource_c), parseInt(ressource_d), 25000, pourcent);
							var ressource_total = parseInt(ressource_m) + parseInt(ressource_c) + parseInt(ressource_d);

							if (question_rassemble_col == 0) {
								var ressource = '<acronym title="' + pourcent + '% de ressources pillables <br> ' + addPoints(nb_pt) + text.nb_pt + '/' + addPoints(nb_gt) + text.nb_gt + ' <br> ' + text.metal + ' : ' + addPoints(Math.round(parseInt(ressource_m) * (pourcent / 100))) + ' | ' + text.cristal + ' : ' + addPoints(Math.round(parseInt(ressource_c) * (pourcent / 100))) + ' | ' + text.deut + ' : ' + addPoints(Math.round(parseInt(ressource_d) * (pourcent / 100))) + '">' + addPoints(Math.round(ressource_total * (pourcent / 100))) + '</acronym>';
							}

							// vitesse minimum.
							var accronyme_temp_vol = vaisseau_vitesse_mini(tech_impul_a, tech_hyper_a, tech_combus_a, vaisseau_lent, coordonee);

							//cdr possible
							var cdr_possible = Math.round(parseInt(scan_info_i[8]) * pourcent_cdr);
							var cdr_possible_m = Math.round(parseInt(scan_info_i[15]) * pourcent_cdr);
							var cdr_possible_c = Math.round(parseInt(scan_info_i[16]) * pourcent_cdr);

							// on verifie que cdr possible existe et soit un chiffre
							if (cdr_possible == '?' || isNaN(cdr_possible)) { var cdr_aff = 0; cdr_possible = '?'; }
							else { var cdr_aff = cdr_possible; }

							// cdr de défense
							// on verifie que le cdr def est bien creer dans le scan info
							if (scan_info_i[21]) { var cdr_def = scan_info_i[21].split('/'); }
							else { var cdr_def = '?'; }
							if (cdr_def[0] != '?' && pourcent_cdr_def != 0 && cdr_def != 'undefined') {
								var cdr_possible_def = Math.round(parseInt(cdr_def[0]) * pourcent_cdr_def);
								var cdr_possible_def_m = Math.round(parseInt(cdr_def[1]) * pourcent_cdr_def);
								var cdr_possible_def_c = Math.round(parseInt(cdr_def[2]) * pourcent_cdr_def);
							}
							else {
								var cdr_possible_def = 0;
								var cdr_possible_def_m = 0;
								var cdr_possible_def_c = 0;
							}

							if (cdr_possible != '?') { cdr_possible = cdr_possible + cdr_possible_def; }
							else { cdr_possible = cdr_possible; }

							cdr_aff = cdr_aff + cdr_possible_def;
							cdr_possible_m = cdr_possible_m + cdr_possible_def_m;
							cdr_possible_c = cdr_possible_c + cdr_possible_def_c;

							if (isNaN(cdr_aff)) { cdr_aff = 0; }
							else { cdr_aff = cdr_aff; }

							if (question_rassemble_col == 0) {
								if (cdr_q_type_affiche == 0) {
									var cdr_aco = '<acronym title="' + addPoints(Math.ceil(cdr_aff / 20000)) + text.nb_rc + '<br>' + text.met_rc + ' : ' + addPoints(cdr_possible_m) + ' | ' + text.cri_rc + ' : ' + addPoints(cdr_possible_c) + ' ">' + addPoints(cdr_possible) + '</acronym>';
								}
								else {
									var cdr_aco = '<acronym title="' + addPoints(Math.ceil(cdr_aff / 20000)) + text.nb_rc + '<br>' + text.met_rc + ' : ' + addPoints(cdr_possible_m) + ' | ' + text.cri_rc + ' : ' + addPoints(cdr_possible_c) + ' ">' + addPoints(Math.ceil(cdr_aff / 20000)) + '</acronym>';
								}
							}

							// colonne cdr +  resource
							if (question_rassemble_col == 1) {
								var col_cdr = '<acronym title="' + pourcent + '% | ' + addPoints(nb_pt) + text.nb_pt + '/' + addPoints(nb_gt) + text.nb_gt + ' | ' + text.metal + ' : ' + addPoints(Math.round(parseInt(ressource_m) * (pourcent / 100))) + ' | ' + text.cristal + ' : ' + addPoints(Math.round(parseInt(ressource_c) * (pourcent / 100))) + ' | ' + text.deut + ' : ' + addPoints(Math.round(parseInt(ressource_d) * (pourcent / 100))) + '\n' + addPoints(Math.ceil(cdr_aff / 20000)) + text.nb_rc + ' | ' + text.met_rc + ' : ' + addPoints(cdr_possible_m) + ' | ' + text.cri_rc + ' : ' + addPoints(cdr_possible_c) + '">' + addPoints(cdr_aff + Math.round(ressource_total * (pourcent / 100))) + '</acronym>';
							}

							//recherhe adersersaire
							var recherche_ad = scan_info_i[13].split('/');
							var tech_arme_d = recherche_ad[0];
							var tech_bouclier_d = recherche_ad[1];
							var tech_protect_d = recherche_ad[2];

							//recupere vaisseau et defense
							var vaisseau_type = new Array(vari.pt, vari.gt, vari.cle, vari.clo, vari.cro, vari.vb, vari.vc, vari.rec, vari.esp, vari.bb, vari.sat, vari.dest, vari.edlm, vari.tra);
							var defense_type = new Array(i18n.get('lm'), i18n.get('lle'), i18n.get('llo'), i18n.get('gauss'), i18n.get('ion'), i18n.get('pla'), i18n.get('pb'), i18n.get('gb'), i18n.get('mic'), i18n.get('mip'));

							//type pour les different simulateur.
							var vaisseau_speed = new Array("ship_d0_0_b", "ship_d0_1_b", "ship_d0_2_b", "ship_d0_3_b", "ship_d0_4_b", "ship_d0_5_b", "ship_d0_6_b", "ship_d0_7_b", "ship_d0_8_b", "ship_d0_9_b", "ship_d0_10_b", "ship_d0_11_b", "ship_d0_12_b", "ship_d0_13_b");
							var def_speed = new Array("ship_d0_14_b", "ship_d0_15_b", "ship_d0_16_b", "ship_d0_17_b", "ship_d0_18_b", "ship_d0_19_b", "ship_d0_20_b", "ship_d0_21_b", "abm_b", "");

							var vaisseau_win = new Array("d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d12", "d13");
							var def_win = new Array("d14", "d15", "d16", "d17", "d18", "d19", "d20", "d21", "", "");

							var vaisseau_drag = new Array("numunits[1][0][k_t]", "numunits[1][0][g_t]", "numunits[1][0][l_j]", "numunits[1][0][s_j]", "numunits[1][0][kr]", "numunits[1][0][sc]", "numunits[1][0][ko]", "numunits[1][0][re]", "numunits[1][0][sp]", "numunits[1][0][bo]", "numunits[1][0][so]", "numunits[1][0][z]", "numunits[1][0][t]", "numunits[1][0][sk]");
							var def_drag = new Array("numunits[1][0][ra]", "numunits[1][0][l_l]", "numunits[1][0][s_l]", "numunits[1][0][g]", "numunits[1][0][i]", "numunits[1][0][p]", "numunits[1][0][k_s]", "numunits[1][0][g_s]", "missiles_available_v", "");

							var url_dragosim = '';
							var url_speedsim = '';
							var url_ogamewinner = '';

							// def et vaisseau variable
							var acronyme_vaisseau = ' ';
							var nb_totalvaisseau = 0;
							var acronyme_def = i18n.get('th_nd') + '<div class="splitLine"></div>';
							var nb_totaldef = 0;

							var vaisseau22 = scan_info_i[9];
							if (vaisseau22 != '?/?/?/?/?/?/?/?/?/?/?/?/?/?') {
								var vaisseau = vaisseau22.split('/');
								for (var k = 0; k < vaisseau.length; k++) {
									if (parseInt(vaisseau[k]) != 0) {
										acronyme_vaisseau = acronyme_vaisseau + ' | ' + vaisseau_type[k] + ' : ' + addPoints(parseInt(vaisseau[k]));
										nb_totalvaisseau = nb_totalvaisseau + parseInt(vaisseau[k]);

										url_speedsim = url_speedsim + '&amp;' + vaisseau_speed[k] + '=' + parseInt(vaisseau[k]);
										url_dragosim = url_dragosim + '&amp;' + vaisseau_drag[k] + '=' + parseInt(vaisseau[k]);
										url_ogamewinner = url_ogamewinner + '&amp;' + vaisseau_win[k] + '=' + parseInt(vaisseau[k]);
									}
								}
								nb_totalvaisseau = addPoints(nb_totalvaisseau);
							}
							else {
								var vaisseau = vaisseau22.split('/');
								acronyme_vaisseau = '?';
								nb_totalvaisseau = '?';
							}

							var defense2 = scan_info_i[10];
							if (defense2 != '?/?/?/?/?/?/?/?/?/?') {
								var defense = defense2.split('/');
								for (var k = 0; k < defense.length; k++) {
									if (parseInt(defense[k]) != 0) {
										acronyme_def = acronyme_def + '<br>' + defense_type[k] + ' : ' + addPoints(parseInt(defense[k]));

										url_speedsim = url_speedsim + '&amp;' + def_speed[k] + '=' + parseInt(defense[k]);
										url_dragosim = url_dragosim + '&amp;' + def_drag[k] + '=' + parseInt(defense[k]);
										url_ogamewinner = url_ogamewinner + '&amp;' + def_win[k] + '=' + parseInt(defense[k]);

										if (k != 8 && k != 9) {// si k n'est pas des missiles (interplanetaire ou de def)
											nb_totaldef = nb_totaldef + parseInt(defense[k]);
										}
									}
								}
								nb_totaldef = addPoints(nb_totaldef);
							} else {
								var defense = defense2.split('/');
								acronyme_def = '?';
								nb_totaldef = '?';
							}

							var acronyme_vaisseau2 = '';
							if (vaisseau_question == 1)
								acronyme_vaisseau2 = '<acronym title=" ' + acronyme_vaisseau + '">' + nb_totalvaisseau + '</acronym>';
							else if (vaisseau_question == 2 && (scan_info_i[22] == '?' || !scan_info_i[2]))
								acronyme_vaisseau2 = '<acronym title=" ' + acronyme_vaisseau + ',' + text.c_nbv + ' ' + nb_totalvaisseau + ' ">?</acronym>';
							else if (vaisseau_question == 2)
								acronyme_vaisseau2 = '<acronym title=" ' + acronyme_vaisseau + ',' + text.c_nbv + ' ' + nb_totalvaisseau + ' ">' + addPoints(parseInt(scan_info_i[22])) + '</acronym>';

							var acronyme_def2 = '';
							// -------------------------------------------------------------------------------------------------
							if (defense_question == 1)
								acronyme_def2 = '<div class="tooltipTitle">' + acronyme_def + '</div><acronym>' + nb_totaldef + '</acronym>';
							else if (defense_question == 2 && (scan_info_i[23] == '?' || !scan_info_i[23]))
								acronyme_def2 = '<div class="tooltipTitle">' + acronyme_def + ',' + text.c_nbd + ' ' + nb_totaldef + '</div><acronym>?</acronym>';
							else if (defense_question == 2)
								acronyme_def2 = '<div class="tooltipTitle>" ' + acronyme_def + ',' + text.c_nbd + ' ' + nb_totaldef + '</div><acronym>' + addPoints(parseInt(scan_info_i[23])) + '</acronym>';
							// -------------------------------------------------------------------------------------------------


							//url d'attaque		//am202 = pt / am203 = gt
							var url_fleet1 = document.getElementById("menuTable").getElementsByClassName('menubutton ')[7].href;
							var url_attaquer = url_fleet1 + '&galaxy=' + galaxie + '&system=' + systeme + '&position=' + planette + '&type=' + type_planette + '&mission=1';
							if (lien_raide_nb_pt_gt == 1) {
								var nb_pt2;
								if (nb_ou_pourcent == 1) {
									nb_pt2 = nb_pt + nb_pourcent_ajout_lien;
								} else {
									nb_pt2 = Math.ceil(nb_pt + (nb_pt / 100) * nb_pourcent_ajout_lien);
								}
								url_attaquer += '&am202=' + nb_pt2;
							} else if (lien_raide_nb_pt_gt == 0) {
								var nb_gt2;
								if (nb_ou_pourcent == 1) {
									nb_gt2 = nb_gt + nb_pourcent_ajout_lien;
								} else {
									nb_gt2 = Math.ceil(nb_gt + (nb_gt / 100) * nb_pourcent_ajout_lien);
								}
								url_attaquer += '&am203=' + nb_gt2;
							}

							// url de simulation
							if (q_techzero == 1 && recherche_ad[0] == "?") {
								var tech_arme_a_sim = 0;
								var tech_protect_a_sim = 0;
								var tech_bouclier_a_sim = 0;
								var tech_arme_d_sim = 0;
								var tech_bouclier_d_sim = 0;
								var tech_protect_d_sim = 0;
							}
							else {
								var tech_arme_a_sim = tech_arme_a;
								var tech_protect_a_sim = tech_protect_a;
								var tech_bouclier_a_sim = tech_bouclier_a;
								var tech_arme_d_sim = tech_arme_d;
								var tech_bouclier_d_sim = tech_bouclier_d;
								var tech_protect_d_sim = tech_protect_d;
							}

							if (simulateur == 1) {
								var url_simul = 'http://websim.speedsim.net/index.php?version=1&lang=' + vari.lang_speedsin + '&tech_a0_0=' + tech_arme_a_sim + '&tech_a0_1=' + tech_bouclier_a_sim + '&tech_a0_2=' + tech_protect_a_sim + '&engine0_0=' + tech_combus_a + '&engine0_1=' + tech_impul_a + '&engine0_2=' + tech_hyper_a + '&start_pos=' + coordonnee_slelec
									+ '&tech_d0_0=' + tech_arme_d_sim + '&tech_d0_1=' + tech_bouclier_d_sim + '&tech_d0_2=' + tech_protect_d_sim
									+ '&enemy_name=' + nom_planete_complet.replace(/"/g, '&quot;') + '&perc-df=' + (pourcent_cdr * 100) + '&enemy_pos=' + coordonee + '&enemy_metal=' + parseInt(ressource_m) + '&enemy_crystal=' + parseInt(ressource_c) + '&enemy_deut=' + parseInt(ressource_d) + url_speedsim
									+ '&uni_speed=' + vitesse_uni + '&perc-df=' + pourcent_cdr * 100 + '&plunder_perc=' + pourcent + '&del_techs=1&rf=1';
							}
							else if (simulateur == 0) {
								var url_simul = 'http://drago-sim.com/index.php?style=new&template=New&lang=' + vari.lang_dragosin + '&' + 'techs[0][0][w_t]=' + tech_arme_a_sim + '&techs[0][0][s_t]=' + tech_bouclier_a_sim + '&techs[0][0][r_p]=' + tech_protect_a_sim + '&engine0_0=' + tech_combus_a + '&engine0_1=' + tech_impul_a + '&engine0_2=' + tech_hyper_a + '&start_pos=' + coordonnee_slelec
									+ '&techs[1][0][w_t]=' + tech_arme_d_sim + '&techs[1][0][s_t]=' + tech_bouclier_d_sim + '&techs[1][0][r_p]=' + tech_protect_d_sim
									+ '&v_planet=' + nom_planete_complet.replace(/"/g, '&quot;') + '&debris_ratio=' + pourcent_cdr + '&v_coords=' + coordonee + '&v_met=' + parseInt(ressource_m) + '&v_kris=' + parseInt(ressource_c) + '&v_deut=' + parseInt(ressource_d) + url_dragosim;
							}
							else if (simulateur == 2) {
								var url_simul = 'http://www.gamewinner.fr/cgi-bin/csim/index.cgi?lang=fr?' + '&aattack=' + tech_arme_a_sim + '&ashield=' + tech_bouclier_a_sim + '&aarmory=' + tech_protect_a_sim
									+ '&dattack=' + tech_arme_d_sim + '&dshield=' + tech_bouclier_d_sim + '&darmory=' + tech_protect_d_sim
									+ '&enemy_name=' + nom_planete_complet.replace(/"/g, '&quot;') + '&enemy_pos=' + coordonee + '&dmetal=' + parseInt(ressource_m) + '&dcrystal=' + parseInt(ressource_c) + '&ddeut=' + parseInt(ressource_d) + url_ogamewinner;
							}

						// batiment adversaire + prodh + resrrouce x h
							//+bat +prod/h
							var mine_array = scan_info_i[19].split('/');
							var mine_m = mine_array[0];
							var mine_c = mine_array[1];
							var mine_d = mine_array[2];

							// si on a besoin de la production pour afficher une colone
							if (prod_h_q == 1 || prod_gg != 0 || q_vid_colo == 1) {
								if (mine_array != '?,?,?') {
									var prod_t = calcule_prod(mine_m, mine_c, mine_d, coordonee, '?');
									var prod_m_h = prod_t.metal;
									var prod_c_h = prod_t.cristal;
									var prod_d_h = prod_t.deut;
									var prod_tot = parseInt(prod_m_h) + parseInt(prod_c_h) + parseInt(prod_d_h);

									var acro_prod_h = '<acronym title=" ' + text.metal + ' : ' + addPoints(parseInt(prod_m_h)) + ' | ' + text.cristal + ' : ' + addPoints(parseInt(prod_c_h)) + ' | ' + text.deut + ' : ' + addPoints(parseInt(prod_d_h)) + ' ">' + addPoints(prod_tot) + '</acronym>';

									//ressource x h
									var prod_m_xh = Math.round(parseInt(prod_m_h) * (parseInt(prod_gg) / 60));
									var prod_c_xh = Math.round(parseInt(prod_c_h) * (parseInt(prod_gg) / 60));
									var prod_d_xh = Math.round(parseInt(prod_d_h) * (parseInt(prod_gg) / 60));
									var prod_tt_xh = prod_m_xh + prod_c_xh + prod_d_xh;

									var ressource_m_xh = parseInt(ressource_m) + prod_m_xh;
									var ressource_c_xh = parseInt(ressource_c) + prod_c_xh;
									var ressource_d_xh = parseInt(ressource_d) + prod_d_xh;
									var ressource_tt_xh = ressource_m_xh + ressource_c_xh + ressource_d_xh;

									var acro_ress_xh = '<acronym title=" ' + text.metal + ' : ' + addPoints(ressource_m_xh) + '(+' + addPoints(prod_m_xh) + ') | ' + text.cristal + ' : ' + addPoints(ressource_c_xh) + '(+' + addPoints(prod_c_xh) + ') | ' + text.deut + ' : ' + addPoints(ressource_d_xh) + '(+' + addPoints(prod_d_xh) + ') | +' + addPoints(prod_tt_xh) + ' ">' + addPoints(ressource_tt_xh) + '</acronym>';
								}
								else {
									var acro_prod_h = '<acronym title="' + text.batiment_non_visible + '"> ? </acronym>';
									var acro_ress_xh = '<acronym title="' + text.batiment_non_visible + '"> ? </acronym>';
								}
							}

							//case simuler en mode exporter vers un autre simulateur.
							if (simulateur == 3) {
								var saut = '\n';
								var tabulation = '&nbsp;&nbsp;&nbsp;&nbsp;';
								var export_scan_simul = 'Ressources sur Mirage ' + coordonee + ' (joueur \'' + nom_joueur + '\') le ' + datecc.getMonth() + '-' + datecc.getDate() + ' ' + datecc.getHours() + 'h ' + datecc.getMinutes() + 'min ' + datecc.getSeconds() + 's'
									+ saut
									+ saut + 'Métal:' + tabulation + addPoints(parseInt(ressource_m)) + tabulation + 'Cristal:' + tabulation + addPoints(parseInt(ressource_c))
									+ saut + 'Deutérium:' + tabulation + addPoints(parseInt(ressource_d)) + tabulation + ' Energie:' + tabulation + '5.000'
									+ saut
									+ saut + 'Activité'
									+ saut + 'Activité'
									+ saut + 'Activité signifie que le joueur scanné était actif sur la planète au moment du scan ou qu`un autre joueur a eu un contact de flotte avec cette planète à ce moment là.'
									+ saut + 'Le scanner des sondes n`a pas détecté d`anomalies atmosphériques sur cette planète. Une activité sur cette planète dans la dernière heure peut quasiment être exclue.'
									+ saut + 'Flottes';
								var vaisseau_nom = new Array(vari.pt, vari.gt, vari.cle, vari.clo, vari.cro, vari.vb, vari.vc, vari.rec, vari.esp, vari.bb, vari.sat, vari.dest, vari.edlm, vari.tra);
								var q_saut_v = 0;
								if (vaisseau22 != '?/?/?/?/?/?/?/?/?/?') {
									var vaisseau = vaisseau22.split('/');
									for (var k = 0; k < vaisseau.length; k++) {
										if (parseInt(vaisseau[k]) != 0) {
											if (q_saut_v < 3) { export_scan_simul = export_scan_simul + ' | ' + vaisseau_nom[k] + tabulation + ' : ' + addPoints(parseInt(vaisseau[k])); q_saut_v++; }
											else { export_scan_simul = export_scan_simul + saut + ' | ' + vaisseau_nom[k] + tabulation + ' : ' + addPoints(parseInt(vaisseau[k])); q_saut_v = 0; }
										}
									}
								}

								export_scan_simul = export_scan_simul + saut + 'Défense';
								var defense_nom = new Array(vari.lm, vari.lle, vari.llo, vari.gauss, vari.ion, vari.pla, vari.pb, vari.gb, vari.mic, vari.mip);
								var q_saut = 0;
								if (defense2 != '?/?/?/?/?/?/?/?/?/?') {
									var defense = defense2.split('/');
									for (var k = 0; k < defense.length; k++) {
										if (parseInt(defense[k]) != 0) {
											if (q_saut < 3) { export_scan_simul = export_scan_simul + ' | ' + defense_nom[k] + tabulation + ' : ' + addPoints(parseInt(defense[k])); q_saut++; }
											else { export_scan_simul = export_scan_simul + saut + ' | ' + defense_nom[k] + tabulation + ' : ' + addPoints(parseInt(defense[k])); q_saut = 0; }
										}
									}
								}

								export_scan_simul = export_scan_simul + saut + 'Bâtiment'
								+ saut + vari.mine_m + tabulation + mine_m + tabulation + vari.mine_c + tabulation + mine_c
								+ saut + vari.mine_d + tabulation + mine_d + tabulation
								+ saut + 'Recherche'
								+ saut + vari.tech_arm + tabulation + tech_arme_d + tabulation + vari.tech_bouc + tabulation + tech_bouclier_a + tabulation
								+ saut + vari.tech_pro + tabulation + tech_protect_d
								+ saut + 'Probabilité de contre-espionnage : 0 %';
							}

							//compteur d'attaque
							if (q_compteur_attaque == 1) {//si il est activé
								var coordonee2_ss_crochet = galaxie + ':' + systeme + ':' + planette;
								if (attaque_24h.indexOf(coordonee2_ss_crochet) > -1) {//si il est pas compté.
									var compteur = 0;
									for (var s = 0; s < attaque_24h_split.length; s++) {
										if (attaque_24h_split2[s][1] == coordonee2_ss_crochet) {
											compteur++;
										}
									}
									var attaque_deja_fait = compteur;
								}
								else {
									var attaque_deja_fait = 0;
								}
							}

							//ligne du tableau <tr> de toute les infos du scan
							cptLigne++;
							ligne_tableau += '\n<tr class="' + coordonee + '" id="tr_' + i + '">';
							var num_scan = nb_scan_deb + cptLigne;
							ligne_tableau += '<td class="right">' + num_scan + '.</td>';
							ligne_tableau += '<td><input type="checkbox" name="delcase" value="' + i + '" id="check_' + i + '"/></td>';
							ligne_tableau += '<td class="marqueur"></td>';

							if (nom_j_q_q == 1)
								ligne_tableau += '<td class="left">' + nom_joueur + '</td>';
							if (coor_q_q == 1)
								ligne_tableau += '<td class="coordonee">' + coordonee_fin + '</td>';
							ligne_tableau += '<td>' + type_honor + '</td>';
							ligne_tableau += '<td>' + type_joueur + '</td>';
							ligne_tableau += '<td>' + activite_fin + '</td>';

/* 							var indexof_inactif = inactif_normal.indexOf(nom_joueur);
							if(q_inactif == 0 && indexof_inactif != -1)
								var inactif_nom_j = '('+'<span style="color:#4A4D4A">i</span>'+')';
							else
								var inactif_nom_j = '';
							if(nom_p_q_q == 1)
								ligne_tableau += '<td>' + nom_planete + inactif_nom_j +  '</td>';
							if(q_inactif == 1 && indexof_inactif != -1)
								ligne_tableau += '<td>' + '<input type="checkbox" checked="checked" name="inactif" value="'+ nom_joueur +'"  class="inactif" id="inactif_'+ i +'"/>' +  '</td>';
							else if(q_inactif == 1 && indexof_inactif == -1)
								ligne_tableau += '<td>' + '<input type="checkbox" name="inactif" value="'+ nom_joueur +'"  class="inactif" id="inactif_'+ i +'"/>' +  '</td>'; */
							if (nom_p_q_q == 1)
								ligne_tableau += '<td title="' + nom_planete_complet.replace(/"/g, '&quot;') + '">' + nom_planete + '</td>';

							if (date_affiche == 1)
								ligne_tableau += '<td class="right">' + date2 + '</td>';
							if (tps_vol_q == 1)
								ligne_tableau += '<td>' + accronyme_temp_vol + '</td>';
							if (prod_h_q == 1)
								ligne_tableau += '<td>' + acro_prod_h + '</td>';
							if (prod_gg != 0)
								ligne_tableau += '<td>' + acro_ress_xh + '</td>';
							if (q_vid_colo == 1)
								ligne_tableau += '<td>' + calcul_dernier_vidage(ressource_m, ressource_c, ressource_d, prod_m_h, prod_c_h, prod_d_h, date_scan, mine_m) + '</td>';

							if (question_rassemble_col == 0) {
								if (pt_gt != 0)
									ligne_tableau += '<td>' + addPoints(nb_pt) + '/' + addPoints(nb_gt) + '</td>';
								ligne_tableau += '<td class="right">' + ressource + '</td>';
								ligne_tableau += '<td class="right">' + cdr_aco + '</td>';
							}
							else {
								ligne_tableau += '<td class="right">' + col_cdr + '</td>';
								if (pt_gt != 0)
									ligne_tableau += '<td>' + addPoints(nb_pt) + '/' + addPoints(nb_gt) + '</td>';
							}
							if (vaisseau_question != 0)
								ligne_tableau += '<td class="right">' + acronyme_vaisseau2 + '</td>';
							if (defense_question != 0)
								ligne_tableau += '<td class="right htmlTooltip">' + acronyme_def2 + '</td>';
							if (tech_q == 1)
								ligne_tableau += '<td class="right">' + tech_arme_d + '/' + tech_bouclier_d + '/' + tech_protect_d + '</td>';

							if (q_compteur_attaque == 1)
								ligne_tableau += '<td class="nombreAttaque">' + attaque_deja_fait + '</td>';

							ligne_tableau += '<td> <a href="' + espionnage + '" title="' + text.espionner + '"> <img src="http://gf2.geo.gfsrv.net/45/f8eacc254f16d0bafb85e1b1972d80.gif" height="16" width="16"></a></td>';
							ligne_tableau += '<td> <a class="del1_scan" data-id="' + i + '" title="' + text.eff_rapp + '" ><img src="http://gf1.geo.gfsrv.net/99/ebaf268859295cdfe4721d3914bf7e.gif" height="16" width="16"></a></td>';
							var target;
							if (stockageOption.get('attaquer nouvel onglet') === 1) {
								target = '';
							} else if (stockageOption.get('attaquer nouvel onglet') === 2) {
								target = ' target="_blank"';
							} else {
								target = ' target="attaque"';
							}
							ligne_tableau += '<td class="boutonAttaquer"> <a href="' + url_attaquer + '" title="' + text.att + '"' + target + '><img src="http://gf1.geo.gfsrv.net/9a/cd360bccfc35b10966323c56ca8aac.gif" height="16" width="16"></a></td>';
							if (q_mess == 1) {
								var url_href = 'index.php?page=showmessage&session=' + info.session + '&ajax=1&msg_id=' + scan_info_i[11] + '&cat=7';
								ligne_tableau += '<td><a class="overlay" href="' + url_href + '" id="' + scan_info_i[11] + '"><img src="http://snaquekiller.free.fr/ogame/messages.jpg" height="16" width="16"/></a></td>';
							}
							if (simulateur != 3 && q_lien_simu_meme_onglet == 1)
								ligne_tableau += '<td> <a href="' + url_simul + '" title="' + text.simul + '" target="_blank"><img src="http://snaquekiller.free.fr/ogame/simuler.jpg" height="16" width="16"></a></td></tr>';
							else if (simulateur != 3 && q_lien_simu_meme_onglet != 1)
								ligne_tableau += '<td> <a href="' + url_simul + '" title="' + text.simul + '" target="RaideFacileSimul"><img src="http://snaquekiller.free.fr/ogame/simuler.jpg" height="16" width="16"></a></td></tr>';
							else
								ligne_tableau += '<td> <a href="#" title="' + text.simul + '" id="simul_' + i + '" class="lien_simul_' + i + '"><img src="http://snaquekiller.free.fr/ogame/simuler.jpg" height="16" width="16"></a></td></tr>';
							if (simulateur == 3) {
								ligne_tableau += '<tr style="display:none;" id="textarea_' + i + '" class="textarea_simul_' + i + '">' + '<TD COLSPAN=20> <textarea style="width:100%;background-color:transparent;color:#999999;text-align:center;">' + export_scan_simul + '</textarea></td></tr>';
							}

							/**************** BBCODE EXPORT **************/
							// bbcode_export = bbcode_export + coordonee +'==>';
							bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[1] + bbcode_balisem[8] + nom_joueur + '' + bbcode_balisef[8];
							if (coor_q_q == 1) { bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[2] + bbcode_balisem[8] + ' ==> ' + coordonee + '' + bbcode_balisef[8]; }
							// bbcode_export = bbcode_export +'==>' + activite_fin +  '';
							if (nom_p_q_q == 1) { bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[3] + bbcode_balisem[8] + ' ==> ' + nom_planete_complet + '' + bbcode_balisef[8]; }
							bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[4] + bbcode_balisem[8] + ' ==> ' + addPoints(parseInt(ressource_m)) + 'metal ,' + addPoints(parseInt(ressource_c)) + 'cristal ,' + addPoints(parseInt(ressource_d)) + 'deut (' + nb_pt + '/' + nb_gt + ')' + '' + bbcode_balisef[8];
							bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[5] + bbcode_balisem[8] + ' ==> ' + addPoints(cdr_possible_m) + ' metal ,' + addPoints(cdr_possible_c) + ' cristal ,' + addPoints(Math.round(cdr_possible / 25000)) + ' rc ' + bbcode_balisef[8];
							if (acronyme_vaisseau != ' ') { bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[6] + bbcode_balisem[8] + ' ==> ' + acronyme_vaisseau + '' + bbcode_balisef[8]; }
							if (acronyme_vaisseau != ' ') { bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[7] + bbcode_balisem[8] + ' ==> ' + acronyme_def + '\n' + bbcode_balisef[8]; }
							else { bbcode_export = bbcode_export + '\n\n'; }
						} else
							nb_scan_fin++; // on rajoute un scan a afficher
					} else
						nb_scan_fin++;
				} else if (scan_info[i] && scan_info[i].indexOf(';;;;;;;;;;;;;;;;;x;;') === -1) {
					scan_info[i] = '';
					nb_scan_fin++;
				}
				else
					nb_scan_fin++;
			} else if (scan_info[i] && scan_info[i].indexOf(';;;;;;;;;;;;;;;;;x;;') === -1)
				scan_info[i] = '';
		}
		document.getElementById('corps_tableau2').innerHTML = ligne_tableau;

		/**************** BBCODE EXPORT **************/{
			var bbcode_haut = ' ';
			if (q_centre == 1) { bbcode_haut = bbcode_haut + bbcode_baliseo[10] + bbcode_balisem[10]; }
			if (q_cite == 1) { bbcode_haut = bbcode_haut + bbcode_baliseo[4]; }
			bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[1] + bbcode_balisem[8] + text.th_nj + '' + bbcode_balisef[8];
			if (coor_q_q == 1) { bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[2] + bbcode_balisem[8] + ' ==> ' + text.th_coo + '' + bbcode_balisef[8]; }
			// bbcode_haut = bbcode_haut +'==>' + activite_fin +  '';
			if (nom_p_q_q == 1) { bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[3] + bbcode_balisem[8] + ' ==> ' + text.th_np + '' + bbcode_balisef[8]; }
			bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[4] + bbcode_balisem[8] + ' ==> ' + text.th_ress + ' metal , cristal ,deut (pt/gt)' + '' + bbcode_balisef[8];
			bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[5] + bbcode_balisem[8] + ' ==> ' + text.cdr_pos + ' metal , cristal ,' + text.nb_rc + bbcode_balisef[8];
			bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[6] + bbcode_balisem[8] + ' ==> pt/gt/cle/clo/cro/vb/vc/rec/esp/bb/sat/dest/edlm/tra' + bbcode_balisef[8];
			bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[7] + bbcode_balisem[8] + ' ==> lm/lle/llo/gauss/ion/plas/pb/gb/mic/mip \n\n' + bbcode_balisef[8];

			bbcode_export = bbcode_export + '\n\n\n' + bbcode_baliseo[1] + bbcode_baliseo[5] + 'http://board.ogame.fr/index.php?=Thread&postID=10726546#post10726546' + bbcode_balisem[5] + 'par Raide-Facile' + bbcode_balisef[5] + bbcode_balisef[1];
			if (q_centre == 1) { bbcode_export = bbcode_export + bbcode_balisef[10]; }
			if (q_cite == 1) { bbcode_export = bbcode_export + bbcode_balisef[4]; }

			document.getElementById('text_bbcode').innerHTML = bbcode_haut + bbcode_export;
		}
	}

	/*************** anti reload automatique de la page. ***************/{
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("language", "javascript");
		script.text = 'function reload_page() {' + '}';
		document.body.appendChild(script);
	}

	/*************** Option du scripts ***************/{
		var option_html = '<div id="option_script" style="display:none;text-align:center;" >'
				+ '<div class="sectionTitreOptions" data-cible="mon_compte"> '+ text.moncompte +' </div>'
				+ '<div class="sectionOptions" id="mon_compte">'
					+ '<table class="tableau_interne">'
					+ '<tr><td colspan="4" class="titre_interne"><strong>'+ text.vos_techno +' </strong></td></tr>'
						+ '<tr><td><label for="valeur_arme">• '+ vari.tech_arm +' </label></td><td><input type="text" id="valeur_arme" value="'+ tech_arme_a +'" style="width:20px;" /></td></tr>'
						+ '<tr><td><label for="valeur_boulier">• '+ vari.tech_bouc +' </label></td><td><input type="text" id="valeur_boulier" value="'+ tech_bouclier_a +'" style="width:20px;" /></td></tr>'
						+ '<tr><td><label for="valeur_protection">• '+ vari.tech_pro +' </label></td><td><input type="text" id="valeur_protection" value="'+ tech_protect_a +'" style="width:20px;" /></td></tr>'

						+ '<tr><td><label for="valeur_combustion">• '+ vari.tech_com +' </label></td><td><input type="text" id="valeur_combustion" value="'+ tech_combus_a +'" style="width:20px;" /></td></tr>'
						+ '<tr><td><label for="valeur_impulsion">• '+ vari.tech_imp +' </label></td><td><input type="text" id="valeur_impulsion" value="'+ tech_impul_a +'" style="width:20px;" /></td></tr>'
						+ '<tr><td><label for="valeur_hyper">• '+ vari.tech_hyp +' </label></td><td><input type="text" id="valeur_hyper" value="'+ tech_hyper_a +'" style="width:20px;" /></td></tr>'

					+ '<tr></tr><tr></tr>'
					+ '<tr><td colspan="4" class="titre_interne"><strong> '+ text.other_st +'</strong></td></tr>'
					+ '<tr><td><label for="valeur_co">• '+ text.q_coord +' </label></td><td><input type="text" id="valeur_co" class="valeur_coordonee" value="'+ pos_depart +'" style="width:55px;" /></td></tr>'
					+ '<tr><td><label for="vaisseau_vite">• '+ text.q_vaisseau_min +' </label></td><td><select name="vaisseau_vite" id="vaisseau_vite">'
						+ '<option value="0" id="selec_q_0" >'+ vari.pt +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 0) +')'+ '</option>'
						+ '<option value="1" id="selec_q_1">'+ vari.gt +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 1) +')'+ '</option>'
						+ '<option value="2" id="selec_q_2">'+ vari.cle +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 2) +')'+ '</option>'
						+ '<option value="3" id="selec_q_3">'+ vari.clo +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 3) +')'+ '</option>'
						+ '<option value="4" id="selec_q_4">'+ vari.cro +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 4) +')'+ '</option>'
						+ '<option value="5" id="selec_q_5">'+ vari.vb +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 5) +')'+ '</option>'
						+ '<option value="6" id="selec_q_6">'+ vari.vc +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 6) +')'+ '</option>'
						+ '<option value="7" id="selec_q_7">'+ vari.rec +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 7) +')'+ '</option>'
						+ '<option value="8" id="selec_q_8">'+ vari.esp +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 8) +')'+ '</option>'
						+ '<option value="9" id="selec_q_9">'+ vari.bb +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 9) +')'+ '</option>'
						+ '<option value="10" id="selec_q_10">'+ vari.dest +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 10) +')'+ '</option>'
						+ '<option value="11" id="selec_q_11">'+ vari.edlm +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 11) +')'+ '</option>'
						+ '<option value="12" id="selec_q_12">'+ vari.tra +'('+ vitesse_vaisseau(tech_impul_a ,tech_hyper_a ,tech_combus_a, 12) +')'+ '</option>'
					+ ' </select></td></tr>'
					+ '<tr><td><label for="cdr_pourcent">• '+ text.pourcent +' </label></td><td><input type="text" id="cdr_pourcent"  value="'+ (pourcent_cdr*100) +'" style="width:20px;" /></td></tr>'
					+ '<tr><td><label for="cdr_pourcent_def">• '+ text.pourcent_def +' </label></td><td><input type="text" id="cdr_pourcent_def"  value="'+ (pourcent_cdr_def*100) +'" style="width:20px;" /></td></tr>'
					+'</table>'
				+'</div>'


				+ '<div class="sectionTitreOptions" data-cible="choix_var">'+text.choix_certaine_vari +' </div>'
				+ '<div class="sectionOptions" id="choix_var">'
					+ '<table class="tableau_interne">'
					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.selec_scan_st +'</strong></td></tr>'
						+ '<tr><td><label for="val_res_min" >• '+ text.q_apartir +' </label></td><td><input type="text" id="val_res_min" value="'+ numberConverter.toPrettyString(nb_scan_accpte) +'" class="w50"></td></tr>'
						+ '<tr><td><label for="valeur_cdr_mini">• '+ text.q_cdrmin +' </label></td><td><input type="text" id="valeur_cdr_mini"  value="'+ numberConverter.toPrettyString(valeur_cdr_mini) +'" class="w50"></td></tr>'
						+ '<tr><td><label for="valeur_tot_mini">• '+ text.q_totmin +' </label></td><td><input type="text" id="valeur_tot_mini"  value="'+ numberConverter.toPrettyString(valeur_tot_mini) +'" class="w50"></td></tr>'
						+ '<tr><td><label>• '+ text.q_prend_type +' </label></td><td> <label for="prend_type0"><input type="radio" name="prend_type" value="0" id="prend_type0">'+ text.rep_0_prend1 +'<span class="x">'+ valeur_cdr_mini +'</span> '+ text.rep_0_prend2 +'<span class="y">'+nb_scan_accpte +'</span></label><br> <label for="prend_type1"><input type="radio" name="prend_type" value="1" id="prend_type1">'+ text.rep_1_prend1 +'<span class="x">'+ valeur_cdr_mini +'</span> '+ text.rep_1_prend2 +'<span class="y">'+nb_scan_accpte +'</span></label><br> <label for="prend_type2"><input type="radio" name="prend_type" value="2" id="prend_type2">'+ text.rep_2_prend +'<span class="z">'+ valeur_tot_mini +'</span></label> </td></tr>'

					//0 date ; 1 coordonee ; 2 joueur ; 3 nom planète ; 4 ressource metal; 5 cristal ; 6 deut ; 7 activite  ; 8 cdr possible ; 9 vaisseau; 10 defense ; 11 idrc ; 12 ressource total,13 reherche , 14 type de planète (lune ou planète)
					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.classement_st+'</strong></td></tr>'
						+ '<tr><td><label for="classement">• '+ text.q_class +' </label></td><td><select name="classement" id="classement">'
							+ '<option value="0" id="selec_0" >'+ text.c_date +'</option>'
							+ '<option value="1" id="selec_1">'+ text.c_coo +'</option>'
							+ '<option value="2" id="selec_2">'+ text.c_nj +'</option>'
							+ '<option value="3" id="selec_3">'+ text.c_np +'</option>'
							+ '<option value="4" id="selec_4">'+ text.c_met +'</option>'
							+ '<option value="5" id="selec_5">'+ text.c_cri +'</option>'
							+ '<option value="6" id="selec_6">'+ text.c_deu +'</option>'
							+ '<option value="7" id="selec_7">'+ text.c_acti +'</option>'
							+ '<option value="8" id="selec_8">'+ text.c_cdr +'</option>'
							+ '<option value="17a" id="selec_9">'+ text.c_nbv +'</option>'
							+ '<option value="18a" id="selec_10">'+ text.c_nbd +'</option>'
							+ '<option value="12" id="selec_12">'+ text.c_ress +'</option>'
							+ '<option value="14" id="selec_14">'+ text.c_type +'</option>'
							+ '<option value="20c" id="selec_15">'+ text.c_cdrress +'</option>'
							+ '<option value="20d" id="selec_16">'+ text.ressourcexh +'</option>'
							+ '<option value="20e" id="selec_17">'+ text.prod_classement +'</option>'
							+ '<option value="22" id="selec_22">'+ text.c_vaisseau_valeur +'</option>'
							+ '<option value="23" id="selec_23">'+ text.c_defense_valeur +'</option>'
						+ ' </select></td></tr>'
						+ '<tr><td><label>• '+ text.q_reverse +' </label></td><td> <label for="q_reverse_decroissant">'+ text.descroissant +'</label>&nbsp<input type="radio" name="q_reverse" value="1" id="q_reverse_decroissant" /> <label for="q_reverse_croissant">'+ text.croissant +'</label>&nbsp<input type="radio" name="q_reverse" value="0" id="q_reverse_croissant" /></td></tr>'
						+ '<tr><td><label>• '+ text.taux_classement_ressource +' </label></td><td> <label for="q_taux_m">'+ text.taux_m +'</label>&nbsp<input type="text" id="q_taux_m"  value="'+ q_taux_m +'" style="width:50px;" />&nbsp<label for="q_taux_c">'+ text.taux_c +'</label>&nbsp<input type="text" id="q_taux_c"  value="'+ q_taux_c +'" style="width:50px;" />&nbsp<label for="q_taux_d">'+ text.taux_d +'</label>&nbsp<input type="text" id="q_taux_d"  value="'+ q_taux_d +'" style="width:50px;" /></td></tr>'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.option_save_scan_st +'</strong></td></tr>'
						+ '<tr><td><label>• '+ text.q_sae_auto +' </label></td><td> <label for="save_auto_scan_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="option_scan_save_o" value="1" id="save_auto_scan_oui" /> <label for="save_auto_scan_non">'+ text.non +'</label>&nbsp<input type="radio" name="option_scan_save_o" value="0" id="save_auto_scan_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.remp_scn +' </label></td><td>  <label for="scan_remplace_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="scan_remplace" value="1" id="scan_remplace_oui" /> <label for="scan_remplace_non">'+ text.non +'</label>&nbsp<input type="radio" name="scan_remplace" value="0" id="scan_remplace_non" /></td></tr>'
						+ '<tr><td><label for="jourrr">• '+ text.q_garde +' </label></td><td> <input type="text" id="jourrr" class="jours_suprime"  value="'+ jours_opt +'" style="width:20px;" /> '+ text.jours +'&nbsp<input type="text" class="heures_suprime"  value="'+ heures_opt +'" style="width:20px;" />&nbsp'+ text.heures +'&nbsp<input type="text" class="minutes_suprime"  value="'+ minutes_opt +'" style="width:20px;" />&nbsp'+ text.min +'&nbsp</td></tr>'
						+ '<tr><td><label for="nb_max_def">• '+ text.q_nb_max_def +' </label></td><td><input id="nb_max_def" type="text" value="'+ nb_max_def +'" style="width:60px;" /></td></tr>'


					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.other_st +'</strong></td></tr>'
						+ '<tr><td><label>• '+ text.import_q +' </label> </td><td><label><input type="radio" name="import_q" value="1" id="import_rajoute"> '+ text.import_rajoute +'</label><br><label><input type="radio" name="import_q" value="0" id="import_remplace"> '+ text.import_remplace +'</label></td></tr>'
						+ '<tr><td><label>• '+ text.lien_raide_nb_pt_gt +' </label> </td><td><label for="lien_raide_nb_pt_remplit">'+ text.nb_pt +'</label>&nbsp<input type="radio" name="lien_raide_nb_pt_gt" value="1" id="lien_raide_nb_pt_remplit" />&nbsp<label for="lien_raide_nb_gt_remplit">'+ text.nb_gt +'</label>&nbsp<input type="radio" name="lien_raide_nb_pt_gt" value="0" id="lien_raide_nb_gt_remplit" />&nbsp<label for="lien_raide_nb_pt_gt2">'+ text.rien +'</label>&nbsp<input type="radio" name="lien_raide_nb_pt_gt" value="2" id="lien_raide_nb_pt_gt2" /></td></tr>'
						+ '<tr><td><label>• '+ text.lien_raide_ajout_nb_pourcent +' </label></td><td> <input type="text" id="nb_pourcent_ajout_lien"  value="'+ nb_pourcent_ajout_lien +'" style="width:20px;" />&nbsp<select name="nb_ou_pourcent" id="nb_ou_pourcent"><option value="0"> %</option> <option value="1"> en plus</option></select></td></tr>'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ i18n('raccourcis') +'</strong></td></tr>'
						+ '<tr><td><label>'+ i18n('shortcut_attack_next') +'</label></td><td><input type="text" id="shortcut_attack_next" value="'+ stockageOption.get('touche raid suivant') +'" title="'+i18n('ce_nombre_est_keycode')+'" style="width:20px" readonly> <button id="shortcut_attack_next_modify" class="ui-button ui-widget ui-state-default ui-corner-all">'+ i18n('modifier') +'</button></td></tr>'
					+'</table>'
				+'</div>'


				+ '<div class="sectionTitreOptions" data-cible="color_ligne"> '+ text.couleur_ligne +' </div>'
				+ '<div class="sectionOptions" id="color_ligne">'
					+ '<table class="tableau_interne">'
					+ '<tr><td colspan="4" class="titre_interne"><strong>'+ text.q_color +'</strong></td></tr>'
					+ '<tr><td></td><td><strong>Aller</strong></td><td><strong>Retour</strong></td></tr>'
					+ '<tr><td><label for="att1">• '+ text.attt +' </label> </td><td><input id="att1" type="text" class="att" value="'+ col_att +'" style="width:60px;background-color:'+ col_att +';" /></td><td><input id="att1_r" type="text" class="att_r" value="'+ col_att_r +'" style="width:60px;background-color:'+ col_att_r +';" /></td></tr>'
					+ '<tr><td><label for="att2">• '+ text.attt +' (2)</label> </td><td><input id="att2" type="text" class="att" value="'+ stockageOption.get('couleur attaque2') +'" style="width:60px;background-color:'+ stockageOption.get('couleur attaque2') +';" /></td><td><input id="att2_r" type="text" class="att_r" value="'+ stockageOption.get('couleur attaque2 retour') +'" style="width:60px;background-color:'+ stockageOption.get('couleur attaque2 retour') +';" /></td></tr>'
					+ '<tr><td><label for="att_group">• '+ text.ag +' </label> </td><td><input id="att_group" type="text" class="att_group" value="'+ col_att_g +'" style="width:60px;background-color:'+ col_att_g +';" /></td><td><input id="att_group_r" type="text" class="att_group_r" value="'+ col_att_g_r +'" style="width:60px;background-color:'+ col_att_g_r +';" /></td></tr>'
					+ '<tr><td><label for="det">• '+ text.det +' </label> </td><td><input id="det" type="text" class="det" value="'+ col_dest +'" style="width:60px;background-color:'+ col_dest +';" /></td><td><input id="det_r" type="text" class="det_r" value="'+ col_dest_r +'" style="width:60px;background-color:'+ col_dest_r +';" /></td></tr>'
					+ '<tr><td><label for="colEspio">• '+ localization.missions[6] +'</label> </td><td><input id="colEspio" type="text" value="'+ stockageOption.get('couleur espionnage') +'" style="width:60px;background-color:'+ stockageOption.get('couleur espionnage') +';" /></td></tr>'
					+'</table>'
				+ '</div>'


				+ '<div class="sectionTitreOptions" data-cible="choix_affichage"> '+ text.option_affichage +' </div>'
				+ '<div class="sectionOptions" id="choix_affichage">'
					+ '<table class="tableau_interne">'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.affichage_changement_colonne +'  </strong></td></tr>'
						+ '<tr><td><label>• '+ text.q_date_type +' </label>  </td><td><label for="date_type_heure"> '+ text.date_type_heure +'</label>&nbsp<input type="radio" name="q_date_type" value="1" id="date_type_heure" />  <label for="date_type_chrono">'+ text.date_type_chrono +'</label>&nbsp<input type="radio" name="q_date_type" value="0" id="date_type_chrono" /></td></tr>'
						+ '<tr><td><label>• '+ text.cdr_q +' </label> </td><td> <label for="recycleur_type"> '+ text.recyclc +'</label>&nbsp<input type="radio" name="recycleur_type" value="1" id="recycleur_type_affichage_recyleur" /> <label for="recycleur_type_affichage_ressource">'+ text.ressousrce +'</label>&nbsp<input type="radio" name="recycleur_type" value="0" id="recycleur_type_affichage_ressource" /></td></tr>'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.changement_boutondroite +'  </strong></td></tr>'
						+ '<tr><td><label>• '+ text.q_simul +' </label>  </td><td><label for="sim_q_dra">'+ text.drago +'</label>&nbsp<input type="radio" name="q_sim" value="0" id="sim_q_dra" /><br><label for="sim_q_speed">'+ text.speed +'</label>&nbsp<input type="radio" name="q_sim" value="1" id="sim_q_speed" /><br><label for="sim_q_ogwin">'+ text.ogwinner +'</label>&nbsp<input type="radio" name="q_sim" value="2" id="sim_q_ogwin" /><br><label for="sim_q_autre">'	+ text.simu_exte +'</label>&nbsp<input type="radio" name="q_sim" value="3" id="sim_q_autre" /></td></tr>'
						+ '<tr><td><label>• '+ text.mess_q +' </label>  </td><td><label for="mess_origine_aff_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_mess" value="1" id="mess_origine_aff_oui" /> <label for="mess_origine_aff_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_mess" value="0" id="mess_origine_aff_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.lienespi +' </label>  </td><td><label for="espionn_galaxie">'+ text.page_g +'</label>&nbsp<input type="radio" name="espionn" value="0" id="espionn_galaxie" /> <label for="espionn_fleet">'+ text.page_f +'</label>&nbsp<input type="radio" name="espionn" value="1" id="espionn_fleet" /></td></tr>'
						+ '<tr><td><label>• Le lien attaquer s\'ouvre dans</label></td><td><select id="rf_attaquer_ouvredans" style="width:210px;"><option value="1"'+(stockageOption.get('attaquer nouvel onglet') === 1 ? ' selected':'')+'>L\'onglet actuel</option><option value="2"'+(stockageOption.get('attaquer nouvel onglet') === 2 ? ' selected':'')+'>Un nouvel onglet</option><option value="3"'+(stockageOption.get('attaquer nouvel onglet') === 3 ? ' selected':'')+'>Toujours le même nouvel onglet</option></select></td></tr>'
						+ '<tr><td><label>• '+ text.q_lien_simu_meme_onglet +' </label>  </td><td><label for="q_lien_simu_meme_onglet_non">'+ text.rep_onglet_norm +'</label>&nbsp<input type="radio" name="q_lien_simu_meme_onglet" value="1" id="q_lien_simu_meme_onglet_non" /> <label for="q_lien_simu_meme_onglet_oui">'+ text.rep_onglet_autre +'</label>&nbsp<input type="radio" name="q_lien_simu_meme_onglet" value="0" id="q_lien_simu_meme_onglet_oui" /></td></tr>'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.affichage_colonne +'  </strong></td></tr>'
						+ '<tr><td><label>• '+ text.nom_j_q +' </label></td><td><label for="nom_joueur_affi_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="nom_j_q" value="1" id="nom_joueur_affi_oui" />  <label for="nom_joueur_affi_non">'+ text.non +'</label>&nbsp<input type="radio" name="nom_j_q" value="0" id="nom_joueur_affi_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.coor_q +' </label></td><td><label for="coord_affi_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="coor_q" value="1" id="coord_affi_oui" />  <label for="coord_affi_non">'+ text.non +'</label>&nbsp<input type="radio" name="coor_q" value="0" id="coord_affi_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.nom_p_q +' </label></td><td><label for="nom_planet_affi_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="nom_p_q" value="1" id="nom_planet_affi_oui" />  <label for="nom_planet_affi_non">'+ text.non +'</label>&nbsp<input type="radio" name="nom_p_q" value="0" id="nom_planet_affi_non" /></td></tr>'
//						+ '<tr><td><label>• '+ text.nom_p_q +' </label></td><td><label for="nom_planet_affi_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="nom_p_q" value="1" id="nom_planet_affi_oui" />  <label for="nom_planet_affi_non">'+ text.non +'</label>&nbsp<input type="radio" name="nom_p_q" value="0" id="nom_planet_affi_non" /> <label for="nom_planet_affi_autre">'+ text.autre_planette +'</label>&nbsp<input type="radio" name="nom_p_q" value="2" id="nom_planet_affi_autre" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_date +' </label></td><td><label for="date_affi_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="date_q" value="1" id="date_affi_oui" />  <label for="date_affi_non">'+ text.non +'</label>&nbsp<input type="radio" name="date_q" value="0" id="date_affi_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.tps_vol +' </label></td><td><label for="tps_vol_afficher_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="tps_vol" value="1" id="tps_vol_afficher_oui" />  <label for="tps_vol_afficher_non">'+ text.non +'</label>&nbsp<input type="radio" name="tps_vol" value="0" id="tps_vol_afficher_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_prod +' </label></td><td><label for="prod_h_aff_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="prod_h_q" value="1" id="prod_h_aff_oui" />  <label for="prod_h_aff_non">'+ text.non +'</label>&nbsp<input type="radio" name="prod_h_q" value="0" id="prod_h_aff_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_afficher_dernier_vid_colo +' </label></td><td><label for="aff_vid_colo_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_vid_colo" value="1" id="aff_vid_colo_oui" /> <label for="aff_vid_colo_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_vid_colo" value="0" id="aff_vid_colo_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_pt_gt +' </label></td><td><label for="q_pt_gt_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_pt_gt" value="1" id="q_pt_gt_oui" /> <label for="q_pt_gt_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_pt_gt" value="0" id="q_pt_gt_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.question_rassemble_cdr_ress +' </label></td><td><label for="rassemble_cdr_ress_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="rassemble_q" value="1" id="rassemble_cdr_ress_oui" /> <label for="rassemble_cdr_ress_non">'+ text.non +'</label>&nbsp<input type="radio" name="rassemble_q" value="0" id="rassemble_cdr_ress_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_ress_h +'</label></td><td><input type="text" class="ress_nb_j"  value="'+ prod_j_g +'" style="width:20px;" />&nbsp'+ text.jours +'&nbsp<input type="text" class="ress_nb_h"  value="'+ prod_h_g +'" style="width:20px;" />&nbsp'+ text.heures +'&nbsp<input type="text" class="ress_nb_min"  value="'+ prod_min_g +'" style="width:20px;" />&nbsp'+ text.min +'</td></tr> '
						+ '<tr><td><label>• '+ text.vaisseau_q +' </label></td><td><label for="vaisseau_q_n">'+ text.non +'</label>&nbsp<input type="radio" name="vaisseau_q" value="0" id="vaisseau_q_n" />  <label for="vaisseau_q_nb">'+ text.defense_nb +'</label>&nbsp<input type="radio" name="vaisseau_q" value="1" id="vaisseau_q_nb" /> <label for="vaisseau_q_val">'+ text.defense_valeur +'</label>&nbsp<input type="radio" name="vaisseau_q" value="2" id="vaisseau_q_val" /></td></tr>'
						+ '<tr><td><label>• '+ text.defense_q +' </label> </td><td><label for="defense_q_n">'+ text.non +'</label>&nbsp<input type="radio" name="defense_q" value="0" id="defense_q_n" />  <label for="defense_q_nb">'+ text.defense_nb +'</label>&nbsp<input type="radio" name="defense_q" value="1" id="defense_q_nb" /> <label for="defense_q_val">'+ text.defense_valeur +'</label>&nbsp<input type="radio" name="defense_q" value="2" id="defense_q_val" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_tech +' </label></td><td><label for="tech_aff_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="tech_q" value="1" id="tech_aff_oui" />  <label for="tech_aff_non">'+ text.non +'</label>&nbsp<input type="radio" name="tech_q" value="0" id="tech_aff_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_compteur_attaque +' </label>  </td><td><label for="compteur_attaque_aff_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_compteur_attaque" value="1" id="compteur_attaque_aff_oui" /> <label for="compteur_attaque_aff_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_compteur_attaque" value="0" id="compteur_attaque_aff_non" /></td></tr>'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.affichage_global +'  </strong></td></tr>'
						+ '<tr><td><label>• '+ text.q_galaxie_scan +' </label> </td><td><label for="scan_galaxie_cours_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_galaxie_scan" value="1" id="scan_galaxie_cours_oui" />&nbsp<label for="scan_galaxie_cours_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_galaxie_scan" value="0" id="scan_galaxie_cours_non" /><br/><label for="scan_galaxie_autre">'+ text.other +'</label>&nbspG&nbsp<input type="text" id="galaxie_demande"  value="'+ galaxie_demande +'" style="width:20px;" />&nbsp<input type="radio" name="q_galaxie_scan" value="2" id="scan_galaxie_autre" /><br/><label for="scan_galaxie_plus_ou_moin">'+ text.galaxie_plus_ou_moins + '</label>&nbsp<input type="text" id="galaxie_demande_plus_moin_text"  value="'+ galaxie_plus_ou_moins +'" style="width:20px;" />&nbsp<input type="radio" name="q_galaxie_scan" value="3" id="scan_galaxie_plus_ou_moin" /></td></tr>'
						+ '<tr><td><label>• '+ text.afficher_seulement +' </label>  </td><td><label for="afficher_lune_planet">'+ text.toutt +'</label>&nbsp<input type="radio" name="afficher_seulement" value="1" id="afficher_lune_planet" /> <label for="afficher_planet_seul">'+ text.planete_sel +'</label>&nbsp<input type="radio" name="afficher_seulement" value="0" id="afficher_planet_seul" />&nbsp<label for="afficher_lune_seul">'+ text.lune +'</label>&nbsp<input type="radio" name="afficher_seulement" value="2" id="afficher_lune_seul" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_afficher_ligne_def_nvis +' </label>  </td><td><label for="aff_lign_def_invisible_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_def_vis" value="1" id="aff_lign_def_invisible_oui" /> <label for="aff_lign_def_invisible_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_def_vis" value="0" id="aff_lign_def_invisible_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.q_afficher_ligne_flo_nvis +' </label>  </td><td><label for="aff_lign_flot_invisible_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_flo_vis" value="1" id="aff_lign_flot_invisible_oui" /> <label for="aff_lign_flot_invisible_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_flo_vis" value="0" id="aff_lign_flot_invisible_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.page +'</label> </td><td><input type="text" id="nb_scan_page" value="'+ nb_scan_page +'" style="width:40px;" /> </td></tr>'

					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong> '+ text.other_st +'</strong></td></tr>'
						+ '<tr><td><label>• '+ text.q_techn_sizero +' </label>  </td><td><label for="q_techzero_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_techzero" value="1" id="q_techzero_oui" /> <label for="q_techzero_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_techzero" value="0" id="q_techzero_non" /></td></tr>'
						+ '<tr><td><label>• '+ text.tableau_raide_facile +' </label> </td><td>+ <input type="text" id="tableau_raide_facile_q" value="'+ tableau_raide_facile_value +'" style="width:40px;" />&nbsppx</td></tr>'
						+ '<tr><td><label>• '+ text.question_afficher_icone_mess +' </label>  </td><td><label for="icone_parti_mess_oui">'+ text.oui +'</label>&nbsp<input type="radio" name="q_icone_mess" value="1" id="icone_parti_mess_oui" /> <label for="icone_parti_mess_non">'+ text.non +'</label>&nbsp<input type="radio" name="q_icone_mess" value="0" id="icone_parti_mess_non" /></td></tr>'

					+'</table>'
				+ '</div>'

				// option bbcode
				+ '<div class="sectionTitreOptions" data-cible="option_bbcode_interieur"> BBCode </div>'
				+ '<div class="sectionOptions" id="option_bbcode_interieur">'
					+'<table class="tableau_interne">'
					+ '<tr></tr><tr></tr><tr><td colspan="4" class="titre_interne"><strong>Couleurs : </strong></td></tr>'
						+ '<tr><td><label>• '+ text.color +'1</label></td><td><input type="text" id="col_1" value="'+ couleur2[1] +'" style="width:60px;background-color:'+ couleur2[1] +';" /></td></tr>'
						+ '<tr><td><label>• '+ text.color +'2</label></td><td><input type="text" id="col_2" value="'+ couleur2[2] +'" style="width:60px;background-color:'+ couleur2[2] +';" /></td></tr>'
						+ '<tr><td><label>• '+ text.color +'3</label></td><td><input type="text" id="col_3" value="'+ couleur2[3] +'" style="width:60px;background-color:'+ couleur2[3] +';" /></td></tr>'
						+ '<tr><td><label>• '+ text.color +'4</label></td><td><input type="text" id="col_4" value="'+ couleur2[4] +'" style="width:60px;background-color:'+ couleur2[4] +';" /></td></tr>'
						+ '<tr><td><label>• '+ text.color +'5</label></td><td><input type="text" id="col_5" value="'+ couleur2[5] +'" style="width:60px;background-color:'+ couleur2[5] +';" /></td></tr>'
						+ '<tr><td><label>• '+ text.color +'6</label></td><td><input type="text" id="col_6" value="'+ couleur2[6] +'" style="width:60px;background-color:'+ couleur2[6] +';" /></td></tr>'
						+ '<tr><td><label>• '+ text.color +'7</label></td><td><input type="text" id="col_7" value="'+ couleur2[7] +'" style="width:60px;background-color:'+ couleur2[7] +';" /></td></tr>'
					+ '<tr><td><label>• '+ text.text_cite +' </label></td><td>'+ text.oui +'&nbsp<input type="radio" name="cite" value="1" id="cite1" />&nbsp'+ text.non +'&nbsp<input type="radio" name="cite" value="0" id="cite0" /></td></tr>'
					+ '<tr><td><label>• '+ text.text_centre +' </label></td><td>'+ text.oui +'&nbsp<input type="radio" name="centre" value="1" id="centre1" />&nbsp'+ text.non +'&nbsp<input type="radio" name="centre" value="0" id="centre0" /></td></tr>'
					+ '<tr><td><label>• '+ text.balise_centre +' </label></td><td> '+ text.balise1_center +'&nbsp<input type="radio" name="centre_type" value="1" id="centre_type1" />&nbsp'+ text.balise2_center +'&nbsp<input type="radio" name="centre_type" value="0" id="centre_type0" /></td></tr>'
					+ '<tr><td><label>• '+ text.balise_url +' </label></td><td> '+ text.balise1_url +'&nbsp<input type="radio" name="url_type" value="1" id="url_type1" />&nbsp'+ text.balise2_url +'&nbsp<input type="radio" name="url_type" value="0" id="url_type0" /></td></tr>'
					+'</table>'
				+ '</div>'

				//option de langue
				+ '<div class="sectionTitreOptions" data-cible="choix_langue"> '+ text.option_langue +' </div>'
				+ '<div class="sectionOptions" id="choix_langue">'
					+ '<BR /><label>• '+ text.q_langue +' </label>'
						+ '<select name="langue" id="langue" class="w200" style="min-width:120px">'
						+ '<option value="fr">'+ text.francais +'</option>'
						+ '<option value="en">'+ text.anglais +'</option>'
						+ '<option value="es">'+ text.spagnol +'</option>'
						+ '<option value="ro">'+ text.roumain +'</option>'
						// + '<option value="2" id="langue2">'+ text.autre +'</option>'
					+ ' </select>'
				+ '</div>'

				+ '<input type="submit" value="'+ text.save_optis +'" id="sauvegarder_option" href=# style="margin-top:5px;"/></div>';
}

//########### TABLEAU A AFFICHER ##########
		var texte_a_afficher =  '';

		/************** TABLEAU INGAME ***************/

		if (nb_scan_page != 0) {// on affiche les numeros pages
			var page_bas = '<span id="page" >Page : ';
			var num_page = info.url.split('&page_r=')[1];
			var scan_info = GM_getValue('scan' + info.serveur, '').split('#');
			var nb = scan_info.length;
			var nb_page_poss = Math.ceil(nb / nb_scan_page);

			if (num_page == undefined || num_page == 1 || num_page == '') { num_page = 1; }
			for (var i = 1; i < (nb_page_poss + 1); i++) {
				if (i != num_page) {
					page_bas = page_bas + ' <a href="' + url_2 + '&amp;raidefacil=scriptOptions&amp;page_r=' + i + '" >' + i + '</a>';
				}
				else {
					page_bas = page_bas + ' ' + i;
				}

				if (i != nb_page_poss) { page_bas = page_bas + ','; }
			}
			page_bas = page_bas + '</span>';
		}
		else { var page_bas = '<span id="page" ></span>'; }

		var filtres = '<div id="filtres"><select name="choix_affichage2" id="choix_affichage2" class="w100">'
							+ '<option value="0" id="tout" >'+ text.toutt +'</option>'
							+ '<option value="1" id="planete_seul" >'+ text.planete_sel +'</option>'
							+ '<option value="2" id="lune_seul" >'+ text.lune +'</option>'
							+ '</select>  ';
		filtres += '<select name="filtre_actif_inactif" id="filtre_actif_inactif" class="w100">'
							+ '<option value="0" >'+ text.toutt +'</option>'
							+ '<option value="1" >'+ text.filtre_actif +'</option>'
							+ '<option value="2" >'+ text.filtre_inactif +'</option>'
							+ '</select>  ';
		filtres += text.th_nj +': <input type="text" id="filtre_joueur" value="" style="width:140px;" />  ';
		filtres += '<input type="submit" value="' + text.filtrer + '" id="change_value_affiche" href=# /></div>';

		/**************** tete tableau + les titres des colonnes ****************/{
		var titre_div = '<div id="raide_facile_titre"><div style="background-color:#1A2128;color:#6F9FC8;padding:5px;text-align:center;border-bottom: 1px solid black;font-size:18px;">'+i18n.get('raid facile')+ ' - version ' + info.version +'</div>'
					+'<a style="font-size:10px;cursor:pointer;" id="htmlclique" data-cible="text_html_bbcode">[Export Forum]</a> '
					+'<a style="font-size:10px;cursor:pointer;" id="imp_exp_clique" data-cible="div_import_exp">[Import/Export de sauvegarde]</a> '
					// +'<a style="font-size:10px;cursor:pointer;" id=info_news_clique >[Info]</a> '
					+'<a style="font-size:10px;cursor:pointer;" id="optionclique" class="htmlTooltip"><div class="tooltipTitle">'+ iconeNew('Version 8.0') +'<br>Depuis la version 8.0<br>Le lien pour afficher les options est dans le menu de gauche : <div class="menu_icon"><div class="menuImage traderOverview highlighted"></div></div></div>[Option]</a></div>';

		var haut_tableau = '<table id="tableau_raide_facile" cellspacing="0" cellpadding="0">';
		var titre_colonne_tableau = '\n<thead id=haut_table2 style="background-color:#1A2128;color:#6F9FC8;"><tr><th></th><th></th><th></th>';

		if(nom_j_q_q == 1)
			titre_colonne_tableau += '<th id="cjoueur"><a>'+ text.th_nj +'</a></th>';
		if(coor_q_q == 1)
			titre_colonne_tableau += '\n<th id="ccoordonee" ><a>'+ text.th_coo +'</a></th>';
		titre_colonne_tableau += '\n<th></th>';
		titre_colonne_tableau += '\n<th></th>';
		titre_colonne_tableau += '\n<th></th>';
		if(nom_p_q_q == 1)
			titre_colonne_tableau += '\n<th id="cplanete"><a>'+ text.th_np +'</a></th>';
		if(date_affiche == 1)
			titre_colonne_tableau += '\n<th id="cdate"><a>'+ text.dated +'</a></th>\n';
		if(tps_vol_q == 1)
			titre_colonne_tableau += '\n<th id="ctmps_vol"><a>'+ text.tmp_vol_th +'</a></th>\n';
		if(prod_h_q == 1)
			titre_colonne_tableau += '\n<th id="cprod_h"><a>'+ text.prod_h_th +'</a></th>\n';
		if(prod_gg != 0)
			titre_colonne_tableau += '\n<th id="cressourcexh"><a>'+ text.ressource_xh_th +'</a></th>\n';
		if(q_vid_colo != 0)
			titre_colonne_tableau += '\n<th>'+ text.th_h_vidage +'</th>\n';
		if(question_rassemble_col == 0)
		{
			if(pt_gt != 0)
				titre_colonne_tableau += '\n<th id="cfleet">'+ text.th_fleet +'</th>';
			titre_colonne_tableau += '\n<th id="cress"><a>'+ text.th_ress +'</a></th>';
			if(cdr_q_type_affiche == 0)
				titre_colonne_tableau += '<th id="ccdr"><a>' + text.cdr_pos+'</a></th>';
			else if(cdr_q_type_affiche == 1)
				titre_colonne_tableau += '<th id="ccdr"><a>' + text.nb_recycl+'</a></th>';
		}else{
			titre_colonne_tableau += '\n<th id="ccdr_ress"><a>'+ text.th_ress_cdr_col +'</a></th>';
			if(pt_gt != 0)
				titre_colonne_tableau += '\n<th id="cfleet"><a>'+ text.th_fleet +'</a></th>';
		}
		if(vaisseau_question != 0)
			titre_colonne_tableau += '\n<th id="cnb_v'+vaisseau_question +'"><a>'+ text.th_nv +'</a></th>\n';
		if(defense_question != 0)
			titre_colonne_tableau += '<th id="cnb_d'+defense_question +'"><a>'+ text.th_nd +'</a></th>';
		if(tech_q != 0)
			titre_colonne_tableau += '\n<th>'+ text.th_tech +'</th>';
		if(q_compteur_attaque == 1)
			titre_colonne_tableau += '\n<th title="Nombre d\'attaque dans les dernières 24h + Nombre d\'attaque en cours">#</th>';
	//Bouton
		titre_colonne_tableau += '\n<th class="RF_icon"></th>';
		titre_colonne_tableau += '\n<th class="RF_icon"></th>';
		titre_colonne_tableau += '\n<th class="RF_icon"></th>';
		titre_colonne_tableau += '\n<th class="RF_icon"></th>';
		titre_colonne_tableau += '\n<th class="RF_icon"></th>';

		titre_colonne_tableau += '\n</tr>\n</thead>\n'
						+ '\n<tbody id="corps_tableau2" > \n</tbody>'
						// + '\n<tbody id=corps_tableau2>'	+ ligne_tableau	+ '\n</tbody>'
						+ '\n</table>';
		}

		/**************** HTML/BBCODE EXPORT **************/{
			var html_bbcode = '<div id="text_html_bbcode"><center style="margin-left: auto; margin-right: auto; width: 99%;">';
			html_bbcode += '<textarea style="margin-top:5px; margin-bottom:10px; width:100%;background-color:black;color:#999999;text-align:center;" id="text_html" >'+
							'</textarea>';
			html_bbcode += '<textarea style="margin-top:5px; margin-bottom:10px; width:100%;background-color:black;color:#999999;text-align:center;" id="text_bbcode" >'+
							'</textarea>';
			html_bbcode += '</center></div>';
		}

		/**************** IMPORT / EXPORT **************/{
			var import_export = '<div id="div_import_exp" style="text-align:center">';
			import_export += '<input type="submit" id="export_script" value="'+ i18n('export_scan_se') +'" />';
			import_export += '<input type="submit" id="export_script_ns" value="'+ i18n('export_scan_nnse') +'" />';
			import_export += '<input type="submit" id="export_options" value="'+ i18n('export_options') +'">';
			import_export += '<br><label for="area_export">' + i18n('exportt') + '</label><textarea id="area_export" readonly style="box-sizing:border-box; width:100%"></textarea>';
			import_export += '<label for="area_import">' + i18n('importt') + '</label><textarea id="area_import" style="box-sizing:border-box; width:100%"></textarea>';
			import_export += '<input type="submit" id="import_scan" value="'+ i18n('importer_scan') +'" />';
			import_export += '<input type="submit" id="import_options" value="'+ i18n('import_options') +'" />';
			import_export += '</div>';
		}

		/****************************/
	texte_a_afficher = '<div id="div_raide_facile">' + titre_div + option_html + '<div id="div_tableau_raide_facile">'
					+ '\n<div id="boutons_haut"></div>' + haut_tableau + titre_colonne_tableau + '<div id="boutons_bas"></div>' + '</div>' + html_bbcode + import_export + '</div>';


	//document.getElementById('inhalt').innerHTML = texte_a_afficher;
	document.getElementById('inhalt').style.display = "none";

	var div_raide_facile = document.createElement('div');
	insertAfter(div_raide_facile, document.getElementById('inhalt'));
	div_raide_facile.outerHTML = texte_a_afficher;
	// Stylisation des éléments (select, input, ...) comme ogame
	intercom.send('ogame style');
	// Activation des tooltips dans le style ogame
	intercom.send('tooltip', { selector: '#corps_tableau2 acronym[title]' });
	intercom.send('tooltip', { selector: '#corps_tableau2 .htmlTooltip', htmlTooltip: true });
	intercom.send('tooltip', { selector: '#raide_facile_titre #optionclique', htmlTooltip: true });
	intercom.send('tooltip', { selector: '#option_script #shortcut_attack_next' });


	//document.getElementById("contentWrapper").appendChild(document.createElement('div')).outerHTML = texte_a_afficher;

	//on affiche les boutons de suppression de scan .
		/**bouton en hauts **/{
			document.getElementById('boutons_haut').innerHTML = '<center><a id="plus_moins" style="float:left;"><img src="http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/plus.png" id="img_moin_plus" height="16" width="16"/></a><a id="supr_scan_h" style="display:none;"><input type="submit" value="' + text.supr_scan_coche + '" style="margin-bottom:5px;"/></a>  <a id="supr_scan_nn_selec_h" style="display:none;"><input type="submit" value="' + text.supr_scan_coche_nnslec + '" style="margin-bottom:5px;"/></a></center>'
			+ '<div id="page_h" style="float:right;display:none;">' + page_bas + '</div>' + filtres;


			// ouvrir fermer le span du haut pour les boutons
			document.getElementById('plus_moins').addEventListener("click", function (event) {
				var img_plus_moin = document.getElementById('plus_moins');
				var supr_scan_h = document.getElementById('supr_scan_h');
				var supr_scan_nn_selec_h = document.getElementById('supr_scan_nn_selec_h');
				var page_h = document.getElementById('page_h');
				if (supr_scan_h.style.display == 'none') {
					supr_scan_h.style.display = '';
					supr_scan_nn_selec_h.style.display = '';
					page_h.style.display = '';
					img_plus_moin.src = 'http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/moins.png';
				}
				else {
					supr_scan_h.style.display = 'none';
					supr_scan_nn_selec_h.style.display = 'none';
					page_h.style.display = 'none';
					img_plus_moin.src = 'http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/plus.png';
				}

			}, true);

			//supressions de scan
			document.getElementById("supr_scan_h").addEventListener("click", function (event) { del_scan_checkbox(info.serveur, true); remlir_tableau(-1, 0); }, true);
			document.getElementById("supr_scan_nn_selec_h").addEventListener("click", function (event) { del_scan_checkbox(info.serveur, false); remlir_tableau(-1, 0); }, true);
	}

		/**bouton en en bas**/{
			document.getElementById('boutons_bas').innerHTML = '<a id="zero_b" style="float:left;">'+ text.remis_z +'</a>'
				+ '<div style="float:right;">'+ page_bas +'</div><br/>'
				+ '<center><a id="supr_scan_b"><input type="submit" value="'+ text.supr_scan_coche +'" style="margin-top:5px;"/></a>  <a id="supr_scan_nn_selec_b"><input type="submit" value="'+ text.supr_scan_coche_nnslec +'" style="margin-top:5px;"/></a></center>';

			//remise a 0
			document.getElementById("zero_b").addEventListener("click", function(event){reset(info.serveur);remlir_tableau(-1, 0);}, true);
			//supressions de scan
			document.getElementById("supr_scan_b").addEventListener("click", function(event){del_scan_checkbox(info.serveur, true);remlir_tableau(-1, 0);}, true);
			document.getElementById("supr_scan_nn_selec_b").addEventListener("click", function(event){del_scan_checkbox(info.serveur, false);remlir_tableau(-1, 0);}, true);
		}

/////// on  trie le tableau ,affiche les lignes, on remplit en meme temps les export(bbcode/html) et colorie les lignes de flottes en vol. ///////////////////////////////////
		function remlir_tableau(classementsecondaire, type_croissant) {
			// on trie le tableau que si besoin est.
			if (parseInt(classementsecondaire) !== -1) {
				trie_tableau(info.serveur, classementsecondaire, type_croissant);
			}
			afficher_ligne_interieur_tab(info.serveur);

			// On crée les événement pour les suppressions de scans via l'icone corbeille
			$('.del1_scan').on('click', function() {
				// on extrait le numéro du scan de l'id
				var numero_scan = parseInt($(this).data('id'));

				var scanList = GM_getValue('scan' + info.serveur, '').split('#');
				scanList.splice(numero_scan, 1);
				GM_setValue('scan' + info.serveur, scanList.join('#'));

				remlir_tableau(-1, 0);
			});

			// on colorie les lignes selon les mouvements de flottes
			$.get('/game/index.php?page=eventList&ajax=1', showAttaque, 'html');

			// on affiche les numeros de pages si un nombre de scans par page est demandé
			var page_bas = '';
			if (nb_scan_page != 0) {
				page_bas = 'Page : ';
				var num_page = info.url.split('&page_r=')[1];
				var scan_info = GM_getValue('scan' + info.serveur, '').split('#');
				var nb = scan_info.length;
				var nb_page_poss = Math.ceil(nb / nb_scan_page);

				if (num_page == undefined || num_page == 1 || num_page == '') { num_page = 1; }
				for (var i = 1; i < (nb_page_poss + 1); i++) {
					if (i != num_page) {
						page_bas = page_bas + ' <a href="' + url_2 + '&amp;raidefacil=scriptOptions&amp;page_r=' + i + '" >' + i + '</a>';
					}
					else { page_bas = page_bas + ' ' + i; }

					if (i != nb_page_poss) { page_bas = page_bas + ','; }
				}
			}
			document.getElementById('page').innerHTML = page_bas;
		}
		remlir_tableau(-2, 0);

		//classer par colone croissante /decroissante grace au titre de colone
		/** Truc pour classer en cliquant sur le titre des colones **///{
		var id_th_classement = new Array("ccoordonee","cjoueur","cplanete","cdate","cprod_h","cressourcexh","cress","ccdr","ccdr_ress","cnb_v1","cnb_v2","cnb_d1","cnb_d2");
		var numero_th_classement = new Array("1","2","3","0","20e","20d","12","8","20c","17","22","18","23");
		var trierColonneCallback = function (event) {
			var id_colone_titre = this.id;
			for (var e = 0; e < (id_th_classement.length); e++) {
				if (id_th_classement[e] == id_colone_titre) {
					if (this.className != "decroissant") {// soit pas de classe soit croissant
						remlir_tableau(numero_th_classement[e], 'croissant');
						this.className = 'decroissant';
					}
					else {
						remlir_tableau(numero_th_classement[e], 'decroissant');
						this.className = "croissant";
					}
				}
			}
		};
		for (var q = 0; q < id_th_classement.length; q++) {
			if (document.getElementById(id_th_classement[q])) {
				document.getElementById(id_th_classement[q]).addEventListener("click", trierColonneCallback, true);
			}
		}
		//}

		// changement du select pour lune /planete/tout
		document.getElementById("change_value_affiche").addEventListener("click", function (event) {
			afficher_seulement = document.getElementById('choix_affichage2').value;
			filtre_actif_inactif = document.getElementById('filtre_actif_inactif').value;
			filtre_joueur = document.getElementById('filtre_joueur').value;
			remlir_tableau(-1, 0);
		}, true);

//////////////// on coche les options et rajoute les addevents et rajoute les boutons ///////////////
	// OPTION PRESELECTIONNER
	function preselectiionne(variable1, check0, check1) {
		if (variable1 == 0) {
			document.getElementById(check0).checked = "checked";
		}
		else if (variable1 == 1) {
			document.getElementById(check1).checked = "checked";
		}
	}
/** preselectionn de toute les options selon des variables **/{
		//mon compte
			// Autre :
			document.getElementById('vaisseau_vite').value = vaisseau_lent;

		//variables
			// Selection de scan :
				if(type_prend_scan == 0)
					{document.getElementById("prend_type0").checked = "checked";}
				else if(type_prend_scan == 1)
					{document.getElementById("prend_type1").checked = "checked";}
				else if(type_prend_scan == 2)
					{document.getElementById("prend_type2").checked = "checked";}

			//Classement :
				document.getElementById('classement').value = classement;
				preselectiionne(reverse, "q_reverse_croissant" , "q_reverse_decroissant");

			//Options de sauvegarde de scan :
				preselectiionne(scan_preenrgistre, "save_auto_scan_non" , "save_auto_scan_oui");
				preselectiionne(scan_remplace, "scan_remplace_non" , "scan_remplace_oui");

			//Autre :
				preselectiionne(import_q_rep, "import_remplace" , "import_rajoute");
				preselectiionne(lien_raide_nb_pt_gt, "lien_raide_nb_gt_remplit" , "lien_raide_nb_pt_remplit");
				if(lien_raide_nb_pt_gt == 2){document.getElementById("lien_raide_nb_pt_gt2").checked = "checked";}
				document.getElementById('nb_ou_pourcent').value = nb_ou_pourcent;


		// affichages
			// Changement dans les colonnes :
				preselectiionne(q_date_type_rep, "date_type_chrono" , "date_type_heure");
				preselectiionne(cdr_q_type_affiche, "recycleur_type_affichage_ressource" , "recycleur_type_affichage_recyleur");

			//Changement dans boutons de droites :
				if(simulateur == 0)
					{document.getElementById("sim_q_dra").checked = "checked";}
				else if(simulateur == 1)
					{document.getElementById("sim_q_speed").checked = "checked";}
				else if(simulateur == 2)
					{document.getElementById("sim_q_ogwin").checked = "checked";}
				else if(simulateur == 3)
					{document.getElementById("sim_q_autre").checked = "checked";}
				preselectiionne(q_mess, "mess_origine_aff_non" , "mess_origine_aff_oui");
				preselectiionne(espionnage_lien, "espionn_galaxie" , "espionn_fleet");
				preselectiionne(q_lien_simu_meme_onglet, "q_lien_simu_meme_onglet_oui" , "q_lien_simu_meme_onglet_non");


			//Affichage de Colonne :
				preselectiionne(q_compteur_attaque, "compteur_attaque_aff_non" , "compteur_attaque_aff_oui");
				preselectiionne(q_vid_colo, "aff_vid_colo_non" , "aff_vid_colo_oui");
				preselectiionne(question_rassemble_col, "rassemble_cdr_ress_non" , "rassemble_cdr_ress_oui");
				preselectiionne(pt_gt, "q_pt_gt_non" , "q_pt_gt_oui");
				preselectiionne(prod_h_q, "prod_h_aff_non" , "prod_h_aff_oui");
				preselectiionne(date_affiche, "date_affi_non" , "date_affi_oui");
				preselectiionne(tps_vol_q, "tps_vol_afficher_non" , "tps_vol_afficher_oui");
				preselectiionne(nom_j_q_q, "nom_joueur_affi_non" , "nom_joueur_affi_oui");
				if(nom_p_q_q == 0)
					document.getElementById('nom_planet_affi_non').checked = "checked";
				else
					document.getElementById('nom_planet_affi_oui').checked = "checked";
				// else if(nom_p_q_q == 2)
					// {document.getElementById('nom_planet_affi_autre').checked = "checked";}
				preselectiionne(coor_q_q, "coord_affi_non" , "coord_affi_oui");

				preselectiionne(defense_question, "defense_q_n" , "defense_q_nb");
					if(defense_question == 2){document.getElementById("defense_q_val").checked = "checked";}
				preselectiionne(vaisseau_question, "vaisseau_q_n" , "vaisseau_q_nb");
					if(vaisseau_question == 2){document.getElementById("vaisseau_q_val").checked = "checked";}
				preselectiionne(tech_q, "tech_aff_non" , "tech_aff_oui");

			//Affichage Global :
				preselectiionne(q_galaxie_scan, "scan_galaxie_cours_non" , "scan_galaxie_cours_oui");
					if(q_galaxie_scan == 2){document.getElementById("scan_galaxie_autre").checked = "checked";}
					else if(q_galaxie_scan == 3){document.getElementById("scan_galaxie_plus_ou_moin").checked = "checked";}
				preselectiionne(afficher_seulement, "afficher_lune_planet" , "afficher_planet_seul");
					if(afficher_seulement == 2){document.getElementById("afficher_lune_seul").checked = "checked";}
				preselectiionne(q_def_vis, "aff_lign_def_invisible_non" , "aff_lign_def_invisible_oui");
				preselectiionne(q_flo_vis, "aff_lign_flot_invisible_non" , "aff_lign_flot_invisible_oui");

			//Autre :
				preselectiionne(q_techzero, "q_techzero_non" , "q_techzero_oui");
				preselectiionne(q_icone_mess, "icone_parti_mess_non" , "icone_parti_mess_oui");

			// select
			document.getElementById('choix_affichage2').value = afficher_seulement;

		/** langue **/
		document.getElementById('langue').value = langue;

		/** bbcode **/
		preselectiionne(q_cite, "cite0" , "cite1");
		preselectiionne(q_centre, "centre0" , "centre1");
		preselectiionne(center_typeq, "centre_type0" , "centre_type1");
		preselectiionne(q_url_type, "url_type0" , "url_type1");
	}

	//changement des chiffres dans les options
	document.getElementById("val_res_min").addEventListener("change", function (event) { var val_res_minn = document.getElementById("val_res_min").value; document.getElementsByClassName("y")[0].innerHTML = val_res_minn; document.getElementsByClassName("y")[1].innerHTML = val_res_minn; }, true);
	document.getElementById("valeur_cdr_mini").addEventListener("change", function (event) { var valeur_cdr_minis = document.getElementById("valeur_cdr_mini").value; document.getElementsByClassName("x")[0].innerHTML = valeur_cdr_minis; document.getElementsByClassName("x")[1].innerHTML = valeur_cdr_minis; }, true);
	document.getElementById("valeur_tot_mini").addEventListener("change", function (event) { var valeur_tot_minis = document.getElementById("valeur_tot_mini").value; document.getElementsByClassName("z")[0].innerHTML = valeur_tot_minis; }, true);

	/******** Partie qui rajoute les events d'ouverture/fermeture de blocs avec des clics **********///{
	/* permet d'afficher/masquer un panneau d'options en cliquant sur un lien
	 * le panneau d'options affiché/masqué est celui désigné par l'attribut "data-cible" du lien
	 * les autres panneaux d'options déjà affiché seront masqué si un autre s'affiche
	 */
	var changeDisplayedOption = function (eventObject) {
		var titre = $(eventObject.target);
		var contenu = $('#' + titre.data('cible'));

		var closed = contenu.css('display') === 'none';

		// on ferme tous les panneaux d'option
		titre.parent().children('.open').removeClass('open');

		// si le contenu est caché alors on ouvre ce panneau
		if (closed) {
			titre.addClass('open');
			contenu.addClass('open');
			var selects = $('select.dropdownInitialized:not(.fixed)', contenu);
			if (selects.length) {
				ogameStyleSelectFix(selects);
			}
		}
	};

	/* permet d'afficher/masquer un élément en cliquant sur un lien
	 * l'élément affiché/masqué est celui désigné par l'attribut "data-cible" du lien
	 */
	var afficherMasquerPanneau = function (eventObject) {
		var titre = $(eventObject.target);
		var contenu = $('#' + titre.data('cible'));

		titre.toggleClass('open');
		contenu.toggleClass('open');

		if (eventObject.data !== null && eventObject.data.callback !== undefined) {
			eventObject.data.callback();
		}
	};

	// fonction qui met le listener pour afficher/masquer le textarea de simulation
	function display_change(idclique, idouvre_f) {
		document.getElementById(idclique).addEventListener("click", function (event) {
			var cellule = $('#' + idouvre_f);
			cellule.toggle();
		}, true);
	}

	// Afficher la fenêtre de choix de touche
	$('#shortcut_attack_next_modify').click(function () {
		findKey({
			defaultValue: stockageOption.get('touche raid suivant'),
			callback: function (which) {
				if (which) {
					stockageOption.set('touche raid suivant', which).save();
					$('#shortcut_attack_next').val(which);
					logger.log('touche choisie : ' + which);
				}
			}
		});
	});

	// afficher/masquer les options
	$('#optionclique').click(afficherMasquerOptions);

	// afficher/masque les panneaux d'options
	$('#option_script > .sectionTitreOptions').click(changeDisplayedOption);

	// afficher/masquer l'import/export
	$('#imp_exp_clique').click(afficherMasquerPanneau);

	// afficher/masquer le bbcode + html
	$('#htmlclique').click({
		callback: export_html.bind(this, info.serveur, false, info.url, nb_scan_page)
	}, afficherMasquerPanneau);

	//ouvrir fermer export scan simulateur
	if (simulateur == 3) {
		for (var p = 0; p <= i; p++) {
			if (document.getElementById('simul_' + p)) {
				display_change('simul_' + p, 'textarea_' + p);
			}
		}
	}
	//}

	// sauvegarder option si clique
		document.getElementById("sauvegarder_option").addEventListener("click", function (event) {
			save_option(info.serveur);
			save_optionbbcode(info.serveur);
			// On recharge la page pour que les changements prennent effet
			setTimeout(location.reload.bind(location), 1000);
		}, true);

		// import/export
		document.getElementById("export_script").addEventListener("click", export_scan.bind(undefined, true, '#area_export'), true);
		document.getElementById("export_script_ns").addEventListener("click", export_scan.bind(undefined, false, '#area_export'), true);
		document.getElementById("export_options").addEventListener("click", exportOptions.bind(undefined, '#area_export'), true);
		document.getElementById("import_scan").addEventListener("click", import_scan.bind(undefined, import_q_rep, '#area_import'), true);
		document.getElementById("import_options").addEventListener("click", importOptions.bind(undefined, '#area_import'), true);

	/**** partie pour le css du tableau avec les options + déplacer le menu planette ***************/{
		// modification du css de la page et du tableau.
		tableau_raide_facile_value = parseInt(tableau_raide_facile_value);
		/*if (tableau_raide_facile_value !== 0) {
			if (document.getElementById("banner_skyscraper")){
				var value = parseInt(document.getElementById("banner_skyscraper").offsetLeft) + tableau_raide_facile_value;
				document.getElementById("banner_skyscraper").style.left = value + 'px';
			};
		}*/
		/*if(document.getElementById("div_raide_facile")) {
			var value = parseInt(document.getElementById("contentWrapper").offsetWidth) + tableau_raide_facile_value;
			document.getElementById("div_raide_facile").style.minWidth = value +'px';
		}*/

		var style_css = '#raide_facile_titre {background-color:#0D1014; border:1px solid black; padding:5px 5px 10px 5px; font-weight:bold; text-align:center;}' +
						'\n #raid_facile_news {background-color:#0D1014; border:1px solid black; margin-top:10px; padding:5px 5px 10px 5px;}' +
						'\n #option_script {background-color:#0D1014; border:1px solid black; margin-top:10px; padding:5px 5px 10px 5px; font-size:11px; color:#848484;}' +
						'\n #div_tableau_raide_facile {background-color:#0D1014; border:1px solid black; margin-top:10px; padding:5px 5px 10px 5px;}' +
						'\n #text_html_bbcode {display:none; background-color:#0D1014; border:1px solid black; margin-top:10px; padding:5px 5px 10px 5px;}' +
						'\n #text_html_bbcode.open {display:block;}' +
						'\n #div_import_exp {display:none; background-color:#0D1014; border:1px solid black; margin-top:10px; padding:5px 5px 10px 5px;}' +
						'\n #div_import_exp.open {display:block;}' +
						'\n #filtres {width:100%; padding:5px 5px 5px 5px; font-size:11px; color:#848484; text-align: center;}' +

						'\n acronym {cursor: pointer;}' +
						'\n a {cursor: pointer;text-decoration:none;}' +
						'\n #haut_table2 {background-color: #0D1014;}' +
						'\n #corps_tableau2 {background-color: #13181D;}' +
						'\n #corps_tableau2 tr:nth-child(2n) {background-color:#1A2128;}' +
						'\n #corps_tableau2 tr.attaque {color:'+col_att+';}' +
						'\n #corps_tableau2 tr.attaqueRet {color:'+col_att_r+';}' +
						'\n #corps_tableau2 tr.attaque2 {color:'+stockageOption.get('couleur attaque2')+';}' +
						'\n #corps_tableau2 tr.attaqueRet2 {color:'+stockageOption.get('couleur attaque2 retour')+';}' +
						'\n #corps_tableau2 tr.attaqueGr {color:'+col_att_g+';}' +
						'\n #corps_tableau2 tr.attaqueGrRet {color:'+col_att_g_r+';}' +
						'\n #corps_tableau2 tr.espio {color:'+stockageOption.get('couleur espionnage')+';}' +
						'\n #corps_tableau2 tr.detruire {color:'+col_dest+';}' +
						'\n #corps_tableau2 tr.detruireRet {color:'+col_dest_r+';}' +
						'\n #bas_tableau2 {background-color: #0D1014;}' +
						'\n #collapse {border-collapse:separate ;}' +

						'\n #div_raide_facile {float:left; z-index:2;min-width:'+(670+tableau_raide_facile_value)+'px}' +
						'\n .sectionTitreOptions{text-indent:35px; text-align:left;cursor:pointer;border:1px solid black;font-weight: bold;color:#6F9FC8; background-color: #0D1014;background-attachment: scroll; background-clip: border-box; background-color: #13181D; background-image: url("/cdn/img/layout/fleetOpenAll.gif"); background-origin: padding-box; background-position: 0 0; background-repeat: no-repeat; background-size: auto auto; height: 22px; line-height: 22px; margin-right:auto; margin-left:auto; width:99%; margin-bottom:5px}'+
						'\n .sectionTitreOptions:hover{background-color: #23282D;}'+
						'\n .sectionTitreOptions.open{background-image: url("/cdn/img/layout/fleetCloseAll.gif");}'+
						'\n .sectionOptions{display:none; margin-right:auto; margin-left:auto; width:95%; padding:5px; margin-top:5px; margin-bottom:5px; text-align:left; border:1px solid black; background-color:#13181D;}'+
						'\n .sectionOptions.open{display:block;}'+
						'\n .titre_interne{font-weight:bold;color:#5A9FC8;}'+
						'\n .tableau_interne{padding-top:0px;border-bottom:0px;}'+

						'\n #div_raide_facile input[type="submit"] {border: 1px solid #6F899D; color: white; background-color: rgb(92, 118, 139);}'+

						'\n #raid_facile_news{color:#FFFFFF;  text-align:left; font-size:11px; }'+
						'\n #raid_facile_news a {color:#6F9FC8;}'+
						'\n #raid_facile_news h4{margin-top:5px;text-indent:10px;font-size:11px;font-weight:bold;color:#6F9FC8;}'+

						'\n #tableau_raide_facile{margin-top:5px; margin-bottom:5px; background-color:#0D1014; text-align:center;border-top: 1px solid black; border-bottom: 1px solid black; font-size:10px;line-height:20px;white-space:nowrap;width:100%;}'+
						// ' .boutons_haut{text-align:right;}'+
						'\n #tableau_raide_facile td {padding-right:2px;padding-left:2px;}'+
						'\n #tableau_raide_facile td.right {text-align:right;padding-right:2px;padding-left:2px;}'+
						'\n #tableau_raide_facile th.RF_icon {width: 18px;}'+
						'\n #tableau_raide_facile th {color: #6F9FC8;}'+
						'\n #tableau_raide_facile a {color: #6F9FC8;}'+
						'\n #tableau_raide_facile a {color: #6F9FC8;}'+
						// Options
						'#div_raide_facile .tableau_interne tr:hover { color:white; }'+
						// Tableau des scans
						'#div_raide_facile .htmlTooltip > .tooltipTitle { display:none; }';

		var heads = document.getElementsByTagName("head");
		if (heads.length > 0) {
			var node = document.createElement("style");
			node.type = "text/css";
			node.appendChild(document.createTextNode(style_css));
			heads[0].appendChild(node);
		}

		// détection automatique de la bonne taille pour décaler le menu des planètes
		plusTard(ajusterTailleBox);
	}

}


/* global Tipped */
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

$(document).ajaxSuccess(function (event, jqXHR, ajaxOptions, data) {
	if (ajaxOptions.url !== 'index.php?page=messages&tab=20&ajax=1') {
		return;
	}
	intercom.send('messageEspionnageLoaded', {
		url: ajaxOptions.url,
		text: data,
	});
});

};

// injection du script
var script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.innerHTML = '('+injectScript.toString()+')();';
document.head.appendChild(script);

})();

// console.profileEnd('Raid facile');
