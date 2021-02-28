(function(g){

    "use strict";
    /**
     * ATTENTION: must include collider.js
     * ATTENTION: must include map_chip.js
     * ATTENTION: must include map.js
     */
    const MapGeneratorSetting = g.MapGeneratorSetting = {
        "map_width": 16,
        "map_height": 48,
        "map_min_height": 64,
        "map_max_height": 128,
        "level_interval": 4,
    };
    const MAPSYM_EMPTY = "  ";
    const MAPSYM_BLOCK1 = "*0";
    const MAPSYM_BLOCK2 = "*1";
    const MAPSYM_WALL = "*2";
    const MAPSYM_BRIDGE = "#+";
    const MAPSYM_BASE = "@+";
    const MAPSYM_FLOOR1 = "$+";
    const MAPSYM_FLOOR2 = "%+";
    const MAPSYM_HOLE = "X+";

    phina.define('MapGenerator', {
        init: function(sprite_sheet_name, map_asset_name) {
            this.sprite_sheet_name = sprite_sheet_name;
            this.map_data_org = AssetManager.assets.json[map_asset_name].data;
            this.map = MapTopView();
        },
        create: function(level){//0スタート
            this.level = level;
            // const random = this.random = Random(level);
            const random = this.random = Random(Math.floor(Math.random()*999));//debug
            const level_interval = this.level_interval = MapGeneratorSetting.level_interval || 4;
            const stage_scene = this.stage_scene = level % level_interval;
            const stage_switch = this.stage_switch = !!(Math.floor(level / level_interval) % 2);

            const map_data = JSON.parse(JSON.stringify(this.map_data_org));
            map_data.map_width = MapGeneratorSetting.map_width || map_data.map_width;
            map_data.tiles = { over: [], under: [] };
            // this.tiles = map_data.tiles;
            this.map_width = map_data.map_width;
            // this.map_height = 0;//未確定

            const appear_criff = this.is_appear_criff();
            const appear_crack = this.is_appear_crack();

            const map_scenes = ["wall"];
            map_scenes.push("rough");
            if(appear_criff){ map_scenes.push("criff"); }//stage_scene=2(cave) or 3(castle)
            if(appear_crack){ map_scenes.push("crack"); }//stage_scene=1(rock) or 3(castle)
            map_scenes.push("field");
            map_scenes.push("start");

            this.draw_map(map_data, map_scenes);
            //フチの処理
            map_data.tiles.over = this.draw_border(map_data.tiles.over, [MAPSYM_BRIDGE]);
            map_data.tiles.under = this.draw_border(map_data.tiles.under, [MAPSYM_FLOOR1, MAPSYM_FLOOR2, MAPSYM_HOLE]);
            //生成
            const sprite_sheet = this.get_sprite_sheet(stage_scene);
            return this.map.create(sprite_sheet, map_data);
        },

        get_sprite_sheet: function(stage_type){
            const sheets_set = [
                ["map_field_1", "map_field_2", "map_field_3"],
                ["map_rockey_1", "map_rockey_2"],
                ["map_cave_1", "map_cave_2"],
                ["map_castle_1", "map_castle_2"],
            ];
            // const sheets = sheets_set[stage_type % sheets_set.length];
            // const random = this.random.randint(0, 999);
            // return sheets[random % sheets.length];
            const _sheets_set = sheets_set.flat(Infinity);
            return _sheets_set[Math.floor(Math.random() * _sheets_set.length)];
        },
        is_appear_criff: function(){
            return true; //!!(this.stage_scene == 2 || this.stage_scene == 3);
        },
        is_appear_crack: function(){
            return true; //!!(this.stage_scene == 1 || this.stage_scene == 3);
        },

        draw_map: function(map_data, map_scenes){
            while(map_scenes.length){
                const scene = map_scenes.shift();
                switch(scene){
                    case "wall": this.draw_map__wall(map_data); break;
                    case "rough": this.draw_map__rough(map_data); break;
                    case "criff": this.draw_map__criff(map_data); break;
                    case "crack": this.draw_map__crack(map_data); break;
                    case "field": this.draw_map__field(map_data); break;
                    case "start": this.draw_map__start(map_data); break;
                    default: throw new error(`unknown scene: '${scene}'.`);
                }
            }
        },
        draw_map__wall: function(map_data){
            const wall_height = 8;
            const wall_tiles = this.get_maplines(wall_height, MAPSYM_WALL, MAPSYM_EMPTY);
            this.push_tiles(map_data, wall_tiles);

            const ground_height = 8;
            const ground_tiles = this.get_maplines(ground_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            const p1 = {x: rnd.randint(1, 4), y: rnd.randint(1, 2)};
            const p2 = {x: this.map_width - rnd.randint(1, 4), y: ground_height - rnd.randint(1, 2)};
            ground_tiles.under = this.fill_rect(ground_tiles.under, p1, p2, MAPSYM_FLOOR2);
            this.push_tiles(map_data, ground_tiles);

            const enter_height = 4;
            const enter_tiles = this.get_maplines(enter_height, MAPSYM_BASE, MAPSYM_EMPTY);
            this.push_tiles(map_data, enter_tiles);
        },
        draw_map__rough: function(map_data){
            const rough_height = 16;
            const rough_tiles = this.get_maplines(rough_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            //hole
            rough_tiles.under = this.spread_rects({
                layer: rough_tiles.under,
                times: Math.min(Math.floor(this.level / 8) + 1, 6),
                minarea: 25, maxarea: 39, minsize: 5, offset: 1,
                fill: MAPSYM_HOLE, lay: null, exclude: MAPSYM_HOLE,
            });
            //rough
            rough_tiles.under = this.spread_rects({
                layer: rough_tiles.under,
                times: rnd.randint(2, 8),
                minarea: 12, maxarea: 32, minsize: 2,
                fill: MAPSYM_FLOOR1, lay: null, exclude: MAPSYM_HOLE,
            });
            //block
            this.put_blocks({
                under: rough_tiles.under,
                over: rough_tiles.over,
                lays: [MAPSYM_BASE, MAPSYM_FLOOR1],
                times: Math.min(Math.floor(this.level / 4) + 4, 12),
            });

            this.push_tiles(map_data, rough_tiles);
        },
        draw_map__criff: function(map_data){
            const rnd = this.random;
            const criff_height = Math.floor(Math.log2(this.level || 1) * 2) + 12;
            const criff_tiles_upper = this.get_maplines(2, MAPSYM_BASE, MAPSYM_EMPTY);
            const criff_tiles_under = this.get_maplines(2, MAPSYM_BASE, MAPSYM_EMPTY);
            const criff_tiles_main = this.get_maplines(criff_height, MAPSYM_HOLE, MAPSYM_EMPTY);

            const w = rnd.randint(2, 6);
            const x = rnd.randint(4, this.map_width - 4 - w);
            criff_tiles_main.under = this.fill_rect(criff_tiles_main.under, {x: x, y: 0}, {x: x+w, y: criff_height}, MAPSYM_BASE);

            this.push_tiles(map_data, criff_tiles_upper);
            this.push_tiles(map_data, criff_tiles_main);
            this.push_tiles(map_data, criff_tiles_under);
        },
        draw_map__crack: function(map_data){
            const rnd = this.random;
            const crack_height = Math.floor(Math.log2(this.level || 1) * 2) + 12;
            const crack_tiles = this.get_maplines(crack_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const crack_x_list = [
                0, this.map_width,
                rnd.randint(4, this.map_width - 4),
                rnd.randint(4, this.map_width - 4)
            ];
            crack_x_list.sort(function(a, b){ return (a * 1) - (b * 1); });
            const crack_points = crack_x_list.map(function(x){
                return {x: x, y: rnd.randint(2, crack_height - 2)};
            });
            let p1 = crack_points.shift();
            let p2 = crack_points.shift();
            while(true){
                const length = Math.ceil(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
                const w = (p2.x - p1.x) / length;
                const h = (p2.y - p1.y) / length;
                for(let i=0; i<=length; i++){
                    const x = Math.floor(p1.x + (w * i));
                    const y = Math.floor(p1.y + (h * i));
                    crack_tiles.under = this.fill_rect(crack_tiles.under, {x: x, y: y}, {x: x+1, y: y+2}, MAPSYM_HOLE);
                }
                [p1, p2] = [p2, crack_points.shift()];
                if(!p2){
                    break;
                }
            }
            this.push_tiles(map_data, crack_tiles);
        },
        draw_map__field: function(map_data){},
        draw_map__start: function(map_data){},

        push_tiles: function(map_data, _layers){
            Object.keys(_layers).forEach(function(layer_name){
                const layer = map_data.tiles[layer_name];
                if(!layer){
                    throw new Error(`layer name '${layer_name}' not found.`);
                }
                layer.push(..._layers[layer_name]);
            });
            map_data.map_height = map_data.tiles.under.length;
        },
        get_maplines: function(times, under_sym, over_sym){
            const width = this.map_width;
            const unders = (new Array(times)).fill(null).map(function(_){
                return (new Array(width)).fill(under_sym);
            });
            const overs = (new Array(times)).fill(null).map(function(_){
                return (new Array(width)).fill(over_sym);
            });
            return { under: unders, over: overs };
        },
        spread_rects: function(param){
            let layer = JSON.parse(JSON.stringify(param.layer));
            const conf = {
                fill: param.fill,//描画するシンボル
                lay: param.lay,//描画領域の下地を強制する場合（falsyのとき強制しない
                exclude: param.exclude,//描画領域の下地に禁止する場合（falsyのとき禁止しない
                times: param.times || 4,//描画する矩形の個数
                maxarea: param.maxarea || null,//矩形の最大面積
                minarea: param.minarea || null,//矩形の最小面積
                maxsize: param.maxsize || null,//矩形の最大幅・高さ
                minsize: param.minsize || null,//矩形の最小幅・高さ
                offset: param.offset || 0,//描画矩形の縮小幅（説明難しい
            };
            const self = this;
            const rnd = this.random;
            (new Array(conf.times)).fill(null).map(function(_){
                let counter = 0;
                while(true){
                    if(counter++ > 99){ break; }//無限ループ防止
                    const rect_width = rnd.randint(conf.minsize || 0, conf.maxsize || self.map_width);
                    const rect_height = rnd.randint(conf.minsize || 0, conf.maxsize || layer.length);
                    if(conf.maxarea !== null && (rect_width * rect_height > conf.maxarea)){ continue; }
                    if(conf.minarea !== null && (rect_width * rect_height < conf.minarea)){ continue; }
                    const x1 = rnd.randint(0, self.map_width - rect_width);
                    const x2 = x1 + rect_width;
                    const y1 = rnd.randint(0, layer.length - rect_height);
                    const y2 = y1 + rect_height;
                    const p1 = {x: x1, y: y1};
                    const p2 = {x: x2, y: y2};
                    const o1 = {x: x1 + conf.offset, y: y1 + conf.offset};
                    const o2 = {x: x2 - conf.offset, y: y2 - conf.offset};
                    const lay_ok = conf.lay ? self.is_all(layer, p1, p2, conf.lay) : true;
                    const exclude_ok = conf.exclude ? self.is_in(layer, p1, p2, conf.exclude) : true;
                    if(!lay_ok || !exclude_ok){ continue; }
                    layer = self.fill_rect(layer, o1, o2, conf.fill);
                    break;
                }
            });
            return layer;
        },
        put_blocks: function(param){
            const conf = {
                under: param.under,
                over: param.over,
                lays: param.lays || [],//ブロックを置いてよいシンボル
                times: param.times,
            };
            const self = this;
            const rnd = this.random;
            (new Array(conf.times)).fill(null).map(function(_){
                let counter = 0;
                while(true){
                    if(counter++ > 99){ break; }//無限ループ防止
                    const x = rnd.randint(0, self.map_width);
                    const y = rnd.randint(0, conf.under.length);
                    if(conf.under[y] && conf.under[y][x]){
                        const symbol = conf.under[y][x];
                        if(conf.lays.indexOf(symbol) < 0){ continue; }
                        const block = (rnd.randint(0, 10) < 3) ? MAPSYM_BLOCK2 : MAPSYM_BLOCK1;
                        if(conf.over[y] && conf.over[y][x]){
                            if(conf.over[y][x] == MAPSYM_EMPTY){
                                conf.over[y][x] = block;
                                break;
                            }
                            else{ continue; }
                        }
                    }
                }
            });
        },
        fill_rect: function(_layer, p1, p2, symbol){
            const layer = JSON.parse(JSON.stringify(_layer));
            for(let y=p1.y; y<=p2.y; y++){
                for(let x=p1.x; x<=p2.x; x++){
                    if(layer[y] && layer[y][x]){
                        layer[y][x] = symbol;
                    }
                }
            }
            return layer;
        },
        is_all: function(layer, p1, p2, symbol){
            for(let y=p1.y; y<=p2.y; y++){
                for(let x=p1.x; x<=p2.x; x++){
                    if(layer[y] && layer[y][x]){
                        if(layer[y][x] != symbol){ return false; }
                    }
                }
            }
            return true;
        },
        is_in: function(layer, p1, p2, symbol){
            for(let y=p1.y; y<p2.y; y++){
                for(let x=p1.x; x<p2.x; x++){
                    if(layer[y] && layer[y][x]){
                        if(layer[y][x] == symbol){ return false; }
                    }
                }
            }
            return true;
        },

        draw_border: function(_layer, _symbols){
            const layer = JSON.parse(JSON.stringify(_layer));
            const symbol_heads = _symbols.map(function(s){ return s[0]; });
            const self = this;
            const EQ = "EQ";//同じ柄
            const NE = "NE";//違う柄
            const border_patterns = [
                {num: 7, top: NE, right: EQ, bottom: EQ, left: NE},
                {num: 8, top: NE, right: EQ, bottom: EQ, left: EQ},
                {num: 9, top: NE, right: NE, bottom: EQ, left: EQ},
                {num: 4, top: EQ, right: EQ, bottom: EQ, left: NE},
                // {num: 5, top: EQ, right: EQ, bottom: EQ, left: EQ},
                {num: 6, top: EQ, right: NE, bottom: EQ, left: EQ},
                {num: 1, top: EQ, right: EQ, bottom: NE, left: NE},
                {num: 2, top: EQ, right: EQ, bottom: NE, left: EQ},
                {num: 3, top: EQ, right: NE, bottom: NE, left: EQ},
            ];
            const get_symbol_at = function(x, y, symbol){
                const not_equal = MAPSYM_EMPTY;
                if(y < 0 || layer.length <= y ){ return not_equal; }
                const row = layer[y];
                if(x < 0 || row.length <= x ){ return symbol; }
                return row[x];
            };
            symbol_heads.forEach(function(head){
                for(let y=0; y<layer.length; y++){
                    const row = layer[y];
                    for(let x=0; x<row.length; x++){
                        const symbol = row[x];
                        const symbol_head = symbol[0];
                        if(symbol_head != head){ continue; }

                        const top_is    = (head == get_symbol_at(x, y-1, symbol)[0]) ? EQ : NE;
                        const right_is  = (head == get_symbol_at(x+1, y, symbol)[0]) ? EQ : NE;
                        const bottom_is = (head == get_symbol_at(x, y+1, symbol)[0]) ? EQ : NE;
                        const left_is   = (head == get_symbol_at(x-1, y, symbol)[0]) ? EQ : NE;
                        const border_pattern = border_patterns.find(function(pattern){
                            return (
                                pattern.top == top_is &&
                                pattern.right == right_is &&
                                pattern.bottom == bottom_is &&
                                pattern.left == left_is
                            );
                        });
                        const new_symbol = border_pattern ? `${head}${border_pattern.num}` : symbol;
                        layer[y][x] = new_symbol;
                    }
                }
            });
            return layer;
        },

    });


})(this);