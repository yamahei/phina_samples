(function(g){

    "use strict";

    const IMAGEINDEX_HIDE = 0;
    const IMAGEINDEX_TIME = 1;
    const IMAGEINDEX_SHOE = 2;
    const IMAGEINDEX_SWORD = 3;
    const IMAGEINDEX_WING = 4;


    phina.define('SpriteSingleItem', {
        superClass: 'phina.display.Sprite',
        init: function(index, type) {
            this.superInit("item", 16, 16);
            this.setOrigin(0, 0);
            this.setInteractive(true);
            this.type = type;
            this.sort_index = index;
            this.x = this.get_x();
            this.blink = 24 * 3;//sec
            switch(type){
                case IMAGEINDEX_HIDE:  case "hide":  this.frameIndex = IMAGEINDEX_HIDE;  break;
                case IMAGEINDEX_TIME:  case "time":  this.frameIndex = IMAGEINDEX_TIME;  break;
                case IMAGEINDEX_SHOE:  case "shoe":  this.frameIndex = IMAGEINDEX_SHOE;  break;
                case IMAGEINDEX_SWORD: case "sword": this.frameIndex = IMAGEINDEX_SWORD; break;
                case IMAGEINDEX_WING:  case "wing":  this.frameIndex = IMAGEINDEX_WING;  break;
                default: throw new Error(`unknown type: '${type}'`);
            }
        },
        get_x: function(){
            return this.width * 1.25 + (this.sort_index * this.width * (1 + 1.25));
        },
        setSortIndex: function(index){
            this.sort_index = index;
            const x = this.get_x();
            const sort_msec = 500;
            const self = this;
            self.tweener
            .clear()
            .to({x: x, y: self.y}, sort_msec, "linear")
        },
        update: function(){
            if(this.blink-- >= 0){
                this.visible = !!(Math.floor(this.blink / 8) % 2);
            }else{
                this.visible = true;
            }
        }
    });
    phina.define('Items', {
        superClass: 'phina.display.DisplayElement',
        init: function(default_items, screen_width, screen_height) {
            this.superInit({
                width: screen_width,
                height: 16,
            });
            // this.setOrigin(0, 0);
            this.x = 0;
            this.y = screen_height - this.height * 2;
            this.items = [];
            this.usable = false;
            const self = this;
            for(let i=0; i<default_items.length; i++){
                const type = default_items[i];
                this.items.push({
                    type: type,
                    obj: SpriteSingleItem(i, type).addChildTo(self),
                });
            }
            this.reset_sort_index();
        },
        reset_sort_index: function(){
            const self = this;
            for(let i=0; i<this.items.length; i++){
                const item = this.items[i];
                item.obj.setSortIndex(i);
                item.obj.clear('pointstart');
                item.obj.on('pointstart', function(e){
                    if(self.usable){
                        item.obj.clear('pointstart');
                        item.obj.remove();
                        self.use_item(item);
                    }
                });
            }
        },
        use_item: function(item){
            const index = this.items.indexOf(item);
            if(index >= 0){
                this.items.splice(index, 1);
                this.reset_sort_index();
                this.fire({type: "useitem", item: item});
            }
        },
        get_item: function(chest_type){
            const _candies = [
                { type: "wing",  per: 2, chests: ["B"] },
                { type: "sword", per: 3, chests: ["A", "B"] },
                { type: "hide",  per: 4, chests: ["C"] },
                { type: "time",  per: 8, chests: ["C"] },
                { type: "shoe",  per: 9, chests: ["D"] },
            ];
            const candies = _candies.filter(function(candy){ return (candy.chests.indexOf(chest_type) >= 0); });
            if(candies.length <= 0){ candies.push(..._candies); }

            let type = (candies.length==1) ? candies[0].type : null;
            const total_odds = candies
            .map(function(c){ return c.per; })
            .reduce(function(sum, per){ return sum + per; }, 0);
            while(!type){
                const per = Math.floor(Math.random() * total_odds);//敢えてレベルに連動しない
                const candy = candies[0];
                if(candy.per > per){
                    type = candy.type;
                    break;
                }else{
                    candies.push(candies.shift());
                }
            }
            this.items.unshift({
                type: type,
                obj: SpriteSingleItem(0, type).addChildTo(this),
            });
            this.reset_sort_index();
        },
        get_item_names: function(){
            return this.items.map(function(item){ return item.type; });
        },

    });


})(this);