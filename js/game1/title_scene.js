(function(g){
    "use strict;";

	phina.define('TitleScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;

			//音を鳴らす準備
			g.Sounds.firstSoundForMobile(this.canvas);

			const self = this;
            const selections = [
                {label: "Game start", event: "game"},
				{},
                {label: "Credits", event: "credit"},
            ];
            const select = Selector(selections, {}).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(0.5));
			select.visible = false;
			select.on("select", function(e){
				switch(e.event){
					case "game":
						options.score = 0;
						//options.level = 0;
						self.exit("game", options);
						break;
					case "credit": alert("not yet"); break;
				}
			});

			const title = Sprite("title", 240, 85).addChildTo(this).setPosition(this.gridX.center(), -100);
			const ease = "easeInOutElastic";//"linear";
			title.tweener
			.to({x: this.gridX.center(), y: this.gridY.center(-2)}, 2000, ease)
			.wait(100)
			.call(function(){
				select.visible = true;
			});

		},

	});

})(this);