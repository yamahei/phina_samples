(function(g){

    "use strict";
    /**
     * ATTENTION: must include collider.js
     */
    phina.define('SpriteMapChip', {
        superClass: 'phina.display.Sprite',
        init: function(image, width, height, frame_index, collision, event) {
            this.superInit(image, width, height);
            this.setOrigin(0, 0);
            this.frameIndex = frame_index;
            this.event_name = event;
            if(collision){
                this.collider.show();//.hide();//
                this.collider.setSize(width * collision, height * collision);
                const offset_x = (width - width * collision) / 2
                const offset_y = (height - height * collision) / 2
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