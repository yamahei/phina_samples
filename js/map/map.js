(function(g){

    "use strict";
    const LAYER_HOVER = 'hover';//キャラクタを覆い隠すオブジェクトの層
    const LAYER_FIELD = 'field';//一般的にキャラクタを配置する層
    const LAYER_OVER  = 'over';//地面を覆い隠すオブジェクトの層（キャラクタよりは下）
    const LAYER_UNDER = 'under';//地面を配置する層

    phina.define('MapLayer', {
        superClass: 'phina.display.DisplayElement',
        init: function(options) {
            this.superInit(options);
            this.setOrigin(0, 0);
            this.x = 0;
            this.y = 0;
        }
    });
    phina.define('MapTopView', {
        superClass: 'MapLayer',
        init: function(options) {
            this.superInit(options);
            this.addChild(this.layer_hover = MapLayer(options));
            this.addChild(this.layer_field = MapLayer(options));
            this.addChild(this.layer_over  = MapLayer(options));
            this.addChild(this.layer_under = MapLayer(options));

            this.layers = [
                {name: LAYER_HOVER, obj: this.layer_hover, sort: false},
                {name: LAYER_FIELD, obj: this.layer_field, sort: true},
                {name: LAYER_OVER,  obj: this.layer_over,  sort: false},
                {name: LAYER_UNDER, obj: this.layer_under, sort: false},
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
        addChildToHover: function(mapchip){ return this.layer_hover.addChild(mapchip); },
        addChildToField: function(mapchip){ return this.layer_field.addChild(mapchip); },
        addChildToOver:  function(mapchip){ return this.layer_over.addChild(mapchip); },
        addChildToUnder: function(mapchip){ return this.layer_under.addChild(mapchip); },

        clear_chips: function(){
            this.children.forEach(function(layer){
                layer.children.clear();
            });
            return this;
        },
        create: function(sprite_sheet, _map_data){
            const map_data = this.validate_map_data(_map_data);
            this.clear_chips();

            const chip_height = map_data.chip_height;
            const chip_width = map_data.chip_width;
            const chips = map_data.chips;
            const tiles = map_data.tiles;

            for(let y=0; y<tiles.length; y++){
                const row = tiles[y];
                for(let x=0; x<row.length; x++){
                    const symbol = row[x];
                    const col = chips.find(function(chip){
                        return chip.symbol == symbol;
                    });
                    if(!col){
                        throw new Error(`symbol '${symbol}' not found in chips.`);
                    }else{
                        const mapchip = SpriteMapChip(
                            sprite_sheet,
                            chip_width, chip_height,
                            col.index, col.collision, col.event
                        );
                        mapchip.x = x * chip_width;
                        mapchip.y = y * chip_height;
                        switch(col.layer){
                            case LAYER_HOVER: this.addChildToHover(mapchip); break;
                            case LAYER_FIELD: this.addChildToField(mapchip); break;
                            case LAYER_OVER:  this.addChildToOver(mapchip);  break;
                            case LAYER_UNDER: this.addChildToUnder(mapchip); break;
                            default: throw new Error(`layer '${col.layer}' not found.`);
                        }
                    }
                }
            }
            return this;
        },
        validate_map_data: function(_map_data){
            const map_data = {
                map_width: _map_data.map_width || 32,
                map_height: _map_data.map_height || 64,
                chip_width: _map_data.chip_width || 32,
                chip_height: _map_data.chip_height || 32,
                symbol_digit: _map_data.symbol_digit || 2,
            };
            map_data.chips = this.convert_chips(_map_data.chips);
            map_data.tiles = this.convert_tiles(_map_data.tiles, map_data.map_width, map_data.map_height, map_data.symbol_digit);
            return map_data;
        },
        convert_chips: function(chips){
            return chips.map(function(chip){
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
        },
        convert_tiles: function(tiles, width, height, digit){
            const is_string = (tiles.constructor === String);
            const is_array = (tiles.constructor === Array);
            if(!is_string && !is_array){
                console.log(tiles);
                throw new Error(`map_data.tiles must be String or Array: ${tiles}`);
            }
            const tile_str = is_array ? tiles.flat(Infinity).join("") : tiles;
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
        },

    });

})(this);