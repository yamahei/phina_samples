const ASSETS = {
	image: {
		map_castle_1: "ASSETS/image/maps/bg_castle_1_4x.png",
		map_castle_2: "ASSETS/image/maps/bg_castle_2_4x.png",
		map_cave_1: "ASSETS/image/maps/bg_cave_1_4x.png",
		map_cave_2: "ASSETS/image/maps/bg_cave_2_4x.png",
		map_field_1: "ASSETS/image/maps/bg_field_1_4x.png",
		map_field_2: "ASSETS/image/maps/bg_field_2_4x.png",
		map_field_3: "ASSETS/image/maps/bg_field_3_4x.png",
		map_rockey_1: "ASSETS/image/maps/bg_rockey_1_4x.png",
		map_rockey_2: "ASSETS/image/maps/bg_rockey_2_4x.png",
	},
	json: {
		map_sample: "ASSETS/json/map/map_sample.json"
	},
};

// phina.js をグローバル領域に展開
phina.globalize();

// MainScene クラスを定義
phina.define('MainScene', {
	superClass: 'DisplayScene',
	init: function() {
		this.superInit();
		this.canvas.imageSmoothingEnabled = false;
		const bg_images = Object.keys(AssetManager.assets.image);
		const bg_image = bg_images[Math.floor(Math.random() * 1000) % bg_images.length];
		const data = AssetManager.assets.json.map_sample.data;
		const map = this.map = MapTopView().create(bg_image, data);
	},

});

// メイン処理
phina.main(function() {
	// アプリケーション生成
	var app = GameApp({
		startLabel: 'main', // メインシーンから開始する
		assets: ASSETS,
	});
	// アプリケーション実行
	app.run();
});