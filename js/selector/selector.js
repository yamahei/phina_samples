(function(g){

    "use strict";

    const SELECOR_FONTSIZE = 8;
    phina.define('Selector', {
        superClass: 'phina.display.DisplayElement',
        init: function(selections, label_options) {
            this.superInit({});
            this.origin.y = 0;
            this.create(selections, label_options);
        },
        create: function(_selections, _label_options){
            const label_options = {
                margin: 0, padding: 0,
                fontSize: _label_options.fontSize || SELECOR_FONTSIZE,
                fontWeight: _label_options.fontWeight || "normal",
                fontFamily: _label_options.fontFamily || "PressStart2P",
                fill: _label_options.stroke || "white",
                //align: _label_options.align,// || "center",
                baseline: _label_options.baseline,
                lineHeight: _label_options.lineHeight,
                backgroundColor: "black",
            };
            const objects = _selections.map(function(select){
                // const label = (select.label + space).slice(0, max_length);
                const options = Object.assign({text: select.label}, label_options);
                const obj = select.label ? Label(options) : null;
                if(obj){
                    obj.origin.y = 0;
                    obj.height = obj.calcCanvasHeight();
                }
                return Object.assign({obj: obj}, select);
            });
            const self = this;
            let y = 0;
            objects.forEach(function(object){
                const label = object.obj;
                if(!label){
                    y += SELECOR_FONTSIZE;
                }else{
                    self.addChild(label);
                    label.x = 0;
                    label.y = y;
                    y += label.height + SELECOR_FONTSIZE;
                    label.setInteractive(true);
                    label.on("pointstart", function(e){
                        self.raise_event(object);
                    });
                }
            });
        },

        raise_event: function(target){
            this.fire({
                type: "select",
                event: target.event,
                object: target.obj,
            });
        },
    });


})(this);