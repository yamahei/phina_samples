(function(g){

    "use strict";

    const METER_MARGIN = 2;
    const METER_HEIGHT = 16;
    const METER_MINPER = 0.2;

    phina.define('Timer', {
        superClass: 'phina.display.RectangleShape',
        init: function() {
            this.superInit({
                margin: 0,
                padding: 0,
                height: METER_HEIGHT,
            });
            this.x = this.y = METER_MARGIN;
        },
        initialize: function(parent, limit_sec){
            this.full_width = parent.width - METER_MARGIN * 2;
            this.width = this.full_width;
            this.setOrigin(0, 0);

            this.container = parent;
            this.limit_sec = limit_sec;
            this.init = true;
            this.start = null;
            this.end = null;
            this.timeup = false;
            this.meter = 0;
            this.stop = false;
            this.remain = limit_sec;

            this.visible = true;
            return this;
        },
        count_start: function(){
            this.init = false;
            this.start = new Date();
        },
        update: function(){
            if(this.init){
                this.meter += (this.meter < 100) ? 1 : 0;
                this.set_width_from_meter();
            }else{
                this.set_width_from_date();
            }
        },
        set_width_from_meter: function(){
            const per = this.meter / 100;
            this.set_width(per);
        },
        set_width_from_date: function(){
            if(!this.init && !this.stop){
                const start_msec = +this.start;
                const now_msec = +new Date();
                const remain = (now_msec - start_msec) / 1000;
                const limit_sec = this.limit_sec;
                const _per = remain / limit_sec;
                this.remain = this.limit_sec - Math.ceil(remain);
                if(this.remain <= 0){ this.remain = 0; }
                this.set_width(1 - _per);
            }
        },
        set_width: function(_per){
            let per = _per;
            if(per < 0){ per = 0; }
            if(per > 1){ per = 1; }
            if(per > 0){
                this.width = Math.ceil(this.full_width * per);
                this.visible = (METER_MINPER > per) ? !this.visible : true;
            }else{
                this.visible = false;
            }
            if(per <= 0 && !this.init && !this.timeup){
                this.timeup = true;
                this.fire({type: "timeup"});
            }
        },
        minus: function(){
            if(!this.stop){
                this.start.setMilliseconds(this.start.getMilliseconds() - 100);
            }
        },

    });


})(this);