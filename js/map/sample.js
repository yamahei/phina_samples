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

const size = GameSize.byWidth(96);
// const size = GameSize.byWidth(384);
// phina.js をグローバル領域に展開
phina.globalize();

// MainScene クラスを定義
phina.define('MainScene', {
	superClass: 'DisplayScene',
	init: function() {
		this.superInit(size);
		this.backgroundColor = '#212';
		this.canvas.imageSmoothingEnabled = false;
		const bg_images = Object.keys(AssetManager.assets.image);
		const bg_image = bg_images[Math.floor(Math.random() * 1000) % bg_images.length];
		const data = AssetManager.assets.json.map_sample.data;
		const world = MapTopView();
		world.create(bg_image, data);
		this.addChild(world);
		//当たり判定
		const collision = SpriteCharBase('hero');
		world.addChar(collision);
		collision.onenterframe = function(e){
			const self = this;
			e.app.pointers.forEach(function(p){
				self.x = p.x;
				self.y = p.y;
			});
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
	app.run();
});