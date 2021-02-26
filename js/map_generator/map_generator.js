(function(g){

    "use strict";
    /**
     * ATTENTION: must include collider.js
     * ATTENTION: must include map_chip.js
     * ATTENTION: must include map.js
     */
    const MapGeneratorSetting = g.MapGeneratorSetting = {
        "map_width": 32,
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
            const random = this.random = Random(level);
            const level_interval = this.level_interval = MapGeneratorSetting.level_interval || 4;
            const stage_scene = this.stage_scene = level % level_interval;
            const stage_switch = this.stage_switch = !!(Math.floor(level / level_interval) % 2);

            const map_data = JSON.parse(JSON.stringify(this.map_data_org));
            map_data.map_width = MapGeneratorSetting.map_width || map_data.map_width;
            map_data.tiles = { over: [], under: [] };
            // this.tiles = map_data.tiles;
            // this.map_width = map_data.map_width;
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
            //map_data.tiles形式に変換
            //描画
            // const sprite_sheet = this.get_sprite_sheet(stage_scene);
            // return this.map.create(sprite_sheet, map_data);
        },

        get_sprite_sheet: function(stage_type){
            const sheets_set = [
                ["map_field_1", "map_field_2", "map_field_3"],
                ["map_rockey_1", "map_rockey_2"],
                ["map_cave_1", "map_cave_2"],
                ["map_castle_1", "map_castle_2"],
            ];
            const sheets = sheets_set[stage_type % sheets_set.length];
            const random = this.random.randint(0, 1000);
            return sheets[random % sheets.length];
        },
        is_appear_criff: function(){
            return !!(this.stage_scene == 2 || this.stage_scene == 3);
        },
        is_appear_crack: function(){
            return !!(this.stage_scene == 1 || this.stage_scene == 3);
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
            const wall_tiles = this.get_maplines(map_data, 12, MAPSYM_WALL, MAPSYM_EMPTY);
            this.push_tiles(map_data, wall_tiles);

            const ground_tiles = this.get_maplines(map_data, 16, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            const p1 = {x: rnd.randint(0, 4), y: rnd.randint(0, 4)};
            const p2 = {x: map_data.map_width - rnd.randint(0, 4), y: 16 - rnd.randint(0, 4)};
            ground_tiles.under = this.fill_rect(ground_tiles.under, p1, p2, MAPSYM_FLOOR2);
            this.push_tiles(map_data, ground_tiles);
        },
        draw_map__rough: function(map_data){
            const rough_tiles = this.get_maplines(map_data, 32, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;

            //rough
            const rough_times = rnd.randint(2, 8);
            const rough_maxarea = 12;
            rough_tiles.under = this.spread_rects(rough_tiles.under, map_data.map_width, rough_times, rough_maxarea, 2, MAPSYM_FLOOR1, MAPSYM_BASE);

            //hole
            const hole_times = Math.min(Math.floor(this.level / 8) + 1, 4);
            const hole_maxarea = 12;
            rough_tiles.under = this.spread_rects(rough_tiles.under, map_data.map_width, hole_times, hole_maxarea, 3, MAPSYM_HOLE, MAPSYM_BASE);

            //TODO: block

            this.push_tiles(map_data, rough_tiles);
        },
        draw_map__criff: function(map_data){},
        draw_map__crack: function(map_data){},
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
        },
        get_maplines: function(map_data, times, under_sym, over_sym){
            const width = map_data.map_width;
            const unders = (new Array(times)).fill(null).map(function(_){
                return (new Array(width)).fill(under_sym);
            });
            const overs = (new Array(times)).fill(null).map(function(_){
                return (new Array(width)).fill(over_sym);
            });
            return { under: unders, over: overs };
        },
        fill_rect: function(_layer, p1, p2, symbol){
            const layer = JSON.parse(JSON.stringify(_layer));
            for(let y=p1.y; y<p2.y; y++){
                for(let x=p1.x; x<p2.x; x++){
                    layer[y][x] = symbol;
                }
            }
            return layer;
        },
        spread_rects: function(_layer, map_width, times, maxarea, minsize, fill_symbol, lay_symbol){
            const self = this;
            const rnd = this.random;
            let layer = JSON.parse(JSON.stringify(_layer));
            (new Array(times)).fill(null).map(function(_){
                let counter = 0;
                while(true){
                    let [x1, x2] = [rnd.randint(0, map_width), rnd.randint(0, map_width)].sort();
                    let [y1, y2] = [rnd.randint(0, layer.length), rnd.randint(0, layer.length)].sort();
                    if(x2 - x1 < minsize || y2 - y1 < minsize){ continue; }
                    if((x2 - x1) * (y2 - y1) > maxarea){ continue; }
                    const p1 = {x: x1, y: y1};
                    const p2 = {x: x2, y: y2};
                    if(self.is_all(layer, p1, p2, lay_symbol)){
                        layer = self.fill_rect(layer, p1, p2, fill_symbol);
                        break;
                    }else if(counter++ > 10){
                        break;//無限ループ防止
                    }
                }
            });
            return layer;
        },
        is_all: function(layer, p1, p2, symbol){
            for(let y=p1.y; y<p2.y; y++){
                for(let x=p1.x; x<p2.x; x++){
                    if(layer[y][x] != symbol){ return false; }
                }
            }
            return true;
        },
    });


})(this);