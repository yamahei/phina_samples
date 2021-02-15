(function(g){

    "use strict";
    const LAYER_HOVER = 'hover';//キャラクタを覆い隠すオブジェクトの層
    const LAYER_FIELD = 'field';//一般的にキャラクタを配置する層
    const LAYER_OVER = 'over';//地面を覆い隠すオブジェクトの層（キャラクタよりは下）
    const LAYER_UNDER = 'under';//地面を配置する層

    phina.define('Layer', {
        superClass: 'phina.display.DisplayElement',
        init: function(options) {
            this.superInit(options);
        }
    });
    phina.define('MapTopview', {
        superClass: 'Layer',
        init: function(options) {
            this.superInit(options);
            this.layers = [
                {name: LAYER_HOVER, obj: Layer(), sort: false},
                {name: LAYER_FIELD, obj: Layer(), sort: true},
                {name: LAYER_OVER,  obj: Layer(), sort: false},
                {name: LAYER_UNDER, obj: Layer(), sort: false},
            ];
            this.layers.forEach(function(layer){
                //y座標の小さい順位ソート（上から順に描画）
                if(layer.sort){
                    layer.obj.onenterframe = function(e){
                        this.children.sort(function(a, b){
                            return a.y - b.y;
                        });
                    };
                }
            });
        },
        _appendChild: function(name, obj){
            const target = this.layers.find(function(layer){
                return layer.name == name;
            });
            if(!target){
                throw new Error(`layer of '${name}' not found.`);
            }else{
                return target.obj.addChild(obj);
            }
        },
        appendChildToHover: function(obj){ return this._appendChild(LAYER_HOVER, obj); },
        appendChildToField: function(obj){ return this._appendChild(LAYER_FIELD, obj); },
        appendChildToOver:  function(obj){ return this._appendChild(LAYER_OVER,  obj); },
        appendChildToUnder: function(obj){ return this._appendChild(LAYER_UNDER, obj); },
    });

})(this);