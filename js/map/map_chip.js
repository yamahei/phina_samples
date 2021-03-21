(function(g){

    "use strict";

    const MAP_DEBUG = false;

    /**
     * ATTENTION: must include collision_rect.js
     */
    phina.define('SpriteMapChip', {
        superClass: 'phina.display.Sprite',
        init: function(image, symbol, width, height, frame_index, collision, _propotion, event) {
            this.superInit(image, width, height);
            this.setOrigin(0, 0);
            this.frameIndex = frame_index;
            this.symbol = symbol;
            this.event_name = event;
            this.sprite_type = "map";
            /**
             * collision setting
             */
            const propotion_w = _propotion < 0 ? 1 + _propotion : 1;
            const propotion_h = _propotion > 0 ? 1 - _propotion : 1;
            const collision_setting = {
                width: width * collision * propotion_w,
                height: height * collision * propotion_h,
                offset_x: width / 2,
                offset_y: height / 2,
            };
            if(collision_setting.width * collision_setting.height > 0){
                const collision = CollisionRect({
                    width: collision_setting.width,
                    height: collision_setting.height,
                    fill: null,
                    stroke: MAP_DEBUG ? "yellow" : null,
                }).addChildTo(this);
                collision.x = collision_setting.offset_x;
                collision.y = collision_setting.offset_y;
                this.collision_rect = collision;
            }
        },
        getCollisionRect: function(){
            return this.collision_rect || this;
        },
        hitTestElement: function(target){//override
            if(!this.collision_rect){
                //collisionのないSpriteMapChipはヒットしない
                return false;
            }else{
                const target_collision = target.collision_rect || target;
                return this.collision_rect.hitTestElement(target_collision);
            }
        },

    });


})(this);