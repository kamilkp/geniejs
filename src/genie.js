
// Javascript library for Genie Effect animations by Kamil Pękala 2013

(function(window, undefined){
	'use strict';

	var document = window.document,
		getClientDimensions = function(el){
			if (!el) return null;
			var rect = el.getBoundingClientRect();
			return {
				w: rect.width,
				h: rect.height,
				t: rect.top,
				l: rect.left,
				b: rect.bottom,
				r: rect.right,
				obj: el
			};
		},
		prefixedEvent = function(el, type, callback, capture) {
			var pfx = 'webkit moz ms o '.split(' ');
			for (var p=0, pl=pfx.length; p<pl; p++) {
				if (!pfx[p]) type = type.toLowerCase();
				el.addEventListener(pfx[p] + type, callback, capture);
			}
		},
		delegate = function(fn){
			var that = this;
			return function(){
				fn.apply(that, Array.prototype.slice.call(arguments));
			};
		};

	var GenieInit = function(container, directions, quantum, callback){
		this.animationDirection = null;
		this.possibleDirections = directions;
		this.step_quantum = typeof quantum  === "number" ? Math.abs(Math.ceil(quantum)) : 3;
		this.expandedContainer = container;
		this.fixedContainer = document.body.appendChild(document.createElement('div'));
		this.fixedContainer.className = 'genie';
		this.callback = callback;
	};
	GenieInit.prototype = {
		constructor: GenieInit,
		collapseTransitionEvent: function(event) {
			switch(event.propertyName){
				case 'left':
				case 'top':
					var source = event.target.parentNode,
						source_dim = getClientDimensions(source),
						target_dim = getClientDimensions(this.target),
						step = source.childNodes,
						step_quantum = this.step_quantum + 1,
						diffT = step_quantum - (step.length - 1)*(1 - step_quantum) - 1,
						diffB = step_quantum + target_dim.h - (step.length - 1)*(1 - step_quantum) - 1,
						diffL = step_quantum - (step.length - 1)*(1 - step_quantum) - 1,
						diffR = step_quantum + target_dim.w - (step.length - 1)*(1 - step_quantum) - 1,
						i,
						il = step.length,
						pystr,
						py,
						pxstr,
						px;
					this.target.style.backgroundPosition = '0px 0px';

					switch(this.animationDirection){
						case 'top':
							for (i=il-1; i>=0; i--) {
								pystr = step[i].style.backgroundPosition.split(' ')[1];
								py = parseFloat(pystr.slice(0, pystr.length - 2), 10);
								step[i].style.backgroundPosition = '0px '+ (py - diffB) +'px';
							}
							break;
						case 'bottom':
							for (i=0; i<il; i++) {
								pystr = step[i].style.backgroundPosition.split(' ')[1];
								py = parseFloat(pystr.slice(0, pystr.length - 2), 10);
								step[i].style.backgroundPosition = '0px '+ (py + diffT)  +'px';
							}
							break;
						case 'left':
							for (i=il-1; i>=0; i--) {
								pxstr = step[i].style.backgroundPosition.split(' ')[0];
								px = parseFloat(pxstr.slice(0, pxstr.length - 2), 10);
								step[i].style.backgroundPosition = (px - diffR) + 'px 0px';
							}
							break;
						case 'right':
							for (i=0; i<il; i++) {
								pxstr = step[i].style.backgroundPosition.split(' ')[0];
								px = parseFloat(pxstr.slice(0, pxstr.length - 2), 10);
								step[i].style.backgroundPosition = (px + diffL) + 'px 0px';
							}
							break;
						
					}
					source.className += ' change-pace';
					break;
				case 'background-position':
				case 'background-position-x':
				case 'background-position-y':
					document.body.removeChild(this.fixedContainer);
					if(typeof this.callback === "function")
						this.callback.call(this.expandedContainer);
					break;
			}
		},
		expandTransitionEvent: function(event) {
			var source = event.target.parentNode;
			switch(event.propertyName){
				case 'background-position':
				case 'background-position-x':
				case 'background-position-y':
					var	step = source.childNodes,
						i,
						il = step.length;
					source.className += ' change-pace';
					for(i=0;i<il;i++){
						switch(this.animationDirection){
							case 'top':
							case 'bottom':
								step[i].style.width = '100%';
								step[i].style.left = '0px';
								break;
							case 'left':
							case 'right':
								step[i].style.height = '100%';
								step[i].style.top = '0px';
								break;
						}
					}
					break;
				case 'width':
				case 'height':
					this.expandedContainer.style.backgroundPosition = '0px 0px';
					document.body.removeChild(source);
					if(typeof this.callback === "function")
						this.callback.call(this.expandedContainer);
					break;
			}
		},
		collapse: function(target) {
			this.target = target;
			var step_quantum = this.step_quantum,
				source = this.expandedContainer,
				fixed = this.fixedContainer,
				source_dim = getClientDimensions(source),
				target_dim = getClientDimensions(target),
				step_length_bottom = Math.ceil((target_dim.t - source_dim.t) / step_quantum),
				step_length_top = Math.ceil((source_dim.b-target_dim.b) / step_quantum),
				step_length_right = Math.ceil((target_dim.l-source_dim.l) / step_quantum),
				step_length_left = Math.ceil((source_dim.r-target_dim.r) / step_quantum),
				step_length_max = -1,
				htm = '',
				bg_pos,
				top,
				left,
				i = 0,
				that = this;

			if(typeof this.possibleDirections === "undefined" || typeof this.possibleDirections.indexOf !== "function")
				this.possibleDirections = ['top', 'bottom', 'right', 'left'];
			if(this.possibleDirections.indexOf('bottom') >= 0 && step_length_bottom > step_length_max){
				step_length_max = step_length_bottom;
				this.animationDirection = 'bottom';
			}
			if(this.possibleDirections.indexOf('top') >= 0 && step_length_top > step_length_max){
				step_length_max = step_length_top;
				this.animationDirection = 'top';
			}
			if(this.possibleDirections.indexOf('left') >= 0 && step_length_left > step_length_max){
				step_length_max = step_length_left;
				this.animationDirection = 'left';
			}
			if(this.possibleDirections.indexOf('right') >= 0 && step_length_right > step_length_max){
				step_length_max = step_length_right;
				this.animationDirection = 'right';
			}

			switch(this.animationDirection){
				case 'top':
					var off = Math.ceil((source_dim.t - target_dim.b) / step_quantum);
					fixed.style.width = source_dim.w + 'px';
					fixed.style.height = source_dim.h + 'px';
					fixed.style.top = source_dim.t + 'px';
					fixed.style.left = source_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = source.style.backgroundPosition;
					fixed.style.backgroundImage = source.style.backgroundImage;
					fixed.style.display = source.style.display;

					fixed.style.backgroundPosition = '0px 9999px';

					for (i=-off; i<step_length_top - off; i++) {
						top = i * step_quantum;
						bg_pos = '0px '+ (-(i+1) * step_quantum) + 'px';
						htm += '<div class="genie-step" style="left: 0px; top: '+ top +'px; width: '+ source_dim.w +
								'px; height: '+ (step_quantum + 1) +'px; background-position: '+ bg_pos +'; background-size: 100% ' + source_dim.h + 'px;"></div>';
					}
					fixed.innerHTML = htm;

					setTimeout(function() {
						source.style.backgroundPosition = '0px 9999px';
						var steps = fixed.childNodes,
							radians_left = Math.floor((target_dim.l - source_dim.l) / 2),
							radians_width = Math.floor((target_dim.w - source_dim.w) / 2),
							rw_offset = radians_width - target_dim.w + 1,
							increase = (Math.PI * 2) / (step_length_top * 2),
							counter = 4.7,
							i = 0,
							il = steps.length;
						for (; i<il; i++) {
							steps[il - i - 1].style.left = Math.ceil((Math.sin(counter) * radians_left) + radians_left) +'px';
							steps[il - i - 1].style.width = Math.ceil((Math.sin(counter) * radians_width) - rw_offset) + 'px';
							counter += increase;
						}
						prefixedEvent(steps[0], 'TransitionEnd', delegate.call(that, that.collapseTransitionEvent), true);
						fixed.className += ' collapse';
					}, 10);
					break;
				case 'bottom':
					fixed.style.width = source_dim.w + 'px';
					fixed.style.height = source_dim.h + 'px';
					fixed.style.top = source_dim.t + 'px';
					fixed.style.left = source_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = source.style.backgroundPosition;
					fixed.style.backgroundImage = source.style.backgroundImage;
					fixed.style.display = source.style.display;

					fixed.style.backgroundPosition = '0px -9999px';

					for (; i<step_length_bottom; i++) {
						top = i * step_quantum;
						bg_pos = '0px '+ (-(i+1) * step_quantum) + 'px';
						htm += '<div class="genie-step" style="left: 0px; top: '+ top +'px; width: '+ source_dim.w +
								'px; height: '+ (step_quantum + 1) +'px; background-position: '+ bg_pos +'; background-size: 100% ' + source_dim.h + 'px;"></div>';
					}
					fixed.innerHTML = htm;

					setTimeout(function() {
						source.style.backgroundPosition = '0px -9999px';
						var steps = fixed.childNodes,
							radians_left = Math.floor((target_dim.l - source_dim.l) / 2),
							radians_width = Math.floor((target_dim.w - source_dim.w) / 2),
							rw_offset = radians_width - target_dim.w + 1,
							increase = (Math.PI * 2) / (step_length_bottom * 2),
							counter = 4.7,
							i = 0,
							il = steps.length;
						for (; i<il; i++) {
							steps[i].style.left = Math.ceil((Math.sin(counter) * radians_left) + radians_left) +'px';
							steps[i].style.width = Math.ceil((Math.sin(counter) * radians_width) - rw_offset) + 'px';
							counter += increase;
						}
						prefixedEvent(steps[il-1], 'TransitionEnd', delegate.call(that, that.collapseTransitionEvent), true);
						fixed.className += ' collapse';
					}, 10);
					break;
				case 'right':
					fixed.style.width = source_dim.w + 'px';
					fixed.style.height = source_dim.h + 'px';
					fixed.style.top = source_dim.t + 'px';
					fixed.style.left = source_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = source.style.backgroundPosition;
					fixed.style.backgroundImage = source.style.backgroundImage;
					fixed.style.display = source.style.display;

					fixed.style.backgroundPosition = '-9999px 0px';

					for (; i<step_length_right; i++) {
						left = i * step_quantum;
						bg_pos = (-(i+1) * step_quantum) + 'px 0px';
						htm += '<div class="genie-step" style="left: ' + left + 'px; top: 0px; width: '+ (step_quantum + 1) +
								'px; height: '+ source_dim.h +'px; background-position: '+ bg_pos +'; background-size: ' + source_dim.w + 'px 100%;"></div>';
					}
					fixed.innerHTML = htm;
					setTimeout(function() {
						source.style.backgroundPosition = '-9999px 0px';
						var steps = fixed.childNodes,
							radians_top = Math.floor((target_dim.t - source_dim.t) / 2),
							radians_height = Math.floor((target_dim.h - source_dim.h) / 2),
							rh_offset = radians_height - target_dim.h + 1,
							increase = (Math.PI * 2) / (step_length_right * 2),
							counter = 4.7,
							i = 0,
							il = steps.length;
						for (; i<il; i++) {
							steps[i].style.top = Math.ceil((Math.sin(counter) * radians_top) + radians_top) +'px';
							steps[i].style.height = Math.ceil((Math.sin(counter) * radians_height) - rh_offset) + 'px';
							counter += increase;
						}
						prefixedEvent(steps[il-1], 'TransitionEnd', delegate.call(that, that.collapseTransitionEvent), true);
						fixed.className += ' collapse';
					}, 10);
					break;
				case 'left':
					var off = Math.ceil((source_dim.l - target_dim.r) / step_quantum);
					fixed.style.width = source_dim.w + 'px';
					fixed.style.height = source_dim.h + 'px';
					fixed.style.top = source_dim.t + 'px';
					fixed.style.left = source_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = source.style.backgroundPosition;
					fixed.style.backgroundImage = source.style.backgroundImage;
					fixed.style.display = source.style.display;

					fixed.style.backgroundPosition = '9999px 0px';

					for (i=-off; i<step_length_left-off; i++) {
						left = i * step_quantum;
						bg_pos = (-(i+1) * step_quantum) + 'px 0px';
						htm += '<div class="genie-step" style="left: ' + left + 'px; top: 0px; width: '+ (step_quantum + 1) +
								'px; height: '+ source_dim.h +'px; background-position: '+ bg_pos +'; background-size: ' + source_dim.w + 'px 100%;"></div>';
					}
					fixed.innerHTML = htm;
					setTimeout(function() {
						var steps = fixed.childNodes,
							radians_top = Math.floor((target_dim.t - source_dim.t) / 2),
							radians_height = Math.floor((target_dim.h - source_dim.h) / 2),
							rh_offset = radians_height - target_dim.h + 1,
							increase = (Math.PI * 2) / (step_length_left * 2),
							counter = 4.7,
							i = 0,
							il = steps.length;
						for (; i<il; i++) {
							steps[il - 1 - i].style.top = Math.ceil((Math.sin(counter) * radians_top) + radians_top) +'px';
							steps[il - 1 - i].style.height = Math.ceil((Math.sin(counter) * radians_height) - rh_offset) + 'px';
							counter += increase;
						}
						prefixedEvent(steps[0], 'TransitionEnd', delegate.call(that, that.collapseTransitionEvent), true);
						source.style.backgroundPosition = '9999px 0px';
						fixed.className += ' collapse';
					}, 10);
					break;
			}
		},
		setupTarget: function(img, callback) {
			var target = this.expandedContainer,
				tempImg = new Image(),
				bgUrl = img.style.backgroundImage;
			tempImg.src = /"/.test(bgUrl) ? bgUrl.slice(5, bgUrl.length - 2) : bgUrl.slice(4, bgUrl.length - 1);
			tempImg.onload = function() {
				target.style.backgroundPosition = '0px -9999px';
				target.style.backgroundImage = bgUrl;
				target.className = 'genie';
				if(typeof callback === "function")
					callback();
			};
		},
		expand: function(source) {
			var step_quantum = this.step_quantum,
				target = this.expandedContainer,
				fixed = this.fixedContainer,
				source_dim = getClientDimensions(source),
				target_dim = getClientDimensions(target),
				step_length_bottom = Math.ceil((source_dim.t - target_dim.t) / step_quantum),
				step_length_top = Math.ceil((target_dim.b-source_dim.b) / step_quantum),
				step_length_right = Math.ceil((source_dim.l-target_dim.l) / step_quantum),
				step_length_left = Math.ceil((target_dim.r-source_dim.r) / step_quantum),
				step_length_max = -1,
				counter = 4.7,
				htm = '',
				i = 0;

			if(typeof this.possibleDirections === "undefined" || typeof this.possibleDirections.indexOf !== "function")
				this.possibleDirections = ['top', 'bottom', 'right', 'left'];
			if(this.possibleDirections.indexOf('bottom') >= 0 && step_length_bottom > step_length_max){
				step_length_max = step_length_bottom;
				this.animationDirection = 'bottom';
			}
			if(this.possibleDirections.indexOf('top') >= 0 && step_length_top > step_length_max){
				step_length_max = step_length_top;
				this.animationDirection = 'top';
			}
			if(this.possibleDirections.indexOf('left') >= 0 && step_length_left > step_length_max){
				step_length_max = step_length_left;
				this.animationDirection = 'left';
			}
			if(this.possibleDirections.indexOf('right') >= 0 && step_length_right > step_length_max){
				step_length_max = step_length_right;
				this.animationDirection = 'right';
			}
			switch(this.animationDirection){
				case 'bottom':
					var diffT = source_dim.t - target_dim.t,
						radians_left = Math.floor((source_dim.l - target_dim.l) / 2),
						radians_width = Math.floor((source_dim.w - target_dim.w) / 2),
						rw_offset = radians_width - source_dim.w + 1,
						increase = (Math.PI * 2) / (step_length_bottom * 2);

					fixed.style.width = target_dim.w + 'px';
					fixed.style.height = target_dim.h + 'px';
					fixed.style.top = target_dim.t + 'px';
					fixed.style.left = target_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = target.style.backgroundPosition;
					fixed.style.backgroundImage = target.style.backgroundImage;
					fixed.style.display = target.style.display;
					fixed.className = "genie";

					for (; i<step_length_bottom; i++) {
						htm += '<div class="genie-step" style="top: '+ (i * step_quantum) +
								'px; height: '+ (step_quantum + 1) +'px; background-position: 0px '+ (diffT - (i * step_quantum)) +
								'px; left: '+ Math.ceil((Math.sin(counter) * radians_left) + radians_left) +
								'px; width: '+ Math.ceil((Math.sin(counter) * radians_width) - rw_offset) +'px; '+
								'background-size: 100% ' + target_dim.h + 'px;"></div>';
						counter += increase;
					}
					fixed.innerHTML = htm;

					prefixedEvent(fixed.childNodes[0], 'TransitionEnd', delegate.call(this, this.expandTransitionEvent));

					setTimeout(function() {
						var steps = fixed.childNodes,
							pystr,
							py,
							i=0,
							il=steps.length;
						for (; i<il; i++) {
							pystr = steps[i].style.backgroundPosition.split(' ')[1];
							py = parseFloat(pystr.slice(0, pystr.length - 2), 10);
							steps[i].style.backgroundPosition = '0px ' + (py - diffT) + 'px';
						}
						source.style.backgroundPosition = '0px -'+ Math.floor((diffT / target_dim.h) * 100 ) +'px';
						fixed.className += ' expand';
					}, 0);
					break;
				case 'top':
					var diffB = target_dim.b - source_dim.b,
						off = Math.ceil((target_dim.t - source_dim.b) / step_quantum),
						radians_left = Math.floor((source_dim.l - target_dim.l) / 2),
						radians_width = Math.floor((source_dim.w - target_dim.w) / 2),
						rw_offset = radians_width - source_dim.w + 1,
						increase = (Math.PI * 2) / (step_length_top * 2),
						k = step_length_top-off-1;

					fixed.style.width = target_dim.w + 'px';
					fixed.style.height = target_dim.h + 'px';
					fixed.style.top = target_dim.t + 'px';
					fixed.style.left = target_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = target.style.backgroundPosition;
					fixed.style.backgroundImage = target.style.backgroundImage;
					fixed.style.display = target.style.display;
					fixed.className = "genie";

					for (i=-off; i<step_length_top-off; i++, k--) {
						htm += '<div class="genie-step" style="top: '+ (k * step_quantum) +
								'px; height: '+ (step_quantum + 1) +'px; background-position: 0px '+ ((-k * step_quantum) - diffB) +
								'px; left: '+ Math.ceil((Math.sin(counter) * radians_left) + radians_left) +
								'px; width: '+ Math.ceil((Math.sin(counter) * radians_width) - rw_offset) +'px; '+
								'background-size: 100% ' + target_dim.h + 'px;"></div>';
						counter += increase;
					}
					fixed.innerHTML = htm;

					prefixedEvent(fixed.childNodes[0], 'TransitionEnd', delegate.call(this, this.expandTransitionEvent));

					setTimeout(function() {
						var steps = fixed.childNodes,
							pystr,
							py,
							i=0,
							il=steps.length;
						for (; i<il; i++) {
							pystr = steps[i].style.backgroundPosition.split(' ')[1];
							py = parseFloat(pystr.slice(0, pystr.length - 2), 10);
							steps[i].style.backgroundPosition = '0px ' + (py + diffB) + 'px';
						}
						source.style.backgroundPosition = '0px '+ Math.floor((diffB / target_dim.h) * 100 ) +'px';
						fixed.className += ' expand';
					}, 0);
					break;
				case 'right':
					var diffL = source_dim.l - target_dim.l,
						radians_top = Math.floor((source_dim.t - target_dim.t) / 2),
						radians_height = Math.floor((source_dim.h - target_dim.h) / 2),
						rh_offset = radians_height - source_dim.h + 1,
						increase = (Math.PI * 2) / (step_length_right * 2);

					fixed.style.width = target_dim.w + 'px';
					fixed.style.height = target_dim.h + 'px';
					fixed.style.top = target_dim.t + 'px';
					fixed.style.left = target_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = target.style.backgroundPosition;
					fixed.style.backgroundImage = target.style.backgroundImage;
					fixed.style.display = target.style.display;
					fixed.className = "genie";

					for (; i<step_length_right; i++) {
						htm += '<div class="genie-step" style="left: '+ (i * step_quantum) +
								'px; width: '+ (step_quantum + 1) +'px; background-position: ' + (diffL - (i * step_quantum)) + 'px 0' +
								'px; top: '+ Math.ceil((Math.sin(counter) * radians_top) + radians_top) +
								'px; height: '+ Math.ceil((Math.sin(counter) * radians_height) - rh_offset) +'px; '+
								'background-size: ' + target_dim.w + 'px 100%;"></div>';
						counter += increase;
					}
					fixed.innerHTML = htm;

					prefixedEvent(fixed.childNodes[0], 'TransitionEnd', delegate.call(this, this.expandTransitionEvent));

					setTimeout(function() {
						var steps = fixed.childNodes,
							pxstr,
							px,
							i=0,
							il=steps.length;
						for (; i<il; i++) {
							pxstr = steps[i].style.backgroundPosition.split(' ')[0];
							px = parseFloat(pxstr.slice(0, pxstr.length - 2), 10);
							steps[i].style.backgroundPosition = (px - diffL) + 'px 0px';
						}
						source.style.backgroundPosition = '-'+ Math.floor((diffL / target_dim.h) * 100 ) +'px 0px';
						fixed.className += ' expand';
					}, 0);
					break;
				case 'left':
					var diffR = target_dim.r - source_dim.r,
						off = Math.ceil((target_dim.l - source_dim.r) / step_quantum),
						radians_top = Math.floor((source_dim.t - target_dim.t) / 2),
						radians_height = Math.floor((source_dim.h - target_dim.h) / 2),
						rh_offset = radians_height - source_dim.h + 1,
						increase = (Math.PI * 2) / (step_length_left * 2),
						k=step_length_left-off-1;

					fixed.style.width = target_dim.w + 'px';
					fixed.style.height = target_dim.h + 'px';
					fixed.style.top = target_dim.t + 'px';
					fixed.style.left = target_dim.l + 'px';
					fixed.style.position = 'absolute';
					fixed.style.backgroundPosition = target.style.backgroundPosition;
					fixed.style.backgroundImage = target.style.backgroundImage;
					fixed.style.display = target.style.display;
					fixed.className = "genie";

					for (i=-off; i<step_length_left-off; i++, k--) {
						htm += '<div class="genie-step" style="left: '+ (k * step_quantum) +
								'px; width: '+ (step_quantum + 1) +'px; background-position: ' + ((-k * step_quantum) - diffR) + 'px 0' +
								'px; top: '+ Math.ceil((Math.sin(counter) * radians_top) + radians_top) +
								'px; height: '+ Math.ceil((Math.sin(counter) * radians_height) - rh_offset) +'px; '+
								'background-size: ' + target_dim.w + 'px 100%;"></div>';
						counter += increase;
					}
					fixed.innerHTML = htm;

					prefixedEvent(fixed.childNodes[0], 'TransitionEnd', delegate.call(this, this.expandTransitionEvent));

					setTimeout(function() {
						var steps = fixed.childNodes,
							pxstr,
							px,
							i=0,
							il=steps.length;
						for (; i<il; i++) {
							pxstr = steps[i].style.backgroundPosition.split(' ')[0];
							px = parseFloat(pxstr.slice(0, pxstr.length - 2), 10);
							steps[i].style.backgroundPosition = (px + diffR) + 'px 0px';
						}
						source.style.backgroundPosition = Math.floor((diffR / target_dim.h) * 100 ) +'px 0px';
						fixed.className += ' expand';
					}, 0);
					break;
			}
		}
	};
	
	var genie = {
		expand: function(source, target, directions, quantum, callback){
			var	callbackCalled = false,
				callbackDelegate = delegate.call(target, function(){
					if(callbackCalled) return;
					callbackCalled = true;
					if(typeof callback === "function")
						callback.call(this);
				}),
			g = new GenieInit(target, directions, quantum, callbackDelegate);
			g.setupTarget(source, function(){
				g.expand(source);
				// in case something goes wrong, the callback will get executed after two seconds
				setTimeout(callbackDelegate, 2000);
			});
		},
		collapse: function(source, target, directions, quantum, callback){
			var	callbackCalled = false,
				callbackDelegate = delegate.call(source, function(){
					if(callbackCalled) return;
					callbackCalled = true;
					if(typeof callback === "function")
						callback.call(this);
				}),
				g = new GenieInit(source, directions, quantum, callbackDelegate);
			g.collapse(target);
			// in case something goes wrong, the callback will get executed after two seconds
			setTimeout(callbackDelegate, 2000);
		}
	};

	window.genie = genie;
})(window);