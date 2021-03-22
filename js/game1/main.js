
(function(g){
    "use strict;";

    const ASSETS = g.ASSETS = {
        //TODO: 各クラスからASSETに追加する
        font:　{'PressStart2P': 'fonts/PressStart2P-Regular.ttf'},
        image: {
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
            door: "ASSETS/image/chars/doors.png",

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
        },
    };

    const USE_WebGL = false;//WebGLだと当たり判定枠が表示できない
    const size = GameSize.byWidth(16 * 16);
    const GAME_LEVEL = (Queries.get().level || 0) * 1;
    const SCENES = [
        {label: "game", className: "GameScene"},
    ];


    // メイン処理
    phina.main(function() {
        // アプリケーション生成
        const app = GameApp({
            startLabel: 'game',
            fps: 24,
            scenes: SCENES,
            assets: ASSETS,
            ...size,
            //
            level: GAME_LEVEL,
            usegl: USE_WebGL,
            score: 0,
            timeout: 60,//sec
        });
        // アプリケーション実行
        app.enableStats();
        app.run();
    });
    //(phina.js)好きなシーンへ遷移して引数も渡す方法
    //https://www.mizukinoko.com/entry/2019/05/27/163817

})(this);