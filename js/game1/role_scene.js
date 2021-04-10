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

            const label_options = {
                margin: 0, padding: 0,
                fontSize: _label_options.fontSize || ROLE_FONTSIZE,
                fontWeight: _label_options.fontWeight || "normal",
                fontFamily: _label_options.fontFamily || "PressStart2P",
                fill: _label_options.stroke || "white",
                //align: _label_options.align,// || "center",
                baseline: _label_options.baseline,
                lineHeight: _label_options.lineHeight,
                backgroundColor: "transparent",
            };


			self.exit("game", options);

		},

	});

})(this);