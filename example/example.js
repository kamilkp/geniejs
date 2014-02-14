$(document).ready(function(fn, undefined){
	var lastExpandedElement,
		lastExpandedDir,
		callbackFn = function(){
			console.log('%cgenie animation finished', "color: teal");
		};
	$(document).on('click', function(ev){
		var target = $(ev.target);
		if (target.hasClass('genie-thumb')) {
			var dir = /dock-\S+(\s|$)/.exec(target.parent().parent()[0].className)[0].slice(5);
			lastExpandedElement = target;
			lastExpandedDir = dir;
			target.genieExpand($('#genie-target'), [dir], null, callbackFn);
		}
		else if(target.hasClass('genie')){
			if(!!lastExpandedElement)
				target.genieCollapse(lastExpandedElement, [lastExpandedDir], null, callbackFn);
			lastExpandedElement = undefined;
			lastExpandedDir = undefined;
		}
	});
});