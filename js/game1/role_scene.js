(function(g){
    "use strict;";

	const ROLE_FONTSIZE = 8;

	phina.define('RoleScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;

			const self = this;

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
            const lap = options.level % 4;
            const cycle = options.level % 20;
            const is_fin = !!(options.level >= 40);
            const texts = [
                "Congrats!", "",
                "You've finally run through",
                "the whole scene.          ", "",
            ];
            if(is_fin){
                texts.push("Our Journey is over.");
                texts.push("Thanks for playing. ");
            }else{
                texts.push("This is also the beginning");
                texts.push("of a new adventure.       ");
                texts.push("");
                texts.push("The show must go on.");
            }
            const next_scene = is_fin
            ? function(){
                options.level = 0;
                options.score = 0;
                options.retry = 0;
                options.items = {};
                self.exit("title", options);
            }
            : function(){
                self.exit("game", options);
            };

            const offset = texts.length * label_options.fontSize;
            const x = self.gridX.center();
            let y = self.gridY.center() - offset;
            let index = 0;

            const set_label = function(){
                const text = texts[index++];
                if(text === undefined){
                    setTimeout(next_scene, 2000);
                }else{
                    if(!text){
                    }else{
                        const option = { text: text, ...label_options };
                        const label = Label(option);
                        label.addChildTo(self);
                        label.setPosition(x, y);
                    }
                    y += label_options.fontSize;
                    setTimeout(set_label, 1000);
                }
            };
            if(lap != 0 || cycle != 0){
                setTimeout(function(){
                    self.exit("game", options);
                }, 0);
            }else{
                set_label();//一回目
            }


		},

	});

})(this);