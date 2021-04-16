(function(g){
    "use strict;";

	const ROLE_FONTSIZE = 8;

	phina.define('CreditScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;

            const _label_options = {};
            const label_options = {
                margin: 0, padding: 0,
                fontSize: _label_options.fontSize || ROLE_FONTSIZE,
                fontWeight: _label_options.fontWeight || "normal",
                fontFamily: _label_options.fontFamily || "PressStart2P",
                fill: _label_options.stroke || "white",
                //align: _label_options.align,// || "center",
                baseline: _label_options.baseline,
                lineHeight: _label_options.lineHeight,
                backgroundColor: "black",
            };
            const min_margin = 1;
            const default_margin = 4;
            const lines = [
                {text: "Tap Runner"},
                {margin: default_margin},

                {sprite: CharSnake},
                {text: "Graphics"},
                {margin: min_margin},
                {text: "First seed material"},
                {margin: default_margin},

                {sprite: CharRooster},
                {text: "Sound"},
                {margin: min_margin},
                {text: "Maoudamashii"},
                {text: "THE MATCH-MAKERS"},
                {margin: default_margin},

                {sprite: CharWolf},
                {text: "Logo"},
                {margin: min_margin},
                {text: "Cool Text"},
                {margin: default_margin},

                {sprite: CharOrg},
                {text: "Game engine"},
                {margin: min_margin},
                {text: "Phina.js"},
                {margin: default_margin},

                {sprite: CharDragon},
                {text: "Special thanks"},
                {margin: min_margin},
                {text: "takakun"},
                {margin: default_margin},
                {margin: default_margin},
                {margin: default_margin},

                {text: "powered by yamahei"},
            ];
            const layer = this.layer = DisplayElement(options).addChildTo(this).setOrigin(0, 0).setPosition(0, this.height);
            const x = this.gridX.center();
            let y = 0;
            for(let i=0; i<lines.length; i++){
                const line = lines[i];
                if(line.text){
                    const option = { text: line.text, ...label_options };
                    const label = Label(option).addChildTo(layer).setPosition(x, y);
                    label.origin.y = 0;
                    y += label_options.fontSize * 1.5;
                }
                if(line.sprite){
                    const sprite = line.sprite();
                    sprite.origin.y = 0;
                    sprite.visible = true;
                    sprite.addChildTo(layer).setPosition(x, y);
                    sprite.setAnimationDirection("down");
                    sprite.setCharAnimation("walk");
                    y += sprite.height;
                    y += label_options.fontSize * 1.5;
                }
                if(line.margin){
                    y += (label_options.fontSize * 1.5) * line.margin;
                }
            }

            const self = this;
            layer.tweener
            .to({x: 0, bottom: -this.height}, 20000)
            .call(function(){
                //scoreのクリアとかはrollでやってるはず
                self.exit("title", options);
            });

		},

	});

})(this);