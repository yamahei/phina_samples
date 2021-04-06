phina_samples
=============

[phina.js](https://phinajs.com/) を勉強しつつライブラリを充実させるて、最後にはゲームを作る予定

GithubPages
--------

* [https://yamahei.github.io/phina_samples/](https://yamahei.github.io/phina_samples/)

ローカルでの動かし方
--------

ASSET読み込みの都合があり、Webサーバを起動します

```
gem install sinatra
ruby -rsinatra -e 'set :bind, "0.0.0.0"; set :public_folder, "./", get("/"){"Hello world"}'
```

各ページの説明
--------------

### [スプライト制御のサンプル](char_sample.html)

スプライトシートとアニメーション、当たり判定の制御のサンプルです。

* 基底クラス: SpriteCharBase
* 基本設定: SpriteCharSetting

### [マップ当たり判定のサンプル](map_sample.html)

* トップビューのマップ管理クラス: MapTopView
* マップチップ管理クラス: SpriteMapChip

#### マップの構成要素

* スプライトシート
* マップ定義定義(map_sample.json)

#### Credits

* Character & Map : First seed material
* Logo : cool text
* Engine : Phina.js
* Sound : NOT YET
* Programming : yamahei
