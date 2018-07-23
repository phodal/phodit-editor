(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
    mod(
      require('codemirror/lib/codemirror'),
      require('codemirror/mode/markdown/markdown'),
      require('codemirror/addon/hint/show-hint')
    );
  }
  else if (typeof define === 'function' && define.amd) { // AMD
    define([
      'codemirror/lib/codemirror',
      'codemirror/mode/markdown/markdown',
      'codemirror/addon/hint/show-hint'
    ], mod);
  }
  else { // Plain browser env
    mod(CodeMirror);
  }
})(function (CodeMirror) {
  'use strict';

  CodeMirror.defineOption('phoditSuggest', [], function (cm, value, old) {
    cm.on('inputRead', function (cm, change) {
      var mode = cm.getModeAt(cm.getCursor());

      for (var i = 0, len = value.length; i < len; i++) {
        if (mode.name === value[i].mode && change.text[0] === value[i].startChar) {
          cm.showHint({
            completeSingle: false,
            hint: function (cm, options) {
              return new Promise(function(accept) {
                var cur = cm.getCursor(),
                  token = cm.getTokenAt(cur);
                var start = token.start + 1,
                  end = token.end;

                var textToken = cm.getTokenAt(cm.getCursor());
                var text = textToken.state.streamSeen.string.split("《")[1];
                if (text.length < 2) {
                  return accept({
                    list: [],
                    from: CodeMirror.Pos(cur.line, start),
                    to: CodeMirror.Pos(cur.line, end)
                  });
                }

                var event1 = new CustomEvent("phodit.editor.suggest.get", {detail: text});
                window.document.dispatchEvent(event1);

                window.document.addEventListener("phodit.editor.suggest.receive", function(event){
                  return accept({
                    list: JSON.parse(event.detail),
                    from: CodeMirror.Pos(cur.line, start),
                    to: CodeMirror.Pos(cur.line, end)
                  });
                });
              })
            }
          });
        }
      }
    });
  });
});
