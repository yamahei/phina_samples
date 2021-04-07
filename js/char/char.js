(function(g){

    "use strict";
    /**
     * ATTENTION: must include collision_rect.js
     */
    const SpriteCharSetting = g.SpriteCharSetting = {
        debug: false,
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
        getCollisionRect: function(){
            return this.collision_rect || this;
        },
        get_char_distance: function(char){
            const v = this.x - char.x;
            const w = this.y - char.y;
            return Math.abs(v) + Math.abs(w);
        },
        get_direction_for_char: function(char){
            const v = char.x - this.x;
            const w = char.y - this.y;
            const is_joge = Math.abs(v) < Math.abs(w);//上下方向（左右ではなく）に向くべきか
            const candy = is_joge ? ["up", "down"] : ["left", "right"];
            const expression = is_joge ? w : v;
            return expression < 0 ? candy[0] : candy[1];
        },
        char_isin_my_direction: function(char, range){
            const direction = this.direction;
            const accel = this.getAcceleration(direction, 1);
            const dv = char.x - this.x;
            const dw = char.y - this.y;
            const sv = Math.sign(dv);
            const sw = Math.sign(dw);
            const v = (accel.v != 0 && accel.w == 0) ?
            {//左右方向を向いている
                accel: accel.v, axis: dv, angle: dw / dv, diff: this.y - char.y
            } : {//前後方向を向いている
                accel: accel.w, axis: dw, angle: dv / dw, diff: this.x - char.x
            };
            if(Math.sign(v.accel) * Math.sign(v.axis) < 0){
                //向きの符号と座標差の向きが異なる
                // console.log({isin:false, riyu: "dir", ...v});
                return false;
            }
            //距離が近いと変になる
            // if(Math.abs(v.angle) > 0.5 ){/* 0.5 */
            //     //向きに対して45度を超えた範囲
            //     // console.log({isin:false, riyu: "ang", ...v});
            //     return false;
            // }
            // console.log({isin:true, ...v});

            //range幅以内なら進行方向に対して衝突したとみなす
            return !!(Math.abs(v.diff) <= range + 1);
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
        moveBy: function(v, w, _option){
            const option = _option || {};
            const orgVW = {v: v, w: w};
            this.x += v;
            this.y += w;
            //TODO: 最初から衝突している場合は想定していない
            let hit = this.parent.hitTestElement(this);//判定一回目
            if(!hit){ return null; }//衝突なく終了
            const event_name = hit.event_name || "";
            if(event_name && option.repell_events && !option.repell_events[event_name]){
                return hit;//repell_events(位置補正)が定義かつ今回は補正なし⇒イベント返却のみ
            }
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
            this.dom_no_weapon = phina.asset.AssetManager.get('image', 'hero').domElement;
            this.dom_has_ken = phina.asset.AssetManager.get('image', 'hero_ken').domElement;
            this.dom_has_kentate = phina.asset.AssetManager.get('image', 'hero_kentate').domElement;
            this.image = this.hero_image = this.image.clone();
            this.change_equipment();
        },
        change_equipment: function(equipment){
            let dom = this.dom_no_weapon;
            switch(equipment){
                case "ken": dom = this.dom_has_ken; break;
                case "kentate": dom = this.dom_has_kentate; break;
            }
            this.hero_image.domElement = dom;
            this.visible = false;//一回消す
        },
    });
    phina.define('CharEnemyBase', {
        superClass: 'SpriteCharBase',
        init: function(image) {
            this.superInit(image);
            this.autonomous = false;
            this.damagecounter = 0;
            this.autonomousOff();
        },
        autonomousOn: function(){
            this.autonomous = true;
            this.update = this.autonomousAction;
            this.autoparam = this.getDefaultAutoParam();
        },
        autonomousOff: function(){
            this.autonomous = false;
            this.update = null;
            this.autoparam = {};
        },
        getDefaultAutoParam: function(){
            return {};
        },
        autonomousAction: function(e){
            console.log("TODO: must implent!");
        },
        damageOn: function(_damage){
            this.autonomous = false;
            this.damagecounter = _damage || 10;
            this.update = this.damageAction;
        },
        damageAction: function(e){
            if(--this.damagecounter <= 0){
                this.autonomous = true;
                this.update = this.autonomousAction;
            }
            this.setAnimationAction("damage");
        },
    });
    phina.define('CharButterfly', {
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "butterfly";
            this.collision_setting_width = 10;
            this.collision_setting_height = 10;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            const target = this.parent.getScrollTarget();
            return {
                speed: 1, counter: 4, _counter: this.random.randint(0, 4),
                direction: "down", action: "walk",
                chars: [...this.parent.getChars().filter(function(c){
                    return c.sprite_type == "event";
                }), target],
                min_distance_to_closer: 3 * 16,//タイル（16）
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const get_nearest = function(){
                //ドア、宝箱、主人公の一番近いもの
                return param.chars.sort(function(a, b){
                    return self.get_char_distance(a) - self.get_char_distance(b);
                })[0];
            };
            const turn = function(){
                const nearest = get_nearest();
                const distance = self.get_char_distance(nearest);
                const is_closer = !!(param.min_distance_to_closer <= distance);
                const is_rnd = !!(rnd.randint(0, 999) % 2 != 0);//1/2
                const directions = g.SpriteCharSetting.directions;
                const index = rnd.randint(1, directions.length) - 1;
                param.direction = (is_rnd && is_closer) ? self.get_direction_for_char(nearest) : directions[index];
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
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "bee";
            this.collision_setting_width = 14;
            this.collision_setting_height = 14;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 2, counter: 8, _counter: this.random.randint(0, 8),
                waiting: true, direction: "down", action: "run",
                min_distance_to_closer: 2 * 16,//タイル（16）
                max_distance_to_closer: 7 * 16,//タイル（16）
            };
        },
        autonomousAction: function(e){
            const target = this.parent.getScrollTarget();
            const param = this.autoparam;
            const rnd = this.random;
            const self = this;
            const turn = function(){
                param.waiting = !param.waiting;
                param._counter = 0;
                if(!param.waiting){//動き出す
                    param.speed = 2;
                }else{//方向転換して待つ
                    const distance = self.get_char_distance(target);
                    const is_closer = !!(param.min_distance_to_closer <= distance && distance <= param.max_distance_to_closer);
                    const directions = g.SpriteCharSetting.directions;
                    const index = rnd.randint(1, directions.length) - 1;
                    param.direction = is_closer ? self.get_direction_for_char(target) : directions[index];
                    param.speed = 0;
                    param._counter = is_closer ? param.counter : param._counter;
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
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "snake";
            this.collision_setting_width = 14;
            this.collision_setting_height = 14;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 8;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 1, counter: 12, _counter: this.random.randint(0, 12),
                interval: 0, direction: "down", action: "walk",
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
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "rooster";
            this.collision_setting_width = 14;
            this.collision_setting_height = 14;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 2, counter: 24, _counter: this.random.randint(0, 24),
                waiting: true, direction: "down", action: "walk",
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
                }
                self.setAnimationDirection(param.direction);
                self.setAnimationAction(param.action);
            };
            const stop = function(){
                param.waiting = false;
                param._counter = param.counter;
                turn();
            }
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ stop(); }
            if(this.outerLimit()){ stop(); }
        },
    });
    phina.define('CharSlime', {
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "slime";
            this.collision_setting_width = 20;
            this.collision_setting_height = 16;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 11;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 1, counter: 12, _counter: this.random.randint(0, 12),
                waiting: true, direction: "down", action: "walk",
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
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "hawk";
            this.collision_setting_width = 14;
            this.collision_setting_height = 14;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            const rnd = this.random;
            return {
                speed: 2, counter: 64, _counter: rnd.randint(0, 64),
                directionOffset: rnd.randint(0, 99),
                directionIndex: rnd.randint(0, 99),
                direction: "down",
                action: "stand",
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
            };
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            this.x += accel.v;
            this.y += accel.w;
            if(this.outerLimit()){ turn(); }
            self.setAnimationDirection(param.direction);
            self.setAnimationAction(param.action);
    },

    });
    phina.define('CharBat', {
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "bat";
            this.collision_setting_width = 12;
            this.collision_setting_height = 12;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            const rnd = this.random;
            return {
                speed: 5, counter: 32, _counter: rnd.randint(0, 32),
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
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "wolf";
            this.collision_setting_width = 14;
            this.collision_setting_height = 14;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                mode: "run",
                direction: "down",
                walk: {
                    speed: 1, counter: 24, _counter: this.random.randint(0, 24),
                    counter2: 4, _counter2: 4,
                    v: 0, w: 0,
                    action: "walk",
                },
                run: {
                    speed: 3, counter: 24, _counter: this.random.randint(0, 24),
                    v: 0, w: 0, action: "run",
                },
            };
        },
        autonomousAction: function(e){
            const target = this.parent.getScrollTarget();
            if(!target){ return; }

            const param = this.autoparam;
            const target_is_upper = !!(target.y < this.y);
            const target_is_left = !!(target.x < this.x);
            const turn_to_walk = function(){
                param.mode = "walk";
                param.walk._counter = 0;
                param.walk._counter2 = 0;
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
                param.walk._counter += 1;
                if(param.walk.counter <= param.walk._counter){
                    param.run.w = target_is_upper ? -1 : 1;
                    param.direction = target_is_upper ? "up" : "down";
                    param.walk.v = target_is_left ? -1 : 1;
                    param.walk._counter2 += 1;
                    param.walk._counter = 0;
                    if(param.walk.counter2 <= param.walk._counter2){ turn(); }
                }
                v = param.walk.v;
                w = param.walk.w;
                speed = param.walk.speed;
                action = "walk";
            }else if(param.mode == "run"){
                param.run._counter += 1;
                if(param.run.counter <= param.run._counter){ turn(); }
                v = param.run.v;
                w = param.run.w;
                speed = param.run.speed;
                action = "run";
            }
            this.setAnimationDirection(param.direction);
            this.setAnimationAction(action);
            this.moveBy(v * speed, w * speed);
            this.outerLimit();
        },
    });
    phina.define('CharOrg', {
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "org";
            this.collision_setting_width = 18;
            this.collision_setting_height = 18;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 10;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 1, counter: 16, _counter: this.random.randint(0, 16),
                waiting: true, direction: "down", action: "run",
            };
        },
        autonomousAction: function(e){
            const target = this.parent.getScrollTarget();
            if(!target){ return; }
            const param = this.autoparam;
            const self = this;
            const target_is_upper = !!(target.y < this.y);
            const target_is_left = !!(target.x < this.x);
            const target_x_per_y = Math.abs((target.x - this.x) / (target.y - this.y));

            const turn = function(){
                param.waiting = !param.waiting;
                param._counter = 0;
                if(!param.waiting){//動き出す
                    param.action = "walk";
                    param.speed = 2;
                }else{//方向転換して待つ
                    param.direction = target_x_per_y < 0.4
                        ? (target_is_upper ? "up" : "down")
                        : (target_is_left ? "left" : "right");
                    param.action = "stand";
                    param.speed = 0;
                }
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
    phina.define('CharFire', {
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "fire";
            this.collision_setting_width = 14;
            this.collision_setting_height = 16;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 4;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 8, counter: 12, _counter: 21,
                direction: this.direction || "down",
                action: "damage",
            };
        },
        autonomousAction: function(e){
            const param = this.autoparam;
            if(!!param.speed){
                param.speed *= 0.9;
                if(param.speed < 1){ param.speed = 0; }
            }else{
                this.visible = !this.visible;
                param.counter -= 1;
                if(param.counter <= 0){
                    this.parent.delChar(this);
                    return;
                }
            }
            const accel = this.getAcceleration(param.direction, param.speed);
            this.setAnimationDirection(param.direction);
            this.setAnimationAction(param.action);
            if(this.parent){
                this.x += accel.v;
                this.y += accel.w;
                // this.moveBy(accel.v, accel.w);
                // this.outerLimit();
            }
        },
    });
    phina.define('CharDragon', {
        superClass: 'CharEnemyBase',
        init: function() {
            const image = "dragon";
            this.collision_setting_width = 18;
            this.collision_setting_height = 18;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = 10;
            this.superInit(image);
        },
        getDefaultAutoParam: function(){
            return {
                speed: 2, counter: 24, _counter: this.random.randint(0, 24),
                waiting: true, direction: "down", action: "walk",
            };
        },
        autonomousAction: function(e){
            const target = this.parent.getScrollTarget();
            if(!target){ return; }
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
                    const target_is_upper = !!(target.y < self.y);
                    const target_is_left = !!(target.x < self.x);
                    const target_x_per_y = Math.abs((target.x - self.x) / (target.y - self.y));
                    param.direction = target_x_per_y < 0.6
                    ? (target_is_upper ? "up" : "down")
                    : (target_is_left ? "left" : "right");
                    param.action = "stand";
                    param.speed = 0;
                    //fire
                    if(rnd.randint(0, 4) < 3){//3/5
                        const offset = self.getAcceleration(param.direction, 16);
                        const fire = CharFire().setPosition(self.x + offset.v, self.y + offset.w);
                        self.parent.addChar(fire);
                        fire.direction = param.direction;
                        fire.autonomousOn();
                    }
                }
                self.setAnimationDirection(param.direction);
                self.setAnimationAction(param.action);
            };
            const stop = function(){
                param.waiting = false;
                param._counter = param.counter;
                turn();
            }
            param._counter += 1;
            if(param.counter <= param._counter){ turn(); }
            const accel = this.getAcceleration(param.direction, param.speed);
            const hit = this.moveBy(accel.v, accel.w);
            if(hit){ stop(); }
            if(this.outerLimit()){ stop(); }
        },

    });
    phina.define('CharSpiritCommon', {
        superClass: 'CharEnemyBase',
        init: function(image) {
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
            /**
             * Spiritの基本動作
             * 0.wait_frame間待つ
             * 1.heroのx方向にside_step回、step_width幅ずつ移動
             * 2.damageアクションしながらx,yともに±rotate_lenずつrotate_frame回ブルブルする
             */
            this.boss_wait_frame = 48;
            this.boss_step_easing = 0;// -1: easeout, 0: liner, 1: easein
            this.boss_step_speed = 1;
            this.boss_side_step = 1;
            this.boss_step_width = 24;
            this.boss_rotate_len = 1;
            this.boss_rotate_frame = 36;
        },
        getDefaultAutoParam: function(){
            return {
                state: ["wait", "step", "rotate"],
                wait_frame: this.boss_wait_frame, _wait_frame: 0,
                step_easing: this.boss_step_easing,
                step_speed: this.boss_step_speed,
                side_step: this.boss_side_step, _side_step: 0,
                step_width: this.boss_step_width, _step_width: 0,
                rotate_len: this.boss_rotate_len, //_rotate_len: 0,
                rotate_frame: this.boss_rotate_frame, _rotate_frame: 0,
                base_x: this.x, base_y: this.y, direction: 0,
            };
        },
        autonomousAction: function(e){
            const target = this.parent.getScrollTarget();
            if(!target){ return; }

            const self = this;
            const param = this.autoparam;
            const target_is_left = !!(target.x < this.x);
            let v = 0;
            let w = 0;
            let action = "stand";
            const next = function(){
                param._wait_frame = 0;
                param._side_step = 0;
                param._step_width = 0;
                param._rotate_len = 0;
                param._rotate_frame = 0;
                param.base_x = self.x;
                param.base_y = self.y;
                param.direction = target_is_left ? -1 : 1;
                param.state.push(param.state.shift());
            };
            const waiting = function(){
                if(param.wait_frame <= param._wait_frame++){ next(); }
                else{
                    action = "stand";
                    v = 0; w = 0;
                }
            };
            const stepping = function(){
                if(param.step_width <= param._step_width++){
                    if(param.side_step <= param._side_step++){ next(); }
                    else{
                        param.base_x = self.x;
                        param.base_y = self.y;
                        param._step_width = 0;
                        param.direction = target_is_left ? -1 : 1;
                    }
                }
                const per = param._step_width / param.step_width;
                let ease = per;
                if(param.step_easing < 0){//ease out
                    ease =  Math.sqrt(1 - Math.pow(per - 1, 2));
                }
                if(param.step_easing > 0){//ease in
                    ease = 1 - Math.sqrt(1 - Math.pow(per, 2));
                }
                const _v = param.step_width * ease * param.direction * param.step_speed;
                v = (param.base_x + _v) - self.x;
                w = 0;
                action = (Math.abs(v) > 3) ? "run" : "walk";
            };
            const rotation = function(){
                if(param.rotate_frame <= param._rotate_frame++){ next(); }
                else{
                    const rnd = self.random;
                    action = "damage";
                    v = rnd.randint(-param.rotate_len, param.rotate_len);
                    w = rnd.randint(-param.rotate_len, param.rotate_len);
                }
            };
            switch(param.state[0]){
                case "wait": waiting(); break;
                case "step": stepping(); break;
                case "rotate": rotation(); break;
                default: next();
            }
            if(v != 0 || w != 0){
                this.moveBy(v, w);
                this.outerLimit();
            }
            this.setAnimationDirection("down");
            this.setAnimationAction(action);
        },
    });

    phina.define('CharSpirit3', {//flower
        superClass: 'CharSpiritCommon',
        init: function() {
            const image = "spirit3";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
            this.boss_wait_frame = 6;
            this.boss_step_easing = 0;// -1: easeout, 0: liner, 1: easein
            this.boss_step_speed = 1;
            this.boss_side_step = 1;
            this.boss_step_width = 72;
            this.boss_rotate_len = 0;
            this.boss_rotate_frame = 12;
        },
    });
    phina.define('CharSpirit2', {//water
        superClass: 'CharSpiritCommon',
        init: function() {
            const image = "spirit2";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
            this.boss_wait_frame = 12;
            this.boss_step_easing = -1;// -1: easeout, 0: liner, 1: easein
            this.boss_step_speed = 1;
            this.boss_side_step = 3;
            this.boss_step_width = 24;
            this.boss_rotate_len = 0;
            this.boss_rotate_frame = 12;
        },
    });
    phina.define('CharSpirit5', {//snow
        superClass: 'CharSpiritCommon',
        init: function() {
            const image = "spirit5";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
            this.boss_wait_frame = 48;
            this.boss_step_easing = -1;// -1: easeout, 0: liner, 1: easein
            this.boss_step_speed = 1;
            this.boss_side_step = 4;
            this.boss_step_width = 16;
            this.boss_rotate_len = 0;
            this.boss_rotate_frame = 12;
        },
    });
    phina.define('CharSpirit4', {//flare
        superClass: 'CharSpiritCommon',
        init: function() {
            const image = "spirit4";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
            this.boss_wait_frame = 48;
            this.boss_step_easing = 0;// -1: easeout, 0: liner, 1: easein
            this.boss_step_speed = 2;
            this.boss_side_step = 8;
            this.boss_step_width = 8;
            this.boss_rotate_len = 3;
            this.boss_rotate_frame = 36;
        },
    });
    phina.define('CharSpirit6', {
        superClass: 'CharSpiritCommon',
        init: function() {
            const image = "spirit6";
            this.collision_setting_width = 24;
            this.collision_setting_height = 20;
            this.collision_setting_offset_x = null;
            this.collision_setting_offset_y = null;
            this.superInit(image);
            this.boss_wait_frame = 64;
            this.boss_step_easing = -1;// -1: easeout, 0: liner, 1: easein
            this.boss_step_speed = 8;
            this.boss_side_step = 4;
            this.boss_step_width = 8;
            this.boss_rotate_len = 8;
            this.boss_rotate_frame = 12;
        },
    });


})(this);