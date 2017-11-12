function startMove(obj, attr, iTarget, fn) {
	clearInterval(obj.timer); //1.2+++
	obj.timer = setInterval(function() {
		var icur = null;
		if(attr == 'opacity') {
			icur = Math.round(parseFloat(getCSS(obj, attr)) * 100);
		} else {
			icur = parseInt(getCSS(obj, attr));
		}

		var speed = (iTarget - icur) / 4;
		speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
		if(icur == iTarget) {
			clearInterval(obj.timer);
			if(fn) {
				fn();
			}
		} else {
			if(attr == 'opacity') {
				obj.style.filter = 'alpha(opacity:' + (icur + speed) + ')';
				obj.style.opacity = (icur + speed) / 100;
			} else {
				obj.style[attr] = icur + speed + 'px';
			}
		}
	}, 30);
}

function getStyle(obj, attr) {
	if(obj.currentStyle) {
		return obj.currentStyle[attr];
	} else {
		return getComputedStyle(obj, false)[attr];
	}
}

function getCSS(obj, style) {
	if(window.getComputedStyle) {
		return getComputedStyle(obj)[style];
	}
	return obj.currentStyle[style];
}

function shakeMove(json) {
	//声明要进行抖动的元素
	var obj = json.obj;
	//声明元素抖动的最远距离
	var target = json.target;
	//默认值为20
	target = Number(target) || 20;
	//声明元素的变化样式
	var attr = json.attr;
	//默认为'left' 
	attr = attr || 'left';
	//声明元素的起始抖动方向
	var dir = json.dir;
	//默认为'1'，表示开始先向右抖动
	dir = Number(dir) || '1';
	//声明元素每次抖动的变化幅度
	var stepValue = json.stepValue;
	stepValue = Number(stepValue) || 4;
	//声明回调函数 
	var fn = json.fn;
	//声明步长step
	var step = 0;
	//保存样式初始值
	var attrValue = parseFloat(getCSS(obj, attr));
	//声明参照值value
	var value;
	//清除定时器
	if(obj.timer) {
		return;
	}
	//开启定时器
	obj.timer = setInterval(function() {
		//抖动核心代码
		value = dir * (target - step);
		//当步长值大于等于最大距离值target时
		if(step >= target) {
			step = target
		}
		//更新样式值
		obj.style[attr] = attrValue + value + 'px';
		//当元素到达起始点时，停止定时器
		if(step == target) {
			clearInterval(obj.timer);
			obj.timer = 0;
			//设置回调函数
			fn && fn.call(obj);
		}
		//如果此时为反向运动，则步长值变化
		if(dir === -1) {
			step = step + stepValue;
		}
		//改变方向
		dir = -dir;

	}, 50);
}

function easeMove(json) {
	var obj = json.obj;
	var attr = json.attr;
	attr = attr || 'left';
	var value = json.value;
	var target = json.target;
	target = Number(target) || 0;
	var step = json.step;
	var cur = parseFloat(getCSS(obj, 'left'));
	var type = json.type;
	var fn = json.fn;
	if(!obj.timers) {
		obj.timers = {};
	}
	if(obj.timers[attr]) {
		return;
	}
	obj.timers[attr] = setInterval(function() {
		cur = parseFloat(getCSS(obj, 'left'));
		switch(type) {
			case 'linear':
				step = Number(value) || 10;
				break;

			case 'buffer':
				cur = cur > 0 ? Math.ceil(cur) : Math.floor(cur);
				value = Number(value) || 0.1;
				step = (target - cur) * 0.1;
				break
			default:
				step = 10;
				break;
		}
		if ((cur + step - target)*step > 0) {
			step = target - cur;
		}
		obj.style[attr] = cur +step+ 'px';
		if (step == target - cur) {
			clearInterval(obj.timers[attr]);
			obj.timers[attr] = 0;
			fn && fn.call(obj);
		}
	}, 30)
}

function elasticMove(json){
	var obj = json.obj;
	var attr = json.attr;
	attr = attr || 'left'
	var target = json.target;
	if (isNaN(Number(target))) {
		target = 200;
	} else{
		target = Number(target);
	}
	var fn = json.fn;
	var step = 0;
	var len = target;
	var k = json.k;
	k = Number(k) || 0.7;
	var z = json.z;
	z = Number(z) || 0.7;
	var cur = parseFloat(getCSS(obj,attr));
	if (!obj.timers) {
		obj.timers = {};
	}
	if (obj.timers[attr]) {
		return;
	}
	obj.timers[attr] = setInterval(function(){
		cur = parseFloat(getCSS(obj,attr));
		len = target - cur;
		step += len*k;
		step = step*z;
		if((attr == 'height' || attr == 'width') && (cur + step) < 0){
			obj.style[attr] = 0;
		}else{
			obj.style[attr] = cur + step + 'px';
		}
		if (Math.round(step) == 0 && Math.round(len) == 0) {
			obj.style[attr] = target + 'px';
			clearInterval(obj.timers[attr]);
			obj.timers[attr] = 0;
			fn && fn.call(obj);
		}
	},20);
}


function collisionMove(json){
	var obj = json.obj;
	var fn = json.obj;
	
	var  curX = parseFloat(getCSS(obj,'left'));
	var curY = parseFloat(getCSS(obj,'top'));
	
	var stepX = json.step;
	var stepY = json.step;
	stepX = Number(stepX) || 5*Math.floor(Math.random()*10-5);
	stepY = Number(stepY) || 5*Math.floor(Math.random()*18-5);
	
	var dirX =json.dirX;
	var dirY = json.dirY;
	dirX = stepX > 0 ? '+' : '-';
	dirY = stepY > 0 ? '+' : '-';
	
	var offsetWidth = obj.offsetWidth;
	var offsetHeight = obj.offsetHeight;
	
	var activeWidth = obj.offsetWidth;
	var activeHeight = obj.offsetHeight;
	
	activeWidth = Number(activeWidth) || document.documentElement.clientWidth;
	activeHeight = Number(activeHeight) || document.documentElement.clientHeight;
	
	var left;
	var top;
	
	if (obj.timer) {
		return;
	}
	obj.timer = setInterval(function(){
		curX = parseFloat(getCSS(obj,'left'));
		curY = parseFloat(getCSS(obj,'top'));
		
		left = curX + stepX;
		top = curY + stepY;
		
		if ((left > activeWidth - offsetWidth) && (dirX == '+')) {
			left = activeWidth - offsetWidth;
		}
		if ((Math.abs(stepX) > curX) && (dirX == '-')) {
			left = curX;
		}
		if ((top > activeHeight - offsetHeight) && (dirY == '+')) {
			top = activeHeight - offsetHeight;
		}
		if ((Math.abs(stepY) > curY) && (dirY == '-')) {
			top = curY;
		}
		
		obj.style.left = left + 'px';
		obj.style.top = top + 'px';
		
		if (left == activeWidth - offsetWidth || left == curX) {
			stepX = -stepX;
		}
		if (top == activeHeight - offsetHeight || top == curY) {
			stepY = -stepY;
		}
		dirX = stepX > 0 ? '+' : '-';
		dirY = stepY > 0 ? '+' : '-';
	},20)
}
