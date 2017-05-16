(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./dom/el');
require('./dom/css');
require('./ba/ajustes');
var forms = require('./dom/forms');
require('./dom/forms-dictionary');
console.log('app.static');

},{"./ba/ajustes":2,"./dom/css":3,"./dom/el":4,"./dom/forms":6,"./dom/forms-dictionary":5}],2:[function(require,module,exports){

$(() => {
	console.log('ajustes');
	css.to(".main").set({
		"min-height": screen.height - 400 + "px!important"
	});
});

},{}],3:[function(require,module,exports){
var css = function () {
	var scopes = {};
	function id(selectors) {
		var rta = '';
		Object.keys(selectors).forEach(function (k) {
			rta += k;
		});
		return btoa(rta);
	}
	function scope(selectors) {
		var _id = id(selectors);
		if (scopes[_id] !== undefined) return scopes[_id];
		//
		var el = document.createElement('style');
		el.setAttribute('type', 'text/css');
		el.id = _id;
		document.querySelector('head').appendChild(el);
		var data = {};
		var rta = {
			data: data,
			render: function () {
				var html = "";
				for (var selector in data) {
					var rules = data[selector];
					html += selector + "{";
					for (var rule in rules) {
						html += rule + ": " + rules[rule] + ';';
					}
					html += "}";
				}
				console.log('css.render');
				el.innerHTML = html;
			}
		};
		scopes[_id] = rta;
		return rta;
	}
	var fn = function (selectors) {
		//rule = {body:{background:"red"}}
		var self = scope(selectors);
		for (var selector in selectors) {
			if (self.data[selector] === undefined) {
				self.data[selector] = selectors[selector];
			} else {
				for (var prop in selectors[selector]) {
					self.data[selector][prop] = selectors[selector][prop];
				}
			}
		}
		self.render();
	};
	fn.to = function (selector) {
		var p = {};
		p[selector] = {};
		return {
			set: function (props) {
				p[selector] = props;
				fn(p);
			}
		};
	};
	return fn;
}();
module.exports = css;
top.css = css;

},{}],4:[function(require,module,exports){
/* global _ */

//var _ =  _ || {};

_.extend = (a, b) => {
	if (a == null) return null;
	return Object.assign(a, b);
};

var toggleClass = (el, cls, val) => {
	var has = el.className.indexOf(cls) !== -1;
	if (val === undefined) el.className = el.className += !has ? cls : '';
	if (val === true) {
		if (!has) el.className = (el.className + ' ' + cls).trim();
	}
	if (val === false && has) {
		el.className = el.className.replace(cls, '').trim();
	}
	return el;
};

_.extend(_, {
	dom: t => {
		if (t.indexOf('<') !== -1) {
			return _.el(_.el(document.createElement('output')).html(t).firstChild);
		} else {
			return _.el(document.createElement(t));
		}
	},
	el: (() => {
		var element = e => _.extend(e, {
			val: v => {
				if (v === undefined) return e.value || undefined;
				e.value = v;
				return e;
			},
			html: raw => {
				if (raw !== undefined) {
					e.innerHTML = raw;
					return e;
				} else {
					return e.innerHTML;
				}
			},
			append: el => {
				//console.log(el);
				e.appendChild(el);
				return e;
			},
			prependTo: el => {
				if (el.childNodes.length === 0) return e.append(el);else {
					el.insertBefore(e, el.childNodes[0]);
					return e;
				}
			},
			appendTo: el => {
				el.appendChild(e);
				return e;
			},
			el: n => element(e.querySelector(n)),
			attr: t => {
				if (typeof t === 'string') e.getAttribute(t);else {
					Object.keys(t).forEach(k => {
						e.setAttribute(k, t[k]);
					});
				}
				return e;
			},
			toggle: (cls, val) => toggleClass(e, cls, val),
			cls: o => {
				Object.keys(o).forEach(k => e.toggle(k, o[k]));
				return e;
			}
		});

		var self = t => {
			if (typeof t === 'string') {
				return element(document.querySelector(t));
			} else {
				return element(t);
			}
		};
		return _.extend(self, {
			convert: arr => {
				_.each(arr, (v, k) => arr[k] = element(v));
				return arr;
			},
			all: n => _.el.convert(document.querySelectorAll(n)),
			each: (n, cb) => _.each(_.el.all(n), cb),
			toggleClass: toggleClass
		});
	})()
});

},{}],5:[function(require,module,exports){
var forms = require('./forms');

forms.type('dictionary', field => {
	var el = _.dom('output');
	var frm = forms({
		name: 'form-dictionary-' + new Date().getTime(),
		target: el,
		fields: {
			0: {
				label: 'Key/Value',
				type: 'keyvalue'
			}
		}
	}).attach();
	field.val = (index, k, v) => {
		frm.fields[index].val();
	};
	field.clear = index => {
		frm.fields[index].clear();
	};
	field.template = "" + "<label data-label></label>" + "<div data-view></div>" + "<button class='add'>add</button>" + "";
	return el;
});

forms.type('keyvalue', field => {
	var el = _.dom('output');
	var frm = forms({
		name: 'form-keyvalue-' + new Date().getTime(),
		target: el,
		fields: {
			key: {
				label: 'Key',
				template: "<div data-view></div>"
			},
			value: {
				label: 'Value',
				template: "<div data-view></div>"
			}
		}
	}).attach();
	field.val = (k, v) => {
		frm.fields.key.el.val(k);
		frm.fields.value.el.val(v);
	};
	field.clear = () => {
		frm.fields.key.el.val('');
		frm.fields.value.el.val('');
	};
	return el;
});
/*
forms.type({
	type: "dictionary",
	template: "<label><span data-label></span>(key/value)</label><ul><output></output></ul>"
	+"<button class='add'>add</button>",
	events: {
		"form-show": (self) => {
			self.el('.add').onclick = (e) => {
				console.log('addd!');
				e.preventDefault();
			};
		}
	},
	create: function (field) {
		var wrapper = _.dom('output');
		wrapper.innerHTML = field.template;
		forms({
			target: wrapper.el('output'),
			fields: {
				property_0: {
					label: 'Property',
					type:'property'
				}
			}
		}).show();
		return wrapper;
	}
});

forms.type({
	type: "property",
	template: "",
	create: function (self) {
		var wrapper = _.dom('output').html(self.template).cls({
			box: true
		});
		forms({
			target: wrapper,
			template: "<li><output></output></li>",
			fields: {
				key: {
					label: 'Key',
					template: "<label data-label></label><input class='key' style='width:60px;'/>",
					attributes: {
						placeholder: 'key'
					}
				},
				value: {
					label: 'Value',
					template: "<label data-label></label><input class='value' style='width:80px;'/>",
					attributes: {
						placeholder: 'value'
					}
				}
			}
		}).show();
		return wrapper;
	}
});

*/

},{"./forms":6}],6:[function(require,module,exports){
var createEventSystem = target => {
	var _evts = {};
	target.emit = (n, p) => {
		var c = 0;
		var arr = _.if(typeof _evts[n] !== 'undefined', _evts[n], []);
		_.each(arr, (handler, id) => {
			handler(p);
			c++;
		});
		if (c > 0) console.log((target.name || 'noname') + '.emit.' + n + '.' + c);
	};
	target.on = (n, handler) => {
		var id = n + new Date().getTime() + _.if(typeof _evts[n] !== 'undefined', Object.keys(_evts[n] || []).length, 0);
		_evts[n] = _.if(_evts[n], _.set(_evts[n], id, handler), _.set({}, id, handler));
		console.log((target.name || 'noname') + '.on.' + n + '.' + Object.keys(_evts).length + '.registered.');
		return () => {
			delete _evts[n][id];
		};
	};
};

var FORMS_TYPES = ['input', 'select', 'textarea'];
var isValidTag = t => {
	return FORMS_TYPES.find(tag => tag == t) !== undefined;
};

var applyFieldDefaults = (field, name, options) => {
	field.name = name;
	field.type = field.type || 'input';
	field._events = _.if(field.events, _.push([], field.events), []);
	createEventSystem(field);
	field.template = field.template || "" + "<div data-view></div>" + "";
};

var FORMS = options => {
	var self = _.extend({}, options);
	createEventSystem(self);
	var target = _.el(options.target);
	var wrapper = _.el(document.createElement('output')).attr({
		'data-wrapper': ''
	});
	//self.form = _.el(target).el('form') || _.el(document.createElement('form')).appendTo(target);
	self.form = target.el('[data-view]') || target;
	//if(!self.form){
	//	throw Error('You need to define a [data-view] inside target '+ target.id+' '+target.name+' ' //+ target.className);
	//}
	self.el = n => _.el(target).el(n);
	self.wrapper = wrapper;
	self.target = target;

	options._events = _.if(options.events, _.push([], options.events), []);

	var fire = n => {
		self.emit(n);
		_.each(options._events, (obj, index) => {
			_.each(obj, (callback, name) => {
				if (name == n) {
					callback(self);
				}
			});
		});
	};

	//wrapper.id = 'wrapper-' + new Date().getTime();

	var addFieldToWrapper = (tpl => {
		if (tpl == undefined) return el => wrapper.appendChild(el);
		wrapper.innerHTML = tpl;
		var out = wrapper.el('output');
		if (!out) {
			throw Error('Template require output tag.');
		} else {
			return el => {
				out.append(el);
				//out.parentNode.insertBefore(el, out);
				//out.parentNode.removeChild(out);
			};
		}
	})(options.template);

	var defineCommonControl = (control, fieldKey, f) => {
		control.name = fieldKey;
		f.el = control;
		f.val = v => f.el.val(v);
		f.clear = () => f.el.val();
		if (f.attributes) {
			control.attr(f.attributes);
		}
		control.className = fieldKey + ' ' + (f.className || '') + ' ' + (options.attributes && options.attributes.className || '');
		var el = control;
		control.onkeyup = evt => f.emit('onkeyup', { el, evt });
	};

	var addField = (f, fieldKey) => {
		applyFieldDefaults(f, fieldKey, options);

		var out = _.dom(f.template);
		var view = out.dataset.view !== undefined && out || out.el('[data-view]') || null;
		if (!view) {
			throw Error('No data-view in template: ' + JSON.stringify(f.template));
		}

		if (f.type && FORMS._isCustom(f.type)) {
			view.append(FORMS._types[f.type](f));
		} else {
			if (!isValidTag(f.type)) {
				throw Error(fieldKey + ' has an invalid type ' + f.type + '. Available types are the follow: ' + _.union(FORMS_TYPES, Object.keys(FORMS._types)));
			}

			var control = out.el('.' + fieldKey) || _.dom(f.type);
			if (!out.el('.' + fieldKey)) {
				view.append(control);
			}

			if (f.label) {
				out.el('[data-label]') && out.el('[data-label]').html(f.label) || _.dom('label').html(f.label).prependTo(view);
			}

			defineCommonControl(control, fieldKey, f);
		}
		//

		addFieldToWrapper(out);
	};

	_.el.toggleClass(target, 'hidden', true);

	target.dataset.form = '';

	var attached = false;
	var actions = {
		attach: () => {
			self.form.appendChild(wrapper);
			attached = true;
			fire('form-attach');
			actions.toggle(true);
		},
		add: fields => {
			Object.keys(fields).forEach(fieldKey => {
				addField(fields[fieldKey], fieldKey);
			});

			/*
   _.each(wrapper.querySelectorAll('output'),(out)=>{
   	_.each(_.toArray(out.childNodes),(n)=>{
   		if(n)out.parentNode.insertBefore(n, out);
   	});
   	out.parentNode.removeChild(out);
   });
   */
		},
		toggle: val => {
			if (!attached && val === true) {
				throw Error('The form you are trying to toggle on is not attached yet. Call to show to attach it for first time.');
			}
			_.el.toggleClass(target, 'hidden', !val);
			fire('form-toggle-' + val.toString());
		},
		detach: () => {
			target.removeChild(wrapper);
			attached = false;
			fire('form-detach');
		},
		self: self
	};
	actions.add(options.fields);
	self.action = actions;
	fire('form-init');

	//	FORMS._instances.push(actions);

	return actions;
};
//FORMS._instances = [];
FORMS._isCustom = fieldKey => Object.keys(FORMS._types).find(k => k == fieldKey) !== undefined;
FORMS._types = {};
FORMS.type = (name, constructor) => {
	FORMS._types[name] = constructor;
};

module.exports = FORMS;

window._ = _ || {};
_.forms = FORMS;

},{}]},{},[1])
//# sourceMappingURL=app.static.js.map
