(function(g){

    "use strict";

    phina.define('TextBox', {
        superClass: 'phina.display.RectangleShape',
        init: function(texts, _options) {
            const label = this.get_label_from_texts(texts, _options);
            const space = 4;
            const _rectangle_options = Object.assign({}, _options);
            const rectangle_options = {
                backgroundColor: _rectangle_options.backgroundColor || 'black',
                fill: _rectangle_options.fill || 'black',
                stroke: _rectangle_options.stroke || 'white',
                strokeWidth: _rectangle_options.strokeWidth || space,
                cornerRadius: _rectangle_options.cornerRadius || 0,
                height: label.calcCanvasHeight(),
                width: label.calcCanvasWidth(),
                margin: _rectangle_options.margin || space,
                padding: _rectangle_options.padding || space,
            };
            this.superInit(rectangle_options);
            label.addChildTo(this);
            label.setPosition(0, 0);
        },
        get_label_from_texts: function(texts, _options){
            const _label_options = Object.assign({}, _options);
            const label_options = {
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
        },
        get_text: function(texts, align){
            const is_array = (Object.prototype.toString.call(texts) === '[object Array]');
            return is_array ? texts.join("\n") : texts;
        },
    });


})(this);