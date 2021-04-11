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

Credits(覚書)
--------

* Character & Map : First seed material
* Logo : cool text
* Engine : Phina.js
* Sound : maoh-damashii, The match makers
* Programming : yamahei
