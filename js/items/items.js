(function(g){

    "use strict";

    const IMAGEINDEX_HIDE = 0;
    const IMAGEINDEX_TIME = 1;
    const IMAGEINDEX_SHOE = 2;
    const IMAGEINDEX_SWORD = 3;
    const IMAGEINDEX_WING = 4;

    const LABEL_FONTSIZE = 8;


    phina.define('SpriteSingleItem', {
        superClass: 'phina.display.Sprite',
        init: function(index, type, count, screen_width) {
            this.superInit("item", 16, 16);
            // this.setOrigin(0, 0);
            // this.setInteractive(true);
            this.type = type;
            this.sort_index = index;
            this.count = count * 1;
            this.screen_width = screen_width;
            this.x = this.get_x();
            this.set_blink_count();
            switch(type){
                // case IMAGEINDEX_HIDE:  case "hide":  this.frameIndex = IMAGEINDEX_HIDE;  break;
                case IMAGEINDEX_TIME: case "time": this.frameIndex = IMAGEINDEX_TIME; break;
                case IMAGEINDEX_SHOE: case "shoe": this.frameIndex = IMAGEINDEX_SHOE; break;
                case IMAGEINDEX_SWORD:case "sword":this.frameIndex = IMAGEINDEX_SWORD;break;
                case IMAGEINDEX_WING: case "wing": this.frameIndex = IMAGEINDEX_WING; break;
                default: throw new Error(`unknown type: '${type}'`);
            }
            this.label = this.get_label(count);
            this.addChild(this.label);
        },
        set_blink_count: function(){
            this.blink = 24 * 3;//sec
        },
        get_label: function(no){
            const _label_options = {};
            const label_options = {
                text : (no).toString(),
                margin: 0, padding: 0,
                fontSize: _label_options.fontSize || LABEL_FONTSIZE,
                fontWeight: _label_options.fontWeight || "normal",
                fontFamily: _label_options.fontFamily || "PressStart2P",
                fill: _label_options.stroke || "white",
                //align: _label_options.align,// || "center",
                baseline: _label_options.baseline,
                lineHeight: _label_options.lineHeight,
                backgroundColor: "black",
            };
            const width = this.width;
            const height = this.height;
            const label = Label(label_options);
            return label.setPosition(10, 8);
        },
        get_x: function(){
            const screen_width = this.screen_width;
            const side_margin = screen_width / 4;
            const items_width = screen_width - side_margin * 2
            const hq = items_width / 8;
            return side_margin + (this.sort_index * 2 + 1) * hq - this.width;
        },
        update: function(){
            this.label.text = this.count.toString();
            this.label.visible = (this.count > 1);
            if(this.count > 0){
                if(this.blink-- >= 0){
                    this.visible = !!(Math.floor(this.blink / 8) % 2);
                }else{
                    this.visible = true;
                }
            }else{
                this.visible = false;
            }
        },
        can_use: function(){ return (this.count>0); },
        count_up: function(){
            this.count++;
            this.set_blink_count();
        },
        count_down: function(){
            if(this.can_use){this.count--;}
            else{ throw new Error(`${this.type} cant use.`); }
        },
    });
    phina.define('Items', {
        superClass: 'phina.display.DisplayElement',
        init: function(default_items, screen_width, screen_height) {
            this.superInit({
                width: screen_width,
                height: 16,
            });
            this.setOrigin(0, 0);
            this.x = 0;
            this.y = screen_height - this.height * 2;
            this.items = {};
            const item_names = this.item_names = ["sword", "shoe", "time", "wing"];
            const self = this;
            for(let i=0; i<item_names.length; i++){
                const name = item_names[i];
                const obj = SpriteSingleItem(i, name, (default_items[name] || 0), screen_width).addChildTo(self);
                self.items[name] = obj;
            }
        },
        use_item: function(item){
            const obj = this.items[item];
            if(!obj){ throw new Error(`${item} isnt valid item.`);}
            if(!obj.can_use()){ throw new Error(`${item} cant use.`);}
            obj.count_down();
        },
        get_item: function(chest_type){
            const _candies = [
                { type: "wing",  per: 2, chests: ["B"] },
                { type: "sword", per: 3, chests: ["C"] },
                { type: "shoe",  per: 8, chests: ["D"] },
                { type: "time",  per: 9, chests: ["E"] },
            ];
            const candies = _candies.filter(function(candy){
                return (candy.chests.indexOf(chest_type) >= 0);
            });
            if(candies.length <= 0){ candies.push(..._candies); }

            let type = (candies.length==1) ? candies[0].type : null;
            //TODO: 今となっては不要な出現確立でのアイテム決定処理
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
            const obj = this.items[type];
            if(!obj){ throw new Error(`${type} isnt valid item.`);}
            obj.count_up();
            return type;
        },
        get_item_properties: function(){
            const properties = {};
            const self = this;
            Object.keys(this.items).forEach(function(key){
                properties[key] = self.items[key].count || 0;
            });
            return properties;
        },
        get_item_state: function(name){
            return this?.items[name]?.count || 0;
        },

    });


})(this);