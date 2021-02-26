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
	},
	json: {
		map_sample: "ASSETS/json/map/map_sample.json"
	},
};

const size = GameSize.byWidth(384);
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