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
            this.autonomousOff();

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
        autonomousOn: function(){
            this.update = this.autonomousAction;
            this.autoparam = this.getDefaultAutoParam();
        },
        autonomousOff: function(){
            this.update = null;
            this.autoparam = {};
        },
        getCollisionRect: function(){
            return this.collision_rect || this;
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){
            console.log("TODO: must implent!");
        },
        getAcceleration: function(direction, speed){
            const accel_per_dir = {
                up:    {v: 0, w:-1},
                down:  {v: 0, w: 1},
                left:  {v:-1, w: 0},
                right: {v: 1, w: 0},
            }[direction] || {v: 0, w: 0};
            accel_per_dir.v *= speed;
            accel_per_dir.w *= speed;
            return accel_per_dir;
        },
        moveBy: function(v, w){
            const orgXY = {x: this.x, y: this.y};
            const orgVW = {v: v, w: w};
            this.x += v;
            this.y += w;
            //TODO: 最初から衝突している場合は想定していない
            let hit = this.parent.hitTestElement(this);//判定一回目
            if(!hit){ return null; }//衝突なく終了
            const myrect = this.getCollisionRect();
            const otherrect = hit.getCollisionRect();
            if(v < 0){ this.x += (otherrect.right - myrect.left); }
            if(v > 0){ this.x -= (myrect.right - otherrect.left); }
            if(w < 0){ this.y += (otherrect.bottom - myrect.top); }
            if(w > 0){ this.y -= (myrect.bottom - otherrect.top); }
            return hit;//衝突したオブジェクト
        },
        outerLimit: function(){
            let out = false;
            if(this.x < 0){ out = true; this.x = 0; }
            if(this.x > this.parent.width){ out = true; this.x = this.parent.width; }
            if(this.y < 0){ out = true; this.y = 0; }
            if(this.y > this.parent.height){ out = true; this.y = this.parent.height; }
            return out;
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
            this.collision_setting_width = 8;
            this.collision_setting_height = 8;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 1, counter: 4, _counter: 4,
                direction: "down", action: "walk",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                const directions = g.SpriteCharSetting.directions;
                const index = rnd.randint(1, directions.length) - 1;
                param.direction = directions[index];
                param._counter = 0;
                self.setAnimationDirection(param.direction);
                self.setAnimationAction(param.action);
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ param._counter = param.counter; }
            if(this.outerLimit()){ turn(); }
        },
    });
    phina.define('CharBee', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "bee";
            this.collision_setting_width = 12;
            this.collision_setting_height = 12;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 2, counter: 8, _counter: 8, waiting: true,
                direction: "down", action: "run",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                param.waiting = !param.waiting;
                param._counter = 0;
                if(!param.waiting){//動き出す
                    param.speed = 2;
                }else{//方向転換して待つ
                    const directions = g.SpriteCharSetting.directions;
                    const index = rnd.randint(1, directions.length) - 1;
                    param.direction = directions[index];
                    param.speed = 0;
                    self.setAnimationDirection(param.direction);
                    self.setAnimationAction(param.action);
                }
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ param._counter = param.counter; }
            if(this.outerLimit()){ turn(); }
        },
    });
    phina.define('CharSnake', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "snake";
            this.collision_setting_width = 12;
            this.collision_setting_height = 12;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 8;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 1, counter: 12, _counter: 12, interval: 0,
                direction: "down", action: "walk",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                const directions = g.SpriteCharSetting.directions;
                const index = rnd.randint(1, directions.length) - 1;
                param.interval = (param.interval + 1) % 4;
                if(param.interval == 0){// 1/4
                    param.action = "run";
                    param.speed = 3;
                }else{
                    param.action = "walk";
                    param.speed = 1;
                }
                param.direction = directions[index];
                param._counter = 0;
                self.setAnimationDirection(param.direction);
                self.setAnimationAction(param.action);
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ param._counter = param.counter; }
            if(this.outerLimit()){ turn(); }
        },
    });
    phina.define('CharRooster', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "rooster";
            this.collision_setting_width = 12;
            this.collision_setting_height = 12;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 2, counter: 24, _counter: 24, waiting: true,
                direction: "down", action: "walk",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                if(param.waiting){
                    param.waiting = !!rnd.randint(0, 3);// 1/4
                }else{
                    param.waiting = !param.waiting;
                }
                param._counter = 0;
                if(!param.waiting){//動き出す
                    param.action = "walk";
                    param.speed = 2;
                }else{//方向転換して待つ
                    const directions = g.SpriteCharSetting.directions;
                    const index = rnd.randint(1, directions.length) - 1;
                    param.action = "stand";
                    param.direction = directions[index];
                    param.speed = 0;
                    self.setAnimationDirection(param.direction);
                    self.setAnimationAction(param.action);
                }
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ param._counter = param.counter; }
            if(this.outerLimit()){ turn(); }
        },
    });
    // phina.define('CharGull', {
    //     superClass: 'SpriteCharBase',
    //     init: function() {
    //         const image = "gull";
    //         this.collision_setting_width = 24;
    //         this.collision_setting_height = 24;
    //         this.collision_setting_offset_x = null;
    //         this.collision_setting_offset_y = null;
    //         this.superInit(image);
    //     },
    // });
    phina.define('CharSlime', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "slime";
            this.collision_setting_width = 20;
            this.collision_setting_height = 14;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 1, counter: 12, _counter: 21, waiting: true,
                direction: "down", action: "walk",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                param.waiting = !param.waiting;
                param._counter = 0;
                if(!param.waiting){//動き出す
                    param.speed = 2;
                    param.action = "walk";
                }else{//方向転換して待つ
                    const directions = g.SpriteCharSetting.directions;
                    const index = rnd.randint(1, directions.length) - 1;
                    param.direction = directions[index];
                    param.action = "stand";
                    param.speed = 0;
                    self.setAnimationDirection(param.direction);
                    self.setAnimationAction(param.action);
                }
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ param._counter = param.counter; }
            if(this.outerLimit()){ turn(); }
        },
    });
    phina.define('CharHawk', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "hawk";
            this.collision_setting_width = 12;
            this.collision_setting_height = 12;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            const rnd = this.random;
            return {
                speed: 2, counter: 64, _counter: 64,
                directionOffset: rnd.randint(0, 99),
                directionIndex: rnd.randint(0, 99),
                direction: "down", action: "stand",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                const directions = g.SpriteCharSetting.directions;
                param.directionIndex = (param.directionIndex + 1) % directions.length;
                const index = (param.directionIndex + param.directionOffset) % directions.length
                param.direction = directions[index];
                if(rnd.randint(0, 5) == 0){
                    param.action = 'walk';
                    param._counter = param.counter * 0.6;
                }else{
                    param.action = 'stand';
                    param._counter = 0;
                }
                self.setAnimationDirection(param.direction);
                self.setAnimationAction(param.action);
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            this.x += accel.v;
            this.y += accel.w;
            if(this.outerLimit()){ turn(); }
        },

    });
    phina.define('CharBat', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "bat";
            this.collision_setting_width = 8;
            this.collision_setting_height = 8;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            const rnd = this.random;
            return {
                speed: 5, counter: 32, _counter: 32,
                v: (rnd.randint(0, 99) % 2) * 2 - 1, w: 0,
                mode: "fly", direction: "down", action: "run",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const seek = function(){
                param.mode = "seek";
                param._counter = 0;
                param.w = (rnd.randint(0, 99) % 2) * 2 - 1;
            };
            const fly = function(){
                param.mode = "fly";
                param._counter = 0;
                param.v *= -1;
            };
            if(param.mode == "fly"){
                param.direction = (param.v < 0) ? "left" : "right";
                param.action = "run";
                param.speed = 5;
                this.x += param.v * param.speed;
                if(this.x < 0 || this.x > this.parent.width){ seek(); }
            }else if(param.mode == "seek"){
                param.direction = (param.w < 0) ? "up" : "down";
                param.action = "walk";
                param.speed = 1;
                this.y += param.w * param.speed;
                param._counter += 1;
                if(param.counter <= param._counter){ fly(); }
            }
            this.setAnimationDirection(param.direction);
            this.setAnimationAction(param.action);
        },
    });
    phina.define('CharWolf', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "wolf";
            this.collision_setting_width = 12;
            this.collision_setting_height = 12;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            const rnd = this.random;
            return {
                mode: "run",
                direction: "down",
                walk: {
                    speed: 1, counter: 24, _counter: 24,
                    counter2: 4, _counter2: 4,
                    v: 0, w: 0,
                    action: "walk",
                },
                run: {
                    speed: 3, counter: 24, _counter: 24,
                    v: 0, w: 0, action: "run",
                },
            };
        },
        autonomousAction: function(e){
            const target = this.parent.getScrollTarget();
            if(!target){ return; }

            const param = this.autoparam;
            const target_is_upper = !!(target.y < this.y);
            const turn_to_walk = function(){
                param.mode = "walk";
                param.walk._counter = 0;
                param.walk._counter2 = 0;
                param.run.w = target_is_upper ? -1 : 1;
                param.direction = target_is_upper ? "up" : "down";
                };
            const turn_to_run = function(){
                param.mode = "run";
                param.run._counter = 0;
                param.run.w = target_is_upper ? -1 : 1;
                param.direction = target_is_upper ? "up" : "down";
                };
            const turn = !!(param.mode == "walk") ? turn_to_run : turn_to_walk;
            let v = 0;
            let w = 0;
            let speed = 0;
            let action = "";
            if(param.mode == "walk"){
                v = param.walk.v;
                w = param.walk.w;
                speed = param.walk.speed;
                action = "walk";
                param.walk._counter += 1;
                if(param.walk.counter <= param.walk._counter){
                    const target_is_left = !!(target.x < this.x);
                    param.walk.v = target_is_left ? -1 : 1;
                    param.walk._counter2 += 1;
                    if(param.walk.counter2 <= param.walk._counter2){ turn(); }
                }
            }else if(param.mode == "run"){
                v = param.run.v;
                w = param.run.w;
                speed = param.run.speed;
                action = "run";
                param.run._counter += 1;
                if(param.run.counter <= param.run._counter){ turn(); }
            }
            this.setAnimationDirection(param.direction);
            this.setAnimationAction(action);
            this.moveBy(v * speed, w * speed);
            this.outerLimit();
        },
    });
    phina.define('CharOrg', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "org";
            this.collision_setting_width = 16;
            this.collision_setting_height = 16;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 10;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });
    phina.define('CharDragon', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "dragon";
            this.collision_setting_width = 16;
            this.collision_setting_height = 16;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 10;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });
    phina.define('CharSpirit3', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit3";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });
    phina.define('CharSpirit2', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit2";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });
    phina.define('CharSpirit5', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit5";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });
    phina.define('CharSpirit4', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit4";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });
    phina.define('CharSpirit6', {
        superClass: 'SpriteCharBase',
        init: function() {
            const image = "spirit6";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){},
    });


})(this);