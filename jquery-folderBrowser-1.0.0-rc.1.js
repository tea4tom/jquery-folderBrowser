/* folderBrowser v1.2.0

*/


// Folder browser class
if(jQuery) (function($) {
	
	$.fn.folderBrowser = function(options, evItemSelected, evFileDblClick, evPathChange, evMenuClick) { 

		// Declare a class instance
		var instance = $(this);
		instance.eleDOM = $(this)[0];

		instance.options = $.extend({
            // Default folderBrowser values
            rootpath: '/',
            script: 'folderBrowser.php',
            display: 'icons',
            showtoolbar: false,
            icontype: 'i',
            foldersclass: 'fas fa-fw fa-folder',
            folderreturnclass: 'fas fa-fw fa-reply',
            filesclass: {
            	star: 'fas fa-fw fa-file-alt',
            	php: 'fab fa-fw fa-php',
				css: 'fab fa-fw fa-css3',
				js: 'fab fa-fw fa-js-square',
				htm: 'fab fa-fw fa-html5',
				html: 'fab fa-fw fa-html5',
				pdf: 'fas fa-fw fa-file-pdf',
				zip: 'fas fa-fw fa-file-archive',
				z: 'fas fa-fw fa-file-archive',
				rar: 'fas fa-fw fa-file-archive',
				arj: 'fas fa-fw fa-file-archive',
				mp3: 'fas fa-fw fa-file-audio',
				wav: 'fas fa-fw fa-file-audio',
				mid: 'fas fa-fw fa-file-audio',
				c: 'fas fa-fw fa-file-code',
				vb: 'fas fa-fw fa-file-code',
				vbs: 'fas fa-fw fa-file-code',
				asp: 'fas fa-fw fa-file-code',
				inc: 'fas fa-fw fa-file-code',
				xls: 'fas fa-fw fa-file-excel',
				ods: 'fas fa-fw fa-file-excel',
				xlsx: 'fas fa-fw fa-file-excel',
				doc: 'fas fa-fw fa-file-word',
				docx: 'fas fa-fw fa-file-word',
				odt: 'fas fa-fw fa-file-word',
				rtf: 'fas fa-fw fa-file-word',
				jpg: 'fas fa-fw fa-file-image',
				jpeg: 'fas fa-fw fa-file-image',
				gif: 'fas fa-fw fa-file-image',
				png: 'fas fa-fw fa-file-image',
				bmp: 'fas fa-fw fa-file-image',
				svg: 'fas fa-fw fa-file-image',
				ppt: 'fas fa-fw fa-file-powerpoint',
				avi: 'fas fa-fw fa-file-video',
				mp4: 'fas fa-fw fa-file-video',
				fla: 'fas fa-fw fa-file-video',
				mpg: 'fas fa-fw fa-file-video',
				mpeg: 'fas fa-fw fa-file-video',
				mov: 'fas fa-fw fa-file-video'
            },
            toolbaricons: {
            	viewmode: ['fas fa-fw fa-th','fas fa-fw fa-th-list','fas fa-fw fa-list'],
				search: 'fas fa-fw fa-search',
				options: 'fas fa-fw fa-bars'
            }
        }, options );

        // Instance runtime properties
		instance.curpath = '';
		instance.selitem = null;
		instance.curview = 0;

		// Constants and Enums
		var viewmodesEnum = [
			['icons', 'fbr-iconview'],
			['list', 'fbr-listview'],
			['detail', 'fbr-detailview']
		];


		function fbLoadList(container, path, resultsmode = false) {

			if(container.options == undefined) container.options = instance.options;
			if(container.curview == undefined) container.curview = instance.curview;
			if(container.curpath == undefined) container.curpath = instance.curpath;

			// prepare to request new data
			if(resultsmode && container.curview != 1) {
				container.curview = 0;
				$(toolbarViewmode).click();
			}
			
			$(loadingdiv).show();

			$(container).addClass('fbr-wait');
			var oldlis = $(".fbr-ul");
			$(container).find( oldlis ).remove();
			
			container.curpath = path;

			// request data from ajax script
			$.post(container.options.script, { dir: path }, function(data) {
				// console.log(data);
				try {
					var allitems = JSON.parse(data);
				} catch(e) {
					console.log('Call to: ' + path);
					console.log('Returned false: ' + data);
					return false;
				}
				var folders = [];
				var files = [];
				var ddFolder = {
					name: '..',
					fullpath: '',
					type: 'folder',
					items: 0
				}

				if(path != container.options.rootpath) allitems.unshift(ddFolder);

				// remove a query string from any search value
				if(path.indexOf(' "') != -1) path = path.substr(0, path.indexOf(' "'));
				
				// Sort through ALL items to split folders from files
				allitems.forEach(function(oneitem) {
					
					var mu_li = document.createElement('li');
					var mu_itemdiv = document.createElement('div');
					var mu_icondiv = document.createElement('div');
					var mu_iconel = document.createElement(container.options.icontype);
					var mu_textdiv = document.createElement('div');
					var mu_textnode = document.createTextNode(oneitem.name);

					var mu_detail1 = document.createElement('div');
					var mu_detail2 = document.createElement('div');
					var mu_detail3 = document.createElement('div');
					var mu_detail4 = document.createElement('div');
					var mu_detail5 = document.createElement('div');
					var mu_detailend = document.createElement('div');

					mu_detail1.setAttribute("class", "fbr-detail fbr-type");
					mu_detail2.setAttribute("class", "fbr-detail fbr-size");
					mu_detail3.setAttribute("class", "fbr-detail fbr-date");
					mu_detail4.setAttribute("class", "fbr-detail fbr-date");
					mu_detail5.setAttribute("class", "fbr-detail fbr-date");
					mu_detailend.setAttribute("class", "fbr-detail fbr-detail-end");

					mu_itemdiv.setAttribute("class", "fbr-all-items");
					mu_icondiv.setAttribute("class", "fbr-icon");
					mu_textdiv.setAttribute("class", "fbr-text");

					$(mu_icondiv).append(mu_iconel);
					$(mu_textdiv).html(oneitem.name);
					$(mu_itemdiv).append([mu_icondiv, mu_textdiv, mu_detail1, mu_detail2, mu_detail3, mu_detail4, mu_detail5, mu_detailend]);
					$(mu_li).append(mu_itemdiv);

					// select item on click
					$(mu_itemdiv).click(function() {
						// select / deselect
						$(instance).find('.fbr-selected').removeClass('fbr-selected');
						$(this).addClass('fbr-selected');
						container.selitem = oneitem;
						evItemSelected(oneitem);
						return false;
					});

					// select none (click on white)
					$(container).unbind().click(function() {
						// select / deselect
						$(instance).find('.fbr-selected').removeClass('fbr-selected');
						instance.selitem = null;
						evItemSelected(null);
						return false;
					});

					if(oneitem.type=='folder') {

						// double click enters folder
						$(mu_itemdiv).dblclick(function() {
							// enter folder
							var newfolder = '';
							if(oneitem.name != '..') {
								newfolder = container.curpath + oneitem.name + '/';
							} else {
								var newfolderarr = container.curpath.split("/");
								newfolderarr.clean('');
								newfolderarr.pop();
								newfolder = '/' + newfolderarr.join("/");
								if(newfolder.substr(newfolder.length - 1, 1) != '/')
									newfolder += '/';
							}
							evPathChange(newfolder);
							fbLoadList(container, newfolder);
						});

						if(oneitem.items > 0)
							mu_detail2.appendChild(document.createTextNode(oneitem.items + ' items'));

						if(oneitem.name=='..') {
							mu_iconel.setAttribute("class", container.options.folderreturnclass);
						} else {
							mu_iconel.setAttribute("class", container.options.foldersclass);
						}

						if(resultsmode) {
							$(mu_detail3).html(oneitem.relpath);
							$(mu_detail3).addClass('fbr-search-location');
							$(mu_detail4).addClass('fbr-search-hidden');
							$(mu_detail5).addClass('fbr-search-hidden');
						}

						oneitem.dom = mu_li;
						folders.push(oneitem);
					} else {

						// double click sends file chosen event
						$(mu_itemdiv).dblclick(function() {
							evFileDblClick(oneitem);
						});

						var fileico = '';
						if(typeof container.options.filesclass[oneitem.ext] === 'undefined') {
							fileico = container.options.filesclass['star'];
						} else {
							fileico = container.options.filesclass[oneitem.ext];
						}

						mu_iconel.setAttribute("class", fileico);

						mu_detail1.appendChild(document.createTextNode(oneitem.ext));
						mu_detail2.appendChild(document.createTextNode(oneitem.size));
						mu_detail3.appendChild(document.createTextNode(oneitem.accessed));
						mu_detail4.appendChild(document.createTextNode(oneitem.modified));
						mu_detail5.appendChild(document.createTextNode(oneitem.changed));

						if(resultsmode) {
							$(mu_detail3).html(oneitem.relpath);
							$(mu_detail3).addClass('fbr-search-location');
							$(mu_detail4).addClass('fbr-search-hidden');
							$(mu_detail5).addClass('fbr-search-hidden');
						}

						oneitem.dom = mu_li;
						files.push(oneitem);
					}
				});

				// compile all folders and files into one ul
				var markup = document.createElement('ul');
				markup.setAttribute("class", "fbr-ul");
				folders.forEach(function(oneitem) {
					$(markup).append(oneitem.dom);
				});
				files.forEach(function(oneitem) {
					$(markup).append(oneitem.dom);
				});

				$(loadingdiv).hide();
				$(container).removeClass('fbr-wait');

				$(container).append(markup);

				if(resultsmode && container.curview != 2) {
					container.curview = 1;
					$(toolbarViewmode).click();
				}

			});
			return container;
		}

		/* Class initialisation code
		   *********************************************************************
		*/

		$(instance).empty();
		var loadingdiv = document.createElement('div');
		loadingdiv.appendChild(document.createTextNode('Loading list...'));
		$(instance).append(loadingdiv);

		if(instance.options.showtoolbar) {
			var toolbardiv = document.createElement('div');
			var toolbarel = document.createElement('ul');
			var toolbarViewmode = document.createElement('a');
			var toolbarViewmodei = document.createElement('i');
			var toolbarSearch = document.createElement('a');
			var toolbarSearchi = document.createElement('i');
			var toolbarOptions = document.createElement('a');
			var toolbarOptionsi = document.createElement('i');

			toolbarViewmodei.setAttribute("class", instance.options.toolbaricons['viewmode'][instance.curview]);
			toolbarSearchi.setAttribute("class", instance.options.toolbaricons['search']);
			toolbarOptionsi.setAttribute("class", instance.options.toolbaricons['options']);

			toolbarViewmode.appendChild(toolbarViewmodei);
			toolbarSearch.appendChild(toolbarSearchi);
			toolbarOptions.appendChild(toolbarOptionsi);

			toolbardiv.setAttribute("class", "fbr-toolbar");

			// Bind tool bar functions
			$(toolbarViewmode).click(function() {
				// Toggle viewmode
				var orgvm = instance.curview;
				instance.curview++;
				if(instance.curview==3) instance.curview = 0;

				// FontAwesome hack
				if(instance.options.toolbaricons['viewmode'][instance.curview].substr(0, 2)=='fa') {
					$(this)
				        .find('[data-fa-i2svg]')
				        .removeClass(instance.options.toolbaricons['viewmode'][orgvm])
				        .addClass(instance.options.toolbaricons['viewmode'][instance.curview]);
				} else {
					$(toolbarViewmodei).removeClass(instance.options.toolbaricons['viewmode'][orgvm]);
					$(toolbarViewmodei).addClass(instance.options.toolbaricons['viewmode'][instance.curview]);
				}

				$(instance).removeClass(viewmodesEnum[orgvm][1]);
				$(instance).addClass(viewmodesEnum[instance.curview][1]);

			});
			$(toolbarSearch).click(function() {
				$(searchtooldiv).slideToggle();
			});
			$(toolbarOptions).click(function() {
				evMenuClick(instance.selitem, instance.curpath);
			});

			// Attach toolbar
			toolbarel.appendChild(document.createElement('li').appendChild(toolbarViewmode));
			toolbarel.appendChild(document.createElement('li').appendChild(toolbarSearch));
			toolbarel.appendChild(document.createElement('li').appendChild(toolbarOptions));

			toolbardiv.appendChild(toolbarel);
			$(instance).append(toolbardiv);
		}
		var searchtooldiv = document.createElement('div');
		searchtooldiv.setAttribute("class", "fbr-searchtool");
		
		var searchtooltext = document.createElement('input');
		searchtooltext.setAttribute("type", "text");
		searchtooltext.setAttribute("placeholer", "Search...");
		searchtooltext.setAttribute("class", "fbr-searchtool-text");

		var searchtoolbutton = document.createElement('button');
		searchtoolbutton.setAttribute("role", "button");
		searchtoolbutton.setAttribute("class", "fbr-searchtool-button");
		searchtoolbutton.appendChild(document.createTextNode('Search'));

		$(searchtooldiv).append([searchtooltext, searchtoolbutton]);

		$(searchtoolbutton).click(function() {
			var safetxt = $(searchtooltext).val()
				.replace('/','')
				.replace('\\','')
				.replace('"', '')
				.replace('\'', '');
			var qry = instance.curpath + ' "search: ' + safetxt + '"';
			
			fbLoadList($(instance), qry, true);
		});

		$(instance).append(searchtooldiv);

		viewmodesEnum.forEach(function(itm, idx) {
			if(itm[0]==options.display) {
				instance.curview = idx;
			}
		});

		var viewmodeclass = viewmodesEnum[instance.curview][1];
		$(instance).addClass(viewmodeclass);

		instance.fb_refresh = function(newpath = '', changeroot = false) {
			if(newpath=='') newpath = this.curpath;
			if(changeroot) instance.options.rootpath = newpath;
			return fbLoadList(instance, newpath);
		}


		// Get the initial file list
		return fbLoadList(instance, escape(instance.options.rootpath));

	}

	

})(jQuery);

// Function to trim items from array
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};