(function(g){

    "use strict";
    const MAP_DEBUG = false;
    const LAYER_MIXED = 'MIXED';//不定（chip.layerで決定する）
    const LAYER_HOVER = 'hover';//キャラクタを覆い隠すオブジェクトの層
    const LAYER_FIELD = 'field';//一般的にキャラクタを配置する層
    const LAYER_OVER  = 'over';//地面を覆い隠すオブジェクトの層（キャラクタよりは下）
    const LAYER_UNDER = 'under';//地面を配置する層
    const LAYER_BOTTOM = 'bottom';//落ちる演出

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
            this.addChild(this.layer_bottom = MapLayer(options));
            this.addChild(this.layer_under = MapLayer(options));
            this.addChild(this.layer_over  = MapLayer(options));
            this.addChild(this.layer_field = MapLayer(options));
            //this.addChild(this.layer_hover = MapLayer(options));//今回は使ってないので消しとく
            //管理は上から
            this.layers = [
                //{name: LAYER_HOVER, obj: this.layer_hover, map: [], sort: false, hit: false},
                {name: LAYER_FIELD, obj: this.layer_field, map: [], sort: true, hit: true},
                {name: LAYER_OVER,  obj: this.layer_over,  map: [], sort: false, hit: true, assemble: !MAP_DEBUG, sprite: null},
                {name: LAYER_UNDER, obj: this.layer_under, map: [], sort: false, hit: true, assemble: !MAP_DEBUG, sprite: null},
                {name: LAYER_BOTTOM, obj: this.layer_bottom, map: [], sort: false, hit: false},
            ];
            const self = this;
            this.layers.forEach(function(layer){
                //当たり判定はMapTopViewに任せる
                layer.obj.hitTestElement = function(target){
                    return self.hitTestElement(target);
                }
                //スクロール基準（主に主人公）の取得
                layer.obj.getScrollTarget = function(){
                    return self.getScrollTarget();
                }
                //オブジェクトの追加
                layer.obj.addChar = function(char){
                    return self.addChar(char);
                }
                //オブジェクトの削除
                layer.obj.delChar = function(char){
                    return self.delChar(char);
                }
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
            this.tracker = null;//追尾スクロール用
            this.hitMap = null;//当たり判定高速化用
        },
        translatePositionToMapXY: function(realX, realY){
            return {
                mapX: Math.floor(realX / this.chip_width),
                mapY: Math.floor(realY / this.chip_height),
            }
        },
        getHitMap: function(mapX, mapY){
            const map = this.hitMap;
            const maxY = map.length - 1;
            const maxX = map[0].length - 1;
            if(mapX < 0 || maxX < mapX){ return null; }
            if(mapY < 0 || maxY < mapY){ return null; }
            return map[mapY][mapX];
        },
        addChar: function(char){
            this.fire({type: "addchar", char: char});
            return this.layer_field.addChild(char);
        },
        delChar: function(char){
            this.fire({type: "delchar", char: char});
            return this.layer_field.removeChild(char);
        },
        switchCharLayer: function(char, from, _to){
            const current_layer = char.parent;
            const _layer_from = this.layers.find(function(layer){ return layer.name == from; });
            const _layer_to = this.layers.find(function(layer){ return layer.name == _to; });
            if(!_layer_from || !_layer_to){
                throw new Error(`${from} or ${_to} is not found.`);
            }
            if(_layer_from.obj != current_layer){
                throw new Error(`${from} is not current layer for char.`);
            }else{
                _layer_from.obj.removeChild(char);
                _layer_to.obj.addChild(char);
            }
        },
        getBottomY: function(){
            return this.parent.height - this.height;
        },
        getScrollTarget: function(){
            return this.tracker;
        },
        setScrollTracker: function(char, _offset){
            this.tracker = char;
            if(char){
                const self = this;
                const offset = _offset || {x:0, y:0};
                this.onenterframe = function(e){
                    const game_width = e.app.gridX.width;
                    const game_height = e.app.gridY.width;
                    const center_x = game_width / 2;
                    const center_y = game_height / 2;
                    const gap_x = center_x - char.x + offset.x;
                    const gap_y = center_y - char.y + offset.y;
                    const scrollable_width = self.width - game_width;
                    const scrollable_height = self.height - game_height;
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

            this.hitMap = this.createHitMap();
            this.layers.forEach(function(layer){
                if(layer.assemble){
                    self.assemble_sprite(layer, sprite_sheet);
                    while(layer.obj.children.length > 0){
                        layer.obj.children.first.remove();
                    }
                    layer.obj.addChild(layer.sprite);
                }
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
                            col.proportion,
                            col.offset_x, col.offset_y,
                            col.event
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
            this.width = this.map_width * this.chip_width;
            this.height = this.map_height * this.chip_height;
            const self = this;
            this.layers.forEach(function(layer){
                layer.obj.width = self.width;
                layer.obj.height = self.height;
            });
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
                    offset_x: chip.offset_x || 0,
                    offset_y: chip.offset_y || 0,
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

        /**
         * 当たり判定に関わるマップチップを
         * 1枚の2次元配列にまとめておく（高速化のため
         */
        createHitMap: function(){
            const maps = this.layers
            .filter(function(layer){ return layer.hit; })//当たり判定する層のみ
            .map(function(layer){ return layer.map; });
            const height = maps[0].length;
            const width = maps[0][0].length;
            const hitMap = [];
            const search_mapchip = function(_x, _y){
                for(let i=0; i<maps.length; i++){
                    const chip = maps[i][_y][_x];
                    if(chip){ return chip; }
                }
                return null;
            };
            for(let y=0; y<height; y++){
                const row = [];
                for(let x=0; x<width; x++){
                    row.push(search_mapchip(x, y));
                }
                hitMap.push(row);
            }
            return hitMap;
        },

        hitTestElement: function(sprite){
            const map = this.hitMap;
            const leftX = Math.floor(sprite.left / this.chip_width);
            const rightX = Math.ceil(sprite.right / this.chip_width);
            const topY = Math.floor(sprite.top / this.chip_height);
            const bottomY = Math.ceil(sprite.bottom / this.chip_height);
            if(MAP_DEBUG){
                this.append_rect(leftX*this.chip_width, rightX*this.chip_width, topY*this.chip_height, bottomY*this.chip_height, "red");
            }
            for(let y=topY; y<bottomY; y++){
                if(y < 0 || this.map_height <= y){ continue; }
                for(let x=leftX; x<rightX; x++){
                    if(x < 0 || this.map_width <= x){ continue; }
                    if(MAP_DEBUG){
                        this.append_rect(x*this.chip_width, (x+1)*this.chip_width, y*this.chip_height, (y+1)*this.chip_height, "blue");
                    }
                    let mapchip = (map[y] && map[y][x]) ? map[y][x] : null;
                    if(mapchip && mapchip.hitTestElement(sprite)){
                        return mapchip || true;
                    }
                }
            }
            return false;
        },


        /**
         * 敷き詰めたタイルのままだと描画が激重（glLayerでも無理がある
         * canvasに描画して1枚絵として扱う⇒劇的に高速化
         * 【参考】Tiled Map Editorのデータを扱う
         * https://www.monochromesoft.com/dokuwiki/phinajs/tiled_map_editor
         * @param {*} layer
         * @param {*} asset_name
         */
        assemble_sprite: function(layer, asset_name){
            const asset = phina.asset.AssetManager.get('image', asset_name);
            const map = layer.map;
            const canvas = phina.graphics.Canvas().setSize(this.width, this.height);
            canvas.clear(0, 0, this.width, this.height);


            for(let y=0; y<map.length; y++){
                const row = map[y];
                for(let x=0; x<row.length; x++){
                    const mapchip = row[x];
                    if(!mapchip){ continue; }
                    const mx = mapchip.x;
                    const my = mapchip.y;
                    const mwidth = mapchip.width;
                    const mheight = mapchip.height;
                    const index = mapchip.frameIndex;
                    const image = mapchip.image;
                    const image_wlen = Math.floor(image.domElement.width / mwidth);
                    const image_hlen = Math.floor(image.domElement.height / mheight);
                    const px = index % image_wlen; const ix = px * mwidth;
                    const py = Math.floor(index / image_wlen); const iy = py * mheight;
                    canvas.context.drawImage(asset.domElement, ix, iy, mwidth, mheight, mx, my, mwidth, mheight);
                }
            }
            const texture = phina.asset.Texture();
            texture.domElement = canvas.domElement;
            const sprite = Sprite(texture).setOrigin(0, 0).setPosition(0, 0);
            layer.sprite = sprite;
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