
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

		const label1 = TextBox("text");

		const texts = [
			"Hello, world.",
			"It's a small world.",
			"King of the world.",
		];
		const label2 = TextBox(texts);//no option
		//TODO: rect width too wide...
		// const label3 = TextBox(texts, {align: "right"});
		const label4 = TextBox(texts, {align: "center"});
		//TODO: rect width too wide...
		// const label5 = TextBox(texts, {align: "left"});

		label1.addChildTo(this);
		label1.setPosition(this.gridX.center(), this.gridY.center(-6));
		label2.addChildTo(this);
		label2.setPosition(this.gridX.center(), this.gridY.center(-3));
		// label3.addChildTo(this);
		// label3.setPosition(this.gridX.center(), this.gridY.center(+3));
		label4.addChildTo(this);
		label4.setPosition(this.gridX.center(), this.gridY.center(+6));
		// label5.addChildTo(this);
		// label5.setPosition(this.gridX.center(), this.gridY.center());

		// this.update = function(e){

		// 	label1.x = (label1.x + 5) % 100; label1.y = (label1.y + 5) % 100;
		// 	label2.x = (label2.x + 5) % 100; label2.y = (label2.y + 5) % 100;
		// 	label3.x = (label3.x + 5) % 100; label3.y = (label3.y + 5) % 100;
		// 	label4.x = (label4.x + 5) % 100; label4.y = (label4.y + 5) % 100;

		// };
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