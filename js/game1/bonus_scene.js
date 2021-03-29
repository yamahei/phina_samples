(function(g){
    "use strict;";
	const LABEL_FONTSIZE = 8;

	phina.define('BonusScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;

			const hero = this.hero = CharHero().addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-1));
			const directions = ["up","right","down","left"];
			const direction_index = hero.random.randint(0, directions.length-1);
			hero.setAnimationDirection(directions[direction_index]);
			hero.setAnimationAction("walk");

			const self = this;
			this.step = 7;
			this.bonus = 500;
			this._bonus = 500;
			this.score = options.score + this.bonus;
			this._score = options.score;
			const get_bonus_text = function(){
				const maxlen = (self.bonus).toString().length;
				const padded = ((" ").repeat(maxlen) + (self._bonus).toString()).slice(-maxlen);
				return `Clear bonus: ${padded}`;
			};
			const get_score_text = function(){
				const maxlen = (self.score).toString().length;
				const padded = ((" ").repeat(maxlen) + (self._score).toString()).slice(-maxlen);
				return `Score: ${padded}`;
			};

			const bonus_label_conf = this.get_label_options(get_bonus_text(), {});
			const bonus_label = Label(bonus_label_conf).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-3));
			const score_label_conf = this.get_label_options(get_score_text(), {});
			const score_label = Label(score_label_conf).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(+1));

			this.tweener
			.wait(500)
			.call(function(){
				self.update = function(e){
					if(self._bonus > 0){
						const p = (self._bonus >= self.step) ? self.step : 1;
						self._bonus -= p;
						self._score += p;
					}
					bonus_label.text = get_bonus_text();
					score_label.text = get_score_text();
					if(self._bonus <= 0 && self.step > 0){
						self.step = 0;
						self.fire({type: "counted"});
					}
				};
			});
			this.on("counted", function(e){
				setTimeout(function(){
					options.score += self.bonus;
					self.exit("game", options);
				}, 1000);
			});


		},
		get_label_options: function(text, _label_options){
            return {
				text: text,
                margin: 0, padding: 0,
                fontSize: _label_options.fontSize || LABEL_FONTSIZE,
                fontWeight: _label_options.fontWeight || "normal",
                fontFamily: _label_options.fontFamily || "PressStart2P",
                fill: _label_options.stroke || "white",
                //align: _label_options.align,// || "center",
                baseline: _label_options.baseline,
                lineHeight: _label_options.lineHeight,
                backgroundColor: "black",
            }
		},
	});

})(this);