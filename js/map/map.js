(function(g){

    "use strict";
    const MAP_DEBUG = true;
    const LAYER_MIXED = 'MIXED';//不定（chip.layerで決定する）
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
            //下から追加
            this.addChild(this.layer_under = MapLayer(options));
            this.addChild(this.layer_over  = MapLayer(options));
            this.addChild(this.layer_field = MapLayer(options));
            this.addChild(this.layer_hover = MapLayer(options));
            //管理は上から
            this.layers = [
                {name: LAYER_HOVER, obj: this.layer_hover, map: [], sort: false},
                {name: LAYER_FIELD, obj: this.layer_field, map: [], sort: true},
                {name: LAYER_OVER,  obj: this.layer_over,  map: [], sort: false},
                {name: LAYER_UNDER, obj: this.layer_under, map: [], sort: false},
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
            this.map_width = null;
            this.map_height = null;
            this.chip_width = null;
            this.chip_height = null;
            this.symbol_digit = null;
            this.chip_of_null = null;
            this.chips = null;
            this.sprite_sheet = null;
            this.total_width = null;//
            this.total_height = null;//
            this.tracker = null;//追尾スクロール用
        },
        addChar: function(char){ return this.layer_field.addChild(char); },
        setScrollTracker: function(char){
            this.tracker = char;
            if(char){
                const self = this;
                this.onenterframe = function(e){
                    const game_width = e.app.gridX.width;
                    const game_height = e.app.gridY.width;
                    const center_x = game_width / 2;
                    const center_y = game_height / 2;
                    const gap_x = center_x - char.x;
                    const gap_y = center_y - char.y;
                    const scrollable_width = self.total_width - game_width;
                    const scrollable_height = self.total_height - game_height;
                    let offset_x = gap_x;
                    let offset_y = gap_y;
                    if(offset_x < -scrollable_width){ offset_x = -scrollable_width; }
                    if(offset_x > 0){ offset_x = 0; }
                    if(offset_y < -scrollable_height){ offset_y = -scrollable_height; }
                    if(offset_y > 0){ offset_y = 0; }
                    self.x = offset_x;
                    self.y = offset_y;
                };
            }else{
                this.onenterframe = null;//これでイベント消える？
            }
        },

        create: function(sprite_sheet, _map_data){

            this.sprite_sheet = sprite_sheet;
            const map_data = this._parse_map_data(_map_data);

            this._clear_chips();
            const tiles = map_data.tiles;
            const self = this;
            Object.keys(tiles).forEach(function(layer){
                self.layout_tile(layer, tiles[layer]);
            });

            return this;
        },

        /**
         * マップの簡易表現を配列[y][x]に成形する
         * @param {*} tile map_width * map_height * symbol_digit桁の文字列または配列[map_height] → 要素はmap_width * symbol_digit桁の文字列
         */
        parse_tile: function(tile){
            const map_width = this.map_width;
            const map_height = this.map_height;
            const symbol_digit = this.symbol_digit;
            const chip_of_null = this.chip_of_null;

            const is_string = (tile.constructor === String);
            const is_array = (tile.constructor === Array);
            if(!is_string && !is_array){
                console.log(tile);
                throw new Error(`map_data.tiles[n] must be String or Array.`);
            }
            const tile_str = is_array ? tile.flat(Infinity).join("") : tile;
            const expect_length = map_width * map_height * symbol_digit;
            if(tile_str.length != expect_length){
                console.log(tile_str);
                throw new Error(`tile expects ${expect_length} length: ${[map_width, map_height, symbol_digit]}`);
            }
            const reg_row = new RegExp(`(.{${symbol_digit}}){${map_width}}`, "g");
            const reg_col = new RegExp(`.{${symbol_digit}}`, "g");
            const tile_arr = tile_str.match(reg_row).map(function(row){
                return row.match(reg_col).map(function(symbol){
                    return symbol == chip_of_null ? null : symbol;
                });
            });
            return tile_arr;
        },

        /**
         * 特定のレイヤーにmapchipを配置する
         *  * sprite_sheet, map_dataが配置（create実行）済みであること
         * @param {*} _layer レイヤー名 MIXEDの時chips.layerを見て自動配置する
         * @param {*} tile parse_tileされたmap_width x map_heightの配列（[y][x]）要素はsymbol_digit桁のマップチップを表すシンボル
         */
        layout_tile: function(_layer, tile){
            const sprite_sheet = this.sprite_sheet;
            const chip_width = this.chip_width;
            const chip_height = this.chip_height;
            const chips = this.chips;

            for(let y=0; y<tile.length; y++){
                const row = tile[y];
                for(let x=0; x<row.length; x++){
                    const symbol = row[x];
                    const col = chips.find(function(chip){
                        return chip.symbol == symbol;
                    });
                    if(col){
                        const mapchip = SpriteMapChip(
                            sprite_sheet, symbol,
                            chip_width, chip_height,
                            col.index, col.collision,
                            col.proportion, col.event
                        );
                        mapchip.x = x * chip_width;
                        mapchip.y = y * chip_height;
                        const layer_name = (_layer == LAYER_MIXED) ? col.layer : _layer;
                        const target_layer = this.layers.find(function(layer){
                            return layer.name == layer_name;
                        });
                        if(!target_layer){
                            throw new Error(`layer '${col.layer}' not found.`);
                        }else{
                            target_layer.obj.addChild(mapchip);
                            target_layer.map[y][x] = mapchip;
                        }
                    }
                }
            }
        },

        _clear_chips: function(){
            const map_width = this.map_width;
            const map_height = this.map_height;

            this.layers.forEach(function(layer){
                layer.obj.children.clear();
                layer.map = (new Array(map_height)).fill(null).map(function(row){
                    return (new Array(map_width)).fill(null);
                });
            });
            return this;
        },

        _parse_map_data: function(_map_data){
            const map_data = {
                map_width: _map_data.map_width || 24,
                map_height: _map_data.map_height || 64,
                chip_width: _map_data.chip_width || 16,
                chip_height: _map_data.chip_height || 16,
                symbol_digit: _map_data.symbol_digit || 2,
                chip_of_null: _map_data.chip_of_null || "  ",
            };
            this.map_width = map_data.map_width;
            this.map_height = map_data.map_height;
            this.chip_width = map_data.chip_width;
            this.chip_height = map_data.chip_height;
            this.total_width = this.map_width * this.chip_width;
            this.total_height = this.map_height * this.chip_height;
            this.symbol_digit = map_data.symbol_digit;
            this.chip_of_null = map_data.chip_of_null;
            this.chips = map_data.chips = this._convert_chips(_map_data.chips);
            this.tiles = map_data.tiles = this._convert_tiles(_map_data.tiles);
            return map_data;
        },

        _convert_chips: function(chips){
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
                    layer: chip.layer || LAYER_UNDER,
                    collision: chip.collision || 0,
                    proportion: chip.proportion || 0,
                    event: chip.event || null,
                };
            });
        },

        _convert_tiles: function(_tiles){
            const self = this;
            const tiles = {};
            Object.keys(_tiles).forEach(function(layer_name){
                tiles[layer_name] = self.parse_tile(_tiles[layer_name]);
            });
            return tiles;
        },

        hitTestElement: function(sprite){
            const leftX = Math.floor(sprite.left / this.chip_width);
            const rightX = Math.ceil(sprite.right / this.chip_width);
            const topY = Math.floor(sprite.top / this.chip_height);
            const bottomY = Math.ceil(sprite.bottom / this.chip_height);
            if(MAP_DEBUG){
                this.append_rect(leftX*this.chip_width, rightX*this.chip_width, topY*this.chip_height, bottomY*this.chip_height, "red");
            }
            const layer = this.layers.find(function(_layer){
                return _layer.name = LAYER_FIELD;
            });
            const layer_index = this.layers.indexOf(layer);
            for(let y=topY; y<bottomY; y++){
                if(y < 0 || this.map_height <= y){ continue; }
                for(let x=leftX; x<rightX; x++){
                    if(x < 0 || this.map_width <= x){ continue; }
                    if(MAP_DEBUG){
                        this.append_rect(x*this.chip_width, (x+1)*this.chip_width, y*this.chip_height, (y+1)*this.chip_height, "blue");
                    }
                    let index = layer_index;
                    while(true){
                        let current_layer = this.layers[index];
                        if(!current_layer){ break; }

                        const map = current_layer.map;
                        let mapchip = (map[y] && map[y][x]) ? map[y][x] : null;
                        if(mapchip && mapchip.hitTestElement(sprite)){
                            return mapchip.event_name || true;
                        }else{
                            index += 1;
                        }
                    }
                }
            }
            return false;
        },

        append_rect: function(x1, x2, y1, y2, color){
            const rect = RectangleShape({
                width: Math.abs(x1 - x2),
                height: Math.abs(y1 - y2),
                backgroundColor: "transparent",
                fill: "transparent",
                stroke: color,
                strokeWidth:2,
            });
            rect.x = (x1 + x2) / 2;
            rect.y = (y1 + y2) / 2;
            this.addChild(rect);
            this.remove_rect(rect);
        },
        remove_rect: function(rect){
            setTimeout(function(){
                rect.remove();
            }, 20);
        },
    });

})(this);