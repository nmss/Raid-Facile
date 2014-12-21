/* test encodage
ces caractère doivent être ben accentués et bien écrits, sinon c'est qu'il y a un problème
aâàã eéêè iîì ñ oôòõ uûù €
*/

/************************* PAGE DE MESSAGE *************************///{
	// function suprimer un scan depuis le pop-up
	function supr_scan1(serveur){
		var dateCombat = $('div.showmessage[data-message-id] .infohead tr:eq(3) td').text().match(/(\d+)\.(\d+)\.(\d+) (\d+):(\d+):(\d+)/);
		if (dateCombat.length != 7) {
			console.error('[raid facile] Erreur n°15045');
		}
		var date_scan = (new Date(dateCombat[3], parseInt(dateCombat[2])-1, dateCombat[1], dateCombat[4], dateCombat[5], dateCombat[6])).getTime();

		var scan_info = GM_getValue('scan'+ serveur, '').split('#');
		var listeDateRC = '';
		var suppr = 0;
		for(var i=0; i<scan_info.length; i++) {
			listeDateRC = scan_info[i].split(';')[0];
			if (listeDateRC == date_scan) {
				scan_info[i] = '';
				++suppr;
			}
		}
		scan_info = scan_info.join('#');
		scan_info = scan_info.replace( /\#{2,}/g, "#");

		GM_setValue('scan'+ serveur, scan_info);
		fadeBoxx(suppr+' '+text.rep_mess_supri, 0, 3000);
	}

	function save_scan(serveur, id_rc, popup, afficherResultat){
		if (!id_rc) return;

		var date_combat_total = "";

		if (popup) {// on se place dans le scan en pop up
			var document_spatio = $('div.showmessage[data-message-id="'+id_rc+'"]').get(0);
			date_combat_total = document_spatio.getElementsByClassName('infohead')[0].innerHTML;

		} else { // on se place dans la partie du scan(partie pour les scans pré-ouverts)
			var nom_spatio = 'spioDetails_'+ id_rc;
			var document_spatio = document.getElementById(nom_spatio);

			var document_entete = document.getElementById(id_rc + 'TR');
			if (!document_entete) // Pour la version 5.0.0
				document_entete = document.getElementById('TR' + id_rc);
			date_combat_total = document_entete.getElementsByClassName('date')[0].innerHTML;
		}

// heure du scans - Modification Deberron
		var date_combat = date_combat_total.match(/(\d+)\.(\d+)\.(\d+) (\d+):(\d+):(\d+)/i);
		var jours = date_combat[1];
		var mois = date_combat[2]-1;
		var annee = date_combat[3];
		var heure = date_combat[4];
		var min = date_combat[5];
		var sec = date_combat[6];
		var date_scan = (new Date(annee, mois, jours, heure, min, sec)).getTime();

	// nom de planette et coordoné et nom joueurs

		var planette_et_joueur_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[0].innerHTML;

		spans = document_spatio.getElementsByClassName('material spy')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[0].getElementsByTagName('span');
		nom_joueur = spans[spans.length-1].innerHTML;
			// si antigame est installé et interfere dans le nom du joueurs
		if(nom_joueur.indexOf('war-riders.de') != -1){nom_joueur = document_spatio.getElementsByClassName('material spy')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[0].getElementById("player_name").innerHTML;}

		var coordonnee = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('area')[0].getElementsByTagName('a')[0].innerHTML;
		var nom_plannette = '?';
		if(planette_et_joueur_scan.indexOf('<span>')>= 0)
		{
			nom_plannette = planette_et_joueur_scan.split(' <span>')[0];
			nom_plannette = nom_plannette.split(vari.sur)[1];
		}
		else{
			nom_plannette = planette_et_joueur_scan.split(' <a')[0];
			// normalement il y a une balise <figure> entre le "sur" et le nom de la planète
			// nom_plannette = nom_plannette.split(vari.sur)[1];
			nom_plannette = nom_plannette.split('</figure>')[1];
		}
				//si le nom de planete a un # on le remplace pour pas qu'il interfere dans le split plus tard
		if(nom_plannette.indexOf('#')>=0){
			nom_plannette = nom_plannette.replace( /\#/g, "1diez1");
		}

//ajout Deberron - type de joueur
		var typeJoueur = "";
		var pourcent = 50;
		if(planette_et_joueur_scan.indexOf('status_abbr_active')>= 0)
			typeJoueur = "";
		else if(planette_et_joueur_scan.indexOf('status_abbr_honorableTarget')>= 0) {
			typeJoueur = "ph";
			pourcent = 75;
		}
		else if(planette_et_joueur_scan.indexOf('status_abbr_outlaw')>= 0)
			typeJoueur = "o";
		else if(planette_et_joueur_scan.indexOf('status_abbr_inactive')>= 0)
			typeJoueur = "i";
		else if(planette_et_joueur_scan.indexOf('status_abbr_longinactive')>= 0)
			typeJoueur = "I";
		else if(planette_et_joueur_scan.indexOf('status_abbr_strong')>= 0)
			typeJoueur = "f";
		else if(planette_et_joueur_scan.indexOf('status_abbr_vacation')>= 0)
			typeJoueur = "v";
		// else if(planette_et_joueur_scan.indexOf('status_abbr_ally_own')>= 0)
		// else if(planette_et_joueur_scan.indexOf('status_abbr_ally_war')>= 0)
//ajout Deberron - type de joueur
		var typeHonor = "";
		if(planette_et_joueur_scan.indexOf('rank_bandit1')>= 0) {
			typeHonor = "b1";
			pourcent = 100;
		}
		else if(planette_et_joueur_scan.indexOf('rank_bandit2')>= 0) {
			typeHonor = "b2";
			pourcent = 100;
		}
		else if(planette_et_joueur_scan.indexOf('rank_bandit3')>= 0) {
			typeHonor = "b3";
			pourcent = 100;
		}
		else if(planette_et_joueur_scan.indexOf('rank_starlord1')>= 0)
			typeHonor = "s1";
		else if(planette_et_joueur_scan.indexOf('rank_starlord2')>= 0)
			typeHonor = "s2";
		else if(planette_et_joueur_scan.indexOf('rank_starlord3')>= 0)
			typeHonor = "s3";

	// on recupere l'id du rc
		if( info.url.indexOf('index.php?page=messages')>=0)//si on est dans les scan preouvert
		{
			var idRC = id_rc;
		}
		else{// si on est dans la page pop up
			var idRC = info.url.split('&msg_id=')[1];
			if(info.url.indexOf('&mids')==-1)
			{
				idRC = idRC.split('&cat')[0];
			}
			else {idRC = idRC.split('&mids')[0];}
		}

//modif deberron // on recupere avec le lien pour attaquer si c'est un lune ou une planette
		var type_planette=document_spatio.getElementsByClassName('defenseattack spy')[0].getElementsByClassName('attack')[0].innerHTML.match(/type=(\d+)/i);
			type_planette = type_planette ? type_planette[1] : 1;

		// on verifie si le scan est nouveau
		if (GM_getValue('scan'+ serveur, '').indexOf(idRC)==-1)
			var newscan = '0';
		else
			var newscan = 'nan';

		// on verifie si le scan  peut etre enregistré par rapport a sa date d'expiration(parametre d'option)  et si il est nouveau
		if((info.startTime - nb_ms_garde_scan ) < parseInt(date_scan) && newscan == '0'){
			// on recupere les ressources de la planettes
			var ressource_m_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('fragment spy2')[0].getElementsByTagName('td')[1].innerHTML.replace( /[^0-9-]/g, "");
			var ressource_c_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('fragment spy2')[0].getElementsByTagName('td')[3].innerHTML.replace( /[^0-9-]/g, "");
			var ressource_d_scan = document_spatio.getElementsByClassName('material spy')[0].getElementsByClassName('fragment spy2')[0].getElementsByTagName('td')[5].innerHTML.replace( /[^0-9-]/g, "");

			// on cherche si il y a eu de l'activité et combien de temps
			var activite_scan = document_spatio.getElementsByClassName('aktiv spy')[0].innerHTML;
			activite_scan = activite_scan.split('</div></div></span>')[1].replace( /[^0-9-]/g, "");
			if( activite_scan == ''){activite_scan = 'rien';}

			// on creer des array par rapport a ce que l'on veut recupere
			var vaisseau = new Array(vari.pt, vari.gt, vari.cle, vari.clo, vari.cro, vari.vb, vari.vc, vari.rec, vari.esp, vari.bb, vari.sat, vari.dest, vari.edlm, vari.tra);
			var defense = new Array(vari.lm, vari.lle, vari.llo, vari.gauss, vari.ion, vari.pla, vari.pb, vari.gb, vari.mic, vari.mip);
			var recherche = new Array(vari.tech_arm, vari.tech_bouc, vari.tech_pro );
			var mine = new Array(vari.mine_m, vari.mine_c, vari.mine_d );

			// array de perte d'unité par rapport au vaisseau/defense
			var vaisseau_perte = new Array("4000", "12000", "4000", "10000", "27000", "60000", "30000", "16000", "1000" ,"75000", "2000", "110000", "9000000", "70000");
			var vaisseau_perte_m = new Array("2000", "6000", "3000", "6000", "20000", "45000", "10000", "10000", "0" ,"50000", "0", "60000", "5000000", "30000");
			var vaisseau_perte_c = new Array("2000", "6000", "1000", "4000", "7000",  "15000", "20000", "6000",  "1000" ,"25000", "2000", "50000", "4000000", "40000");

			var def_perte = new Array("2000", "2000", "8000", "35000", "8000", "100000", "20000", "100000", "0" ,"0");
			var def_perte_m = new Array("2000", "1500", "6000", "20000", "2000", "50000", "10000", "50000", "0" ,"0");
			var def_perte_c = new Array("0", "500", "2000", "15000",  "6000", "50000", "10000", "50000", "0" ,"0");

			//valeur de base d'attaque pour vaissea/défense
			var valeur_attaque_vaisseau = new Array( "5", "5", "50", "150", "400","1000", "50", "1", "1", "1000", "1", "2000", "200000", "700");
			var valeur_attaque_defense = new Array( "80", "100", "250", "1100", "150", "3000", "1","1","0","0");

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
			var nb_vaisseau_type = ' ';
			var nb_def_type = ' ';
			var nb_recherche = '';
			var nb_mine = '';

		/******* RECHERCHE *******/ // j'ai la mit la recherche avant alors que c'est apres a cause du besoin de recherche pour calculer la valeur de flotte/def
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[3]){
				var flotte_inter3 = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].innerHTML;
			}else{flotte_inter3 ='';}

			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[3] && flotte_inter3.indexOf('area plunder',0) == -1  ){
				// on compte le nombre de type de recherche affiché.
				var nb_type_recherche = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].getElementsByClassName('key').length;
				for(var j=0; j<nb_type_recherche ; j++)
				{
					var type_recherche = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].getElementsByClassName('key')[j].innerHTML;//23.03.2010 22:27:56
					for(var k=0; k<recherche.length ; k++)
					{
						//on recupere le type de recherche et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
						if(type_recherche == recherche[k])
						{
							nb_recherche = document_spatio.getElementsByClassName('fleetdefbuildings spy')[3].getElementsByClassName('value')[j].innerHTML;
							recherche_scan[k] = parseInt(nb_recherche);
						}
					}

				}
			}//sinon elle existe pas alors on le voit pas donc ?
			else{
				nb_recherche = '?';
				recherche_scan = new Array("?", "?", "?");}

			if(recherche_scan[0] == "?"){var recherche_pour_valeur = new Array(0, 0, 0);}
			else{var recherche_pour_valeur = recherche_scan;}

		/******* VAISSEAU + CDR *******/// on recupere les vaisseaux et le cdr creables.
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[0]){
				var flotte_inter = document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].innerHTML;
			}else{flotte_inter ='';}

			// on verifie que l'on voit bien la flotte
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[0] && flotte_inter.indexOf('area plunder' ,0) == -1 ){

					// on compte le nombre de type de vaisseau affiché.
					var nb_type_vaisseau = document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].getElementsByClassName('key').length;
					for(var j=0; j<nb_type_vaisseau ; j++)
					{
						//on recupere le type du vaisseau et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
						var type_vaisseau = document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].getElementsByClassName('key')[j].innerHTML;
						for(var k=0; k<vaisseau.length ; k++)
						{
							if(type_vaisseau == vaisseau[k])
							{
								nb_vaisseau_type = (document_spatio.getElementsByClassName('fleetdefbuildings spy')[0].getElementsByClassName('value')[j].innerHTML).replace( /[^0-9-]/g, "");
								valeur_attaque_flotte = valeur_attaque_flotte + parseInt(nb_vaisseau_type)*parseInt(valeur_attaque_vaisseau[k])*(1 + 0.1*parseInt(recherche_pour_valeur[0]));

								cdr_possible = parseInt(cdr_possible) + parseInt(vaisseau_perte[k])*parseInt(nb_vaisseau_type);
								cdr_possible_m = parseInt(cdr_possible_m) + parseInt(vaisseau_perte_m[k])*parseInt(nb_vaisseau_type);
								cdr_possible_c = parseInt(cdr_possible_c) + parseInt(vaisseau_perte_c[k])*parseInt(nb_vaisseau_type);

								vaisseau_scan[k] = parseInt(vaisseau_scan[k]) + parseInt(nb_vaisseau_type);
								nb_vaisseau_s = parseInt(nb_vaisseau_s) + parseInt(nb_vaisseau_type);
							}
						}

					}
			}
			else {cdr_possible = '?';
				nb_vaisseau_type = '?';
				valeur_attaque_flotte = '?';
				vaisseau_scan = new Array("?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?");
				nb_vaisseau_s = -1;
			}
			if(cdr_possible == '' || cdr_possible == ' '){cdr_possible = 0;}

		/******* DEFENSE *******/
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[1]){
				var flotte_inter1 = document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].innerHTML;
			}else{flotte_inter1 ='';}

			// on verifie que l'on voit bien la def et on verifie que ce que je prenne c'est pas le tableau d'antigame
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[1] && flotte_inter1.indexOf('area plunder' ,0) == -1 ){
				// on compte le nombre de type de vaisseau affiché.
				var nb_type_def = document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].getElementsByClassName('key').length;
				for(var j=0; j<nb_type_def ; j++){
					//on recupere le type de la defense et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
					var type_def = document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].getElementsByClassName('key')[j].innerHTML;//23.03.2010 22:27:56
					for(var k=0; k<defense.length ; k++){
						if(type_def == defense[k])
						{
							nb_def_type = (document_spatio.getElementsByClassName('fleetdefbuildings spy')[1].getElementsByClassName('value')[j].innerHTML).replace( /[^0-9-]/g, "");
							valeur_attaque_def = valeur_attaque_def + parseInt(nb_def_type)*parseInt(valeur_attaque_defense[k])*(1 + 0.1*parseInt(recherche_pour_valeur[0]));// +t pour faire fonctionner la fonction replace

							defense_scan[k] = parseInt(defense_scan[k]) + parseInt(nb_def_type);
							nb_def_s = parseInt(nb_def_s) + parseInt(nb_def_type);

							cdr_possible_def = parseInt(cdr_possible_def) + parseInt(def_perte[k])*parseInt(nb_def_type);
							cdr_possible_def_m = parseInt(cdr_possible_def_m) + parseInt(def_perte_m[k])*parseInt(nb_def_type);
							cdr_possible_def_c = parseInt(cdr_possible_def_c) + parseInt(def_perte_c[k])*parseInt(nb_def_type);

						}
					}

				}
				var cdr_def = cdr_possible_def +'/'+ cdr_possible_def_m +'/'+ cdr_possible_def_c;
			}
			else {
				nb_def_type = '?';
				valeur_attaque_def = '?';
				defense_scan = new Array("?", "?", "?", "?", "?", "?", "?", "?", "?", "?");
				nb_def_s = -1;
				var cdr_def = '?/?/?';
			}

		/******* Batiment (MINE) *******/
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[2]){
				var flotte_inter2 = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].innerHTML;
			}else{flotte_inter2 ='';}

			// on verifie que l'on voit le batiment et que ce n'est pas antigame
			if(document_spatio.getElementsByClassName('fleetdefbuildings spy')[2] && flotte_inter2.indexOf('area plunder' ,0) == -1 ){
				// on compte le nombre de type de batiment affiché.
				var nb_type_mine = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].getElementsByClassName('key').length;
				for(var jj=0; jj<nb_type_mine ; jj++)
				{
					//on recupere le type de la batiment et apres on cherche c'est lequels, et on remplit les infos dans la case qui lui correspond dans les array
					var type_mine = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].getElementsByClassName('key')[jj].innerHTML;//23.03.2010 22:27:56
					for(var kk=0; kk<mine.length ; kk++)
					{
						if(type_mine == mine[kk])
						{
							nb_mine = document_spatio.getElementsByClassName('fleetdefbuildings spy')[2].getElementsByClassName('value')[jj].innerHTML;
							mine_scan[kk] = parseInt(nb_mine);
						}
					}

				}
			}//si on elle existe pas alors on le voit pas donc ?
			else{ nb_mine = '?';
			mine_scan = new Array("?", "?", "?");}


		/* ******* INFO FINAL ********* */
			// on verifie que l'on peut enregistré selon toute les options
			var ressource_pillable = parseInt(ressource_m_scan) + parseInt(ressource_c_scan) + parseInt(ressource_d_scan);
			var cdr_possible2 = Math.round( ( cdr_possible!='?' ? cdr_possible : 0 ) * pourcent_cdr ) + Math.round( ( cdr_possible_def!='?' ? cdr_possible_def : 0 ) * pourcent_cdr_def );
			// les trois premiere ligne c'est selon le type d'enregistrement par rapport au ressource /cdr ou les deux. / la derniere ligne pour savoir par rapport a la def et que on voit bien les coordonées

			if(((type_prend_scan == 0 && (cdr_possible2 >= parseInt(valeur_cdr_mini) || (ressource_pillable*pourcent/100) >= parseInt(nb_scan_accpte) ))
				|| (type_prend_scan == 1 && cdr_possible2 >= parseInt(valeur_cdr_mini) && (ressource_pillable*pourcent/100) >= parseInt(nb_scan_accpte) )
				|| (type_prend_scan == 2 && (cdr_possible2 + (ressource_pillable*pourcent/100)) >= valeur_tot_mini))
				&& coordonnee != '' && (nb_max_def == 0 || nb_max_def > nb_def_s))
			{
				var info_final = date_scan + ';' + coordonnee + ';' + nom_joueur +  ';' + nom_plannette //0-1-2-3
								+ ';' + ressource_m_scan + ';' + ressource_c_scan + ';' + ressource_d_scan + ';' //4-5-6
								+ activite_scan + ';' + cdr_possible + ';' + vaisseau_scan.join('/') //7-8-9
								+ ';' + defense_scan.join('/') + ';' + idRC + ';' + ressource_pillable //10-11-12
								+ ';' + recherche_scan.join('/') + ';' + type_planette /*13/14*/
								+ ';' + cdr_possible_m + ';' + cdr_possible_c  + ';' + nb_vaisseau_s  + ';' + nb_def_s //15-16-17-18
								+ ';' + mine_scan.join('/') + ';x'+ ';'+ cdr_def //19-20-21
								+ ';' + valeur_attaque_flotte +';'+ valeur_attaque_def //22-23
								+ ';' + typeJoueur + ';' + typeHonor; //24-25

				var scan_info = GM_getValue('scan'+ serveur, '').split('#');

				//alert(info_final);
				// on suprime les scan trop vieux
				if(nb_ms_garde_scan != 0)
				{
					for(var i=0; i<scan_info.length ; i++)
					{
						var scan_info25 = scan_info[i].split(';');
						if(info.startTime - nb_ms_garde_scan > parseInt(scan_info25[0]))
						{
							scan_info[i]='';
						}
					}
				}

				// puis on sauvegarde si on remplace les scan de la meme planette et qu'il existe un scan avec les meme coordonées
				if(GM_getValue('scan'+ serveur, '').indexOf(coordonnee) > -1 && scan_remplace == 1)
				{
					var scan_remplacer_q = 0;// on boucle par rapport au nombre de scan
					for(var p=0; p<scan_info.length ; p++)
					{
						var scan_test = scan_info[p].split(';');
						// on verifie que le scan existe et on cherche si c'est les meme coordonées, si oui alors on regarde si il est plus récent, et si c'est bien le meme type (lune/planette)
						if(scan_test[9]){
							if(scan_info[p].indexOf(coordonnee)!= -1 && scan_test[14] == type_planette) {
								scan_remplacer_q = 1;
								if(parseInt(scan_test[0]) < parseInt(date_scan)) {
									// on vient d'ajouter un scan plus récent pour le même endroit
									scan_info[p] = info_final;
								}
							}
						}
					}
					// on regarde si il a remplacer ou pas le scan par un ancien, si non alors on l'ajoute
					if(scan_remplacer_q == 0){
						var scan_info2 = scan_info.join('#')+ '#'+ info_final;
					} else {
						var scan_info2 = scan_info.join('#');
					}

					scan_info2 = scan_info2.replace( /\#{2,}/g, "#");

					if(scan_info2 == '' || scan_info2 == '#')
					{
						GM_setValue('scan'+ serveur, '');
					}
					else{
						GM_setValue('scan'+ serveur, scan_info2);
					}

				}// si on remplace pas alors on ajoute sans reflechir et on suprime les scan ''
				else{
					var scan_info2 = scan_info.join('#');
						scan_info2 = scan_info2.replace( /\#{2,}/g, "#");

					if(scan_info2 == '' || scan_info2 == '#')
					{
						GM_setValue('scan'+ serveur, info_final);
					}
					else{
						GM_setValue('scan'+ serveur, scan_info2 +'#' + info_final);
					}
				}
				if (afficherResultat) {
					fadeBoxx('1 '+ text.rep_mess_add, 0, 1000);
				}
				return true;
			}
		}
		if (afficherResultat) {
			fadeBoxx('0 '+ text.rep_mess_add, 0, 500);
		}
		return false;
	}

	function bouton_supr_scan_depuis_mess(){
		if(document.getElementById('Bouton_Rf') == null && document.getElementById('mailz'))
		{
			var style_css = ' <style type="text/css">'
							+'.Buttons_scan_mess input {'
							+'	-moz-background-inline-policy:continuous;'
							+'	border:0 none; cursor:pointer;'
							+'	height:32px; text-align:center; width:35px;'
							+'}</style>';

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
			document.getElementById("scan_mess_a").addEventListener("click", function(event){supr_scan_dep_mess(1, true);if(info.firefox){unsafeWindow.mod = 9;}else{window.mod = 9;}document.getElementsByClassName('buttonOK deleteIt')[0].click();}, true);
			document.getElementById("scan_mess_s").addEventListener("click", function(event){supr_scan_dep_mess(2, true);if(info.firefox){unsafeWindow.mod = 7;}else{window.mod = 7;}document.getElementsByClassName('buttonOK deleteIt')[0].click();}, true);
			document.getElementById("scan_mess_ns").addEventListener("click", function(event){supr_scan_dep_mess(2, false);if(info.firefox){unsafeWindow.mod = 10;}else{window.mod = 10;}document.getElementsByClassName('buttonOK deleteIt')[0].click();}, true);

			document.getElementById("scan_a").addEventListener("click", function(event){supr_scan_dep_mess(1, true);}, true);
			document.getElementById("scan_s").addEventListener("click", function(event){supr_scan_dep_mess(2, true);}, true);
			document.getElementById("scan_ns").addEventListener("click", function(event){supr_scan_dep_mess(2, false);}, true);

			document.getElementById("scan_add_a").addEventListener("click", function(event){add_scan_dep_mess(1, true);}, true);
			document.getElementById("scan_add_s").addEventListener("click", function(event){add_scan_dep_mess(2, true);}, true);
			document.getElementById("scan_add_ns").addEventListener("click", function(event){add_scan_dep_mess(2, false);}, true);
		}
	}

	function add_scan_dep_mess(type_clique, check_q){
	//type_clique 1=affiche, 2 = select juste supr scan script , 3/4 idem mais script +scan
		var nb_scan_total_a_enr = document.getElementsByClassName('material spy').length;

		var tout_mess = document.getElementById('messageContent').innerHTML;
		tout_mess = tout_mess.split('switchView(\'spioDetails_');
		var nb_scan_plus_un = tout_mess.length;
		var nb_scan_enregistre = 0;

		if(type_clique ==2)
		{
			for(var nb_scan_s = 1 ; nb_scan_s < nb_scan_plus_un ; nb_scan_s++){

				var id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if(document.getElementById(id_rc).checked == check_q)
				{
					if(save_scan(info.serveur, id_rc, false))
						nb_scan_enregistre = nb_scan_enregistre + 1;
				}

			}
		}
		else if(type_clique == 1){
			for(var nb_scan_s = 1 ; nb_scan_s < nb_scan_plus_un ; nb_scan_s++){
				var id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if(save_scan(info.serveur, id_rc, false))
					nb_scan_enregistre = nb_scan_enregistre + 1;
			}
		}
		else{
			fadeBoxx('Error', 0, 3000);
			nb_scan_enregistre = 0;
		}
		fadeBoxx((nb_scan_enregistre) +' '+ text.rep_mess_add, 0, 3000);
	}

	function supr_scan_dep_mess(type_clique, check_q){
	//type_clique 1=affiche, 2 = select juste supr scan script , 3/4 idem mais script +scan
		var info_scan = GM_getValue('scan'+ info.serveur, '');
		var info_scan_i = info_scan.split('#');
		var nb_scan_total_a_enr = document.getElementsByClassName('material spy').length;

		var tout_mess = document.getElementById('messageContent').innerHTML;
		tout_mess = tout_mess.split('switchView(\'spioDetails_');
		var nb_scan_plus_un = tout_mess.length;
		var id_rc;

		if(type_clique == 2) {
			for(var nb_scan_s = 1 ; nb_scan_s < nb_scan_plus_un ; nb_scan_s++){
				id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if(info_scan.indexOf(id_rc) >=0 && document.getElementById(id_rc).checked == check_q)
				{
					for(var p=0; p<info_scan_i.length; p++)
					{
						if(info_scan_i[p].indexOf(id_rc, 0) >=0){info_scan_i[p] = '';}
					}
				}
			}
		}
		else if(type_clique == 1) {
			for(var nb_scan_s = 1 ; nb_scan_s < nb_scan_plus_un ; nb_scan_s++){
				id_rc = tout_mess[nb_scan_s].split('\');')[0];
				if(info_scan.indexOf(id_rc, 0) >=0)
				{
					for(var p=0; p<info_scan_i.length; p++)
					{
						if(info_scan_i[p].indexOf(id_rc, 0) >=0){info_scan_i[p] = '';}
					}
				}
			}
		}
		info_scan_i = info_scan_i.join('#');
		info_scan_i = info_scan_i.replace( /\#{2,}/g, "#");
		GM_setValue('scan'+ info.serveur, info_scan_i);
		fadeBoxx(text.rep_mess_supri, 0, 3000);
	}

	function scan_pop_up() {
		var pop_up = $('div.showmessage[data-message-id]');
		if (!pop_up.length) {
			// il n'y a pas de popup
			return;
		}
		if (info.chrome) {
			$('.contentPageNavi a', pop_up).click(function(){
				setTimeout(waitAjaxSuccessPopup, 333);
			});
		}
		var msg_id = pop_up.attr('data-message-id');
		if ($('.textWrapper .material.spy', pop_up).length) {
			if(scan_preenrgistre == 1) {
				save_scan(info.serveur, msg_id, true, true);
			}
			var tout_supr = '';
			// tout_supr += '<li class="delete" ><a class="tips2 action" id="2" href=""><span class="icon icon_trash float_left" id="RF_icon_delMEssScan"></span><span class="text"  id="RF_delMEssScan">'+ text.del_scan_script +'</span></a></li>';
			tout_supr += '<li class="delete" ><a class="tips2 action" href=""><span class="icon icon_trash float_left" id="RF_icon_delScan"></span><span class="text"  id="RF_delScan">'+ text.del_script +'</span></a></li>';
			tout_supr += '<li class="delete" ><a href=""><span class="icon float_left" style="background-position: 0 -64px; id="RF_icon_addScan"></span><span class="text" id="RF_addScan">'+ text.add_scan_d +'</span></a></li>';
			var newElement = $(tout_supr);
			// $('#RF_delMEssScan', newElement).closest('a').click(function(e){supr_scan1(info.serveur);});
			$('#RF_delScan', newElement).closest('a').click(function(e){
				e.preventDefault();
				supr_scan1(info.serveur);
			});
			$('#RF_addScan', newElement).closest('a').click(function(e){
				e.preventDefault();
				save_scan(info.serveur, msg_id, true, true);
			});
			newElement.insertBefore('.toolbar .delete', pop_up);
		}
	}
//}

/*######################################### SCRIPT  ################################################## */

init2();

/////////////////// PAGE GENERAL ///////////////////
if (info.page === 'overview') {
	// setSpeed();
	if (document.getElementsByName('ogame-universe-speed')[0]) {
		GM_setValue('vitesse_uni', document.getElementsByName('ogame-universe-speed')[0].content);
	}
}

/////////////////// PAGE DE MESSAGES AVEC POP UP ///////////////////
else if (info.page === 'showmessage') {
	// inutile depuis la màj des popup ?
	alert('[raid facile] Erreur n°164881');
	if(document.getElementsByClassName('note')[0].getElementsByClassName('material spy')[0])
	{
		scan_pop_up();
	}
	else if(document.getElementById('battlereport')){get_info_combat();}
}

/////////////////// Scan des Rapports d'espionnage ///////////////////
else if (info.page === 'messages') {
	function sauve_option2(){
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
				if(scan_preenrgistre == 1){
					if(save_scan(info.serveur, scans[i].id.replace('spioDetails_', ''), false)) {
						++nb_scan_enregistre;
					}
				}
			}
			if (nb_scan_enregistre > 0) {
				fadeBoxx((nb_scan_enregistre) +' '+ text.rep_mess_add, 0, 3000);
			}
		}
	}

	function safeWrap(f) {
		return function() {
			setTimeout.apply(window, [f, 0].concat([].slice.call(arguments)));
		};
	}

	// switch des actions suivant la catégorie
	function switchCat(cat) {
		switch (cat) {/*7 espionner , 5combat , 6joueur , 8expe,2 alli, 4 divers ^^*/
			case "9":
			case "7":
				sauve_option2();
				if(q_icone_mess == 1){bouton_supr_scan_depuis_mess();}
				break;
			// case "5":
				// sauve_option2();
				// break;
			case "10":
				// alert("Boîte de reception");
				sauve_option2();
				if(q_icone_mess == 1){bouton_supr_scan_depuis_mess();}
				break;
			case "3":
				// alert("Corbeille");
				// sauve_option2();
				// if(q_icone_mess == 1){bouton_supr_scan_depuis_mess();}
				break;
			default:
				// alert("Carnet d'adresse");
				break;
		}
	}

	// SCAN PREVOUERT
	if (info.firefox) {
		unsafeWindow.$(document).ajaxSuccess(safeWrap(function(e,xhr,settings){
			//l'url de la requête ajax contient page=messages
			if (settings.url.indexOf("page=messages") == -1) return;
			if (settings.data.indexOf("displayPage") == -1) return;
			// on affiche l'onglet charge
			var cat = settings.data.replace(/^.*displayCategory=([\d-]*).*$/,"$1");
			switchCat(cat);
		}));
	} else if(info.chrome) {
		var waitAjaxSuccessPreouvert = function() {
			// on vérifie si l'image de chargement est encore là
			if ($('#messageContent>img').length) {
				console.log('[raid facile] Attente des messages');
				setTimeout(waitAjaxSuccessPreouvert, 333);
			} else {
				var form = $('#messageContent>form');
				// si on est sur le carnet d'adresse on ne fait rien
				if (!form.length) return;
				// récupération de la catégorie
				var cat = $('#messageContent>form').attr('action').replace(/^.*displayCategory=([\d-]*).*$/,"$1");
				switchCat(cat);
			}
		};
		// en cas de clic on attend que l'action se fasse
		$('.mailWrapper, #tab-msg').on('click keypress', function(e){
			setTimeout(waitAjaxSuccessPreouvert, 333);
		});
		waitAjaxSuccessPreouvert();
	} else {
		alert('[raid facile] Erreur n°154000');
	}

	// SCAN POPUP
	if (info.firefox) {
		unsafeWindow.$(document).ajaxSuccess(safeWrap(function(e,xhr,settings){
			//l'url de la requête ajax contient page=showmessage
			if (settings.url.indexOf("page=showmessage") == -1) return;
			scan_pop_up();
		}));
	} else if(info.chrome) {
		var waitAjaxSuccessPopup = function() {
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
		$('.mailWrapper, #tab-msg').on('click keypress', function(e){
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
	//recupere les flottes en vol
	//recup_flotte_mv();

	/* ********************** On recupere les infos ************************/
	var url_2 = info.url.split('&raidefacil=scriptOptions')[0];
	var scanList = GM_getValue('scan'+ info.serveur, '').split('#');
	var bbcode_export = ' ';

	if ((info.url.indexOf('&del_scan=', 0)) >= 0) {
		var numero_scan = info.url.split('del_scan=')[1].split('&')[0];
		scanList.splice(numero_scan, 1);
		GM_setValue('scan'+ info.serveur, scanList.join('#'));
	}


/************************************** Trie du tableau ******************************************************/
	function trie_tableau(serveur, classementsecondaire, type_trie){
		var ligne_tableau = ' ';

		var scan_i = GM_getValue('scan'+ serveur, '').split('#');
		var nb = scan_i.length ;
		for (var h =0 ; h<nb ; h++) {// on split chaque scan en un tableau
			scan_i[h] = scan_i[h].split(';');
		}

		if(nb_scan_page != 0) {
			var num_page = info.url.split('&page_r=')[1];

			if(num_page == undefined || num_page == 1)
			{
				var nb_scan_deb = 0;
				var nb_scan_fin = nb_scan_page;
			}
			else if(num_page >= 1)
			{
				var nb_scan_deb = (parseInt(num_page) - 1)*nb_scan_page;
				var nb_scan_fin = parseInt(num_page)*nb_scan_page;
			}
		} else {
			var nb_scan_fin = nb;
			var nb_scan_deb =0;
		}

		//("ccoordonee","cplanete","cdate","cprod_h","cressourcexh","cress","ccdr","ccdr_ress","cnb_v1","cnb_v2","cnb_d1","cnb_d2");
		//("1","3","0","20e","20d","12","8","20c","17","22","18","23");


		// pour classement par colone
		if(classementsecondaire != -1 && classementsecondaire != -2 && classementsecondaire != undefined)
			classement = classementsecondaire;

		if(parseInt(classement.replace( /[^0-9-]/g, "")) == 1){//si le classement est par coordonee on fait que les coordonees soit classable
			for (var gh = 0 ; gh<nb ; gh++)
			{
				if(scan_i[gh] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1 )
				{
					if(scan_i[gh][9] != undefined && scan_i[gh][1].split(':')[1]){

						//on recupere les coordonées
						var coordosplit = scan_i[gh][1].split(':');
						var galaxie = coordosplit[0].replace( /[^0-9-]/g, "");
						var systeme = coordosplit[1].replace( /[^0-9-]/g, "");
						var planette = coordosplit[2].replace( /[^0-9-]/g, "");

						// on fait ques les systeme  soit en 3 chiffre et les planetes soit en deux
						if(parseInt(systeme) <100) {
							if(parseInt(systeme) <10)
								systeme = '00'+''+systeme;
							else
								systeme = '0'+''+systeme;
						}
						if(parseInt(planette) <10)
						{
							planette = '0'+''+planette;
						}
						// on met les "nouvellle coordonée". avec '' pour bien que les system /galaxie ne se melange pas
						scan_i[gh][20] = parseInt(galaxie +''+ systeme +''+ planette);
					}
				}
			}
		}
		else if(classement == '20c'){//classement par cdr + ressources.
			for (var gh = 0 ; gh<nb ; gh++)
			{
				if(scan_i[gh] != undefined) {
					if(scan_i[gh][9] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1) {
					//ressource
						var ressource_m = scan_i[gh][4];
						var ressource_c = scan_i[gh][5];
						var ressource_d = scan_i[gh][6];
						var ressource_total = parseInt(ressource_m)*q_taux_m + parseInt(ressource_c)*q_taux_c + parseInt(ressource_d)*q_taux_d;

						var pourcent = 50;
						if(scan_i[gh][24] == "ph")
							pourcent = 75;
						if(scan_i[gh][25] == "b1" || scan_i[gh][25] == "b2" || scan_i[gh][25] == "b3")
							pourcent = 100;

						//cdr possible avec flotte
						var cdr_possible_m = Math.round(parseInt(scan_i[gh][15])*pourcent_cdr);
						var cdr_possible_c = Math.round(parseInt(scan_i[gh][16])*pourcent_cdr);

						//cdr defense
							if(scan_i[gh][21]){var cdr_def = scan_i[gh][21].split('/');}else{var cdr_def = '?';}
							if(cdr_def[0] != '?' &&  pourcent_cdr_def != 0 && cdr_def != 'undefined'){
								var cdr_possible_def_m = Math.round(parseInt(cdr_def[1])*pourcent_cdr_def);
								var cdr_possible_def_c = Math.round(parseInt(cdr_def[2])*pourcent_cdr_def);
							}
							else{//du a la transition des rapports qui ne comptait pas encore les cdr de defense
								var cdr_possible_def_m = 0;
								var cdr_possible_def_c = 0;
							}
						var cdr_possible_def_total = cdr_possible_def_m*q_taux_m + cdr_possible_def_c*q_taux_c;

						var cdr_ressource = ressource_total*(pourcent/100) + cdr_possible_m*q_taux_m + cdr_possible_c*q_taux_c + cdr_possible_def_total;
						scan_i[gh][20] = cdr_ressource;
					}
					else {
						scan_i[gh][20] = '-1';
					}
				}
			}
		}
		else if(classement == '20d'){//classement des ressources dans x heures
			for (var gh = 0 ; gh<nb ; gh++)
			{
				if(scan_i[gh] != undefined)
				{
					if(scan_i[gh][9] != undefined && scan_i[gh] != ';;;;;;;;;;;;;;;;;x;;' && scan_i[gh][1].split(':')[2])
					{
						// batiment adversaire + prodh + resrrouce x h
						//+bat +prod/h
						var coordonee = scan_i[gh][1];
						var mine_array = scan_i[gh][19].split('/');
						var mine_m = mine_array[0];
						var mine_c = mine_array[1];
						var mine_d = mine_array[2];

						//ressource x h
						if(mine_array != '?/?/?'&& coordonee) {
							var prod_t = calcule_prod(mine_m, mine_c, mine_d, coordonee, '?', vitesse_uni);
							var prod_m_h = prod_t.metal;
							var prod_c_h = prod_t.cristal;
							var prod_d_h = prod_t.deut;

							//ressource
							var ressource_m = scan_i[gh][4];
							var ressource_c = scan_i[gh][5];
							var ressource_d = scan_i[gh][6];
							var ressource_total = parseInt(ressource_m) + parseInt(ressource_c) + parseInt(ressource_d);

							var prod_m_xh = parseInt(prod_m_h)*(parseInt(prod_gg)/60);
							var prod_c_xh = parseInt(prod_c_h)*(parseInt(prod_gg)/60);
							var prod_d_xh = parseInt(prod_d_h)*(parseInt(prod_gg)/60);

							var ressource_m_xh = parseInt(ressource_m) + prod_m_xh;
							var ressource_c_xh = parseInt(ressource_c) + prod_c_xh;
							var ressource_d_xh = parseInt(ressource_d) + prod_d_xh;
							var ressource_tt_xh = ressource_m_xh*q_taux_m + ressource_c_xh*q_taux_c + ressource_d_xh*q_taux_d;
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
		else if(classement == '20e'){//si c'est le classement par production par heure
			for (var gh = 0 ; gh<nb ; gh++)
			{
				if(scan_i[gh] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1)
				{
					if(scan_i[gh][9] != undefined)
					{
						// batiment adversaire + prodh + resrrouce x h
						//+bat +prod/h
						var mine_array = scan_i[gh][19].split('/');
						var mine_m = mine_array[0];
						var mine_c = mine_array[1];
						var mine_d = mine_array[2];
						var coordonee = scan_i[gh][1];

						if(mine_array != '?/?/?')
						{
							var prod_t = calcule_prod(mine_m, mine_c, mine_d, coordonee, '?', vitesse_uni);

							var prod_m_h = prod_t.metal;
							var prod_c_h = prod_t.cristal;
							var prod_d_h = prod_t.deut;
							var prod_tot = parseInt(prod_m_h)*q_taux_m + parseInt(prod_c_h)*q_taux_c + parseInt(prod_d_h)*q_taux_d;

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
		else if(parseInt(classement.replace( /[^0-9-]/g, "")) == 12){// classement par ressources
			for (var gh = 0 ; gh<nb ; gh++)
			{
				if(scan_i[gh] != undefined && scan_i[gh].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1)
				{
					if(scan_i[gh][9] != undefined) {
						//ressource
						var ressource_m = scan_i[gh][4];
						var ressource_c = scan_i[gh][5];
						var ressource_d = scan_i[gh][6];
						var ressource_total = parseInt(ressource_m)*q_taux_m + parseInt(ressource_c)*q_taux_c + parseInt(ressource_d)*q_taux_d;

						var pourcent = 50;
						if(scan_i[gh][24] == "ph")
							pourcent = 75;
						if(scan_i[gh][25] == "b1" || scan_i[gh][25] == "b2" || scan_i[gh][25] == "b3")
							pourcent = 100;

						scan_i[gh][20] = ressource_total*(pourcent/100);
					}
					else {
						scan_i[gh][20] = '-1';
					}
				}
			}

		}

		if (classement == 2 || classement == 3) {			// si c'est un classement par rapport au nom de joueur ou de planète
			var sort_Info = function(a, b) {
				return strcmp(a[parseInt(classement.replace( /[^0-9-]/g, ""))], b[parseInt(classement.replace( /[^0-9-]/g, ""))]);
			};
		} else if(classement == 12 || classement == 1) { 	// si c'est par ressources ou par coordonnées
			var sort_Info = function(a, b) {
				return b[20] - a[20];
			};
		} else {
			var sort_Info = function(a, b) {
				return b[parseInt(classement.replace( /[^0-9-]/g, ""))] - a[parseInt(classement.replace( /[^0-9-]/g, ""))];
			};
		}

		if(parseInt(classement.replace( /[^0-9-]/g, "")) > -1)
			scan_i.sort(sort_Info);

		// si on a fait a coché la case reverse ou que l'on trie grace au colone
		if(reverse == '0' || type_trie == 'decroissant')
			scan_i.reverse();

 		// On remet à x la valeur qui nous a servir pour le tri
		if(parseInt(classement.replace( /[^0-9-]/g, "")) == '20' || classement == 12 || classement == 1){
			for (var gh = 0 ; gh<nb ; gh++)
			{
				if(scan_i[gh] != undefined)
					scan_i[gh][20] = 'x';
			}
		}

		for (var h =0 ; h<nb ; h++){
			scan_i[h] = scan_i[h].join(';');
		}
		GM_setValue('scan'+ serveur, scan_i.join('#'));
	} // fin fonction trie_tableau

/*************************************************** ON AFFICHE LE TABLEAU ****************************************************************/

	function afficher_ligne_interieur_tab(serveur){
		var scan_info = GM_getValue('scan'+ serveur, '').split('#');
		var ligne_tableau = ' ';
		var nb = scan_info.length ;

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
		for(var x=0; x<attaque_24h_split.length; x++){
			attaque_24h_split2[x] = attaque_24h_split[x].split('/');
		}

		// on regarde la planette selectionner(liste de droite des planettes)  pour connaitre la galaxie
		if(document.getElementsByName('ogame-planet-coordinates')[0]){
			var coordonnee_slelec = document.getElementsByName('ogame-planet-coordinates')[0].content;
		}
		else{
			if(pos_depart != 'x:xxx:x'){var coordonnee_slelec = pos_depart;}
			else{var coordonnee_slelec = '0';}
		}


		// on les utilises et les place
		cptLigne = 0;
		for(var i= nb_scan_deb; i<nb_scan_fin; i++){
			if(scan_info[i] != undefined && scan_info[i] != ';;;;;;;;;;;;;;;;;x;;')
			{
				var scan_info_i = scan_info[i].split(';');
				//on verifie si c'est ok pour l'afficher
				if(scan_info_i[9] != undefined && scan_info_i[1].split(':')[1] && (q_flo_vis == 1 || scan_info_i[9] != '?/?/?/?/?/?/?/?/?/?/?/?/?/') && (q_def_vis == 1 || scan_info_i[10] != '?/?/?/?/?/?/?/?/?/?') ){


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
								if(	(filtre_joueur == '')
									|| (filtre_joueur != '' && filtre_joueur.toLowerCase() == scan_info_i[2].toLowerCase() )
								)
									filtre = true;

						if (filtre)
						{
						// date
							var date_scan = scan_info_i[0];
							var datecc = new Date();
							datecc.setTime(date_scan);
							var date_final = datecc.getDate()+'/'+ (parseInt(datecc.getMonth()) + 1) +'/'+datecc.getFullYear()+ ' '
											+datecc.getHours()+ ':'+ datecc.getMinutes()+ ':'+datecc.getSeconds()  ;


							// si la date est demander en chronos
							if(q_date_type_rep == 0){
								var datecc2 = parseInt(info.startTime) - parseInt(date_scan);

// Modification Deberron (Je peux avoir une diff de date entre l'heure de mon pc et celle du serveur)
								if (document.getElementsByName('ogame-timestamp')[0])
									datecc2 = parseInt(document.getElementsByName('ogame-timestamp')[0].content)*1000 - parseInt(date_scan);

								var seconde = Math.floor(datecc2/1000); // pour avoir le nb de seconde qui s'est ecouler depuis le scan.
								var minutes = Math.floor(seconde/60);
								var heures = Math.floor(minutes/60);
								var jours = Math.floor(heures/24);
									seconde = Math.floor(seconde%60);
									minutes = Math.floor(minutes%60);
									heures = Math.floor(heures%24);


								if(datecc2 != 0){
									var date2 = '';
									 if(jours>0)
										{date2 += jours + 'j ';}
									 if(jours>0 || heures>0)
										 {date2 += ((heures<10)?'0':'') + heures + 'h ';}
									 if(jours>0 || heures>0 || minutes>0)
										 {date2 += ((minutes<10)?'0':'') + minutes + 'm ';}
									 date2 += ((seconde<10)?'0':'') + seconde + 's';
								}
								else{ var date2 = '--:--:--';}

							}
							else{
// Modification Deberron
								var date2 = + ((datecc.getDate()<10)?'0':'')
											+ datecc.getDate()+'/'
											+ ((datecc.getMonth()<10)?'0':'')
											+ (parseInt(datecc.getMonth())+1)+'/'
											+ (parseInt(datecc.getFullYear())-2000)+' '
											+ ((datecc.getHours()<10)?'0':'')
											+ datecc.getHours()+':'
											+ ((datecc.getMinutes()<10)?'0':'')
											+ datecc.getMinutes()+':'
											+ ((datecc.getSeconds()<10)?'0':'')
											+ datecc.getSeconds();
							}


						// type de la planette
							var type_planette = scan_info_i[14];
							var l_q ='';
							if(type_planette != 1){l_q = ' L';}

						//nom joueur et planette
							var nom_joueur = scan_info_i[2];
							var nom_planete_complet = scan_info_i[3];
							if(nom_planete_complet.indexOf('1diez1')>=0){
								nom_planete_complet = nom_planete_complet.replace( /1diez1/g, "#");
							}
							var nom_planete = raccourcir(nom_planete_complet);

						//coordonee + url
							var coordonee = scan_info_i[1];
									var coordonee_split = coordonee.split(':');
								var galaxie = (coordonee_split[0]).replace( /[^0-9-]/g, "");
								var systeme = (coordonee_split[1]).replace( /[^0-9-]/g, "");
								var planette = (coordonee_split[2]).replace( /[^0-9-]/g, "");
								var url_galaxie = document.getElementById("menuTable").getElementsByClassName('menubutton ')[8].href;

							var url_fleet1 = document.getElementById("menuTable").getElementsByClassName('menubutton ')[7].href;
							if(espionnage_lien == 1)
								{var espionnage = url_fleet1 +'&galaxy='+ galaxie + '&system='+ systeme + '&position='+ planette + '&type='+ type_planette +'&mission=6';}
							else if(espionnage_lien == 0)
								{var espionnage = url_galaxie +'&galaxy='+ galaxie + '&system='+ systeme + '&position='+ planette + '&planetType=1&doScan=1';}

							var coordonee_fin = '<a href="'+url_galaxie +'&galaxy='+ galaxie + '&system='+ systeme + '&position='+ planette +'"';
							if(nom_j_q_q != 1 && nom_p_q_q != 1)
								coordonee_fin += ' title=" Planette: '+ nom_planete_complet.replace(/"/g, '&quot;') + ' | Joueur: ' + nom_joueur + '">';
							else if(nom_j_q_q != 1)
								coordonee_fin += ' title=" Joueur: ' + nom_joueur +'">';
							else if(nom_p_q_q != 1)
								coordonee_fin += ' title=" Planette: '+ nom_planete_complet.replace(/"/g, '&quot;') +'">';
							else
								coordonee_fin += '>';
							coordonee_fin += coordonee + l_q + '</a>';

						//ajout Deberron - type de joueur
							var pourcent = 50; //Ajout Deberron
							var type_joueur = scan_info_i[24] ? scan_info_i[24] : '&nbsp';
							if(type_joueur == "ph") {
								type_joueur = '<span class="status_abbr_honorableTarget">'+type_joueur+'</span>';
								pourcent = 75;
							}
							else if(type_joueur == "o")
								type_joueur = '<span class="status_abbr_outlaw">'+type_joueur+'</span>';
							else if(type_joueur == "i")
								type_joueur = '<span class="status_abbr_inactive">'+type_joueur+'</span>';
							else if(type_joueur == "I")
								type_joueur = '<span class="status_abbr_longinactive">'+type_joueur+'</span>';
							else if(type_joueur == "f")
								type_joueur = '<span class="status_abbr_strong">'+type_joueur+'</span>';
							else if(type_joueur == "v")
								type_joueur = '<span class="status_abbr_vacation">'+type_joueur+'</span>';


						//ajout Deberron - Honeur du joueur
							var type_honor = scan_info_i[25] ? scan_info_i[25] : '&nbsp';
							if(type_honor == "b1") {
								type_honor = '<span class="honorRank rank_bandit1"></span>';
								pourcent = 100;
							}
							else if(type_honor == "b2") {
								type_honor = '<span class="honorRank rank_bandit2"></span>';
								pourcent = 100;
							}
							else if(type_honor == "b3") {
								type_honor = '<span class="honorRank rank_bandit3"></span>';
								pourcent = 100;
							}
							else if(type_honor == "s1")
								type_honor = '<span class="honorRank rank_starlord1"></span>';
							else if(type_honor == "s2")
								type_honor = '<span class="honorRank rank_starlord2"></span>';
							else if(type_honor == "s3")
								type_honor = '<span class="honorRank rank_starlord3"></span>';

						//activite
							var activite = scan_info_i[7];
							if(activite == 'rien'){
								var activite_fin = ' ';
							} else {
								if(parseInt(activite) <= 15){
									var activite_fin = '<img style="width: 12px; height: 12px;" src="http://gf1.geo.gfsrv.net/cdn12/b4c8503dd1f37dc9924909d28f3b26.gif" alt="'+ activite +' min " title="'+ activite +' min"/>';
								} else {
									var activite_fin = '<span style="background-color: #000000;border: 1px solid #FFA800;border-radius: 3px 3px 3px 3px;color: #FFA800;">'+activite+'</span>';
								}
							}

						//ressource
							var ressource_m = scan_info_i[4];
							var ressource_c = scan_info_i[5];
							var ressource_d = scan_info_i[6];
							var nb_pt = shipCount(parseInt(ressource_m), parseInt(ressource_c), parseInt(ressource_d), 5000, pourcent);
							var nb_gt = shipCount(parseInt(ressource_m), parseInt(ressource_c), parseInt(ressource_d), 25000, pourcent);
							var ressource_total = parseInt(ressource_m) + parseInt(ressource_c) + parseInt(ressource_d);

							if(question_rassemble_col == 0)
							{
								var ressource = '<acronym title="' + pourcent + '% de ressources pillables <br> '+ addPoints(nb_pt) + text.nb_pt +'/'+ addPoints(nb_gt) + text.nb_gt + ' <br> ' + text.metal +' : ' + addPoints(Math.round(parseInt(ressource_m)*(pourcent/100))) + ' | '+ text.cristal +' : ' + addPoints(Math.round(parseInt(ressource_c)*(pourcent/100))) + ' | '+ text.deut +' : ' + addPoints(Math.round(parseInt(ressource_d)*(pourcent/100))) + '">' +  addPoints(Math.round(parseInt(ressource_total)*(pourcent/100))) + '</acronym>';
							}

						// vitesse minimum.
							var accronyme_temp_vol = vaisseau_vitesse_mini(tech_impul_a ,tech_hyper_a ,tech_combus_a, vaisseau_lent, coordonee, vitesse_uni);

						//cdr possible
							var cdr_possible = Math.round(parseInt(scan_info_i[8])*pourcent_cdr);
							var cdr_possible_m = Math.round(parseInt(scan_info_i[15])*pourcent_cdr);
							var cdr_possible_c = Math.round(parseInt(scan_info_i[16])*pourcent_cdr);

							// on verifie que cdr possible existe et soit un chiffre
							if(cdr_possible == '?' || isNaN(cdr_possible)){ var cdr_aff = 0;cdr_possible = '?'; }
							else{var cdr_aff = cdr_possible;}

							// cdr de défense
								// on verifie que le cdr def est bien creer dans le scan info
								if(scan_info_i[21]){var cdr_def = scan_info_i[21].split('/');}
								else{var cdr_def = '?';}
							if(cdr_def[0] != '?' &&  pourcent_cdr_def != 0 && cdr_def != 'undefined'){
								var cdr_possible_def = Math.round(parseInt(cdr_def[0])*pourcent_cdr_def);
								var cdr_possible_def_m = Math.round(parseInt(cdr_def[1])*pourcent_cdr_def);
								var cdr_possible_def_c = Math.round(parseInt(cdr_def[2])*pourcent_cdr_def);
							}
							else{
								var cdr_possible_def = 0;
								var cdr_possible_def_m = 0;
								var cdr_possible_def_c = 0;
							}

							if(cdr_possible != '?'){cdr_possible = cdr_possible + cdr_possible_def;}
							else{cdr_possible = cdr_possible;}

							cdr_aff = cdr_aff + cdr_possible_def;
							cdr_possible_m = cdr_possible_m + cdr_possible_def_m;
							cdr_possible_c = cdr_possible_c + cdr_possible_def_c;

							if(isNaN(cdr_aff)){cdr_aff = 0;}
							else{cdr_aff = cdr_aff;}

							if(question_rassemble_col == 0)
							{
								if(cdr_q_type_affiche == 0){
									var cdr_aco = '<acronym title="' + addPoints(Math.ceil(cdr_aff/20000)) + text.nb_rc + '<br>'+ text.met_rc +' : ' + addPoints(cdr_possible_m) + ' | '+ text.cri_rc +' : ' + addPoints(cdr_possible_c) + ' ">'+  addPoints(cdr_possible) + '</acronym>';
								}
								else{
									var cdr_aco = '<acronym title="' + addPoints(Math.ceil(cdr_aff/20000)) + text.nb_rc + '<br>'+ text.met_rc +' : ' + addPoints(cdr_possible_m) + ' | '+ text.cri_rc +' : ' + addPoints(cdr_possible_c) + ' ">'+  addPoints(Math.ceil(cdr_aff/20000)) + '</acronym>';
								}
							}

						// colonne cdr +  resource
							if(question_rassemble_col == 1)
							{
								var col_cdr = '<acronym title="' + pourcent + '% | '+ addPoints(nb_pt) + text.nb_pt +'/'+ addPoints(nb_gt) + text.nb_gt + ' | '+ text.metal +' : ' + addPoints(Math.round(parseInt(ressource_m)*(pourcent/100))) + ' | '+ text.cristal +' : ' + addPoints(Math.round(parseInt(ressource_c)*(pourcent/100))) + ' | '+ text.deut +' : ' + addPoints(Math.round(parseInt(ressource_d)*(pourcent/100))) + '\n' + addPoints(Math.ceil(cdr_aff/20000)) + text.nb_rc + ' | '+ text.met_rc +' : ' + addPoints(parseInt(cdr_possible_m)) + ' | '+ text.cri_rc +' : ' + addPoints(parseInt(cdr_possible_c)) + '">' +  addPoints(parseInt(cdr_aff) + Math.round(parseInt(ressource_total)*(pourcent/100))) + '</acronym>';
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
							var acronyme_def = i18n.get('th_nd')+'<div class="splitLine"></div>';
							var nb_totaldef = 0;

							var vaisseau22 = scan_info_i[9];
							if(vaisseau22 != '?/?/?/?/?/?/?/?/?/?/?/?/?/?')
							{
								var vaisseau = vaisseau22.split('/');
									for(var k=0; k<vaisseau.length ; k++)
										{
										if( parseInt(vaisseau[k]) != 0)
											{
												acronyme_vaisseau = acronyme_vaisseau + ' | '+ vaisseau_type[k] + ' : ' + addPoints(parseInt(vaisseau[k]));
												nb_totalvaisseau = parseInt(nb_totalvaisseau) + parseInt(vaisseau[k]);

												url_speedsim = url_speedsim + '&amp;' + vaisseau_speed[k] + '=' + parseInt(vaisseau[k]);
												url_dragosim = url_dragosim + '&amp;' + vaisseau_drag[k] + '=' + parseInt(vaisseau[k]);
												url_ogamewinner = url_ogamewinner + '&amp;' + vaisseau_win[k] + '=' + parseInt(vaisseau[k]);
											}
										}
								nb_totalvaisseau = addPoints(parseInt(nb_totalvaisseau));
							}
							else{var vaisseau = vaisseau22.split('/');
								acronyme_vaisseau = '?';
								nb_totalvaisseau = '?';}

							var defense2 = scan_info_i[10];
							if(defense2 != '?/?/?/?/?/?/?/?/?/?')
							{
								var defense = defense2.split('/');
									for(var k=0; k<defense.length ; k++)
									{
										if(parseInt(defense[k]) != 0)
										{
											acronyme_def = acronyme_def + '<br>' + defense_type[k] + ' : ' + addPoints(parseInt(defense[k]));

											url_speedsim = url_speedsim + '&amp;' + def_speed[k] + '=' + parseInt(defense[k]);
											url_dragosim = url_dragosim + '&amp;' + def_drag[k] + '=' + parseInt(defense[k]);
											url_ogamewinner = url_ogamewinner + '&amp;' + def_win[k] + '=' + parseInt(defense[k]);

											if(k != 8 && k != 9){// si k n'est pas des missiles (interplanetaire ou de def)
												nb_totaldef = parseInt(nb_totaldef) + parseInt(defense[k]);
											}
										}
									}
								nb_totaldef = addPoints(parseInt(nb_totaldef));
							} else {
								var defense = defense2.split('/');
								acronyme_def = '?';
								nb_totaldef = '?';
							}

							var acronyme_vaisseau2 = '';
							if(vaisseau_question == 1)
								acronyme_vaisseau2 = '<acronym title=" '+ acronyme_vaisseau +'">'+ nb_totalvaisseau   + '</acronym>';
							else if(vaisseau_question == 2  && (scan_info_i[22] == '?' || !scan_info_i[2]))
								acronyme_vaisseau2 = '<acronym title=" '+ acronyme_vaisseau +','+ text.c_nbv +' '+ nb_totalvaisseau +' ">?</acronym>';
							else if(vaisseau_question == 2)
								acronyme_vaisseau2 = '<acronym title=" '+ acronyme_vaisseau +','+ text.c_nbv +' '+ nb_totalvaisseau +' ">'+  addPoints(parseInt(scan_info_i[22]))  + '</acronym>';

							var acronyme_def2 = '';
							// -------------------------------------------------------------------------------------------------
							if(defense_question == 1)
								acronyme_def2 = '<div class="tooltipTitle">'+ acronyme_def +'</div><acronym>'+ nb_totaldef   + '</acronym>';
							else if(defense_question == 2 && (scan_info_i[23] == '?' || !scan_info_i[23]))
								acronyme_def2 = '<div class="tooltipTitle">'+ acronyme_def +','+ text.c_nbd +' '+ nb_totaldef+'</div><acronym>?</acronym>';
							else if(defense_question == 2)
								acronyme_def2 = '<div class="tooltipTitle>" '+ acronyme_def +','+ text.c_nbd +' '+ nb_totaldef +'</div><acronym>'+ addPoints(parseInt(scan_info_i[23])) + '</acronym>';
							// -------------------------------------------------------------------------------------------------


						//url d'attaque		//am202 = pt / am203 = gt
							var url_fleet1 = document.getElementById("menuTable").getElementsByClassName('menubutton ')[7].href;
							var url_attaquer = url_fleet1 + '&galaxy='+ galaxie +'&system='+ systeme +'&position='+ planette +'&type='+ type_planette +'&mission=1';
							if (lien_raide_nb_pt_gt == 1) {
								var nb_pt2;
								if (nb_ou_pourcent == 1) {
									nb_pt2 = nb_pt + nb_pourcent_ajout_lien;
								} else {
									nb_pt2 = Math.ceil(nb_pt + (nb_pt/100)*nb_pourcent_ajout_lien);
								}
								url_attaquer += '&am202='+ nb_pt2;
							} else if (lien_raide_nb_pt_gt == 0) {
								var nb_gt2;
								if (nb_ou_pourcent == 1) {
									nb_gt2 = nb_gt + nb_pourcent_ajout_lien;
								} else {
									nb_gt2 = Math.ceil(nb_gt + (nb_gt/100)*nb_pourcent_ajout_lien);
								}
								url_attaquer += '&am203='+ nb_gt2;
							}

						// url de simulation
							if(q_techzero == 1 && recherche_ad[0] == "?"){
								var tech_arme_a_sim = 0;
								var tech_protect_a_sim = 0;
								var tech_bouclier_a_sim = 0;
								var tech_arme_d_sim = 0;
								var tech_bouclier_d_sim = 0;
								var tech_protect_d_sim = 0;
							}
							else{
								var tech_arme_a_sim = tech_arme_a;
								var tech_protect_a_sim = tech_protect_a;
								var tech_bouclier_a_sim = tech_bouclier_a;
								var tech_arme_d_sim = tech_arme_d;
								var tech_bouclier_d_sim = tech_bouclier_d;
								var tech_protect_d_sim = tech_protect_d;
							}

							if(simulateur == 1){
								var url_simul = 'http://websim.speedsim.net/index.php?version=1&lang='+vari.lang_speedsin+'&tech_a0_0='+ tech_arme_a_sim +'&tech_a0_1='+ tech_bouclier_a_sim +'&tech_a0_2='+ tech_protect_a_sim +'&engine0_0='+ tech_combus_a +'&engine0_1='+ tech_impul_a +'&engine0_2='+ tech_hyper_a +'&start_pos='+ coordonnee_slelec
									+ '&tech_d0_0='+ tech_arme_d_sim +'&tech_d0_1='+ tech_bouclier_d_sim +'&tech_d0_2='+ tech_protect_d_sim
									+ '&enemy_name=' + nom_planete_complet.replace(/"/g, '&quot;') + '&perc-df=' + (pourcent_cdr*100) +'&enemy_pos='+ coordonee +'&enemy_metal='+ parseInt(ressource_m) +'&enemy_crystal='+ parseInt(ressource_c) +'&enemy_deut='+ parseInt(ressource_d) + url_speedsim
									+ '&uni_speed=' + vitesse_uni + '&perc-df=' + pourcent_cdr*100 + '&plunder_perc=' + pourcent + '&del_techs=1&rf=1';
							}
							else if(simulateur == 0){
								var url_simul = 'http://drago-sim.com/index.php?style=new&template=New&lang='+vari.lang_dragosin+'&'+ 'techs[0][0][w_t]='+ tech_arme_a_sim +'&techs[0][0][s_t]='+ tech_bouclier_a_sim +'&techs[0][0][r_p]='+ tech_protect_a_sim +'&engine0_0='+ tech_combus_a +'&engine0_1='+ tech_impul_a +'&engine0_2='+ tech_hyper_a +'&start_pos='+ coordonnee_slelec
									+ '&techs[1][0][w_t]='+ tech_arme_d_sim +'&techs[1][0][s_t]='+ tech_bouclier_d_sim +'&techs[1][0][r_p]='+ tech_protect_d_sim
									+ '&v_planet=' + nom_planete_complet.replace(/"/g, '&quot;') + '&debris_ratio=' + pourcent_cdr +'&v_coords='+ coordonee +'&v_met='+ parseInt(ressource_m) +'&v_kris='+ parseInt(ressource_c) +'&v_deut='+ parseInt(ressource_d) + url_dragosim;
							}
							else if(simulateur == 2){
								var url_simul = 'http://www.gamewinner.fr/cgi-bin/csim/index.cgi?lang=fr?'+'&aattack='+ tech_arme_a_sim +'&ashield='+ tech_bouclier_a_sim +'&aarmory='+ tech_protect_a_sim
									+ '&dattack='+ tech_arme_d_sim +'&dshield='+ tech_bouclier_d_sim +'&darmory='+ tech_protect_d_sim
									+ '&enemy_name=' + nom_planete_complet.replace(/"/g, '&quot;') +'&enemy_pos='+ coordonee +'&dmetal='+ parseInt(ressource_m) +'&dcrystal='+ parseInt(ressource_c) +'&ddeut='+ parseInt(ressource_d) + url_ogamewinner;
							}

						// batiment adversaire + prodh + resrrouce x h
							//+bat +prod/h
							var mine_array = scan_info_i[19].split('/');
							var mine_m = mine_array[0];
							var mine_c = mine_array[1];
							var mine_d = mine_array[2];

							// si on a besoin de la production pour afficher une colone
							if(prod_h_q == 1 || prod_gg != 0 || q_vid_colo == 1)
							{
								if(mine_array != '?,?,?')
								{
									var prod_t = calcule_prod(mine_m, mine_c, mine_d, coordonee, '?', vitesse_uni);
									var prod_m_h = prod_t.metal;
									var prod_c_h = prod_t.cristal;
									var prod_d_h = prod_t.deut;
									var prod_tot = parseInt(prod_m_h) + parseInt(prod_c_h) + parseInt(prod_d_h);

									var acro_prod_h = '<acronym title=" '+ text.metal +' : ' + addPoints(parseInt(prod_m_h)) + ' | '+ text.cristal +' : ' + addPoints(parseInt(prod_c_h)) + ' | '+ text.deut +' : ' + addPoints(parseInt(prod_d_h)) + ' ">'+  addPoints(parseInt(prod_tot)) + '</acronym>';

								//ressource x h
									var prod_m_xh = Math.round(parseInt(prod_m_h)*(parseInt(prod_gg)/60));
									var prod_c_xh = Math.round(parseInt(prod_c_h)*(parseInt(prod_gg)/60));
									var prod_d_xh = Math.round(parseInt(prod_d_h)*(parseInt(prod_gg)/60));
									var prod_tt_xh = prod_m_xh + prod_c_xh + prod_d_xh;

									var ressource_m_xh = parseInt(ressource_m) + prod_m_xh;
									var ressource_c_xh = parseInt(ressource_c) + prod_c_xh;
									var ressource_d_xh = parseInt(ressource_d) + prod_d_xh;
									var ressource_tt_xh = ressource_m_xh + ressource_c_xh + ressource_d_xh;

									var acro_ress_xh = '<acronym title=" '+ text.metal +' : ' + addPoints(ressource_m_xh) + '(+'+  addPoints(prod_m_xh) +') | '+ text.cristal +' : ' + addPoints(ressource_c_xh) + '(+'+  addPoints(prod_c_xh) +') | '+ text.deut +' : ' + addPoints(ressource_d_xh) + '(+'+  addPoints(prod_d_xh) +') | +'+  addPoints(prod_tt_xh) +' ">'+  addPoints(ressource_tt_xh) + '</acronym>';
								}
								else {var acro_prod_h = '<acronym title="'+ text.batiment_non_visible +'"> ? </acronym>';
								var acro_ress_xh = '<acronym title="'+ text.batiment_non_visible +'"> ? </acronym>';}
							}

							//case simuler en mode exporter vers un autre simulateur.
							if(simulateur == 3){
								var saut ='\n';
								var tabulation ='&nbsp;&nbsp;&nbsp;&nbsp;';
								var export_scan_simul = 'Ressources sur Mirage ' + coordonee +' (joueur \''+ nom_joueur +'\') le ' + datecc.getMonth() +'-'+datecc.getDate()+ ' '+datecc.getHours()+ 'h '+ datecc.getMinutes()+ 'min ' +datecc.getSeconds()+ 's'
								+ saut
								+ saut + 'Métal:'+ tabulation + addPoints(parseInt(ressource_m))+ tabulation +'Cristal:'+ tabulation+ addPoints(parseInt(ressource_c))
								+ saut + 'Deutérium:'+ tabulation+ addPoints(parseInt(ressource_d)) +tabulation +' Energie:'+tabulation+'5.000'
								+ saut
								+ saut + 'Activité'
								+ saut + 'Activité'
								+ saut + 'Activité signifie que le joueur scanné était actif sur la planète au moment du scan ou qu`un autre joueur a eu un contact de flotte avec cette planète à ce moment là.'
								+ saut + 'Le scanner des sondes n`a pas détecté d`anomalies atmosphériques sur cette planète. Une activité sur cette planète dans la dernière heure peut quasiment être exclue.'
								+ saut + 'Flottes';
								var vaisseau_nom = new Array(vari.pt, vari.gt, vari.cle, vari.clo, vari.cro, vari.vb, vari.vc, vari.rec, vari.esp, vari.bb, vari.sat, vari.dest, vari.edlm, vari.tra);
								var q_saut_v =0;
								if(vaisseau22 != '?/?/?/?/?/?/?/?/?/?')
								{
									var vaisseau = vaisseau22.split('/');
										for(var k=0; k<vaisseau.length ; k++)
										{
											if(parseInt(vaisseau[k]) != 0)
											{
												if(q_saut_v <3){export_scan_simul = export_scan_simul + ' | '+ vaisseau_nom[k] +tabulation +' : ' + addPoints(parseInt(vaisseau[k]));q_saut_v++;}
												else{export_scan_simul = export_scan_simul + saut + ' | '+ vaisseau_nom[k] +tabulation +' : ' + addPoints(parseInt(vaisseau[k]));q_saut_v= 0;}
											}
										}
								}

								export_scan_simul = export_scan_simul + saut + 'Défense';
								var defense_nom = new Array(vari.lm, vari.lle, vari.llo, vari.gauss, vari.ion, vari.pla, vari.pb, vari.gb, vari.mic, vari.mip);
								var q_saut =0;
								if(defense2 != '?/?/?/?/?/?/?/?/?/?')
								{
									var defense = defense2.split('/');
										for(var k=0; k<defense.length ; k++)
										{
											if(parseInt(defense[k]) != 0)
											{
												if(q_saut <3){export_scan_simul = export_scan_simul + ' | '+ defense_nom[k] +tabulation +' : ' + addPoints(parseInt(defense[k]));q_saut++;}
												else{export_scan_simul = export_scan_simul + saut + ' | '+ defense_nom[k] +tabulation +' : ' + addPoints(parseInt(defense[k]));q_saut= 0;}
											}
										}
								}

								export_scan_simul = export_scan_simul + saut +'Bâtiment'
								+ saut + vari.mine_m +tabulation + mine_m +tabulation  +vari.mine_c +tabulation + mine_c
								+ saut + vari.mine_d +tabulation + mine_d +tabulation
								+ saut +'Recherche'
								+ saut + vari.tech_arm +tabulation	+ tech_arme_d + tabulation +vari.tech_bouc +tabulation + tech_bouclier_a + tabulation
								+ saut + vari.tech_pro +tabulation + tech_protect_d
								+ saut + 'Probabilité de contre-espionnage : 0 %';
							}

							//compteur d'attaque
							if(q_compteur_attaque == 1){//si il est activé
								var coordonee2_ss_crochet = galaxie + ':' + systeme +':' +planette;
								if(attaque_24h.indexOf(coordonee2_ss_crochet) > -1)//si il est pas compté.
								{
									var compteur = 0;
									for(var s=0; s<attaque_24h_split.length;s++)
									{
										if(attaque_24h_split2[s][1] == coordonee2_ss_crochet)
										{
											compteur++;
										}
									}
									var attaque_deja_fait = compteur;
								}
								else{
									var attaque_deja_fait = 0;
								}
							}

							//ligne du tableau <tr> de toute les infos du scan
							cptLigne++;
							ligne_tableau += '\n<tr class="'+ coordonee + '" id="tr_'+i+'">';
							num_scan = nb_scan_deb + cptLigne;
							ligne_tableau += '<td class="right">' + num_scan +  '.</td>';
							ligne_tableau += '<td><input type="checkbox" name="delcase" value="'+ i +'" id="check_'+ i +'"/></td>';
							ligne_tableau +=  '<td class="marqueur"></td>';

							if(nom_j_q_q == 1)
								ligne_tableau += '<td class="left">' + nom_joueur +  '</td>';
							if(coor_q_q == 1)
								ligne_tableau += '<td class="coordonee">' + coordonee_fin +  '</td>';
							ligne_tableau += '<td>' + type_honor +  '</td>';
							ligne_tableau += '<td>' + type_joueur +  '</td>';
							ligne_tableau += '<td>' + activite_fin +  '</td>';

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
							if(nom_p_q_q == 1)
								ligne_tableau += '<td title="'+nom_planete_complet.replace(/"/g, '&quot;')+'">' + nom_planete +  '</td>';

							if(date_affiche == 1)
								ligne_tableau += '<td class="right">' + date2 + '</td>';
							if(tps_vol_q == 1)
								ligne_tableau += '<td>' + accronyme_temp_vol + '</td>';
							if(prod_h_q == 1)
								ligne_tableau += '<td>' + acro_prod_h + '</td>';
							if(prod_gg != 0)
								ligne_tableau += '<td>' + acro_ress_xh + '</td>';
							if(q_vid_colo == 1)
								ligne_tableau += '<td>' + calcul_dernier_vidage(ressource_m, ressource_c, ressource_d, prod_m_h, prod_c_h, prod_d_h, date_scan, mine_m) + '</td>';

							if(question_rassemble_col == 0){
								if(pt_gt != 0)
									ligne_tableau += '<td>' + addPoints(nb_pt) +'/'+ addPoints(nb_gt) +  '</td>';
								ligne_tableau += '<td class="right">' + ressource +  '</td>';
								ligne_tableau += '<td class="right">' + cdr_aco +'</td>';
							}
							else {
								ligne_tableau += '<td class="right">' + col_cdr +  '</td>';
								if(pt_gt != 0)
									ligne_tableau += '<td>' + addPoints(nb_pt) +'/'+ addPoints(nb_gt) +  '</td>';
							}
							if(vaisseau_question != 0)
								ligne_tableau += '<td class="right">' + acronyme_vaisseau2 +  '</td>';
							if(defense_question != 0)
								ligne_tableau += '<td class="right htmlTooltip">' + acronyme_def2 +  '</td>';
							if(tech_q == 1)
								ligne_tableau += '<td class="right">' + tech_arme_d + '/' + tech_bouclier_d + '/' + tech_protect_d + '</td>';

							if(q_compteur_attaque == 1)
								ligne_tableau += '<td class="nombreAttaque">'+ attaque_deja_fait +'</td>';

							ligne_tableau += '<td> <a href="'+ espionnage +'" title="'+ text.espionner +'"> <img src="http://gf2.geo.gfsrv.net/45/f8eacc254f16d0bafb85e1b1972d80.gif" height="16" width="16"></a></td>';
							ligne_tableau += '<td> <a class="del1_scan" id="del1_scan'+i+'" title="'+ text.eff_rapp +'" ><img src="http://gf1.geo.gfsrv.net/99/ebaf268859295cdfe4721d3914bf7e.gif" height="16" width="16"></a></td>';
							var target;
							if (stockageOption.get('attaquer nouvel onglet') === 1) {
								target = '';
							} else if (stockageOption.get('attaquer nouvel onglet') === 2) {
								target = ' target="_blank"';
							} else {
								target = ' target="attaque"';
							}
							ligne_tableau += '<td class="boutonAttaquer"> <a href="'+ url_attaquer +'" title="'+ text.att +'"'+target+'><img src="http://gf1.geo.gfsrv.net/9a/cd360bccfc35b10966323c56ca8aac.gif" height="16" width="16"></a></td>';
							if(q_mess == 1 ){
								var url_href = 'index.php?page=showmessage&session=' + info.session + '&ajax=1&msg_id=' + scan_info_i[11] + '&cat=7';
								ligne_tableau += '<td><a class="overlay" href="'+ url_href +'" id="'+ scan_info_i[11] +'"><img src="http://snaquekiller.free.fr/ogame/messages.jpg" height="16" width="16"/></a></td>';
							}
							if(simulateur != 3 && q_lien_simu_meme_onglet == 1)
								ligne_tableau += '<td> <a href="'+ url_simul +'" title="'+ text.simul +'" target="_blank"><img src="http://snaquekiller.free.fr/ogame/simuler.jpg" height="16" width="16"></a></td></tr>';
							else if(simulateur != 3 && q_lien_simu_meme_onglet != 1)
								ligne_tableau += '<td> <a href="'+ url_simul +'" title="'+ text.simul +'" target="RaideFacileSimul"><img src="http://snaquekiller.free.fr/ogame/simuler.jpg" height="16" width="16"></a></td></tr>';
							else
								ligne_tableau += '<td> <a href="#" title="'+ text.simul +'" id="simul_'+ i +'" class="lien_simul_'+i+'"><img src="http://snaquekiller.free.fr/ogame/simuler.jpg" height="16" width="16"></a></td></tr>';
							if(simulateur == 3){
								ligne_tableau += '<tr style="display:none;" id="textarea_'+ i +'" class="textarea_simul_'+i+'">'+ '<TD COLSPAN=20> <textarea style="width:100%;background-color:transparent;color:#999999;text-align:center;">'+ export_scan_simul +'</textarea></td></tr>';
							}

							/**************** BBCODE EXPORT **************/
							// bbcode_export = bbcode_export + coordonee +'==>';
							bbcode_export = bbcode_export + bbcode_baliseo[8] + couleur2[1] + bbcode_balisem[8] + nom_joueur +  ''+ bbcode_balisef[8];
							if(coor_q_q == 1){bbcode_export = bbcode_export +  bbcode_baliseo[8] + couleur2[2] + bbcode_balisem[8] +' ==> ' + coordonee +''+ bbcode_balisef[8];}
							// bbcode_export = bbcode_export +'==>' + activite_fin +  '';
							if(nom_p_q_q == 1){bbcode_export = bbcode_export +  bbcode_baliseo[8] + couleur2[3] + bbcode_balisem[8] +' ==> ' + nom_planete_complet +  ''+ bbcode_balisef[8];}
							bbcode_export = bbcode_export +  bbcode_baliseo[8] + couleur2[4] + bbcode_balisem[8] +' ==> ' + addPoints(parseInt(ressource_m)) +'metal ,'+ addPoints(parseInt(ressource_c)) +'cristal ,'+ addPoints(parseInt(ressource_d)) +'deut ('+ nb_pt +'/'+nb_gt +')' +  ''+ bbcode_balisef[8];
							bbcode_export = bbcode_export +  bbcode_baliseo[8] + couleur2[5] + bbcode_balisem[8] + ' ==> ' + addPoints(parseInt(cdr_possible_m)) +' metal ,'+ addPoints(parseInt(cdr_possible_c)) +' cristal ,'+ addPoints(Math.round(parseInt(cdr_possible)/25000))+' rc '+ bbcode_balisef[8];
							if(acronyme_vaisseau != ' '){ bbcode_export = bbcode_export +  bbcode_baliseo[8] + couleur2[6] + bbcode_balisem[8] + ' ==> ' + acronyme_vaisseau +  ''+ bbcode_balisef[8];}
							if(acronyme_vaisseau != ' '){ bbcode_export = bbcode_export +  bbcode_baliseo[8] + couleur2[7] + bbcode_balisem[8] + ' ==> ' + acronyme_def +  '\n'+ bbcode_balisef[8];}
							else{bbcode_export = bbcode_export + '\n\n';}
						} else
							nb_scan_fin++; // on rajoute un scan a afficher
					} else
						nb_scan_fin++;
				} else if (scan_info[i] && scan_info[i].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1) {
					scan_info[i] = '';
					nb_scan_fin++;
				}
				else
					nb_scan_fin++;
			} else if (scan_info[i] && scan_info[i].indexOf(';;;;;;;;;;;;;;;;;x;;') == -1)
				scan_info[i] = '';
		}
		document.getElementById('corps_tableau2').innerHTML = ligne_tableau;

		/**************** BBCODE EXPORT **************/{
			var	bbcode_haut = ' ';
			if(q_centre == 1){bbcode_haut = bbcode_haut + bbcode_baliseo[10] +bbcode_balisem[10];}
			if(q_cite == 1){bbcode_haut = bbcode_haut + bbcode_baliseo[4] ;}
			bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[1] + bbcode_balisem[8] + text.th_nj +  '' + bbcode_balisef[8];
				if(coor_q_q == 1){bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[2] + bbcode_balisem[8] +' ==> ' + text.th_coo + '' + bbcode_balisef[8] ;}
				// bbcode_haut = bbcode_haut +'==>' + activite_fin +  '';
				if(nom_p_q_q == 1){bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[3] + bbcode_balisem[8] +' ==> ' + text.th_np +  ''+ bbcode_balisef[8] ;}
				bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[4] + bbcode_balisem[8] +' ==> '+ text.th_ress +' metal , cristal ,deut (pt/gt)' +  ''+ bbcode_balisef[8] ;
				bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[5] + bbcode_balisem[8] + ' ==> '+ text.cdr_pos+' metal , cristal ,'+ text.nb_rc + bbcode_balisef[8] ;
				bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[6] + bbcode_balisem[8] + ' ==> pt/gt/cle/clo/cro/vb/vc/rec/esp/bb/sat/dest/edlm/tra'+ bbcode_balisef[8];
				bbcode_haut = bbcode_haut + bbcode_baliseo[8] + couleur2[7] + bbcode_balisem[8] + ' ==> lm/lle/llo/gauss/ion/plas/pb/gb/mic/mip \n\n'+ bbcode_balisef[8];

				bbcode_export = bbcode_export +'\n\n\n' +bbcode_baliseo[1] + bbcode_baliseo[5] + 'http://board.ogame.fr/index.php?=Thread&postID=10726546#post10726546'+ bbcode_balisem[5] +'par Raide-Facile'+bbcode_balisef[5]+ bbcode_balisef[1];
				if(q_centre == 1){bbcode_export = bbcode_export + bbcode_balisef[10];}
				if(q_cite == 1){bbcode_export = bbcode_export + bbcode_balisef[4] ;}

		document.getElementById('text_bbcode').innerHTML = bbcode_haut + bbcode_export;
		}
	}

	/*************** anti reload automatique de la page. ***************/{
		var script = document.createElement("script");
		script.setAttribute("type","text/javascript");
		script.setAttribute("language","javascript");
		script.text = 'function reload_page() {' +
		'}';
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
				//+ '<BR /><label> '+ text.vitesse_uni +' </label>&nbsp<input type="text" id="vitesse_uni"  value="'+ vitesse_uni +'" style="width:20px;" />
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
						+ '<tr><td><label>• '+ text.import_q +' </label> </td><td><label for="import_rajoute">'+ text.import_rajoute +'</label>&nbsp<input type="radio" name="import_q" value="1" id="import_rajoute" />&nbsp<label for="import_remplace">'+ text.import_remplace +'</label>&nbsp<input type="radio" name="import_q" value="0" id="import_remplace" /></td></tr>'
						+ '<tr><td><label>• '+ text.lien_raide_nb_pt_gt +' </label> </td><td><label for="lien_raide_nb_pt_remplit">'+ text.nb_pt +'</label>&nbsp<input type="radio" name="lien_raide_nb_pt_gt" value="1" id="lien_raide_nb_pt_remplit" />&nbsp<label for="lien_raide_nb_gt_remplit">'+ text.nb_gt +'</label>&nbsp<input type="radio" name="lien_raide_nb_pt_gt" value="0" id="lien_raide_nb_gt_remplit" />&nbsp<label for="lien_raide_nb_pt_gt2">'+ text.rien +'</label>&nbsp<input type="radio" name="lien_raide_nb_pt_gt" value="2" id="lien_raide_nb_pt_gt2" /></td></tr>'
						+ '<tr><td><label>• '+ text.lien_raide_ajout_nb_pourcent +' </label></td><td> <input type="text" id="nb_pourcent_ajout_lien"  value="'+ nb_pourcent_ajout_lien +'" style="width:20px;" />&nbsp<select name="nb_ou_pourcent" id="nb_ou_pourcent"><option value="0"> %</option> <option value="1"> en plus</option></select></td></tr>'
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

		if(nb_scan_page != 0){// on affiche les numeros pages
			var page_bas = '<span id="page" >Page : ';
			var num_page = info.url.split('&page_r=')[1];
			var scan_info = GM_getValue('scan'+ info.serveur, '').split('#');
			var nb = scan_info.length;
			var nb_page_poss = Math.ceil(nb/nb_scan_page);

			if(num_page == undefined || num_page == 1 || num_page== ''){num_page =1;}
			for(var i=1; i<(nb_page_poss+1) ; i++)
			{
				if(i != num_page){
				page_bas = page_bas + ' <a href="'+ url_2 +'&amp;raidefacil=scriptOptions&amp;page_r='+ i +'" >'+ i +'</a>';}
				else{page_bas = page_bas + ' '+ i;}

				if(i != nb_page_poss){page_bas = page_bas +',';}
			}
			page_bas = page_bas +'</span>';
		}
		else{var page_bas = '<span id="page" ></span>';}

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
			var import_export = '<div id="div_import_exp"><center style="margin-left: auto; margin-right: auto; width: 99%;">';
			import_export += text.exportt;
			import_export += '<textarea style="margin-top:5px; margin-bottom:10px; width:100%;background-color:black;color:#999999;text-align:center;" id=area_export ></textarea>';
			import_export += text.importt;
			import_export += '<textarea style="margin-top:5px; margin-bottom:10px; width:100%;background-color:black;color:#999999;text-align:center;" id=area_import ></textarea>';
			import_export += '<a id="export_script"><input type="submit" value="'+ text.export_scan_se +'" /> </a>';
			import_export += ' <a id="export_script_ns"><input type="submit" value="'+ text.export_scan_nnse +'" /> </a>';
			import_export += ' <a id="import_scan"><input type="submit" value="'+ text.importer_scan +'" /> </a>';
			import_export += '</center></div>';
		}

		/****************************/
	texte_a_afficher = '<div id="div_raide_facile">' + titre_div + option_html + '<div id="div_tableau_raide_facile">'
					+ '\n<div id="boutons_haut"></div>' + haut_tableau + titre_colonne_tableau + '<div id="boutons_bas"></div>' + '</div>' + html_bbcode + import_export + '</div>';


	//document.getElementById('inhalt').innerHTML = texte_a_afficher;
	document.getElementById('inhalt').style.display = "none";

	var div_raide_facile = document.createElement('div');
	insertAfter(div_raide_facile,document.getElementById('inhalt'));
	div_raide_facile.outerHTML = texte_a_afficher;
	// Stylisation des éléments (select, input, ...) comme ogame
	intercom.send('ogame style');
	// Activation des tooltips dans le style ogame
	intercom.send('tooltip', {selector:'#corps_tableau2 acronym[title]'});
	intercom.send('tooltip', {selector:'#corps_tableau2 .htmlTooltip', htmlTooltip:true});
	intercom.send('tooltip', {selector:'#raide_facile_titre #optionclique', htmlTooltip:true});


	//document.getElementById("contentWrapper").appendChild(document.createElement('div')).outerHTML = texte_a_afficher;

	//on affiche les boutons de suppression de scan .
		/**bouton en hauts **/{
			document.getElementById('boutons_haut').innerHTML = '<center><a id="plus_moins" style="float:left;"><img src="http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/plus.png" id="img_moin_plus" height="16" width="16"/></a><a id="supr_scan_h" style="display:none;"><input type="submit" value="'+ text.supr_scan_coche +'" style="margin-bottom:5px;"/></a>  <a id="supr_scan_nn_selec_h" style="display:none;"><input type="submit" value="'+ text.supr_scan_coche_nnslec +'" style="margin-bottom:5px;"/></a></center>'
//			+ '<a id="zero_h" style="float:left;display:none;">'+ text.remis_z +'</a>'
			+ '<div id="page_h" style="float:right;display:none;">'+ page_bas +'</div>'+filtres;


			// ouvrir fermer le span du haut pour les boutons
 			document.getElementById('plus_moins').addEventListener("click", function(event){
				var img_plus_moin = document.getElementById('plus_moins');
				var supr_scan_h = document.getElementById('supr_scan_h');
				var supr_scan_nn_selec_h = document.getElementById('supr_scan_nn_selec_h');
				var supr_scan_h = document.getElementById('supr_scan_h');
//				var zero_h = document.getElementById('zero_h');
				var page_h = document.getElementById('page_h');
				if (supr_scan_h.style.display == 'none'){
					supr_scan_h.style.display = '';
					supr_scan_nn_selec_h.style.display = '';
//					zero_h.style.display = '';
					page_h.style.display = '';
					img_plus_moin.src ='http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/moins.png';}
				else {
					supr_scan_h.style.display = 'none';
					supr_scan_nn_selec_h.style.display = 'none';
//					zero_h.style.display = 'none';
					page_h.style.display = 'none';
					img_plus_moin.src ='http://snaquekiller.free.fr/ogame/messraide/raidefacile%20mess/plus.png';}

				}, true);
			//remise a 0
//			document.getElementById("zero_h").addEventListener("click", function(event){reset(info.serveur);remlir_tableau(info.serveur, -1, 0);}, true);
			//supressions de scan
			document.getElementById("supr_scan_h").addEventListener("click", function(event){del_scan_checkbox(info.serveur, true);remlir_tableau(info.serveur, -1, 0);}, true);
			document.getElementById("supr_scan_nn_selec_h").addEventListener("click", function(event){del_scan_checkbox(info.serveur, false);remlir_tableau(info.serveur, -1, 0);}, true);
		}

		/**bouton en en bas**/{
			document.getElementById('boutons_bas').innerHTML = '<a id="zero_b" style="float:left;">'+ text.remis_z +'</a>'
				+ '<div style="float:right;">'+ page_bas +'</div><br/>'
				+ '<center><a id="supr_scan_b"><input type="submit" value="'+ text.supr_scan_coche +'" style="margin-top:5px;"/></a>  <a id="supr_scan_nn_selec_b"><input type="submit" value="'+ text.supr_scan_coche_nnslec +'" style="margin-top:5px;"/></a></center>';

			//remise a 0
			document.getElementById("zero_b").addEventListener("click", function(event){reset(info.serveur);remlir_tableau(info.serveur, -1, 0);}, true);
			//supressions de scan
			document.getElementById("supr_scan_b").addEventListener("click", function(event){del_scan_checkbox(info.serveur, true);remlir_tableau(info.serveur, -1, 0);}, true);
			document.getElementById("supr_scan_nn_selec_b").addEventListener("click", function(event){del_scan_checkbox(info.serveur, false);remlir_tableau(info.serveur, -1, 0);}, true);
		}

/////// on  trie le tableau ,affiche les lignes, on remplit en meme temps les export(bbcode/html) et colorie les lignes de flottes en vol. ///////////////////////////////////
	// try{

		function remlir_tableau(serveur, classementsecondaire, type_croissant) {
			// on trie le tableau que si besoin est.
			if(parseInt(classementsecondaire) !== -1)
				trie_tableau(serveur, classementsecondaire, type_croissant);
			afficher_ligne_interieur_tab(serveur);

			// si il y a le truc pour dire si il est inactif on creer les events pour que sa bouge tout seul .
			/* if(q_inactif == 1){
				var id_class;
				var numero_i_interieur;
				var check;
				var pseudo_inactif;
				var nb_afficher = document.getElementsByClassName('inactif').length;
				for(var y=0; y<nb_afficher; y++)
				{
					id_class = document.getElementsByClassName('inactif')[y].id;
					document.getElementById(id_class).addEventListener("change", function(event){
						pseudo_inactif = this.value;
						check = this.checked;
					inactif_change(pseudo_inactif,check);}, true);

				}
			} */

			// on creer les events pour les suppressions de scans via l'icone corbeille .
			var nb_scan_supr = document.getElementsByClassName('del1_scan').length;
			for (var t=0; t<nb_scan_supr; t++) {
				if (document.getElementsByClassName('del1_scan')[t]) {
					document.getElementsByClassName('del1_scan')[t].addEventListener("click", function(event) {
						// on recupere le numero de scans dans le split d'enregistrement ( enregistrer dans l'id)
						var numero_scan = this.id.split('del1_scan')[1]; // todo : mettre le numéro dans le HTML

						var scanList = GM_getValue('scan'+ serveur, '').split('#');
						scanList.splice(numero_scan, 1);
						GM_setValue('scan'+ serveur, scanList.join('#'));

						remlir_tableau(serveur, -1, 0);
					}, true);
				}
			}

			// on colorie les lignes selon les mouvements de flottes
			$.get('/game/index.php?page=eventList&ajax=1', showAttaque, 'html');

			// on affiche les numeros de pages si un nombre de scans par page est demandé
			if(nb_scan_page != 0){
					var page_bas = 'Page : ';
					var num_page = info.url.split('&page_r=')[1];
					var scan_info = GM_getValue('scan'+ serveur, '').split('#');
					var nb = scan_info.length;
					var nb_page_poss = Math.ceil(nb/nb_scan_page);

					if(num_page == undefined || num_page == 1 || num_page== ''){num_page =1;}
					for(var i=1; i<(nb_page_poss+1) ; i++)
					{
						if(i != num_page){
						page_bas = page_bas + ' <a href="'+ url_2 +'&amp;raidefacil=scriptOptions&amp;page_r='+ i +'" >'+ i +'</a>';}
						else{page_bas = page_bas + ' '+ i;}

						if(i != nb_page_poss){page_bas = page_bas +',';}
					}
				}
			else{var page_bas = '';}
			document.getElementById('page').innerHTML = page_bas;
		}
		remlir_tableau(info.serveur, -2, 0);
	// }
	// catch(err){
		// afficher_erreur('inhalt', err);
	// }

		//classer par colone croissante /decroissante grace au titre de colone
		/** Truc pour classer en cliquant sur le titre des colones **///{
		var id_th_classement = new Array("ccoordonee","cjoueur","cplanete","cdate","cprod_h","cressourcexh","cress","ccdr","ccdr_ress","cnb_v1","cnb_v2","cnb_d1","cnb_d2");
		var numero_th_classement = new Array("1","2","3","0","20e","20d","12","8","20c","17","22","18","23");
		for(var q=0; q<id_th_classement.length; q++){
			if(document.getElementById(id_th_classement[q]) != 'null' && document.getElementById(id_th_classement[q]))
			{
				document.getElementById(id_th_classement[q]).addEventListener("click", function(event){
					var id_colone_titre = this.id;
					for(var e=0; e<(id_th_classement.length); e++){
						if(id_th_classement[e] == id_colone_titre)
						{
							if(this.className != "decroissant")// soit pas de classe soit croissant
							{	remlir_tableau(info.serveur, numero_th_classement[e], 'croissant');
								this.className = 'decroissant';}
							else{remlir_tableau(info.serveur, numero_th_classement[e], 'decroissant');
								this.className = "croissant";}
						}
					}
				}, true);
			}
		}
		//}

		// changement du select pour lune /planete/tout
			document.getElementById("change_value_affiche").addEventListener("click", function(event){
				afficher_seulement = document.getElementById('choix_affichage2').value;
				filtre_actif_inactif = document.getElementById('filtre_actif_inactif').value;
				filtre_joueur = document.getElementById('filtre_joueur').value;
				remlir_tableau(info.serveur, -1, 0);
			}, true);

//////////////// on coche les options et rajoute les addevents et rajoute les boutons ///////////////
	// OPTION PRESELECTIONNER
	function preselectiionne(variable1, check0 , check1){
		if(variable1 == 0)
			{document.getElementById(check0).checked = "checked";}
		else if(variable1 == 1)
			{document.getElementById(check1).checked = "checked";}
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
	document.getElementById("val_res_min").addEventListener("change", function(event){var val_res_minn = document.getElementById("val_res_min").value; document.getElementsByClassName("y")[0].innerHTML = val_res_minn; document.getElementsByClassName("y")[1].innerHTML = val_res_minn;}, true);
	document.getElementById("valeur_cdr_mini").addEventListener("change", function(event){var valeur_cdr_minis = document.getElementById("valeur_cdr_mini").value; document.getElementsByClassName("x")[0].innerHTML = valeur_cdr_minis; document.getElementsByClassName("x")[1].innerHTML = valeur_cdr_minis;}, true);
	document.getElementById("valeur_tot_mini").addEventListener("change", function(event){var valeur_tot_minis = document.getElementById("valeur_tot_mini").value; document.getElementsByClassName("z")[0].innerHTML = valeur_tot_minis;}, true);

	/******** Partie qui rajoute les events d'ouverture/fermeture de blocs avec des clics **********///{
	/* permet d'afficher/masquer un panneau d'options en cliquant sur un lien
	 * le panneau d'options affiché/masqué est celui désigné par l'attribut "data-cible" du lien
	 * les autres panneaux d'options déjà affiché seront masqué si un autre s'affiche
	 */
	var changeDisplayedOption = function(eventObject) {
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
	var afficherMasquerPanneau = function(eventObject) {
		var titre = $(eventObject.target);
		var contenu = $('#' + titre.data('cible'));

		titre.toggleClass('open');
		contenu.toggleClass('open');

		if (eventObject.data !== null && eventObject.data.callback !== undefined) {
			eventObject.data.callback();
		}
	};

	// fonction qui met le listener pour afficher/masquer le textarea de simulation
	function display_change(idclique, idouvre_f){
		document.getElementById(idclique).addEventListener("click", function(event) {
			var cellule = $('#' + idouvre_f);
			cellule.toggle();
		}, true);
	}

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
	if(simulateur == 3){
		for(p=0 ; p<=i ; p++) {
			if(document.getElementById('simul_'+ p)) {
				display_change('simul_'+p , 'textarea_'+p);
			}
		}
	}
	//}

	// sauvegarder option si clique
		document.getElementById("sauvegarder_option").addEventListener("click", function(event){
			save_option(info.serveur);
			save_optionbbcode(info.serveur);
			// On recharge la page pour que les changements prennent effet
			location.reload();
		}, true);

	//export
		document.getElementById("export_script").addEventListener("click", function(event){
			export_scan(info.serveur, true);
		}, true);
		document.getElementById("export_script_ns").addEventListener("click", function(event){
			export_scan(info.serveur, false);
		}, true);

	//import
		document.getElementById("import_scan").addEventListener("click", function(event){
			import_scan(info.serveur, import_q_rep);
		}, true);

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


