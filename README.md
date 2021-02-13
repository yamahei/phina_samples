phina_samples
=============

[phina.js](https://phinajs.com/) を勉強しつつライブラリを充実させるて、最後にはゲームを作る予定

動かし方
--------

ASSET読み込みの都合があり、Webサーバを起動します

```
gem install sinatra
ruby -rsinatra -e 'set :public_folder, "./", get("/"){"Hello world"}'
```

各ページの説明
--------------

### [スプライト制御のサンプル](http://localhost:4567/char_sample.html)

スプライトシートとアニメーション、当たり判定の制御のサンプルです。

* 既定クラス: SpriteCharBase
* 基本設定: SpriteCharSetting