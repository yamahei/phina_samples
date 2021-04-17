phina_samples
=============

[phina.js](https://phinajs.com/) を勉強しつつライブラリを充実させるて、最後にはゲームを作る予定

GithubPages
--------

* [https://yamahei.github.io/phina_samples/samples.html](https://yamahei.github.io/phina_samples/samples.html)

ローカルでの動かし方
--------

ASSET読み込みの都合があり、Webサーバを起動します

```sh
gem install sinatra
cd .. #GCP配置の関係で一つ上から
ruby -rsinatra -e 'set :bind, "0.0.0.0"; set :public_folder, "./", get("/"){"Hello world"}'
```

