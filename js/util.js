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


})(this);