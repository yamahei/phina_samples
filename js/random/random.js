(function(g){

    "use strict";
    /**
     * SEE: JavaScriptで再現性のある乱数を生成する + 指定した範囲の乱数を生成する
     *  https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
     */
    const DIGITER = 99999;
    phina.define('Random', {
        init: function(seed) {
            this.x = 123456789;
            this.y = 362436069;
            this.z = 521288629;
            this.w = seed || Math.PI;//result
        },
        get: function(){
            let t;
            t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));

            let rnd = (this.w % DIGITER) / DIGITER;
            return rnd;
        },
    });


})(this);