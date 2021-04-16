
(function(g){
    "use strict;";

    const ASSETS = g.ASSETS = {
        //TODO: 各クラスからASSETに追加する
        font:　{'PressStart2P': 'fonts/PressStart2P-Regular.ttf'},
        image: {

            title: "ASSETS/image/other/Logo1_digitize_240.png",

            map_castle_1: "ASSETS/image/maps/bg_castle_1.png",
            map_castle_2: "ASSETS/image/maps/bg_castle_2.png",
            map_cave_1: "ASSETS/image/maps/bg_cave_1.png",
            map_cave_2: "ASSETS/image/maps/bg_cave_2.png",
            map_field_1: "ASSETS/image/maps/bg_field_1.png",
            map_field_2: "ASSETS/image/maps/bg_field_2.png",
            map_field_3: "ASSETS/image/maps/bg_field_3.png",
            map_rockey_1: "ASSETS/image/maps/bg_rockey_1.png",
            map_rockey_2: "ASSETS/image/maps/bg_rockey_2.png",

            hero: "ASSETS/image/chars/hero.png",
            hero_ken: "ASSETS/image/chars/hero_ken.png",
            hero_kentate: "ASSETS/image/chars/hero_kentate.png",
            door: "ASSETS/image/chars/doors.png",
            treasure: "ASSETS/image/chars/treasure_chest.png",
            item: "ASSETS/image/chars/item5.png",

            fire: "ASSETS/image/chars/fire.png",
            gull: "ASSETS/image/chars/gull.png",
            //scene 0: 平原
            snake: "ASSETS/image/chars/snake.png",
            bee: "ASSETS/image/chars/bee.png",
            butterfly: "ASSETS/image/chars/butterfly.png",
            rooster: "ASSETS/image/chars/rooster.png",
            gull: "ASSETS/image/chars/gull.png",
            //scene 1: 岩場
            slime: "ASSETS/image/chars/slime.png",
            hawk: "ASSETS/image/chars/hawk.png",
            wolf: "ASSETS/image/chars/wolf.png",
            //scene 2: 洞窟
            bat: "ASSETS/image/chars/bat.png",
            dragon: "ASSETS/image/chars/dragon.png",
            org: "ASSETS/image/chars/org.png",
            //scene 3: 城
            spirit3: "ASSETS/image/chars/spirit3.png",//flower
            spirit2: "ASSETS/image/chars/spirit2.png",//water
            spirit5: "ASSETS/image/chars/spirit5.png",//ice
            spirit4: "ASSETS/image/chars/spirit4.png",//fire
            spirit6: "ASSETS/image/chars/spirit6.png",//dark
        },
        json: {
            map_sample: "ASSETS/json/map/map_sample.json"
        },
        spritesheet: {
            char: "ASSETS/tmss/character.tmss",
            door: "ASSETS/tmss/door.tmss",
            treasure: "ASSETS/tmss/treasure.tmss",
        },
        sound: {
            //maoh damashi
            turn: "ASSETS/sound/md_se_sys22.mp3",
            damage: "ASSETS/sound/voice009.mp3",//md_battle14.mp3",
            attack: "ASSETS/sound/hit48.mp3",//md_battle17.mp3",
            treasure: "ASSETS/sound/md_se_door03.mp3",//voice023_a.mp3",//
            item: "ASSETS/sound/cursor04.mp3",
            open: "ASSETS/sound/door03.mp3",//md_se_door06.mp3",
            close: "ASSETS/sound/close12_r.mp3",//md_se_door02.mp3",
            wing: "ASSETS/sound/md_bird04.mp3",
            fall: "ASSETS/sound/voice006.mp3",//md_magical04.mp3",
            timeup: "ASSETS/sound/md_se_onepoint06.mp3",
            // //https://taira-komori.jpn.org/index.html
            // turn: "ASSETS/sound_tk/defense1.mp3",
            // damage: "ASSETS/sound_tk/powerdown07.mp3",
            // attack: "ASSETS/sound_tk/damage7.mp3",
            // treasure: "ASSETS/sound_tk/jump13.mp3",
            // open: "ASSETS/sound_tk/locker_O.mp3",
            // close: "ASSETS/sound_tk/locker_C.mp3",
            // wing: "ASSETS/sound_tk/strange_wave.mp3",
            // fall: "ASSETS/sound_tk/falling2.mp3",
            // timeup: "ASSETS/sound_tk/powerdown01.mp3",
            // //the match makers
            // turn: "ASSETS/sound_mm/step10_a.wav", //cursor16.wav", //bosu39.wav",
            // damage: "ASSETS/sound_mm/puu77_b.wav", //voice009.wav",
            // attack: "ASSETS/sound_mm/hit48.wav",
            // treasure: "ASSETS/sound_mm/voice023_a.wav",//bell00.wav", //voice026.wav",
            // open: "ASSETS/sound_mm/door03.wav",
            // close: "ASSETS/sound_mm/close12_r.wav",
            // wing: "ASSETS/sound_mm/voice023_b.wav/",//animal00.wav",
            // fall: "ASSETS/sound_mm/voice006.wav",
            // timeup: "ASSETS/sound_mm/whistle02.wav",
        },
    };

    const USE_WebGL = false;//WebGLだと当たり判定枠が表示できない
    const size = GameSize.byWidth(16 * 16);
    const GAME_LEVEL = (Queries.get().level || 0) * 1;
    const SCENES = [
        {label: "title", className: "TitleScene"},
        {label: "bonus", className: "BonusScene"},
        {label: "game", className: "GameScene"},
        {label: "role", className: "RoleScene"},
        {label: "credit", className: "CreditScene"},
    ];


    // メイン処理
    phina.main(function() {
        // アプリケーション生成
        const app = GameApp({
            // startLabel: 'game',
            startLabel: 'title',
            // startLabel: 'role',
            // startLabel: 'credit',
            fps: 24,
            scenes: SCENES,
            assets: ASSETS,
            ...size,
            //
            usegl: USE_WebGL,
            level: GAME_LEVEL,
            items: {},
            score: 0,
            retry: 0,
            timeout: 60,//sec
        });
        // アプリケーション実行
        // app.enableStats();
        app.run();
    });
    //(phina.js)好きなシーンへ遷移して引数も渡す方法
    //https://www.mizukinoko.com/entry/2019/05/27/163817

})(this);