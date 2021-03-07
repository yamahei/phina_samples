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
        init: function(mad_data) {
            this.map_data_org = mad_data;
            this.map = MapTopView();
        },
        create: function(level){//0スタート
            const map_data = JSON.parse(JSON.stringify(this.map_data_org));
            const rand = this.random = Random(level || 99);

            map_data.map_width = MapGeneratorSetting.map_width || map_data.map_width;
            map_data.tiles = { over: [], under: [] };
            // this.tiles = map_data.tiles;
            this.map_width = map_data.map_width;
            // this.map_height = 0;//未確定


            const stage_interval = MapGeneratorSetting.level_interval || 4;
            const stage_flag = !!(Math.floor(level / stage_interval) % 2);
            const stage_scene = level % stage_interval;
            map_data.tiles = this.draw_map(level, stage_scene, stage_interval, stage_flag, map_data);
            //フチの処理
            map_data.tiles.over = this.draw_border(map_data.tiles.over, [MAPSYM_BRIDGE]);
            map_data.tiles.under = this.draw_border(map_data.tiles.under, [MAPSYM_FLOOR1, MAPSYM_FLOOR2, MAPSYM_HOLE]);
            //生成
            const map_image = map_data.images[stage_scene];
            const sprite_sheet = map_image.sheets[rand.randint(0, map_image.sheets.length-1)];
            return this.map.create(sprite_sheet, map_data);
        },

        draw_map: function(level, scene, interval, flag, map_data){

            const map_scene_list = [
                {interval: 0, name: "平原", scenes: ["start", "field", "rough", "field", "wall"]},
                {interval: 1, name: "岩場", scenes: ["start", "rough", "crack", "rough", "wall"]},
                {interval: 2, name: "洞窟", scenes: ["start", "crack", "rough", "crack", "wall"]},
                {interval: 3, name: "城",   scenes: ["start", "criff", "field", "criff", "wall"]},
            ];
            const map_scenes = map_scene_list[scene].scenes.reverse();

            while(map_scenes.length){
                const scene = map_scenes.shift();
                switch(scene){
                    case "wall": this.draw_map__wall(map_data, level, scene, flag); break;
                    case "rough": this.draw_map__rough(map_data, level, scene, flag); break;
                    case "criff": this.draw_map__criff(map_data, level, scene, flag); break;
                    case "crack": this.draw_map__crack(map_data, level, scene, flag); break;
                    case "field": this.draw_map__field(map_data, level, scene, flag); break;
                    case "start": this.draw_map__start(map_data, level, scene, flag); break;
                    default: throw new error(`unknown scene: '${scene}'.`);
                }
            }

            return map_data.tiles;
        },
        draw_map__wall: function(map_data, level, scene, flag){
            const wall_height = 4;
            const wall_tiles = this.get_maplines(wall_height, MAPSYM_WALL, MAPSYM_EMPTY);
            this.push_tiles(map_data, wall_tiles);

            const ground_height = 6;
            const ground_tiles = this.get_maplines(ground_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            const p1 = {x: rnd.randint(1, 4), y: 1};
            const p2 = {x: this.map_width - rnd.randint(1, 4), y: ground_height - rnd.randint(1, 3)};
            ground_tiles.under = this.fill_rect(ground_tiles.under, p1, p2, MAPSYM_FLOOR2);
            this.push_tiles(map_data, ground_tiles);
        },
        draw_map__rough: function(map_data, level, scene, flag){
            const rough_height = 8;
            const rough_tiles = this.get_maplines(rough_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            //rough
            rough_tiles.under = this.spread_rects({
                layer: rough_tiles.under,
                times: rnd.randint(3, 6),
                minarea: 12, maxarea: 20, minsize: 2,
                fill: MAPSYM_FLOOR1, lay: null, exclude: MAPSYM_HOLE,
            });
            //hole
            rough_tiles.under = this.spread_rects({
                layer: rough_tiles.under,
                times: Math.min(Math.floor(level / 3) + 1, 4),
                minarea: 12, maxarea: 24, minsize: 4, offset: 1,
                fill: MAPSYM_HOLE, lay: null, exclude: MAPSYM_HOLE,
            });
            //block
            this.put_blocks({
                under: rough_tiles.under,
                over: rough_tiles.over,
                lays: [MAPSYM_BASE, MAPSYM_FLOOR1],
                times: 4,
            });

            this.push_tiles(map_data, rough_tiles);
        },
        draw_map__criff: function(map_data, level, scene, flag){
            const rnd = this.random;
            const ranks = [
                { rank: 0, upper: 3, main: 6, under: 3, times: 1, roads: 3 },
                { rank: 1, upper: 3, main: 5, under: 3, times: 1, roads: 2 },
                { rank: 2, upper: 2, main: 4, under: 2, times: 2, roads: 2 },
                { rank: 3, upper: 2, main: 5, under: 2, times: 2, roads: 1 },
                { rank: 4, upper: 2, main: 4, under: 2, times: 3, roads: 2 },
                { rank: 5, upper: 2, main: 4, under: 2, times: 3, roads: 1 },
            ];
            const _level = Math.floor(level / 4);
            const _maxlength = ranks.length - 1;
            const _minrank = _level < _maxlength ? _level : 0;
            const _maxrank = Math.min(_maxlength, _level);
            const _rank = rnd.randint(_minrank, _maxrank);
            const rank = ranks[_rank];
            console.log({level: level, _minrank: _minrank, _maxrank: _maxrank, rank: rank.rank});

            const criff_tiles_upper = this.get_maplines(rank.upper, MAPSYM_BASE, MAPSYM_EMPTY);
            this.push_tiles(map_data, criff_tiles_upper);

            for(let i=0; i<rank.times; i++){
                const criff_main_tiles = this.get_maplines(rank.main, MAPSYM_HOLE, MAPSYM_EMPTY);
                for(let j=0; j<rank.roads; j++){
                    const road_width = 1;
                    const criff_padding = 3;
                    const _road_x = rnd.randint(criff_padding, this.map_width - criff_padding - road_width);
                    const road_x = Math.floor(_road_x / 2) * 2;
                    criff_main_tiles.under = this.fill_rect(
                        criff_main_tiles.under,
                        {x: road_x, y: 0},
                        {x: road_x + road_width, y: rank.main},
                        MAPSYM_BASE
                    );
                }
                this.push_tiles(map_data, criff_main_tiles);
                const criff_under_tiles = this.get_maplines(rank.under, MAPSYM_BASE, MAPSYM_EMPTY);
                this.push_tiles(map_data, criff_under_tiles);
            }
        },
        draw_map__crack: function(map_data, level, scene, flag){
            const rnd = this.random;
            const crack_height = Math.floor(Math.log2(level || 1) * 2) + 10;
            while(true){
                const crack_tiles = this.get_maplines(crack_height, MAPSYM_BASE, MAPSYM_EMPTY);
                const crack_x_list = [
                    0, this.map_width - 1,
                    rnd.randint(4, this.map_width - 4),
                    rnd.randint(4, this.map_width - 4)
                ];
                crack_x_list.sort(function(a, b){ return (a * 1) - (b * 1); });
                const crack_points = crack_x_list.map(function(x){
                    return {x: x, y: rnd.randint(2, crack_height - 2)};
                });
                const crack_y_list = crack_points.map(function(p){ return p.y; });
                const crack_min_y = Math.min(...crack_y_list);
                const crack_max_y = Math.max(...crack_y_list);
                if(crack_max_y - crack_min_y < crack_height * 0.6){ continue; }

                const crack_widthes = [];
                for(let i=1; i<crack_points.length; i++){
                    const p1 = crack_points[i-1];
                    const p2 = crack_points[i];
                    const width = Math.abs(p2.x-p1.x);
                    const tilt = Math.abs((p2.y-p1.y)/width);
                    crack_widthes.push({
                        p1: p1, p2: p2,
                        width: width,
                        tilt: tilt,
                    });
                }
                crack_widthes.sort(function(a, b){
                    return a.tilt - b.tilt;
                });

                //亀裂描画
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
                    if(!p2){ break; }
                }
                //橋検索・描画
                const bridge_crack = crack_widthes.find(function(crack_width){
                    return crack_width.width > 3;
                });
                const bridge_x1 = Math.min(...[
                    bridge_crack.p1.x + Math.floor((bridge_crack.p2.x - bridge_crack.p1.x) / 2),
                    this.map_width - 3,
                ]);
                const bridge_cy = Math.floor((bridge_crack.p1.y + bridge_crack.p2.y) / 2);
                const bridge_y_list = [{y: bridge_cy, direction: -1}, {y: bridge_cy, direction: 1}].map(function(param){
                    let y = param.y;
                    while(true){
                        y += param.direction;
                        const f1 = (crack_tiles.under[y][bridge_x1 + 0] != MAPSYM_HOLE);
                        const f2 = (crack_tiles.under[y][bridge_x1 + 1] != MAPSYM_HOLE);
                        const f3 = (crack_tiles.under[y][bridge_x1 + 2] != MAPSYM_HOLE);
                        if((f1 && f2 && f3) || y <= 0 || crack_tiles.under.length - 1 <= y){ break; }
                    }
                    return y;
                });
                let [bridge_y1, bridge_y2] = bridge_y_list;
                crack_tiles.over = this.fill_rect(
                    crack_tiles.over,
                    {x: bridge_x1, y: bridge_y1},
                    {x: bridge_x1 + 2, y: bridge_y2},
                    MAPSYM_BRIDGE
                );

                //背景描画
                crack_tiles.under = this.spread_rects({
                    layer: crack_tiles.under,
                    times: rnd.randint(6, 10),
                    minarea: 12, maxarea: 64, minsize: 4, maxsize: 8, offset: 1,
                    fill: MAPSYM_FLOOR1, lay: MAPSYM_BASE, exclude: MAPSYM_HOLE,
                });

                //TODO: enemies

                this.push_tiles(map_data, crack_tiles);
                break;
            }
            //TODO: draw bridge
        },
        draw_map__field: function(map_data, level, scene, flag){
            const field_height = 6;
            const field_tiles = this.get_maplines(field_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            //rough
            field_tiles.under = this.spread_rects({
                layer: field_tiles.under,
                times: rnd.randint(5, 10),
                minarea: 4, maxarea: 20, minsize: 2,
                fill: MAPSYM_FLOOR1, lay: null, exclude: MAPSYM_HOLE,
            });
            //block
            this.put_blocks({
                under: field_tiles.under,
                over: field_tiles.over,
                lays: [MAPSYM_BASE, MAPSYM_FLOOR1],
                times: 2,
            });
            //TODO: enemies

            this.push_tiles(map_data, field_tiles);
        },
        draw_map__start: function(map_data, level, scene, flag){
            const start_height = 6;
            const start_tiles = this.get_maplines(start_height, MAPSYM_BASE, MAPSYM_EMPTY);
            this.push_tiles(map_data, start_tiles);

            const rnd = this.random;
            const rough_height = rnd.randint(Math.floor(start_height / 2), start_height);
            const map_width = this.map_width;
            const rough_x = rnd.randint(0, 4);
            const p1 = {x: rough_x, y: start_height - rough_height};
            const p2 = {x: map_width - rough_x - 1, y: start_height};

            start_tiles.under = this.fill_rect(start_tiles.under, p1, p2, MAPSYM_FLOOR2);
            this.push_tiles(map_data, start_tiles);
        },

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
                    const x1 = rnd.randint(0, self.map_width - rect_width - 1);
                    const x2 = x1 + rect_width;
                    const y1 = rnd.randint(0, layer.length - rect_height - 1);
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
                    if(counter++ > 9){ break; }//無限ループ防止
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