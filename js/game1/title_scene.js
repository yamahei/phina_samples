(function(g){
    "use strict;";

	phina.define('GameScene', {
		superClass: 'DisplayScene',
		init: function(options) {
			this.superInit(options);
			this.backgroundColor = '#212';
			this.canvas.imageSmoothingEnabled = false;

            const selections = [
                {label: "Game start", event: "game"},
                {label: "Catalogue", event: "catalog"},
                {label: "Credits", event: "credit"},
            ];
            const select = Selector(selections);

		},

	});

})(this);