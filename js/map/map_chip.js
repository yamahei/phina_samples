(function(g){

    "use strict";
    /**
     * ATTENTION: must include collider.js
     */
    phina.define('SpriteMapChip', {
        superClass: 'phina.display.Sprite',
        init: function(image, symbol, width, height, frame_index, collision, event) {
            this.superInit(image, width, height);
            this.setOrigin(0, 0);
            this.frameIndex = frame_index;
            this.symbol = symbol;
            this.event_name = event;
            this.sprite_type = "map";
            if(collision){
                this.collider.show();//.hide();//
                const size_w = width * collision;
                const size_h = height * collision;
                this.collider.setSize(size_w, size_h);
                const offset_x = width / 2;
                const offset_y = height / 2;
                this.collider.offset(offset_x, offset_y);
            }
        },
        hitTestElement: function(target){//override
            //colliderのないSpriteMapChipはヒットしない
            if(!this.collider){ return false; }
            if(target.collider){
                return this.collider.hitTest(target.collider);
            }else{
                return this.superMethod('hitTestElement', target);
            }
        },

    });


})(this);