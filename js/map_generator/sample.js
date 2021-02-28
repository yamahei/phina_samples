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
	},
	json: {
		map_sample: "ASSETS/json/map/map_sample.json"
	},
	spritesheet: {
		char: "ASSETS/tmss/character.tmss",
	},
};

const size = GameSize.byWidth(256);
// const size = GameSize.byWidth(384);
// phina.js をグローバル領域に展開
phina.globalize();

// MainScene クラスを定義
phina.define('MainScene', {
	superClass: 'DisplayScene',
	init: function() {
		this.superInit(size);
		this.canvas.imageSmoothingEnabled = false;
		const bg_images = Object.keys(AssetManager.assets.image);
		const bg_image = bg_images[Math.floor(Math.random() * 1000) % bg_images.length];
		const generator = MapGenerator(bg_image, "map_sample");
		const level = 1;
		const world = generator.create(level);
		this.addChild(world);

		//当たり判定と追尾スクロール
		const collision = SpriteCharBase('hero');
		world.addChar(collision);
		world.setScrollTracker(collision);
		let collision_v = 1;
		let collision_w = 1;
		const collision_speed = 4;
		collision.onenterframe = function(e){
			const self = this;
			// e.app.pointers.forEach(function(p){
			// 	self.x = p.x;
			// 	self.y = p.y;
			// });

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
			const hit = world.hitTestElement(self);
			if(hit){
				this.visible = !this.visible;
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
		assets: ASSETS,
		...size,
	});
	// アプリケーション実行
	app.enableStats();
	app.run();
});