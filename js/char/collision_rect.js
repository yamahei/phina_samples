(function(g){

    "use strict";

    phina.define('CollisionRect', {
        superClass: 'phina.display.RectangleShape',
        init: function(options) {
            this.superInit(options);
        },
        _accessor: {
            x: {
                "get": function()   { return this.position.x; },
                "set": function(v)  { this.position.x = v; }
            },
            y: {
                "get": function()   { return this.position.y; },
                "set": function(v)  { this.position.y = v; }
            },
            originX: {
                "get": function()   { return this.origin.x; },
                "set": function(v)  { this.origin.x = v; }
            },
            originY: {
                "get": function()   { return this.origin.y; },
                "set": function(v)  { this.origin.y = v; }
            },
            scaleX: {
                "get": function()   { return this.scale.x; },
                "set": function(v)  { this.scale.x = v; }
            },
            scaleY: {
                "get": function()   { return this.scale.y; },
                "set": function(v)  { this.scale.y = v; }
            },
            width: {
                "get": function()   {
                    return (this.boundingType === 'rect') ?
                    this._width : this._diameter;
                },
                "set": function(v)  { this._width = v; }
            },
            height: {
              "get": function()   {
                    return (this.boundingType === 'rect') ?
                    this._height : this._diameter;
              },
              "set": function(v)  { this._height = v; }
            },
            top: {
                "get": function()   {
                    // return this.y - this.height*this.originY;
                    const top = this.y - this.height*this.originY;
                    return this.parent.y + top;
                },
                "set": function(v)  { this.y = v + this.height*this.originY; },
            },
            right: {
                "get": function()   {
                    //return this.x + this.width*(1-this.originX);
                    const right = this.x + this.width*(1-this.originX);
                    return this.parent.x + right;
                },
                "set": function(v)  { this.x = v - this.width*(1-this.originX); },
            },
            bottom: {
                "get": function()   {
                    // return this.y + this.height*(1-this.originY);
                    const bottom = this.y + this.height*(1-this.originY);
                    return this.parent.y + bottom;
                },
                "set": function(v)  { this.y = v - this.height*(1-this.originY); },
            },
            left: {
                "get": function()   {
                    // return this.x - this.width*this.originX;
                    const left = this.x - this.width*this.originX;
                    return this.parent.x + left;
                },
                "set": function(v)  { this.x = v + this.width*this.originX; },
            },
            centerX: {
                "get": function()   { return this.x + this.width/2 - this.width*this.originX; },
                "set": function(v)  {
                    // TODO: どうしようかな??
                }
            },
            centerY: {
                "get": function()   { return this.y + this.height/2 - this.height*this.originY; },
                "set": function(v)  {
                    // TODO: どうしようかな??
                }
            },
        },
    });


})(this);