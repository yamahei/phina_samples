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
            const chars = this.chars = {hero: null, events: [], enemies: []};
            const map_data = JSON.parse(JSON.stringify(this.map_data_org));
            const rand = this.random = Random(level || 99);
            rand.random();//init?

            map_data.map_width = MapGeneratorSetting.map_width || map_data.map_width;
            map_data.tiles = { over: [], under: [] };
            this.map_width = map_data.map_width;

            const stage_interval = MapGeneratorSetting.level_interval || 4;
            const stage_flag = !!(Math.floor(level / stage_interval) % 2);
            const stage_lap = Math.floor(level / stage_interval);
            const stage_scene = level % stage_interval;
            map_data.tiles = this.draw_map(level, stage_scene, stage_lap, stage_flag, map_data, chars);
            //フチの処理
            map_data.tiles.over = this.draw_border(map_data.tiles.over, [MAPSYM_BRIDGE]);
            map_data.tiles.under = this.draw_border(map_data.tiles.under, [MAPSYM_FLOOR1, MAPSYM_FLOOR2, MAPSYM_HOLE]);
            //生成
            const map_image = map_data.images[stage_scene];
            const sprite_sheet = map_image.sheets[rand.randint(0, map_image.sheets.length - 1)];
            const map = this.map.create(sprite_sheet, map_data);
            let _seed = level;
            if(chars.hero){ map.addChar(chars.hero); }
            chars.events.forEach(function(event){ map.addChar(event); });
            chars.enemies.forEach(function(enemy){
                enemy.setRandom(_seed++);
                map.addChar(enemy);
            });
            return map;
        },

        draw_map: function(level, scene, lap, flag, map_data, chars){
            const rand = this.random
            const stage_AorB = function(stageA, stageB, switchLevel, currentLevel){
                const per = (currentLevel / switchLevel) * 100;
                const random = rand.randint(0, 9999) % 100;
                return (per < random) ? stageA : stageB;
            };
            const ForC = function(currentLevel){
                return stage_AorB("field", "criff", 40, currentLevel);
            };
            const ForR = function(currentLevel){
                return stage_AorB("field", "crack", 20, currentLevel);
            };

            const lv = level;
            const scene_field = 0;
            const scene_rock = 1;
            const scene_cave = 2;
            const scene_castle = 3;
            const map_stage_list = [
                { scene: scene_field, name: "平原", stages: ["start", "field", "rough", ForC(lv), "wall"], enemies: [16, 3, 1, 2, 2] },
                { scene: scene_rock, name: "岩場", stages: ["start", "rough", "crack", "rough", "wall"], enemies: [12, 2, 1, 3, 1] },
                { scene: scene_cave, name: "洞窟", stages: ["start", "crack", "rough", "crack", "wall"], enemies: [8, 1, 2, 1, 3] },
                { scene: scene_castle, name: "城",   stages: ["start", "criff", ForR(lv), "criff", "wall"], enemies: [4, 3, 1, 2, 1] },
            ];
            const map_stages = map_stage_list[scene].stages.reverse();
            const map_enemies = map_stage_list[scene].enemies.reverse();

            //generate
            while(map_stages.length){
                const stage = map_stages.shift();
                const _enemy = map_enemies.shift();
                const enemy = !!_enemy && (lap >= _enemy - 1);
                switch(stage){
                    case "wall":  this.draw_map__wall(map_data, level, scene, lap, flag, stage, chars, enemy);  break;
                    case "rough": this.draw_map__rough(map_data, level, scene, lap, flag, stage, chars, enemy); break;
                    case "criff": this.draw_map__criff(map_data, level, scene, lap, flag, stage, chars, enemy); break;
                    case "crack": this.draw_map__crack(map_data, level, scene, lap, flag, stage, chars, enemy); break;
                    case "field": this.draw_map__field(map_data, level, scene, lap, flag, stage, chars, enemy); break;
                    case "start": this.draw_map__start(map_data, level, scene, lap, flag, stage, chars, enemy); break;
                    default: throw new error(`unknown stage: '${stage}'.`);
                }
            }
            //treasure
            const put_treasure = true;//(scene != scene_field);
            const treasure = this.get_treasure_point1(level, map_data);
            // const treasure = this.get_treasure_point2(level, map_data);
            if(put_treasure && treasure){
                chars.events.push(treasure);
            }

            // this.debug_enemies(map_data, chars);
            return map_data.tiles;
        },

        get_treasure_point2: function(level, map_data){
            const rnd = this.random;
            const stage_length = map_data.tiles.under.length;
            const map_under = map_data.tiles.under;
            const map_over = map_data.tiles.over;
            const candi_points = [];
            let counter = 0;
            while(candi_points.length < 12){
                const x = rnd.randint(2, map_data.map_width - 1 - 2);
                const y = rnd.randint(12, stage_length - 1 - 12);
                const under_is_flat = !this.is_in(map_under, {x: x-1, y: y-1}, {x: x+1, y: y+1}, MAPSYM_HOLE);
                const over_is_empty = this.is_all(map_over, {x: x-1, y: y-1}, {x: x+1, y: y+1}, MAPSYM_EMPTY);
                if(under_is_flat && over_is_empty){
                    candi_points.push({x: x, y: y, canter: Math.abs((stage_length/2) - y)});
                }
                if(counter++ > 31){ break; }//無限ループ防止
            }
            candi_points.sort(function(a, b){ return a.center - b.center; });
            if(candi_points.length > 0){
                const p = candi_points[0];
                const treasure = EventTreasure();
                treasure.autostyle(level);
                this.set_position_from_map_point(treasure, map_data, p.x, p.y);
                return treasure;
            }
        },

        get_treasure_point1: function(level, map_data){
            const stage_length = map_data.tiles.under.length;
            const map_under = map_data.tiles.under;
            const map_over = map_data.tiles.over;
            const candi_lines = [];
            for(let y=0; y<stage_length; y++){
                const under_is_flat = map_under[y].every(function(col){ return col != MAPSYM_HOLE && col != MAPSYM_BRIDGE;});
                const over_is_empty = map_over[y].every(function(col){ return col == MAPSYM_EMPTY; });
                if(under_is_flat && over_is_empty){
                    candi_lines.push ({ y: y + 0.5, center: Math.abs((stage_length/2) - y) });
                }
            }
            candi_lines.sort(function(a, b){ return a.center - b.center; });
            if(candi_lines.length > 0){
                const rnd = this.random;
                const one_third = Math.floor(this.map_width / 3);
                const y = candi_lines[0].y;
                const x = rnd.randint(one_third, one_third * 2);
                const treasure = EventTreasure();
                treasure.autostyle(level);
                this.set_position_from_map_point(treasure, map_data, x, y);
                return treasure;
            }
        },

        debug_enemies: function(map_data, chars){
            const enemies = [
                CharButterfly, CharBee, CharRooster,
                CharSnake, CharSlime, CharHawk, CharWolf,
                CharBat, CharOrg, CharDragon,
                CharSpirit3, CharSpirit2, CharSpirit5, CharSpirit4, CharSpirit6
                // CharSpirit6
            ];

            for(let i=0; i<enemies.length; i++){
                const w = 4;
                const x = 2 + (i % w) * 3;
                const y = 12 + Math.floor(i / w) * 3;
                const char = enemies[i]();
                //char.autonomousOn();
                this.set_position_from_map_point(char, map_data, x, y);
                chars.enemies.push(char);
            }

        },


        draw_map__wall: function(map_data, level, scene, lap, flag, stage, chars, enemy){
            const wall_height = 4;
            const wall_tiles = this.get_maplines(wall_height, MAPSYM_WALL, MAPSYM_EMPTY);
            this.push_tiles(map_data, wall_tiles);

            const ground_height = 6;
            const ground_tiles = this.get_maplines(ground_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            const p1 = {x: rnd.randint(1, 4), y: 1};
            const p2 = {x: this.map_width - 1 - rnd.randint(1, 4), y: ground_height - rnd.randint(1, 3)};
            ground_tiles.under = this.fill_rect(ground_tiles.under, p1, p2, MAPSYM_FLOOR2);
            this.push_tiles(map_data, ground_tiles);

            //enemies
            if(enemy){
                const enemies = this.get_enemies_in_scene(lap, scene, stage);
                const char = enemies[lap % enemies.length]();
                this.set_position_from_map_point(char, map_data, this.map_width / 2, wall_height + ground_height / 2);
                chars.enemies.push(char);
            }
            //always: door
            const door = EventDoor().autostyle(level);
            this.set_position_from_map_point(door, map_data, this.map_width / 2, wall_height);
            chars.events.push(door);
        },
        set_position_from_map_point: function(char, map_data, map_x, map_y){
            const chip_width = map_data.chip_width;
            const chip_height = map_data.chip_height;
            char.x = map_x * chip_width;
            char.bottom = map_y * chip_height;
        },
        draw_map__rough: function(map_data, level, scene, lap, flag, stage, chars, enemy){
            const rough_height = 8;
            const rough_tiles = this.get_maplines(rough_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            //side blank
            const times = Math.min(Math.floor(level / 3) * rnd.randint(1, level), 20);
            const under = rough_tiles.under;
            for(let i=0; i<times; i++){
                const y = rnd.randint(1, under.length - 1);
                if(rnd.randbool()){
                    under[y].first = MAPSYM_HOLE;
                    under[y-1].first = MAPSYM_HOLE;
                }
                if(rnd.randbool()){
                    under[y].last = MAPSYM_HOLE;
                    under[y-1].last = MAPSYM_HOLE;
                }
            }
            //rough
            rough_tiles.under = this.spread_rects({
                layer: rough_tiles.under,
                times: rnd.randint(3, 6),
                minarea: 12, maxarea: 20, minsize: 2,
                fill: MAPSYM_FLOOR1, lay: null, exclude: MAPSYM_HOLE,
            });
            //hole
            const maxarea = 16;// + (Math.log10(level || 1) * 8);
            const hole_times = (4 - scene) * 3 + 1;
            const marginx = 0;//Math.max(3 - Math.floor(lap / 20), 0);
            rough_tiles.under = this.spread_rects({
                layer: rough_tiles.under,
                times: hole_times,
                minarea: 4, maxarea: maxarea, minsize: 3, offset: 1, marginx: marginx,
                fill: MAPSYM_HOLE, lay: null, //exclude: MAPSYM_HOLE,
            });
            //block
            this.put_blocks({
                under: rough_tiles.under,
                over: rough_tiles.over,
                lays: [MAPSYM_BASE, MAPSYM_FLOOR1],
                times: 4,
            });
            this.push_tiles(map_data, rough_tiles);

            //enemies
            if(enemy){
                const bottom_y = map_data.tiles.under.length - 1;
                const top_y = bottom_y - (rough_height);
                this.set_enemy(map_data, chars, scene, lap, stage, top_y, bottom_y);
            }

        },
        draw_map__criff: function(map_data, level, scene, lap, flag, stage, chars, enemy){
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
            //enemies
            if(enemy){
                const bottom_y = map_data.tiles.under.length - 1;
                const top_y = bottom_y - (rank.upper + (rank.main + rank.under) * rank.times);
                this.set_enemy(map_data, chars, scene, lap, stage, top_y, bottom_y);
            }

        },
        draw_map__crack: function(map_data, level, scene, lap, flag, stage, chars, enemy){
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
                    this.map_width - 4,
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

                this.push_tiles(map_data, crack_tiles);

                //enemies
                if(enemy){
                    const bottom_y = map_data.tiles.under.length - 1;
                    const top_y = bottom_y - crack_height;
                    this.set_enemy(map_data, chars, scene, lap, stage, top_y, bottom_y);
                }

                break;
            }
        },
        draw_map__field: function(map_data, level, scene, lap, flag, stage, chars, enemy){
            const field_height = 6;
            const field_tiles = this.get_maplines(field_height, MAPSYM_BASE, MAPSYM_EMPTY);
            const rnd = this.random;
            //hole
            const marginx = 0;//Math.max(3 - Math.floor(lap / 20), 0);
            field_tiles.under = this.spread_rects({
                layer: field_tiles.under,
                times: rnd.randint(5, 12),
                minarea: 4, maxarea: 16, minsize: 2, marginx: marginx,
                fill: MAPSYM_FLOOR1, lay: null, exclude: MAPSYM_HOLE,
            });
            //block
            this.put_blocks({
                under: field_tiles.under,
                over: field_tiles.over,
                lays: [MAPSYM_BASE, MAPSYM_FLOOR1],
                times: 2,
            });

            this.push_tiles(map_data, field_tiles);

            //enemies
            if(enemy){
                const bottom_y = map_data.tiles.under.length - 1;
                const top_y = bottom_y - field_height;
                this.set_enemy(map_data, chars, scene, lap, stage, top_y, bottom_y);
            }

        },
        draw_map__start: function(map_data, level, scene, lap, flag, stage, chars, enemy){
            const start_height = 5;
            const start_tiles = this.get_maplines(start_height, MAPSYM_BASE, MAPSYM_EMPTY);
            this.push_tiles(map_data, start_tiles);

            const rnd = this.random;
            const rough_height = rnd.randint(2, start_height);
            const map_width = this.map_width;
            const rough_x = rnd.randint(0, 4);
            const p1 = {x: rough_x, y: start_height - rough_height};
            const p2 = {x: map_width - rough_x - 1, y: start_height};

            start_tiles.under = this.fill_rect(start_tiles.under, p1, p2, MAPSYM_FLOOR2);
            this.push_tiles(map_data, start_tiles);

            const hero = CharHero();
            const hero_x = map_width / 2;
            const hero_y = map_data.tiles.under.length;
            this.set_position_from_map_point(hero, map_data, hero_x, hero_y);
            chars.hero = hero;

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
                marginx: param.marginx || 0,//左右に余白
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
                    const x1 = rnd.randint(conf.marginx, self.map_width - conf.marginx - rect_width - 1);
                    const x2 = x1 + rect_width;
                    const y1 = rnd.randint(0, layer.length - rect_height - 1);
                    const y2 = y1 + rect_height;
                    const p1 = {x: x1, y: y1};
                    const p2 = {x: x2, y: y2};
                    const o1 = {x: x1 + conf.offset, y: y1 + conf.offset};
                    const o2 = {x: x2 - conf.offset, y: y2 - conf.offset};
                    if(o1.x >= o2.x || o1.y >= o2.y){ continue; }
                    const lay_ok = conf.lay ? self.is_all(layer, p1, p2, conf.lay) : true;//未設定なら無条件にOK
                    const exclude_ok = conf.exclude ? !self.is_in(layer, p1, p2, conf.exclude) : true;//同上
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
                    if(counter++ > 6){ break; }//無限ループ防止
                    const x = rnd.randint(1, self.map_width - 1) - 1;
                    const y = rnd.randint(1, conf.under.length - 1) - 1;

                    let flag = true;
                    for(let _y=y-1; _y<=y+1; _y++){
                        if(!flag){ break;}
                        for(let _x=x-1; _x<=x+1; _x++){
                            if(!flag){ break;}
                            if(conf.under[_y] && conf.under[_y][_x]){
                                if(conf.lays.indexOf(conf.under[_y][_x]) < 0){ flag = false; }
                            }
                        }
                    }
                    if(!flag){ continue; }
                    const block = (rnd.randint(0, 10) < 3) ? MAPSYM_BLOCK2 : MAPSYM_BLOCK1;
                    if(conf.over[y] && conf.over[y][x]){
                        if(conf.over[y][x] == MAPSYM_EMPTY){
                            conf.over[y][x] = block;
                            break;
                        }
                        else{ continue; }
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
        //すべてが指定したシンボルかどうか
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
        //指定したシンボルが1つでも含まれているか
        is_in: function(layer, p1, p2, symbol){
            for(let y=p1.y; y<=p2.y; y++){
                for(let x=p1.x; x<=p2.x; x++){
                    if(layer[y] && layer[y][x]){
                        if(layer[y][x] == symbol){ return true; }
                    }
                }
            }
            return false;
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
                if(y < 0 || layer.length <= y ){ return symbol; }//not_equal
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

        get_enemies_in_scene: function(lap, scene, stage){
            const SCENE_FIELD  = 0;//平原
            const SCENE_ROCKEY = 1;//岩場
            const SCENE_CAVE   = 2;//洞窟
            const SCENE_CASTLE = 3;//城
            const enemies_field = [ CharButterfly, CharBee, CharRooster ];
            const enemies_rockey = [ CharSnake, CharSlime, CharHawk, CharWolf ];
            const enemies_cave = [ CharBat, CharOrg, CharDragon ];
            const enemies_crack = [ CharBat, CharHawk, CharSnake, CharWolf, CharOrg, CharDragon ];
            const enemies_boss = [ CharRooster, CharSnake, CharSlime, CharWolf, CharOrg, CharDragon ];
            const enemies_castle = [ CharSpirit3, CharSpirit2, CharSpirit5, CharSpirit4, CharSpirit6 ];//flower, water, ice, fire, dark
            const enemies_all = [enemies_field, enemies_rockey, enemies_cave].flat(Infinity);

            const enemies_list = [
                { stage: "rough", scene: SCENE_FIELD, enemies: enemies_field },
                { stage: "wall", scene: SCENE_FIELD, enemies: enemies_cave },
                { stage: "rough", scene: SCENE_ROCKEY, enemies: enemies_rockey },
                { stage: "rough", scene: SCENE_CAVE, enemies: enemies_cave },
                { stage: "crack", scene: SCENE_CAVE, enemies: enemies_crack },
                { stage: "wall", scene: SCENE_CASTLE, enemies: enemies_castle },
                { stage: "wall", scene: SCENE_FIELD, enemies: enemies_boss },
                { stage: "wall", scene: SCENE_ROCKEY, enemies: enemies_boss },
                { stage: "wall", scene: SCENE_CAVE, enemies: enemies_boss },
                { stage: "criff", scene: SCENE_CASTLE, enemies: enemies_rockey },
            ];
            const enmies_item = enemies_list.find(function(item){
                return item.scene == scene && item.stage == stage;
            });
            return enmies_item?.enemies || enemies_all;
        },

        set_enemy: function(map_data, chars, scene, lap, stage, top_y, bottom_y){
            const rnd = this.random;
            const level = lap * 4 + scene;
            //DEBUG::const scene = level % 4; const lap = Math.floor(level / 4);
            const num1 = [2,6,7,4][scene] / 2.56 ;//Math.abs(scene - 1) + 1;
            const num2 = 1 + Math.log10(level || 1) * 1.414;
            const num3 = (13 + lap) / 3.14;
            const num4 = Math.floor(level / 1.732);
            const num = Math.round(((num2 + num3) + (num1 * num4)) / 3.14);
            //DEBUG::console.log(`num=${num}:: 1=${num1}, 2=${num2}, 3=${num3}, 4=${num4}`);
            const max_counter = 99;
            let counter = 0;
            for(let i=0; i<num; i++){
                const enemies = this.get_enemies_in_scene(lap, scene, stage);
                const max_index = Math.min(lap, enemies.length-1) + 1;
                const _index = rnd.randint(1, 65536);
                const type = enemies[_index % max_index];
                const mure = this.get_enemy_mure(type);
                let bx = null, by = null;
                for(let j=0; j<mure; j++){
                    const char = type();
                    while(true){
                        const x = (bx === null) ? rnd.randint(2, this.map_width - 1 - 2) : bx + rnd.randint(-2, 2);
                        const y = (by === null) ? rnd.randint(top_y + 2, bottom_y - 2) : by + rnd.randint(-2, 2);
                        if(bx === null || by === null){
                            bx = x;
                            by = y;
                        }
                        const p1 = {x: x, y: y};
                        const p2 = {x: x + 1, y: y + 1};
                        const is_flat = !this.is_in(map_data.tiles.under, p1, p2, MAPSYM_HOLE);
                        const is_all = is_flat && this.is_all(map_data.tiles.over, p1, p2, MAPSYM_EMPTY);
                        if(!is_all){
                            if(counter++ > max_counter){ break; }//無限ループ防止
                            else{ continue; }
                        }
                        this.set_position_from_map_point(char, map_data, x + 1, y + 1);
                        chars.enemies.push(char);
                        break;
                    }
                }
            }
        },
        get_enemy_mure: function(enemy_type){
            //aveを頂点にmin-max少なくとも1の山を作って確率テーブルにする（わかる？
            const conf = [
                { type: CharButterfly, min: 1, max: 5, ave: 2 },
                { type: CharBee, min: 1, max: 4, ave: 2 },
                { type: CharRooster, min: 1, max: 4, ave: 2 },
                { type: CharSnake, min: 1, max: 3, ave: 1 },
                { type: CharSlime, min: 1, max: 3, ave: 2 },
                { type: CharBat, min: 1, max: 3, ave: 2 },
                { type: CharWolf, min: 1, max: 3, ave: 1 },
            ].find(function(m){ return m.type == enemy_type })
            || { type: enemy_type, min: 1, max: 1, ave: 1};
            const diff_min = conf.ave - conf.min;
            const diff_max = conf.max - conf.ave;
            const top = Math.max(diff_max, diff_min) + 1;//頂点
            //美しくないけど。。
            const table = [];
            let x = conf.min;
            let y = top - diff_min;
            let gx = conf.ave;
            let d = 1;
            while(true){
                table.push(...new Array(y).fill(x));
                x += 1; y += d;
                if(x >= gx){ break; }
            }
            gx = conf.max;
            d = -1;
            while(true){
                table.push(...new Array(y).fill(x));
                x += 1; y += d;
                if(x > gx){ break; }
            }

            const rnd = this.random;
            return table[rnd.randint(0, 9999) % table.length];
        },

    });


})(this);