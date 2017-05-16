/* global ace */


var htmltojson = (() => {
	///
	///
	var model = {
		content: ''
	};
	var modelOriginal = _.clone(model);
	var instance = {};

	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/textmate");
	editor.getSession().setMode("ace/mode/html");
	editor.getSession().setUseWrapMode(true);
	editor.getSession().setWrapLimitRange(null, 100);
	editor.insert("<h3>something cool</h3>");


	var jsoneditor = ace.edit("json-editor");
	jsoneditor.setTheme("ace/theme/xcode");
	jsoneditor.getSession().setMode("ace/mode/json");
	jsoneditor.getSession().setTabSize(2);
	jsoneditor.getSession().setUseWrapMode(true);
 
			
	//ACTIONS
	var action = {
		copyToJson: (decoded) => {
			//var encoded = encodeURIComponent(decoded || editor.getSession().getValue());
			var encoded = decoded || editor.getSession().getValue();
			instance = _.extend(_.clone(model), { content: encoded });
			jsoneditor.setValue(JSON.stringify(instance, null, '\t'));
		},
		copyToEditor: (content) => {
			var encoded = content || model.content;
			//var decoded = decodeURIComponent(encoded);
			var decoded = encoded;
			editor.setValue(decoded);
		},
		openDownloadDialog: (filename, encodedData, mimeType) => {
			var link = document.createElement('a');
			mimeType = mimeType || 'text/plain';
			link.setAttribute('download', filename);
			link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodedData);
			link.click();
		},
		clear: () => {
			//editor.setValue('');
			//jsoneditor.setValue('');
			//action.updatePreview('');
			model = modelOriginal;
			action.copyToEditor();
			action.copyToJson();
			action.updatePreview();
		},
		updatePreview: (c) => {
			document.querySelector('#preview').contentWindow.document.body.innerHTML = c || editor.getSession().getValue();
		}
	}

	//BINDINGS
	//-When the editor changes
	editor.getSession().on('change', function (e) {
		action.copyToJson(editor.getSession().getValue());
		action.updatePreview();
	});

	jsoneditor.getSession().on('change', function (e) {
		try {
			var parsed = JSON.parse(jsoneditor.getSession().getValue());
			instance = parsed;
		} catch (e) { }
	}); 

	//-When the clear button is pressed
	document.querySelector('.clear').onclick = () => {
		if (window.confirm('Sure?')) {
			action.clear();
		}
	};
	//-When the dowload button is pressed
	document.querySelector('.download-json').onclick = () => {
		if (instance) {
			var title = document.querySelector('.filename').value || 'notitle.json';
			instance.content = btoa(instance.content);
			action.openDownloadDialog(title, JSON.stringify(instance, null, '\t'), 'text/json');
		} else {
			alert('Nothing to download');
		}
	};
	document.querySelector('.download-raw').onclick = () => {
		if (instance && instance.content) {
			var title = document.querySelector('.filename').value.replace('.json', '.txt');
			action.openDownloadDialog(title, instance.content);
		} else {
			alert('Nothing to download');
		}
	};



	_.bindFileInput('#file-input', (contents) => {
		if (instance && instance.content) {
			if (window.confirm('overwrite content? (current will be lost)')) {
				action.copyToEditor(contents);
			}
		} else {
			action.copyToEditor(contents);
		}
		action.updatePreview();
	});

	_.bindFileInput('#json-input', (contents) => {
		if (window.confirm('replace model?')) {
			model = JSON.parse(contents);
			try{
			model.content = atob(model.content);
		}catch(e){}
			if (model && model.content) {
				if (instance && instance.content) {
					if (window.confirm("use file's content?")) {
						action.copyToEditor();
						action.copyToJson();
					} else {
						//var encoded = encodeURIComponent(editor.getSession().getValue());
						var encoded = editor.getSession().getValue();
						model.content = encoded;
						action.copyToJson();
					}
				} else {
					action.copyToEditor();
					action.copyToJson();
				}
			} else {
				//var encoded = encodeURIComponent(editor.getSession().getValue());
				var encoded = editor.getSession().getValue();
				model.content = encoded;
			}
			action.updatePreview();
		}
	});
			
	//FINALLY
	action.copyToJson();
	action.updatePreview();
	///
	///
	return {
		model: model, instance: instance, action: action
	};
})();

//FORMS
(() => {
	var main = _.forms({
		name:'form-main',
		target: '.fields',
		events: {
			"form-init": (self) => {
				self.action.attach();

				_.each(self.fields,(field,name)=>{
					field.on('onkeyup',(p)=>{
						htmltojson.model[p.el.name] = p.el.value;
						htmltojson.action.copyToJson();
					});
				});

				self.fields.title.on('onkeyup',(p)=>{
					self.fields.filename.el.value = _.camelToDash(p.el.value, true) + '.json';
					self.fields.filename.emit('onkeyup', { el: self.fields.filename.el });
				})

			},
			"form-attach": (self) => {
				/*
				self.el('.add').onclick = () => {
					newField.attach();
				};
				*/
			}
		},
		attributes: {
			className: 'child'
		},
		fields: {
			filename: {
				label: 'Filename',
				required: true,
				className: '',
				attributes: {
					placeholder: 'filename',
					disabled: 'disabled',
					value: '',
					type: 'text'
				}
			},
			title: {
				label: 'Title',
				required: true,
				className: '',
				attributes: {
					placeholder: 'title',
					value: '',
					type: 'text'
				}
			}
			/*,
			tags: {
				label: 'Tags',
				required: true,
				className: '',
				attributes: {
					placeholder: 'Tags',
					value: 'review',
					type: 'text'
				}
			}*/
		}
	});

	var newField = _.forms({
		name:'form-newfield',
		target: '.newField',
		events: {
			"form-init":(self)=>{
				//self.action.attach();				
			},
			"form-attach": (self) => {
				self.el('.cancel').onclick = () => {
					Object.keys(self.fields).forEach((k) => {
						self.fields[k].clear('');
					})
					newField.toggle(false);
				};
			}
		},
		attributes: {
			className: 'child'
		},
		fields: {
			name: {
				label: 'Name',
				required: true,
				className: '',
				attributes: {
					placeholder: 'Name',
					value: '',
					type: 'text'
				}
			},
			attributes: {
				label: 'Attributes',
				type: 'dictionary'
			}
		}
	});

})();





