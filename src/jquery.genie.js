
// Javascript jQuery plugin for Genie Effect animations by Kamil Pękala 2013

(function($, window, document, undefined){
	// 'use strict';

	$.fn.genieCollapse = function(target, directions, step_quantum, callback){
		window.genie.collapse(this[0], target[0], directions, step_quantum, callback);
		return this;
	};

	$.fn.genieExpand = function(target, directions, step_quantum, callback){
		window.genie.expand(this[0], target[0], directions, step_quantum, callback);
		return this;
	};

	$.fn.htmlGenieCollapse = function(target, directions, step_quantum, callback){
		var src = $(this);
		if(typeof step_quantum === "function"){
			callback = step_quantum;
			step_quantum = null;
		}
		html2canvas(src[0], {
			onrendered: function(canvas){
				var png = canvas.toDataURL("image/png"),
					width = src.outerWidth(),
					height = src.outerHeight(),
					top = src.position().top,
					img = $('<div class="genie expand"></div>'),
					endCallback = function(){
						$(this).remove();
						if(typeof callback === "function")
							callback.call(src);
					};
				img.css({
					'height': height + 'px',
					'width': width + 'px',
					'background-image': "url('" + png + "')",
					'background-position': '0px 0px',
					'position': 'absolute',
					'top': top,
					'display': 'block'
				});
				src.replaceWith(img);
				img.genieCollapse(target, directions, step_quantum, endCallback);
			}
		});
		return this;
	};

	$.fn.htmlGenieExpand = function(target, element, directions, step_quantum, callback){
		var src = $(this);
		if(typeof step_quantum === "function"){
			callback = step_quantum;
			step_quantum = undefined;
		}
		html2canvas(element[0], {
			onrendered: function(canvas){
				var png = canvas.toDataURL("image/png"),
					width = element.outerWidth(),
					height = element.outerHeight(),
					img = $('<div class="genie expand"></div>'),
					endCallback = function(){
						img.remove();
						target.css({
							'background-image': '',
							'background-position': ''
						});
						target[0].innerHTML = element.clone().html();
						if(typeof callback === "function"){
							callback.call(target);
						}
					};
				console.log(png);
				img.css({
					'height': 'inherit',
					'width': 'inherit',
					'background-image': "url('" + png + "')",
					'background-position': '0px 0px',
				});
				target.empty();
				src.append(img);
				img.genieExpand(target, directions, step_quantum, endCallback);
			}
		});
		return this;
	};

	$.fn.urlGenieExpand = function(target, url, directions, step_quantum, callback){
		var src = $(this);
		if(typeof step_quantum === "function"){
			callback = step_quantum;
			step_quantum = undefined;
		}
		var img = $('<div class="genie expand"></div>');
		img.css({
			'height': 'inherit',
			'width': 'inherit',
			'background-image': "url('" + url + "')",
			'background-position': '0px 0px',
		});
		target.empty();
		src.append(img);
		img.genieExpand(target, directions, step_quantum, function(){
			if(typeof callback === "function"){
				callback.call(target);
			}
		});

		return this;
	};
})(jQuery, window, document);