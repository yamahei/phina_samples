(function(g){

    "use strict";
    /**
     * ATTENTION: must include collider.js
     * ATTENTION: must include map_chip.js
     * ATTENTION: must include map.js
     * ATTENTION: must include random.js
     */
    const MapGeneratorSetting = g.MapGeneratorSetting = {
        "map_width": 32,
        "map_height": 5,
        "level_interval": 4,
    };

    phina.define('MapGenerator', {
        init: function(sprite_sheet_name, map_asset_name) {
            this.sprite_sheet_name = sprite_sheet_name;
            this.map_data_org = AssetManager.assets.json[map_asset_name].data;
            this.map = MapTopView();
        },
        create: function(level){
            const random = Random(level);
            const level_interval = MapGeneratorSetting.level_interval || 4;
            const stage_scene = level % level_interval;
            const stage_switch = !!(Math.floor(level / level_interval) % 2);

            const map_data = JSON.parse(JSON.stringify(this.map_data_org));
            map_data.map_width = MapGeneratorSetting.map_width || map_data.map_width;
            map_data.tiles = {};
            this.map_width = map_data.map_width;
            this.map_height = 0;//未確定
        },
    });


})(this);