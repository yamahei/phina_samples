const ASSETS = {
	image: {
		hero: "ASSETS/image/chars/hero.png",
		elf: "ASSETS/image/chars/elf.png",
		door: "ASSETS/image/chars/doors.png",
    treasure: "ASSETS/image/chars/treasure_chest.png",
	},
	spritesheet: {
		char: "ASSETS/tmss/character.tmss",
		door: "ASSETS/tmss/door.tmss",
    treasure: "ASSETS/tmss/treasure.tmss",
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

    //ドア
    const door = EventDoor().addChildTo(this);
    door.autostyle(Math.floor(Math.random()*999));
    door.x = this.gridX.center(+2);
    door.y = this.gridY.center();
    const door_actions = ["do_open", "do_close"];
    const doorButton = this.doorButton = Button({ text: 'door'}).addChildTo(this);
    doorButton.x = this.gridX.center();
    doorButton.y = this.gridY.center(+2);
    doorButton.onclick = function(){
      door[door_actions[0]]();
      door_actions.push(door_actions.shift());
    };

    //宝箱
    const treasure = EventTreasure().addChildTo(this);
    treasure.autostyle(Math.floor(Math.random()*999));
    treasure.x = this.gridX.center(-2);
    treasure.y = this.gridY.center();
    const treasure_actions = ["do_open", "do_close"];
    const treasureButton = this.treasureButton = Button({ text: 'treasure'}).addChildTo(this);
    treasureButton.x = this.gridX.center();
    treasureButton.y = this.gridY.center(-2);
    treasureButton.onclick = function(){
      treasure[treasure_actions[0]]();
      treasure_actions.push(treasure_actions.shift());
    };

    //当たり判定
    const collision = SpriteCharBase('hero').addChildTo(this);
    let last_attack = null;
    collision.onenterframe = function(e){
      const self = this;
      e.app.pointers.forEach(function(p){
        self.x = p.x;
        self.y = p.y;
      });
      const hit = this.hitTestElement(sprite) || this.hitTestElement(door) || this.hitTestElement(treasure);
      const attack = sprite.char_isin_my_direction(this);

      console.log(attack);
      last_attack = attack;

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