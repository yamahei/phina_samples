(function(g){

    "use strict";
    /**
     * ATTENTION: must include collision_rect.js
     */
    const SpriteEventSetting = g.SpriteEventSetting = {
        debug: false,
        width: 24, height: 32,
        // animation_asset: 'char',//ASSETS.spritesheet
        // directions: ["up","right","down","left"],
        // actions: ["stand","jump","walk","run","damage"],
        // default_direction: 'down',
        // default_action: 'walk',
        // collision_width: 12,
        // collision_height: 12,
        // collision_offset_x: 0,
        // collision_offset_y: 12,
    };

    phina.define('SpriteEventBase', {
        superClass: 'phina.display.Sprite',
        init: function(image) {
            this.superInit(
                image,
                SpriteEventSetting.width,
                SpriteEventSetting.height
            );
            this.sprite_type = "event";
            // /**
            //  * animation setting
            //  */
            // this.animation = FrameAnimation(SpriteEventSetting.animation_asset).attachTo(this);

            /**
             * collision setting
             */
            const collision_setting = {
                width: this.collision_setting_width || SpriteEventSetting.collision_width || this.width,
                height: this.collision_setting_height || SpriteEventSetting.collision_height || this.height,
                offset_x: this.collision_setting_offset_x || SpriteEventSetting.collision_offset_x || 0,
                offset_y: this.collision_setting_offset_y || SpriteEventSetting.collision_offset_y || 0,
            };
            if(collision_setting.width * collision_setting.height > 0){
                const collision = CollisionRect({
                    width: collision_setting.width,
                    height: collision_setting.height,
                    fill: null,
                    stroke: SpriteEventSetting.debug ? "yellow" : null,
                }).addChildTo(this);
                collision.x = collision_setting.offset_x;
                collision.y = collision_setting.offset_y;
                this.collision_rect = collision;
            }
        },
        hitTestElement: function(target){//override
            const my_collision = this.collision_rect || this;
            if(target.collision_rect){
                return my_collision.hitTestElement(target.collision_rect);
            }else{
                return my_collision.hitTestElement(target);
            }
        },
    });

    phina.define('EventDoor', {
        superClass: 'SpriteEventBase',
        init: function() {
            this.collision_setting_height = 38;//壁に先に当たるのでちょっと大きく
            const image = "door";
            this.superInit(image);
            this.event = "door";
            this.animation = FrameAnimation("door").attachTo(this);
            this.type = 'A';//'B', 'C'
            this.state = 'off';//'on'
            this.action = 'closed';
            this.is_open = false;
        },
        autostyle: function(seed){
            const rand = Random(seed || 99);
            rand.random();//init?
            const types = ["A", "B", "C"];
            const state = ["on", "off"];
            const index = rand.randint(0, types.length * state.length * seed);
            this.type = types[index % types.length];
            this.state = state[index % state.length];
            this.setEventAnimation();
            return this;
        },
        update: function(e){
            if(this.animation.finished){
                const name = this.animation.currentAnimationName;
                const param = { obj: this, name: name };
                const action = name.split(/_/g).pop();
                this.flare('finished', param);
            }
        },
        do_open: function(){
            this.action = 'opening';
            this.setEventAnimation();
            this.is_open = true;
        },
        do_close: function(){
            this.action = 'closing';
            this.setEventAnimation();
            this.is_open = false;
        },
        setEventAnimation(){
            const animation = `${this.type}_${this.state}_${this.action}`;
            this.animation.gotoAndPlay(animation);
        },
    });

    phina.define('EventTreasure', {
        superClass: 'SpriteEventBase',
        init: function() {
            const image = "treasure";
            this.collision_setting_height = 24;
            this.collision_setting_offset_y = 4;
            this.superInit(image);
            this.event = "treasure";
            this.animation = FrameAnimation("treasure").attachTo(this);
            this.type = 'A';//'B', 'C', 'D', 'E'
            this.action = 'closed';
            this.is_open = false;
        },
        autostyle: function(seed){
            const rand = Random(seed || 99);
            rand.random();//init?
            const types = [
                ..."B".repeat(2),//wing
                ..."C".repeat(1),//sword
                ..."D".repeat(2),//shoe
                ..."E".repeat(3),//time
            ].shuffle();//敢えてレベルに連動しない
            this.type = types[0];
            this.setEventAnimation();
            return this;
        },
        update: function(e){
            if(this.animation.finished){
                const name = this.animation.currentAnimationName;
                const param = { obj: this, name: name };
                const action = name.split(/_/g).pop();
                this.flare('finished', param);
            }
        },
        do_open: function(){
            this.action = 'opening';
            this.setEventAnimation();
            this.is_open = true;
        },
        do_close: function(){
            this.action = 'closing';
            this.setEventAnimation();
            this.is_open = false;
        },
        setEventAnimation(){
            const animation = `${this.type}_${this.action}`;
            this.animation.gotoAndPlay(animation);
        },
    });


})(this);