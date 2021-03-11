const ASSETS = {
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

const USE_WebGL = true;//WebGLだと当たり判定枠が表示できない
const size = GameSize.byWidth(16 * 16);
const GAME_LEVEL = (Queries.get().level || 0) * 1;

// const size = GameSize.byWidth(384);
// phina.js をグローバル領域に展開
phina.globalize();

// MainScene クラスを定義
phina.define('MainScene', {
	superClass: 'DisplayScene',
	init: function(options) {
		this.superInit(size);
		this.backgroundColor = '#212';
		this.canvas.imageSmoothingEnabled = false;
		const mad_data = AssetManager.assets.json.map_sample.data;
		const generator = MapGenerator(mad_data);
		const level = GAME_LEVEL;
		const world = generator.create(level);

		if(USE_WebGL){
			const layer = this.layer = GLLayer(options);//USE GPU
			layer.addChildTo(this);
			layer.addChild(world);
		}else{
			this.addChild(world);
		}

		//当たり判定と追尾スクロール
		const collision = CharHero();//SpriteCharBase('hero');
		collision.setAnimationAction('walk');
		world.addChar(collision);
		world.setScrollTracker(collision);
		let collision_v = 1;
		let collision_w = 1;
		const collision_speed = 4;
		collision.onenterframe = function(e){

			collision.x += collision_v * collision_speed;
			if(collision.x > world.total_width){
				collision.x = world.total_width;
				collision_v *= -1;
			}
			if(collision.x < 0){
				collision.x = 0;
				collision_v *= -1;
			}
			collision.y += collision_w * collision_speed;
			if(collision.y > world.total_height){
				collision.y = world.total_height;
				collision_w *= -1;
			}
			if(collision.y < 0){
				collision.y = 0;
				collision_w *= -1;
			}
			/**
			 * 【注意】
			 * MapTopViewの当たり判定は
			 * MapTopView.hitTestElementに
			 * SpriteCharBaseを与える
			 * →逆だと機能しない
			 */
			const hit = world.hitTestElement(collision);
			if(hit){
				this.visible = false;//!this.visible;
			}else{
				this.visible = true;
			}
		};

	},

});

// メイン処理
phina.main(function() {
	// アプリケーション生成
	const app = GameApp({
		startLabel: 'main', // メインシーンから開始する
		fps: 24,
		assets: ASSETS,
		...size,
	});
	// アプリケーション実行
	app.enableStats();
	app.run();
});