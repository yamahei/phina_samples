(function(g){

    const GameSize = g.GameSize = {
        byWidth: function(/* width_px, min_height_ratio_to_width, max_height_ratio_to_width */){
            const width_px = arguments[0];
            const min_height_ratio_to_width = arguments[1] || 1.5;
            const max_height_ratio_to_width = arguments[2] || 2;
            if(!width_px){ throw new Error("1st parameter (width_px) is required"); }
            const client_width = document.documentElement.clientWidth;
            const client_height = document.documentElement.clientHeight;
            const height_ratio_to_width = client_height / client_width;
            let height_ratio = 0;
            if(min_height_ratio_to_width > height_ratio_to_width){
                height_ratio = min_height_ratio_to_width;
            }else if(max_height_ratio_to_width < height_ratio_to_width){
                height_ratio = max_height_ratio_to_width;
            }else{
                height_ratio = height_ratio_to_width;
            }
            const size = {
                width: width_px,
                height: width_px * height_ratio,
            };
            return size;
        },
    };

    const Queries = g.Queries = {
        get: function(){
            const searches = location.search.replace(/^\?/, "");
            const entries = searches.split(/&/g).map(function(e){ return e.split(/=/); });
            return Object.fromEntries(entries);
        },
    };

    const Sounds = g.Sounds = {
        /**
         * phina.jsで音ゲーを作ってみる【前編】
         * https://qiita.com/pentamania/items/399d133e5440c9424bde
         * > モバイル端末では最初のオーディオ再生はユーザーイベントによって行わないといけないという制約があるため、
         * > タイトル画面（厳密に言うとアプリ本体のCanvas要素）タップ時に各音源毎に無音再生を行うよう仕込んでいます。
         * > 以後は、こちらの好きなタイミングで音を鳴らせるようになります。
         * @param {*} dom
         * @param {*} event
         */
        firstSoundForMobile: function(app){
            const event = "touchstart";
            const dom = app.domElement;
            dom.addEventListener(event, (function() {
              return function f() {
                const context = phina.asset.Sound.getAudioContext();
                const buf = context.createBuffer(1, 1, 22050);
                const src = context.createBufferSource();
                src.buffer = buf;
                src.connect(context.destination);
                src.start(0);
                dom.removeEventListener(event, f, false)
              }
            }()), false);
        },
    };


})(this);