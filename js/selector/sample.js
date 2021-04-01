
const ASSETS = {
	font:　{'PressStart2P': 'fonts/PressStart2P-Regular.ttf'},
};
const size = GameSize.byWidth(384);
// phina.js をグローバル領域に展開
phina.globalize();

// MainScene クラスを定義
phina.define('MainScene', {
	superClass: 'DisplayScene',
	init: function() {
		this.superInit(size);
		this.backgroundColor = '#212';
		const selections = [
			{label: "Game start", event: "game"},
			{},
			{label: "Catalogue", event: "catalog"},
			{label: "Credits", event: "credit"},
		];
		const select = Selector(selections, {});
		select.addChildTo(this);
		select.setPosition(this.gridX.center(), this.gridY.center());
		select.on("select", function(e){
			console.log(e);
			alert(e.event);
		});
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