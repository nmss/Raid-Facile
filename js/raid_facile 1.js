/* Pour éditer ce fichier je conseille Sublime Text, Notepad++ ou Brackets
	lien: http://www.sublimetext.com/
	lien: http://notepad-plus-plus.org/fr
	lien: http://brackets.io/
	il permet de masquer certaines partie du code pour que celui-ci soir mieux organisé, et plus compréhensible */
// Sujet sur le forum officiel : http://board.ogame.fr/index.php?page=Thread&threadID=978693
/* test encodage
ces caractère doivent être ben accentués et bien écrits, sinon c'est qu'il y a un problème
aâàã eéêè iîì ñ oôòõ uûù €
*/


/** Logger **///{region
	function Logger() {
		this.logs = [];
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
	var remplirInfo = function() {
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
			opera: navigator.userAgent.indexOf('Opera')>-1,
			url: location.href,
			serveur: location.hostname,
			univers: location.hostname.replace('ogame.', ''),
			date: new Date(),
			startTime: (new Date()).getTime(),
			session: $('meta[name=ogame-session]').attr('content') || location.href.replace(/^.*&session=([0-9a-f]*).*$/i,"$1"),
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
	var parseUrl = function() {
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
		var GM_getValue = function(key, defaultValue) {
			var retValue = localStorage.getItem(key);
			if (!retValue) {
				retValue = defaultValue;
			}
			return retValue;
		};
	}
	if (typeof GM_setValue === 'undefined') {
		var GM_setValue = function(key, value) {
			localStorage.setItem(key, value);
		};
	}
	if (typeof GM_deleteValue === 'undefined') {
		var GM_deleteValue = function(key) {
			localStorage.removeItem(key);
		};
	}
	if (typeof GM_addStyle === 'undefined') {
		var addStyle = function(css, url) {
			if (url) {
				$('<link rel="stylesheet" type="text/css" media="screen" href="'+url+'">').appendTo(document.head);
			} else {
				$('<style type="text/css">' + css + '</style>').appendTo(document.head);
			}
		};
	} else {
		var addStyle = function(css, url) {
			if (url) {
				$('<link rel="stylesheet" type="text/css" media="screen" href="'+url+'">').appendTo(document.head);
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
			'couleur espionnage retour': ['f_r', '']
		};
		if (!this.checkMappingCount()) {
			throw 'Erreur de mapping, ya pas le bon nombre!';
		}
	}
	Stockage.prototype = {
		/** Renvoie la valeur d'une donnée en mémoire */
		get: function(nom) {
			var key = this.mapping[nom][0];
			if (this.data.hasOwnProperty(key)) {
				return this.data[key];
			} else {
				return this.mapping[nom][1];
			}
		},
		/** Change la valeur en mémoire d'une donnée */
		set: function(nom, valeur) {
			this.data[this.mapping[nom][0]] = valeur;
		},
		/** Charge en mémoire les données du stockage */
		load: function() {
			this.data = JSON.parse(GM_getValue(this.storageKeyName, '{}'));
		},
		/** Sauvegarde dans le stockage les données en mémoire */
		save: function() {
			GM_setValue(this.storageKeyName, JSON.stringify(this.data));
		},
		/** Vérification qu'il n'y a pas eu d'erreur de mapping (que chaque valeur n'est utilisée qu'une fois) */
		checkMappingCount: function() {
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
	var Intercom = function() {
		this.loaded = false;
		this.listen();
		this.listeAttente = [];
	};
	Intercom.prototype = {
		/**	send envoie un message à l'autre classe Intercom
			action (string) le nom de l'action
			data (object)(facultatif) les données à transmettre
		*/
		send: function(action, data) {
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
		listen: function() {
			window.addEventListener('message', this.received.bind(this), false);
		},
		/** Défini les action à effectuer en cas de message reçu */
		received: function(event) {
			// On s'assure que le message est bien pour nous
			if (event.data.namespace !== 'Raid facile' || event.data.fromPage === false) {
				return;
			}
			switch(event.data.action) {
			case 'loaded':
				// l'autre intercom est chargé, on peut donc traiter les messages en attente
				this.loaded = true;
				this.traiterListeAttente();
				break;
			}
		},
		traiterListeAttente: function() {
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
		this.langue = langue;
	}
	I18n.prototype = {
		get: function(key) {
			var local = this[langue][key];
			if (local === undefined && langue !== 'en') {
				local = this.en[key];
			}
			if (local === undefined && langue !== 'fr') {
				local = this.fr[key];
			}
			return local;
		},
		exporter: function(langue) {
			return this[langue];
		},
		importer: function(langue, data) {
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
			$('#contentWrapper').width( $('#contentWrapper').width() + changementTaille);

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
		// exportOptions();
		remplirInfo();
		logger.log('Version', info.version);
		setPage();
		if (info.page === 'optionsRaidFacile') { // impossible d'afficher la page options au départ on affiche donc le tableau
			info.hash.raidFacile = 'tableau';
		}
		rebuildHash();
		logger.log('Page', info.page);
		logger.log('Navigateur', JSON.stringify({ chrome:info.chrome, firefox:info.firefox, opera:info.opera, tampermonkey:info.tampermonkey }));

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
		if (eventObject.which === 80) { // Touche P
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
			li.append('<span class="menu_icon"><a href="'+url.hashes({ raidFacile: 'options' })+'" title="'+i18n.get('options de')+' '+i18n.get('raid facile')+'"><div class="menuImage traderOverview"></div></a></span>');
			$('.menu_icon a', li).click(afficherMasquerOptions);
		}
		li.append('<a href="'+url.hashes({ raidFacile: 'tableau' })+'" class="menubutton" id="lien_raide"><span class="textlabel">'+ i18n.get('raid facile') + '</span></a>');
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
		var traiteFlotte = function(elem) {
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
				titre += '<p>' + localization.missions[typeMission] + ' : ' + cible[typeMission][0] + ' +' + (cible[typeMission][1]-cible[typeMission][0]) + ' retour' + '</p>';
			}
			$('.nombreAttaque', lignes).attr('title', titre);
		}
		intercom.send('tooltip', {selector:'#corps_tableau2 .nombreAttaque[title]'});
	}

	/** Permet de récupérer un objet contenant toutes les options */
	function exportOptions() {
		var optionExport = {};
		optionExport.optionNew = {
			data: stockageOption.data,
			keyName: stockageOption.storageKeyName
		};
		optionExport.optionOld = {
			option1: GM_getValue('option1'+ info.serveur, '0/0/0/0/0/0/x:xxx:x/4000/0.3/0/1'),
			option2: GM_getValue('option2'+ info.serveur, '0/100/100/0/12/1/0/4320/1/1/0/1/1/1/2/0/0'),
			option3: GM_getValue('option3'+ info.serveur, '#C7050D/#025716/#FFB027/#E75A4F/#33CF57/#EFE67F'),
			option4: GM_getValue('option4'+ info.serveur, '1/0/0/0/1/1/1/1/0/0/0/1/0/0/0/0/1/0/1/1/0/0/0/1/1/1/1/1/x/x/0/1/1/1'),
			option5: GM_getValue('option5'+ info.serveur, navigator.language),
			vitesse_uni: parseInt(GM_getValue('vitesse_uni', '1'))
		};
		prompt("Voice l'export des options", JSON.stringify(optionExport));
	}

	/** Renvoie un objet contenant toutes les données utiles pour les statistiques */
	var getStatData = function() {
		var data = {
			id: info.ogameMeta['ogame-player-id'],
			univers: info.ogameMeta['ogame-universe']
		};
		return data;
	};

	/** Affiche qu'il y a une mise à jour de disponible */
	function mise_a_jour(version) {
		if (!/^\d+\.\d+(\.\d+(\.\d+)?)?$/.test(version)) {
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
				"Installer": function() {
					// preference.get()['lastUpdateCheck'] = info.now;
					// preference.save();
					location.href = info.siteUrl;
					// popup.html('<iframe src="'+info.siteUrl+'" style="width:100%; height:98%"></iframe>').css({
						// width:'590px', height:'400px'
					// }).parent().css({
						// width:'auto', height:'auto'
					// });
					GM_setValue("date_mise_ajours", ''+ info.startTime +'');
					popup.dialog('destroy');
				},
				"Changelog": function() {
					location.href = info.siteUrl + '?changelog';
					// popup.html('<iframe src="'+info.siteUrl+'?changelog" style="width:100%; height:98%"></iframe>');
				},
				"Plus tard": function() {
					// preference.get()['lastUpdateCheck'] = info.now;
					// preference.save();
					popup.dialog('destroy');
					GM_setValue("date_mise_ajours", ''+ ( info.startTime + 1000*60*60*24*7 ) +'');
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
		if((info.startTime - parseInt(lastUpdateDate)) > 1000*60*60*6) { // vérification toutes les 6h
			var params = getStatData();
			params.check = true;
			var url = new Url(info.siteUrl).params(params).toString();
			if (typeof GM_xmlhttpRequest === 'undefined') {
				$.get(url, mise_a_jour);
			} else {
				GM_xmlhttpRequest({
					method: 'GET',
					url: url,
					onload: function(response) {
						mise_a_jour(response.responseText);
					}
				});
			}
		}
	}

	/** Converti des nombres en affichage numérique et en affichage court (ex: 10k) */
	var numberConverter = {
		toInt: function(number, useShortNotation) {
			var str = number.toString();
			if (useShortNotation) {
				str = str.replace(/mm/i, '000 000 000').replace(/g/i, '000 000 000').replace(/m/i, '000 000').replace(/k/i, '000');
			}
			str = str.replace(/ /g, '');
			return parseInt(str, 10);
		},
		shortenNumber: function(number, factor) {
			return Math.round(number / factor);
		},
		toPrettyString: function(number) {
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
		parse: function(url) {
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
		params: function(params) {
			for (var key in params) {
				this._params[encodeURIComponent(key)] = encodeURIComponent(params[key]);
			}
			return this;
		},
		hashes: function(hashes) {
			for (var key in hashes) {
				this._hashes[encodeURIComponent(key)] = encodeURIComponent(hashes[key]);
			}
			return this;
		},
		toString: function() {
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
//}endregion

init();

/** initialisation des variables d'option **///{region

	/* Explication des options
	x/x/x/x/x/.... signifie
	arme/bouclier/protect/combus/impul/hyper/coordonee/date/option/ressource/classement/sauvegard auto/temps garde scan/exversion/coul_att/coul_att_g/coul_dest/lien/remplace/lien esp/rec/itesse/tps_vol/nom_j/nom_p/coord_q/prod_h/ress_h
	*/
	var option1 = GM_getValue('option1'+ info.serveur, '0/0/0/0/0/0/x:xxx:x/4000/0.3/0/1');
	var option2 = GM_getValue('option2'+ info.serveur, '0/100/100/0/12/1/0/4320/1/1/0/1/1/1/2/0/0');
	var option3 = GM_getValue('option3'+ info.serveur, '#C7050D/#025716/#FFB027/#E75A4F/#33CF57/#EFE67F');
	var option4 = GM_getValue('option4'+ info.serveur, '1/0/0/0/1/1/1/1/0/0/0/1/0/0/0/0/1/0/1/1/0/0/0/1/1/1/1/1/x/x/0/1/1/1');
	var option5 = GM_getValue('option5'+ info.serveur, navigator.language);

	var option1_split = option1.split('/');
	var option2_split = option2.split('/');
	var option3_split = option3.split('/');
	var option4_split = option4.split('/');
	var option5_split = option5;

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
		var pourcent_cdr =  parseFloat(option1_split[8]);
		var pourcent_cdr_def =  parseFloat(option1_split[9]);
		var vitesse_uni = parseInt(GM_getValue('vitesse_uni', '1'));
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
		if (option2_split[11] !== undefined) { var q_taux_m = option2_split[11]; } else { var q_taux_m = 1; }
		if (option2_split[12] !== undefined) { var q_taux_c = option2_split[12]; } else { var q_taux_c = 1; }
		if (option2_split[13] !== undefined) { var q_taux_d = option2_split[13]; } else { var q_taux_d = 1; }

		//Options de sauvegarde de scan :
		var scan_preenrgistre = option2_split[5];// si le scan est enregistre lorsqu'on le regarde ou seulement quand on clique sur enregistre.
		var scan_remplace = option2_split[6];
		var nb_minutesgardescan = option2_split[7];
		var minutes_opt = Math.floor(parseInt(nb_minutesgardescan) % 60);
		var nb_minutesgardescan2 = parseInt(nb_minutesgardescan) - minutes_opt;
		var heures_opt = Math.floor(Math.floor(parseInt(nb_minutesgardescan2) / 60) % 24);
		nb_minutesgardescan2 = parseInt(nb_minutesgardescan2) - heures_opt * 60;
		var jours_opt = Math.floor(parseInt(nb_minutesgardescan2) / 60 / 24);
		var nb_ms_garde_scan = nb_minutesgardescan * 60 * 1000;
		if (option2_split[10] !== undefined) { var nb_max_def = option2_split[10]; } else { var nb_max_def = 0; }

		//Autre :
		var import_q_rep = option2_split[8];
		if (option2_split[14] !== undefined) { var lien_raide_nb_pt_gt = option2_split[14]; } else { var lien_raide_nb_pt_gt = 2; }
		if (option2_split[15] !== undefined) { var nb_pourcent_ajout_lien = parseInt(option2_split[15]); } else { var nb_pourcent_ajout_lien = 0; }
		if (option2_split[16] !== undefined) { var nb_ou_pourcent = option2_split[16]; } else { var nb_ou_pourcent = 0; }
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
		if (option4_split[25] !== undefined) { var q_lien_simu_meme_onglet = option4_split[25]; } else { var q_lien_simu_meme_onglet = 1; }

		//Affichage de Colonne :
		if (option4_split[21] !== undefined) { var q_compteur_attaque = option4_split[21]; } else { var q_compteur_attaque = 0; }
		if (option4_split[17] !== undefined) { var q_vid_colo = option4_split[17]; } else { var q_vid_colo = 0; }
		var question_rassemble_col = option4_split[14];
		var prod_h_q = option4_split[9];
		var prod_gg = option4_split[10];
		var prod_min_g = Math.floor(parseInt(prod_gg)%60);
		var nb_minutesgardescan3 = parseInt(prod_gg) - prod_min_g;
		var prod_h_g = Math.floor(Math.floor(parseInt(nb_minutesgardescan3)/60)%24);
		nb_minutesgardescan3 = parseInt(nb_minutesgardescan3) - prod_h_g*60;
		var prod_j_g = Math.floor(parseInt(nb_minutesgardescan3)/60/24);
		var date_affiche = option4_split[7];//0 date non affiche, 1 date affiche
		var tps_vol_q = option4_split[3];
		var nom_j_q_q = option4_split[4];
		var nom_p_q_q = option4_split[5];
		var coor_q_q = option4_split[6];
		if (option4_split[26] !== undefined) { var defense_question = option4_split[26]; } else { var defense_question = 1; }
		if (option4_split[27] !== undefined) { var vaisseau_question = option4_split[27]; } else { var vaisseau_question = 1; }
		if (option4_split[32] !== undefined) { var pt_gt = option4_split[32]; } else { var pt_gt = 1; }
		if (option4_split[33] !== undefined) { var tech_q = option4_split[33]; } else { var tech_q = 1; }

		//Affichage Global :
		if (option4_split[22] !== undefined) { var q_galaxie_scan = option4_split[22]; } else { var q_galaxie_scan = 0; }
		if (option4_split[23] !== undefined) { var galaxie_demande = option4_split[23]; } else { var galaxie_demande = 1; }
		if (option4_split[31] !== undefined) { var galaxie_plus_ou_moins = parseInt(option4_split[31]); } else { var galaxie_plus_ou_moins = 1; }
		if (option4_split[24] !== undefined) { var afficher_seulement = option4_split[24]; } else { var afficher_seulement = 0; }
		if (option4_split[19] !== undefined) { var q_def_vis = option4_split[19]; } else { var q_def_vis = 1; }
		if (option4_split[18] !== undefined) { var q_flo_vis = option4_split[18]; } else { var q_flo_vis = 1; }
		var nb_scan_page = parseInt(option4_split[13]);

		//Autre :
		var q_techzero = option4_split[15];
		if (option4_split[30] !== undefined) { var tableau_raide_facile_value = option4_split[30]; } else { var tableau_raide_facile_value = 100; }
		var q_icone_mess = option4_split[16];
	}

	// langue
	var langue = option5_split;
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

	couleur2[1]= option_bbcode_split[0];
	couleur2[2]= option_bbcode_split[1];
	couleur2[3]= option_bbcode_split[2];
	couleur2[4]= option_bbcode_split[3];
	couleur2[5]= option_bbcode_split[4];
	couleur2[6]= option_bbcode_split[5];
	couleur2[7]= option_bbcode_split[6];

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
			espionner:'|Espionner',
			eff_rapp:'|Effacer ce rapport',
			att:'|Attaquer',
			simul:'|Simuler',

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
			espionner:'|spioneaza',
			eff_rapp:'|Sterge acest raport de spionaj',
			att:'|Ataca',
			simul:'|Simuleaza',
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
				espionner:'|Espiar',
				eff_rapp:'|Eliminar el informe de espionaje',
				att:'|Atacar',
				simul:'|Simular',

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
			espionner:'|spying',
			eff_rapp:'|Remove this espionage report',
			att:'|Attack',
			simul:'|Simulate',

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
			sur:'sur ',
			de:' de ',
			pt: 'Petit transporteur',gt: 'Grand transporteur',cle: 'Chasseur léger',clo: 'Chasseur lourd',cro: 'Croiseur',vb: 'Vaisseau de bataille',vc: 'Vaisseau de colonisation',rec: 'Recycleur',esp: 'Sonde d`espionnage',bb: 'Bombardier',sat: 'Satellite solaire',dest: 'Destructeur',edlm: 'Étoile de la mort',tra: 'Traqueur',
			lm: 'Lanceur de missiles',lle: 'Artillerie laser légère',llo: 'Artillerie laser lourde',gauss: 'Canon de Gauss',ion: 'Artillerie à ions',pla: 'Lanceur de plasma',pb: 'Petit bouclier',gb: 'Grand bouclier',mic: 'Missile d`interception',mip: 'Missile Interplanétaire',
			tech_arm:'Technologie Armes', tech_bouc:'Technologie Bouclier', tech_pro:'Technologie Protection des vaisseaux spatiaux',
			tech_com:'Technologie Combustion', tech_imp:'Technologie Impulsion', tech_hyp:'Technologie Hyper-Espace',
			mine_m:'Mine de métal',
			mine_c:'Mine de cristal',
			mine_d:'Synthétiseur de deutérium',

			lang_speedsin:'fr',
			lang_dragosin:'french'
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
			sur:'na ',
			de:' z ',
			tech_arm: 'Technologia bojowa',tech_bouc: 'Technologia ochronna',tech_pro: 'Opancerzenie',
			tech_hyp: 'Naped nadprzestrzenny',tech_com: 'Naped spalinowy',tech_imp: 'Naped impulsowy',
			pt: 'Maly transporter',gt: 'Duzy transporter',cle: 'Lekki mysliwiec',clo: 'Ciezki mysliwiec',cro: 'Krazownik',vb: 'Okret wojenny',vc: 'Statek kolonizacyjny',rec: 'Recykler',esp: 'Sonda szpiegowska',bb: 'Bombowiec',sat: 'Satelita sloneczny ',dest: 'Niszczyciel',edlm: 'Gwiazda Smierci',tra: 'Pancernik',
			lm: 'Wyrzutnia rakiet',lle: 'Lekkie dzialo laserowe ',llo: 'Ciezkie dzialo laserowe',gauss: 'Dzialo Gaussa',ion: 'Dzialo jonowe',pla: 'Wyrzutnia plazmy',pb: 'Mala powloka ochronna',gb: 'Duza powloka ochronna',mic: 'Przeciwrakieta',mip: 'Rakieta miedzyplanetarna',

			mine_m:'Kopalnia metalu',
			mine_c:'Kopalnia krysztalu',
			mine_d:'Ekstraktor deuteru',

			lang_speedsin:'en',
			lang_dragosin:'english'
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
			sur:'en ',
			de:' desde ',
			tech_arm: 'Tecnología Militar',tech_bouc: 'Tecnología de Defensa',tech_pro: 'Tecnología de Blindaje',
			tech_hyp: 'Propulsor Hiperespacial',tech_com: 'Motor de Combustible',tech_imp: 'Motor de Impulso',
			pt: 'Nave Pequeña de Carga',gt: 'Nave Grande de Carga',cle: 'Cazador Ligero',clo: 'Cazador Pesado',cro: 'Crucero',vb: 'Nave de Batalla',vc: 'Nave de Colonia',rec: 'Reciclador',esp: 'Sonda de Espionaje',bb: 'Bombardero',sat: 'Satélite Solar',dest: 'Destructor',edlm: 'Estrella de la Muerte',tra: 'Acorazado',
			lm: 'Lanzamisiles',lle: 'Láser Pequeño',llo: 'Láser Grande',gauss: 'Cañón de Gauss',ion: 'Cañón Iónico',pla: 'Cañón de Plasma',pb: 'Cúpula Pequeña de Protección',gb: 'Cúpula Grande Protección',mic: 'Misiles Antibalísticos',mip: 'Misiles Interplanetarios',

			mine_m:'Mina de Metal',
			mine_c:'Mina de Cristal',
			mine_d:'Sintetizador de Deuterio',

			lang_speedsin:'en',
			lang_dragosin:'english'
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
			sur:'la ',
			de:' de la ',
			tech_arm: 'Tehnologia Armelor',tech_bouc: 'Tehnologia Scuturilor',tech_pro: 'Tehnologia Armurilor',
			tech_hyp: 'Motor Hiperspatial',tech_com: 'Motor de Combustie',tech_imp: 'Motor pe impuls',
			pt: 'Transportator mic',gt: 'Transportator mare',cle: 'Vânator Usor',clo: 'Vânator Greu',cro: 'Crucisator',vb: 'Nava de razboi',vc: 'Nava de colonizare',rec: 'Reciclator',esp: 'Proba de spionaj',bb: 'Bombardier',sat: 'Satelit Solar',dest: 'Distrugator',edlm: 'RIP',tra: 'Interceptor',
			lm: 'Lansatoare de Rachete',lle: 'Lasere usoare',llo: 'Lasere Grele',gauss: 'Tunuri Gauss',ion: 'Tunuri Magnetice',pla: 'Turele de Plasma',pb: 'Scut planetar mic',gb: 'Scut planetar mare',mic: 'Rachete Anti-Balistice',mip: 'Rachete Interplanetare',

			mine_m:'Mina de Metal',
			mine_c:'Mina de Cristal',
			mine_d:'Sintetizator de Deuteriu',

			lang_speedsin:'en',
			lang_dragosin:'english'
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
			sur:'su ',
			de:' di ',
			tech_arm: 'Tecnologia delle Armi',tech_bouc: 'Tecnologia degli Scudi',tech_pro: 'Tecnologia delle Corazze',
			tech_hyp: 'Propulsore Iperspaziale',tech_com: 'Propulsore a Combustione',tech_imp: 'Propulsore a Impulso',
			pt: 'Cargo Leggero',gt: 'Cargo Pesante',cle: 'Caccia Leggero',clo: 'Caccia Pesante',cro: 'Incrociatore',vb: 'Nave da Battaglia',vc: 'Colonizzatrice',rec: 'Riciclatrice',esp: 'Sonda spia',bb: 'Bombardiere',sat: 'Satellite Solare',dest: 'Corazzata',edlm: 'Morte Nera',tra: 'Incrociatore da Battaglia',
			lm: 'Lanciamissili',lle: 'Laser Leggero',llo: 'Laser Pesante',gauss: 'Cannone Gauss',ion: 'Cannone Ionico',pla: 'Cannone al Plasma',pb: 'Cupola Scudo',gb: 'Cupola Scudo Potenziata',mic: 'Missili Anti Balistici',mip: 'Missili Interplanetari',

			mine_m:'Miniera di Metallo',
			mine_c:'Miniera di Cristalli',
			mine_d:'Sintetizzatore di Deuterio',

			lang_speedsin:'it',
			lang_dragosin:'italian'
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
			sur:'στο ',
			de:' απο ',
			tech_arm: 'Τεχνολογία Όπλων',tech_bouc: 'Τεχνολογία Ασπίδων',tech_pro: 'Τεχνολογία Θωράκισης',
			tech_hyp: 'Προώθηση Καύσεως',tech_com: 'Ωστική Προώθηση',tech_imp: 'Υπερδιαστημική Προώθηση',
			pt: 'Μικρό Μεταγωγικό',gt: 'Μεγάλο Μεταγωγικό',cle: 'Ελαφρύ Μαχητικό',clo: 'Βαρύ Μαχητικό',cro: 'Καταδιωκτικό',vb: 'Καταδρομικό',vc: 'Σκάφος Αποικιοποίησης',rec: 'Ανακυκλωτής',esp: 'Κατασκοπευτικό Στέλεχος',bb: 'Βομβαρδιστικό',sat: 'Ηλιακοί Συλλέκτες',dest: 'Destroyer',edlm: 'Deathstar',tra: 'Θωρηκτό Αναχαίτισης',
			lm: 'Εκτοξευτής Πυραύλων',lle: 'Ελαφρύ Λέιζερ',llo: 'Βαρύ Λέιζερ',gauss: 'Κανόνι Gauss',ion: 'Κανόνι Ιόντων',pla: 'Πυργίσκοι Πλάσματος',pb: 'Μικρός Αμυντικός Θόλος',gb: 'Μεγάλος Αμυντικός Θόλος',mic: 'Αντι-Βαλλιστικοί Πύραυλοι',mip: 'Διαπλανητικοί Πύραυλοι',
			mine_m:'Ορυχείο Μετάλλου',
			mine_c:'Ορυχείο Κρυστάλλου',
			mine_d:'Συνθέτης Δευτέριου'
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
			sur:'on ',
			de:' from ',
			tech_arm: 'Weapons Technology',tech_bouc: 'Shielding Technology',tech_pro: 'Armour Technology',
			tech_hyp: 'Hyperspace Drive',tech_com: 'Combustion Drive',tech_imp: 'Impulse Drive',
			pt: 'Small Cargo',gt: 'Large Cargo',cle: 'Light Fighter',clo: 'Heavy Fighter',cro: 'Cruiser',vb: 'Battleship',vc: 'Colony Ship',rec: 'Recycler',esp: 'Espionage Probe',bb: 'Bomber',sat: 'Solar Satellite',dest: 'Destroyer',edlm: 'Deathstar',tra: 'Battlecruiser',
			lm: 'Rocket Launcher',lle: 'Light Laser',llo: 'Heavy Laser',gauss: 'Gauss Cannon',ion: 'Ion Cannon',pla: 'Plasma Turret',pb: 'Small Shield Dome',gb: 'Large Shield Dome',mic: 'Anti-Ballistic Missiles',mip: 'Interplanetary Missiles',

			// ressource:'Ressources',//pour antigame
			mine_m:'Metal Mine',
			mine_c:'Crystal Mine',
			mine_d:'Deuterium Synthesizer',

			lang_speedsin:'en',
			lang_dragosin:'english'
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
		//console.log(nombre, typeof nombre);
		if (nombre === '?' || nombre === 0) {
			return nombre;
		}
		return nombre.toLocaleString();
		/*var signe = '';
		if (nombre < 0) {
			nombre = Math.abs(nombre);
			signe = '-';
		}
		var str = nombre.toString(), n = str.length;
		if (n < 4) {
			return signe + nombre;
		} else {
			return  signe + (((n % 3) ? str.substr(0, n % 3) + '.' : '') + str.substr(n % 3).match(new RegExp('[0-9]{3}', 'g')).join('.'));
		}*/
	}

	function addPoints2(nombre) {
		if (nombre === '?' || nombre < 1000) {
			return nombre;
		}
		return nombre.toLocaleString();
	}

	// merci mushroonm et Lame noire qui mon donner cette function
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
		for(; i < number.length - 1 && number[i] == '0'; ++i) {
			number[i] = '';
		}
		return number.substring(i, number.length);
	}

	//raccourcisseur de noms
	function raccourcir(nomAraccourcir) {
		// conditions ? si c'est vrai : si c'est faut
		return nomAraccourcir.length >= 10 ? nomAraccourcir.substring(0, 10) : nomAraccourcir;
	}

	//function petit rectangle affiche (genre pop up) 0 V , 1 erreur
	function fadeBoxx(message, failed, temps) {
		// var $;
		// try { $ = unsafeWindow.$; }
		// catch(e) { $ = window.$; }

		if (failed) {
			$("#fadeBoxStyle").attr("class", "failed");
		} else {
			$("#fadeBoxStyle").attr("class", "success");
		}
		$("#fadeBoxContent").html(message);
		$("#fadeBox").stop(true, true).fadeIn(0).delay(temps).fadeOut(500);
	}

	/** Affiche l'icône "new" avec un commentaire en "title" */
	function iconeNew(commentaire) {
		return '<img src="http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/iconeNew.png" alt="new" title="'+commentaire+'">';
	}
//}endregion

/** page mouvement **///{region
	function recup_flotte_mv() {// sur la page mouvement recupere les mouvements de flottes en cours
		if (info.url.indexOf('page=movement',0) < 0) {
			return;
		}
		var destination_flotte_f = [];
		var type_missions_f = [];
		var xpathExpression = '//DIV[contains(@class,"fleetDetails")]/SPAN[contains(@class,"hostile")]/..';
		var xpathResult = document.evaluate(xpathExpression, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var k = 0; k < xpathResult.snapshotLength; k++) {
			var doc2 = xpathResult.snapshotItem(k);

			var destination_flotte = doc2.getElementsByClassName('destinationCoords')[0].getElementsByTagName('a')[0].innerHTML;
			destination_flotte_f[k] = destination_flotte;


			var type_missions = doc2.getElementsByClassName('mission hostile textBeefy')[0].innerHTML;
			if (!doc2.getElementsByClassName('reversal')[0] && type_missions.indexOf('(R)') == -1) {// si il n'y as pas de bouton "rappel de flotte",
				type_missions += " (R)";// c'est que la flotte est forcement sur le retour
			}
			type_missions_f[k] = type_missions;

		}
		GM_setValue("attaque_cours_d", destination_flotte_f.join(';'));
		GM_setValue("attaque_cours_t", type_missions_f.join(';'));
	}
//}endregion

/** page de tableau **///{region
	// mettre ou enlever l'inactivité d'un joueur
	/* function inactif_change(pseudo_inactif, check) {
		var inactif = GM_getValue('inactif', '');
		var deja = inactif.indexOf(pseudo_inactif);
		if (check == true && deja == -1)//si on dit qu'il est inactif et qu'il y est pas deja alors on le rajoute a la fin
		{
			inactif = inactif + '#'+ pseudo_inactif;
		}
		else if (check == true)//si on enleve l'inactivité
		{
			var inactif_split = GM_getValue('inactif', '').split('!#!');
			for(var r=0; r<inactif_split.length; r++)
			{
				if (inactif_split[r] == pseudo_inactif)
				{
					inactif_split[r] = '';
				}

			}
			inactif = inactif_split.join('#');
		}
		inactif = inactif.replace( /\#{2,}/g, "#");
		GM_setValue('inactif', inactif);
	} */

	function save_option(serveur) {
		/** checked -> 0, pas checked -> 1 */
		var checkedFromIdToInt = function(id) {
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
				pourcent_cdr_q = Math.round(parseFloat(pourcent_cdr_q)/10);
				pourcent_cdr_q = pourcent_cdr_q/10;

				// pourcentage de defense dans le cdr
				var pourcent_cdr_def_q = document.getElementById('cdr_pourcent_def').value;
				pourcent_cdr_def_q = Math.round(parseFloat(pourcent_cdr_def_q)/10);
				pourcent_cdr_def_q = pourcent_cdr_def_q/10;

				// ancienne question pour la vitesse de l'univers
				var vitesse_uni_q = 1;

			var option1 = techno_arme +'/'+ techno_boulier +'/'+ techno_protect +'/'+ techno_combu +'/'+ techno_impu+
						'/'+ techno_hyper +'/'+ coordonee_depart +'/'+ vitesse_vaisseaux_plus_lent +'/'+ pourcent_cdr_q +'/'+ pourcent_cdr_def_q+
						'/'+ vitesse_uni_q;
			GM_setValue('option1'+ serveur, option1);
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

			var option2 = ressource_prend +'/'+ cdr_prend +'/'+ tot_prend +'/'+ prend_type_x +'/'+
				selection_classement +'/'+ save_auto_scan_rep +'/'+ scan_remplace_rep +'/'+ minutes_total_suprime_scan+
				'/'+ import_qq_rep +'/'+ q_reverse_c +'/'+ nb_max_def_dans_scan +'/'+ taux_m_rep +'/'+ taux_c_rep +'/'+ taux_d_rep+
				'/'+ nb_pt_ou_gt_preremplit +'/'+ nb_pourcent_ajout_lien_rep +'/'+ nb_ou_pourcent_rep;
			GM_setValue('option2'+ serveur, option2);
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

		var option3 = coll_att +'/'+ coll_att_g +'/'+ coll_dest +'/'+ coll_att_r +'/'+ coll_att_g_r +'/'+ coll_dest_r;
		GM_setValue('option3'+ serveur, option3);
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
				var sim_q_autre = document.getElementById("sim_q_autre").checked;
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
				var ress_x_h = Math.floor(ress_nb_min + (ress_nb_h*60) + parseInt((ress_nb_j*60*24)));

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

			GM_setValue('option4'+ serveur, option4);
		//}

		{// option de langue
			var q_langue = document.getElementById('langue').value;
			var option5 = q_langue;
			GM_setValue('option5'+ serveur, option5);

			fadeBoxx(text.option_sv, 0, 5000);
		}
		stockageOption.save();
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

		var option_save_bbcode = col1 +'/'+	col2 +'/'+ col3 +'/'+ col4 +'/'+ col5 +'/'+	col6 +'/'+ col7 +'/'+
				rep_center_type +'/'+ q_url_type +'/'+ q_centre +'/'+ q_cite;
		GM_setValue('option_bbcode'+ serveur, option_save_bbcode);
		//fadeBoxx(text.option_sv, 0, 5000);
	}

	function reset(serveur) {
		var continuer = confirm(text.q_reset);
		if (continuer === true) {
			GM_setValue('scan'+ serveur, '');
			fadeBoxx(text.reset, 0, 5000);
		}
	}
	function resetoption(serveur) {
		var continuer = confirm(text.q_reset_o);
		if (continuer === true) {
			GM_setValue('option1'+ serveur, '0/0/0/0/0/0/x:xxx:x/4000/0.3/0/1');
			GM_setValue('option2'+ serveur, '0/100/100/0/12/1/0/4320/1/1/0/1/1/1/2/0/0');
			GM_setValue('option3'+ serveur, '#C7050D/#025716/#FFB027/#E75A4F/#33CF57/#EFE67F');
			GM_setValue('option4'+ serveur, '1/0/0/0/1/1/1/1/0/0/0/1/0/0/0/0/1/0/1/1/0/0/0/1/1/1/1/1/x/x/0/1/1/1');
			GM_setValue('exversion'+ serveur, info.version);

			fadeBoxx(text.reset_s, 0, 5000);
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
				num_page = parseInt(url.split('&page_r=')[1].replace( /[^0-9-]/g, ""));
			} else {
				num_page = 1 ;
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
			nb_scan_deb =0;
		}
		var retour_scan = [nb_scan_fin, nb_scan_deb];
		return retour_scan;
	}

	// fonction pour creer un tableau html exportable
	function export_html (serveur, check, url, nb_scan_page) {
		var id_num;
		var tr_num;
		var scan_info = GM_getValue('scan' + serveur, '').split('#');
		var nb = scan_info.length;
		var export_html_2 ='';

		var nb_scan_deb_fin = connaitre_scan_afficher(serveur, nb_scan_page, url, nb);
		for(var p=nb_scan_deb_fin[1]; p<nb_scan_deb_fin[0]; p++)
		{
			id_num = 'check_'+ p +'';
			if (scan_info[p]) {
				if (scan_info[p] !== '' && scan_info[p] !== ' ' && scan_info[p])
				{
					if (document.getElementById(id_num))
					{
						if (document.getElementById(id_num).checked == check)
						{
							tr_num = 'tr_'+ p +'';
							export_html_2 = export_html_2 +'\n' + document.getElementById(tr_num).innerHTML.split('<td> <a href="http')[0] +'</tr>';
						}
					} else {nb_scan_deb_fin[0]++;}
				}
				else {nb_scan_deb_fin[0]++;}
			}
		}
		export_html_2 = '<table style="text-align:center;border: 1px solid black;font-size:10px;"><caption>Raide Facile. </caption><thead id="haut_table2"><tr>'+ document.getElementById("haut_table2").innerHTML +
			'</thead><tbody id="export_html_textarea" >'+ export_html_2 + '</tbody></table>';
		document.getElementById("text_html").innerHTML = export_html_2;
	}

	//function d'export des scans.
	function export_scan(serveur , check) {
		var id_num;
		var scan_info = GM_getValue('scan'+ serveur, '').split('#');
		var nb = scan_info.length;
		var export_f ='';

		var nb_scan_deb_fin = connaitre_scan_afficher(serveur, nb_scan_page, info.url, nb);

		for(var p=nb_scan_deb_fin[1]; p<nb_scan_deb_fin[0]; p++)
		{
			id_num = 'check_'+ p +'';
			if (scan_info[p]) {
				if (scan_info[p] !== '' && scan_info[p] !== ' ' && scan_info[p])
				{
					if (document.getElementById(id_num))
					{
						if (document.getElementById(id_num).checked == check)
						{
							export_f = export_f +'#' +scan_info[p];
						}
					} else {nb_scan_deb_fin[0]++;}
				}
				else {nb_scan_deb_fin[0]++;}
			}
		}
		document.getElementById("area_export").innerHTML = export_f;
	}

	//function d'import des scans.
	function import_scan(serveur , variable_q) {
		var scan_info = GM_getValue('scan'+ serveur, '');
		var scan_add = document.getElementById("area_import").value;
		scan_add = scan_add.split('#');
		var scan_info3 ='';

		if (variable_q == 1) {
			for(var p = 0; p < scan_add.length; p++)
			{
				if (scan_add[p].split(';').length > 2)
				{scan_info3 = scan_info3 + '#'+ scan_add[p];}
			}
		} else { // variable_q = 0
			for(var q = 0; q < scan_add.length; q++)
			{
				if (scan_add[q].split(';').length > 2)
				{
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
		else {scan_info = scan_info3;}

		scan_info = scan_info.replace( /\#{2,}/g, "#");
		GM_setValue('scan'+ serveur, scan_info);
		fadeBoxx(text.import_rep, 0, 5000);
	}

	// fonction pour savoir le nombre de pt et gt qu'il faut pour prendre le maximum de reosourcce en raidant
	function shipCount(m, k, d, cargo, pourcent) {
		return Math.ceil ((Math.ceil (Math.max (m + k + d, Math.min (0.75 * (m * 2 + k + d), m * 2 + d))) * (pourcent/100)) / cargo);
	}

	// pouvoir suprimer plusieurs scan. depuis raide-facile grace au checbox
	function del_scan_checkbox(serveur , check) {
		var id_num;
		var scan_info = GM_getValue('scan'+ serveur, '').split('#');
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
				p = (parseInt(num_page) - 1)*nb_scan_page;
				nb_scan_fin = parseInt(num_page)*nb_scan_page;
			}
		} else {
			nb_scan_fin = nb;
			p = 0;
		}

		for(; p < nb_scan_fin; p++) {
			id_num = 'check_'+ p +'';
			if (scan_info[p]) {
				// on verifie que le scan est bien afficher dans la colone sinon on rajoute +1 au nombre final pour verifier les scan afficher l(par rapport au nombre demander)
				if (scan_info[p] !== '' && scan_info[p] !== ' ' && scan_info[p].split(';')[4] && document.getElementById(id_num) !== null)
				{
					if (document.getElementById(id_num).checked == check)
					{
						scan_info[p] = '';
					}

				} else {nb_scan_fin++;}
			}
		}
		scan_info = scan_info.join('#');
		scan_info = scan_info.replace( /\#{2,}/g, "#");
		GM_setValue('scan'+ serveur, scan_info);
		fadeBoxx(text.del_scan, 0, 3000);
	}

	//calcul la production en met/cri/deut par heure selon les coordonees , les mines et la temperature max.
	function calcule_prod(mine_m, mine_c, mine_d, coordonee, tmps_max, vitesse_uni) {
		var retour = {};
		if (mine_m != '?' && mine_m != '?' && mine_m != '?' && coordonee.split(':')[2] !== undefined)
		{
			var prod_m = Math.floor((30*parseInt(mine_m)*Math.pow(1.1, parseInt(mine_m))+30)*vitesse_uni);
				retour.metal = prod_m;
			var prod_c = Math.floor((20*parseInt(mine_c)*Math.pow(1.1, parseInt(mine_c))+15)*vitesse_uni);
				retour.cristal = prod_c;

				// on cherche la temperature de la planette grace au coordonée si on ne la connait pas
				if (tmps_max === '?' || tmps_max === ' ' || tmps_max === '') {
					var pos_planette = coordonee.split(':')[2].replace( /[^0-9-]/g, "");
					if (pos_planette <= 3)
						{tmps_max = 123;}
					else if (pos_planette <= 6)
						{tmps_max = 65;}
					else if (pos_planette <= 9)
						{tmps_max = 35;}
					else if (pos_planette <= 12)
						{tmps_max = 15;}
					else if (pos_planette <= 15)
						{tmps_max = -40;}
				}
			var prod_d = vitesse_uni * parseInt(Math.floor(10 * parseInt(mine_d) * (Math.pow(1.1,parseInt(mine_d)) * (1.44 - (tmps_max * 0.004) ))));
				retour.deut = prod_d;

			return retour;
		}
		else {retour.metal = '?';retour.cristal = '?';retour.deut = '?';
			return retour;}
	}

	function vitesse_vaisseau(impulsion ,hyper_h ,combus, value_select) {
	/***********  vitessse minimum *********************/
			// on voit change la vitesse des vaisseaux qui change de techno selon les niveau de celle ci
		var vitesse_pt;
		var prop_pt;
		if (parseInt(impulsion) >= 5) {
			vitesse_pt = "10000";
			prop_pt = "imp";
		} else {
			vitesse_pt = "5000";
			prop_pt = "comb";
		}

		var vitesse_bb;
		var prop_bb;
		if (parseInt(hyper_h) >= 8) {
			vitesse_bb = "5000";
			prop_bb = "hyp";
		} else {
			vitesse_bb = "4000";
			prop_bb = "imp";
		}

		var vaisseau_type = new Array(vari.pt, vari.gt, vari.cle, vari.clo, vari.cro, vari.vb, vari.vc, vari.rec, vari.esp, vari.bb, vari.dest, vari.edlm, vari.tra);
		var vaisseau_vitess_deb = new Array(vitesse_pt, "7500", "12500", "10000", "15000", "10000", "2500", "2000", "100000000", vitesse_bb, "5000", "100", "10000");
		var vaisseau_type_prop = new Array(prop_pt, "comb", "comb", "imp", "imp", "hyp", "imp", "comb", "comb", prop_bb, "hyp", "hyp", "hyp");

		// on regarde le vaisseau selectionner et on cherche sa vitesse minimale
		var vitesse_mini;
		if (vaisseau_type_prop[value_select] == "comb")
		{
			vitesse_mini = Math.round(parseInt(vaisseau_vitess_deb[value_select])*(1 + (0.1 * parseInt(combus))));
		}
		else if (vaisseau_type_prop[value_select] == "imp")
		{
			vitesse_mini = Math.round(parseInt(vaisseau_vitess_deb[value_select])*(1 + (0.2 * parseInt(impulsion))));
		}
		else if (vaisseau_type_prop[value_select] == "hyp")
		{
			vitesse_mini = Math.round(parseInt(vaisseau_vitess_deb[value_select])* (1 + (0.3 * parseInt(hyper_h))));
		}
		return vitesse_mini;
	}

	function vaisseau_vitesse_mini(impulsion ,hyper_h ,combus, value_select, coordonee_cible , vitesse_uni) {
		if (!vitesse_uni || vitesse_uni <= 0) {vitesse_uni = 1;}
		var distance;
		var vitesse_mini = vitesse_vaisseau(impulsion ,hyper_h ,combus, value_select);
	/***************  Distance *********************/
		var planette_selec = document.getElementsByName('ogame-planet-coordinates')[0].content;
		planette_selec = planette_selec.split(':');
		var galaxie_j = planette_selec[0].replace( /[^0-9-]/g, "");
		var system_j = planette_selec[1].replace( /[^0-9-]/g, "");
		var planet_j = planette_selec[2].replace( /[^0-9-]/g, "");

		var coordonee_cible_split = coordonee_cible.split(':');
		var galaxie_c = coordonee_cible_split[0].replace( /[^0-9-]/g, "");
		var system_c = coordonee_cible_split[1].replace( /[^0-9-]/g, "");
		var planet_c = coordonee_cible_split[2].replace( /[^0-9-]/g, "");

		// on calcule la distance entre la cible et la planette d'attaque(de depart)
		if (galaxie_j != galaxie_c)
		{
			distance = 20000*Math.abs(parseInt(galaxie_j) - parseInt(galaxie_c));

		}
		else {
			if (system_j != system_c)
			{
				distance = 2700 + 95*Math.abs(parseInt(system_j) - parseInt(system_c));
			}
			else {
				distance = 1000 + 5*Math.abs(parseInt(system_j) - parseInt(system_c));
			}
		}

	/***************  Temps de vol  *********************/

		var temps_de_vol_sec = 10 + ((35000/100) * (Math.sqrt((distance*1000)/vitesse_mini)));
		temps_de_vol_sec = Math.round(temps_de_vol_sec/vitesse_uni);

		var minutes = Math.floor(temps_de_vol_sec/60);
		var heures = Math.floor(minutes/60);
		var jours = Math.floor(heures/24);
		var secondes = Math.floor(temps_de_vol_sec%60);
			minutes = Math.floor(minutes%60);
			heures = Math.floor(heures%24);

		var temp_vol = jours +'j '+	heures +'h '+ minutes +'min'+ secondes +'s';
		var sec_arrive = info.startTime + parseInt(temps_de_vol_sec)*1000;
		var date_arrive = new Date();
		date_arrive.setTime(parseInt(sec_arrive));
		var date_arrive_f = date_arrive.getDate() +'/'+ date_arrive.getMonth() +'/'+ date_arrive.getFullYear() +' à '+ date_arrive.getHours() +'h '+ date_arrive.getMinutes() +'min'+ date_arrive.getSeconds()+'s';

		var sec_retour = info.startTime + parseInt(temps_de_vol_sec)*2000;
		var date_retour = new Date();
		date_retour.setTime(sec_retour);
		var date_retour_f = date_retour.getDate() +'/'+ date_retour.getMonth() +'/'+ date_retour.getFullYear() +' à '+ date_retour.getHours() +'h '+ date_retour.getMinutes() +'min'+ date_retour.getSeconds()+'s';

		var acconyme_temps = '<acronym title=" '+ text.arriv_f +' : '+ date_arrive_f +' | '+ text.retour_f +' : '+ date_retour_f +'">'+ temp_vol + '</acronym>';

	return acconyme_temps;
	}

	function calcul_dernier_vidage(metal, cristal, deut, prod_m, prod_c, prod_d, heure_scan, mine_m) {

		if (mine_m != '?' && prod_m !== 0 && prod_m != '?') {
			//prod_par_h on change en prod par minutes.
			var prod_m_sec = parseInt(prod_m)/3600;
			var prod_c_sec = parseInt(prod_c)/3600;
			var prod_d_sec = parseInt(prod_d)/3600;

			// on cherche le nombre de seconde pour produire le metal/cristal/deut sur la planette
			var nb_sec_m = Math.round(parseInt(metal)/prod_m_sec);
			var nb_sec_c = Math.round(parseInt(cristal)/prod_c_sec);
			var nb_sec_d = Math.round(parseInt(deut)/prod_d_sec);

			// on trie
			var sortNumber = function(a,b) {return a - b;};
			var array_nb_sec = [nb_sec_m, nb_sec_c, nb_sec_d];
			array_nb_sec.sort(sortNumber);

			// on prend le temps le plus grand
			var heure_dernier_vidage = parseInt(heure_scan) - parseInt(array_nb_sec[0])*1000;

			var datecc = new Date();
			datecc.setTime(heure_dernier_vidage);
			var date_final = datecc.getDate()+'/'+ (parseInt(datecc.getMonth()) + 1) +'/'+datecc.getFullYear()+ ' ' +
				datecc.getHours()+ ':'+ datecc.getMinutes()+ ':'+datecc.getSeconds()  ;

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
		var heure_moin24h = info.startTime - 24*60*60*1000;
		for(var t=0; t<attaque_deja_split.length; t++)
		{
			attaque_heure = attaque_deja_split[t].split('/')[0];
			if (attaque_heure < heure_moin24h)// alors l'attaque etait fait il y a plus de 24h donc on s'en fou
			{
				attaque_deja_split[t] = '';
			}
		}
		attaque_deja = attaque_deja_split.join('#').replace( /\#{2,}/g, "#");
		GM_setValue('attaque_24h', attaque_deja);
	}

	function afficher_erreur(lieu, err) {
		var erreur = '<center><strong>Erreur</strong></center> \n <BR/> <strong>Name: </strong>'+ err.name +'\n <BR/><strong>Description: </strong>'+ err.message + '\n <BR/> <strong> Browser : </strong>'+navigator.userAgent +
					'\n <BR/> <strong>Url: </strong>'+ document.location.href.split('&s')[0] + '\n <BR/> <strong>Line: </strong>'+ err.lineNumber +'<BR/>\n <strong>Version : </strong>'+ info.version;
		if (langue != 'fr') {
			erreur = erreur +'\n <BR/><strong> Report here: </strong>' + '<a href="http://userscripts.org/scripts/show/72438"> http://userscripts.org/scripts/show/72438 </a>';
		} else {
			erreur = erreur +'\n <BR/><strong> Merci de signalez l\'erreur ici: </strong>' + '<a href="http://board.ogame.fr/board1474-ogame-le-jeu/board641-les-cr-ations-ogamiennes/board642-logiciels-tableurs/978693-raide-facile/">http://board.ogame.fr/board1474-ogame-le-jeu/board641-les-cr-ations-ogamiennes/board642-logiciels-tableurs/978693-raide-facile/</a>';
		}
		var sp1 = document.createElement('div');
		sp1.id = "erreur";
		sp1.setAttribute('style','display:block !important;color:#214563;background-color: #FFFFFF;');
		sp1.innerHTML = erreur;
		document.getElementById('contentWrapper').insertBefore(sp1,document.getElementById(lieu));
	}
//}endregion

/** page de combat report **///{region
	//recupere les informations des rapports de combat pour que le compteur d'attaque
	function get_info_combat() {
		var messages = document.getElementById('messagebox').getElementsByClassName('note')[0].innerHTML;
		if (document.getElementById('battlereport'))
		{
			//recupere la date du combat.
			var date_complet_combat = document.getElementsByClassName('infohead')[0].getElementsByTagName('td')[3].innerHTML;//exemple : 02-09 10:39:35
				var jours_mois_anne_combat = date_complet_combat.split('.');
					var mois_combat = parseInt(supr0(jours_mois_anne_combat[1])) - 1 ;
					var jours_combat = parseInt(supr0(jours_mois_anne_combat[0]));
					var anne_combat = parseInt(jours_mois_anne_combat[2].split(' ')[0]);

				var sec_min_heure_combat = date_complet_combat.split(' ')[1].split(':');
					var heures_combat = sec_min_heure_combat[0];
					var min_combat = sec_min_heure_combat[1];
					var sec_combat = sec_min_heure_combat[2];

				var date_combat_ms = new Date(info.date.getFullYear(), mois_combat, jours_combat, heures_combat, min_combat, sec_combat);
				date_combat_ms = date_combat_ms.getTime();

			if (date_combat_ms  > (info.startTime - 24*60*60*1000))//on verifie que cela fait moin de 24h que l'attaque a eu lieu
			{
				var attaque_deja = GM_getValue('attaque_24h', '');
				if (attaque_deja.indexOf(date_combat_ms) == -1)// si le combat n'est pas déja enregistré
				{
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
					for(var k = 0; k < bloc_attaquant.length; k++) {
						attaquant[k] = bloc_attaquant[k].firstElementChild.textContent;
					}

					var bloc_defenseur = bloc_combatants[2].children;
					var defenseur = [];
					for(var l = 0; l < bloc_defenseur.length; l++) {
						defenseur[l] = bloc_defenseur[l].firstElementChild.textContent;
					}

					if ($.inArray(pseudo_de, attaquant) !== -1) {
						// le joueur est un des attaquants
						var attaque_news =  date_combat_ms + '/'+ coordonee_combat;
						attaque_deja = attaque_deja + '#'+ attaque_news;
						attaque_deja = attaque_deja.replace( /\#{2,}/g, "#");
						GM_setValue('attaque_24h', attaque_deja);
					}
				}
			}
		}
	}
//}endregion

