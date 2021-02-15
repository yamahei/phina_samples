const ASSETS = {
	image: {
		hero: "ASSETS/image/chars/hero.png",
		elf: "ASSETS/image/chars/elf.png",
	},
	spritesheet: {
		char: "ASSETS/tmss/character.tmss",
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

    // スプライト画像作成
    const sprite = SpriteCharBase('elf').addChildTo(this);
    sprite.x = this.gridX.center();
    sprite.y = this.gridY.center();

    //状態表示
    const label = Label("").addChildTo(this);
    const changeLabel = function(){
      label.text = `${sprite.action} : ${sprite.direction}`;
    };
    label.x = this.gridX.center();
    label.y = this.gridY.center(-4);
    changeLabel();

    //アクション切り替え
    const actionButton = this.actionButton = Button({ text: 'action'}).addChildTo(this);
    actionButton.x = this.gridX.center(-4);
    actionButton.y = this.gridY.center(-6);
    actionButton.onclick = function(){
      const actions = SpriteCharSetting.actions;
      const index = (actions.indexOf(sprite.action) + 1) % actions.length;
      const action = actions[index];
      sprite.setAnimationAction(action);
      changeLabel();
    };

    //向き切り替え
    const directionButton = this.directionButton = Button({ text: 'direction'}).addChildTo(this);
    directionButton.x = this.gridX.center(+4);
    directionButton.y = this.gridY.center(-6);
    directionButton.onclick = function(){
      const directions = SpriteCharSetting.directions;
      const index = (directions.indexOf(sprite.direction) + 1) % directions.length;
      const direction = directions[index];
      sprite.setAnimationDirection(direction);
      changeLabel();
    };

    //当たり判定
    const collision = SpriteCharBase('hero').addChildTo(this);
    collision.onenterframe = function(e){
      const self = this;
      e.app.pointers.forEach(function(p){
        self.x = p.x;
        self.y = p.y;
      });
      const hit = this.hitTestElement(sprite);
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
  var app = GameApp({
    startLabel: 'main', // メインシーンから開始する
    assets: ASSETS,
  });
  // アプリケーション実行
  app.run();
});