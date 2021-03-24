(function(g){

    "use strict";

    const SELECOR_MARGIN = 5;
    phina.define('Selector', {
        superClass: 'phina.display.Layer',
        init: function(selections, label_options) {
            this.superInit({});
            this.origin.y = 0;
        },

        get_label: function(){
            const _label_options = Object.assign({}, _options);
            const label_options = {
                //see: Textbox
                fontSize: _label_options.fontSize || 8,
                fontWeight: _label_options.fontWeight || "normal",
                fontFamily: _label_options.fontFamily || "PressStart2P",
                fill: _label_options.stroke || "white",
                //align: _label_options.align,// || "center",
                baseline: _label_options.baseline,
                lineHeight: _label_options.lineHeight,
            };
            label_options.text = this.get_text(texts, label_options.align);
            return Label(label_options);

        }
    });


})(this);