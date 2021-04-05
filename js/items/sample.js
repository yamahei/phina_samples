const ASSETS = {
	image: {
    item: "ASSETS/image/chars/item5.png",
	},
};

const size = GameSize.byWidth(24 * 16);
// phina.js をグローバル領域に展開
phina.globalize();

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit(size);
		this.backgroundColor = '#212';
    this.canvas.imageSmoothingEnabled = false;

    const get_random_chest = function(){
      const item = [
        {name: "wing", chest: "B"},
        {name: "sword",chest: "C"},
        {name: "shoe", chest: "D"},
        {name: "time", chest: "E"},
      ].shuffle()[0];
      console.log(item);
      return item;
    };
    const items2 = Items({}, size.width, size.height).addChildTo(this);
    const addButton = this.addButton = Button({ text: '+'}).addChildTo(this);
    addButton.x = this.gridX.center(-4);
    addButton.y = this.gridY.center(-6);
    addButton.onclick = function(){
      const item = get_random_chest();
      items2.get_item(item.chest);
    };
    const subButton = this.subButton = Button({ text: '-'}).addChildTo(this);
    subButton.x = this.gridX.center(+4);
    subButton.y = this.gridY.center(-6);
    subButton.onclick = function(){
      const item = get_random_chest();
      items2.use_item(item.name);
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