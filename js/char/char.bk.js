(function(g){

    "use strict";
    /**
     * ATTENTION: must include collider.js
     */
    const SpriteCharSetting = g.SpriteCharSetting = {
        width: 24, height: 32,
        animation_asset: 'char',//ASSETS.spritesheet
        directions: ["up","right","down","left"],
        actions: ["stand","jump","walk","run","damage"],
        default_direction: 'down',
        default_action: 'walk',
        collider_width: 12,
        collider_height: 12,
        collider_offset_x: 0,
        collider_offset_y: 12,
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
            /**
             * animation setting
             */
            this.animation = FrameAnimation(SpriteCharSetting.animation_asset).attachTo(this);
            this.direction = SpriteCharSetting.default_direction;
            this.action = SpriteCharSetting.default_action;
            this.setCharAnimation();

            /**
             * collider setting
             * ATTENTION: colliderがscaleに対応していないので、
             *            ドット拡大は画像側かCSSでやること
             */
            const collider_setting = {
                width: this.collider_setting_width || SpriteCharSetting.collider_width || this.width,
                height: this.collider_setting_height || SpriteCharSetting.collider_height || this.height,
                offset_x: this.collider_setting_offset_x || SpriteCharSetting.collider_offset_x || 0,
                offset_y: this.collider_setting_offset_y || SpriteCharSetting.collider_offset_y || 0,
            };
            this.collider.show();//.hide();//
            this.collider.setSize(collider_setting.width, collider_setting.height);
            this.collider.offset(collider_setting.offset_x, collider_setting.offset_y);
        },
        setCharAnimation(){
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
            if(target.collider){
                return this.collider.hitTest(target.collider);
            }else{
                if(target.className == "SpriteMapChip"){
                    //colliderのないSpriteMapChipはヒットしない
                    return false;
                }else{
                    return this.superMethod('hitTestElement', target);
                }
            }
        },
    });


})(this);