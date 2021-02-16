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
    phina.define('MapTopView', {
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

        create: function(sprite_sheet, _map_data){
            const map_data = this.validate_map_data(_map_data);
            console.log(map_data);
        },
        validate_map_data: function(_map_data){
            const convert_chips = function(_chips){
                return _chips.map(function(chip){
                    if(chip.index !== 0 && !chip.index){
                        throw new Error(`chip.index is required: ${chip.index}`);
                    }
                    if(!chip.symbol){
                        throw new Error(`chip.symbol is required: ${chip.symbol}`);
                    }
                    return {
                        name: chip.name || null,
                        index: chip.index,
                        symbol: chip.symbol,
                        layer: chip.layer || LAYER_OVER,
                        collision: chip.collision || 0,
                        event: chip.event || null,
                    };
                });
            };
            const convert_tiles = function(_tiles, width, height, digit){
                const is_string = (_tiles.constructor === String);
                const is_array = (_tiles.constructor === Array);
                if(!is_string && !is_array){
                    console.log(_tiles);
                    throw new Error(`map_data.tiles must be String or Array: ${_tiles}`);
                }
                const tile_str = is_array ? _tiles.flat(Infinity).join("") : _tiles;
                const expect_length = width * height * digit;
                if(tile_str.length != expect_length){
                    console.log(tile_str);
                    throw new Error(`tiles expects ${expect_length} length: ${[width, height, digit]}`);
                }
                const reg_row = new RegExp(`(.{${digit}}){${width}}`, "g");
                const reg_col = new RegExp(`.{${digit}}`, "g");
                const tile_arr = tile_str.match(reg_row).map(function(row){
                    return row.match(reg_col);
                });
                return tile_arr;

            };
            const map_data = {
                map_width: _map_data.map_width || 32,
                map_height: _map_data.map_height || 64,
                chip_width: _map_data.chip_width || 32,
                chip_height: _map_data.chip_height || 32,
                symbol_digit: _map_data.symbol_digit || 2,
            };
            map_data.chips = convert_chips(_map_data.chips);
            map_data.tiles = convert_tiles(_map_data.tiles, map_data.map_width, map_data.map_height, map_data.symbol_digit);

            return map_data;
        },
    });

})(this);