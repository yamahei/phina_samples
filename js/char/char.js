(function(g){

    "use strict";
    /**
     * ATTENTION: must include collision_rect.js
     */
    const SpriteCharSetting = g.SpriteCharSetting = {
        debug: true,
        width: 24, height: 32,
        animation_asset: 'char',//ASSETS.spritesheet
        directions: ["up","right","down","left"],
        actions: ["stand","jump","walk","run","damage"],
        default_direction: 'down',
        default_action: 'stand',
        collision_width: 12,
        collision_height: 12,
        collision_offset_x: 0,
        collision_offset_y: 12,
    };

    phina.define('SpriteCharBase', {
        superClass: 'phina.display.Sprite',
        init: function(image) {
            this.superInit(
                image,
                SpriteCharSetting.width,
                SpriteCharSetting.height
            );
            this.sprite_type = "char";
            this.setRandom(0);
            /**
             * animation setting
             */
            this.animation = FrameAnimation(SpriteCharSetting.animation_asset).attachTo(this);
            this.direction = SpriteCharSetting.default_direction;
            this.action = SpriteCharSetting.default_action;
            this.setCharAnimation();

            /**
             * collision setting
             */
            const collision_setting = {
                width: this.collision_setting_width || SpriteCharSetting.collision_width || this.width,
                height: this.collision_setting_height || SpriteCharSetting.collision_height || this.height,
                offset_x: this.collision_setting_offset_x || SpriteCharSetting.collision_offset_x || 0,
                offset_y: this.collision_setting_offset_y || SpriteCharSetting.collision_offset_y || 0,
            };
            if(collision_setting.width * collision_setting.height > 0){
                const collision = CollisionRect({
                    width: collision_setting.width,
                    height: collision_setting.height,
                    fill: null,
                    stroke: SpriteCharSetting.debug ? "yellow" : null,
                }).addChildTo(this);
                collision.x = collision_setting.offset_x;
                collision.y = collision_setting.offset_y;
                this.collision_rect = collision;
            }
        },
        setRandom: function(seed){
            this.random = Random(seed || 99);
            this.random.random();//init?
        },
        setCharAnimation: function(){
            const animation = `${this.action}_${this.direction}`;
            this.animation.gotoAndPlay(animation);
        },
        setAnimationDirection: function(direction){
            if(SpriteCharSetting.directions.indexOf(direction) < 0){
                throw new Error(`invalid direction: '${direction}'`);
            }
            this.direction = direction;
            this.setCharAnimation();
        },
        setAnimationAction: function(action){
            if(SpriteCharSetting.actions.indexOf(action) < 0){
                throw new Error(`invalid action: '${action}'`);
            }
            this.action = action;
            this.setCharAnimation();
        },
        hitTestElement: function(target){//override
            if(target.className == "SpriteMapChip" && !target.collision_rect){
                //collision_rectのないSpriteMapChipはヒットしない
                return false;
            }
            const my_collision = this.collision_rect || this;
            if(target.collision_rect){
                return my_collision.hitTestElement(target.collision_rect);
            }else{
                return my_collision.hitTestElement(target);
            }
        },
    });

    phina.define('CharHero', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "hero";
            this.collision_setting_width = 4;
            this.collision_setting_height = 4;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharButterfly', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "butterfly";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharBee', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "bee";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSnake', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "snake";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharRooster', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "rooster";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharGull', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "gull";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSlime', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "slime";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharHawk', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "hawk";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharWolf', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "wolf";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharBat', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "bat";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharOrg', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "org";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharDragon', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "dragon";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSpirit3', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit3";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSpirit2', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit2";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSpirit5', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit5";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSpirit4', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit4";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });
    phina.define('CharSpirit6', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit6";
            this.collision_setting_width = 24;
            this.collision_setting_height = 24;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
    });


})(this);