(function(g){
    "use strict;";

	phina.define('TitleScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;
			const title = TextBox("noname").addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-2));

			const self = this;
            const selections = [
                {label: "Game start", event: "game"},
				{},
                {label: "Catalogue", event: "catalog"},
                {label: "Credits", event: "credit"},
            ];
            const select = Selector(selections, {}).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
			select.on("select", function(e){
				switch(e.event){
					case "game":
						options.score = 0;
						options.level = 0;
						self.exit("game", options);
						break;
					case "catalog": alert("not yet"); break;
					case "credit": alert("not yet"); break;
				}
			});

		},

	});

})(this);