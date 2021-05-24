
/**
 * キャッシュコントロール
 * CACHE_STORAGE_NAME: キャッシュ名
 *     バージョンアップごとにカウントアップ（再キャッシュ用）
 * files_to_cache: 対象ファイルリスト
 *     ここにないとキャッシュされない
 *     パス「../phina_samples」にて
 *     以下のコマンドを実行する
 *     $ find . -type f | grep "phina_samples" | grep -v ".git" | sed 's/^\.//'
 */
const CACHE_STORAGE_NAME = 'taprunner_v3';
const files_to_cache = `
/phina_samples/ASSETS/image/chars/armor.png
/phina_samples/ASSETS/image/chars/bat.png
/phina_samples/ASSETS/image/chars/bee.png
/phina_samples/ASSETS/image/chars/bob.png
/phina_samples/ASSETS/image/chars/butler.png
/phina_samples/ASSETS/image/chars/butterfly.png
/phina_samples/ASSETS/image/chars/chancellor.png
/phina_samples/ASSETS/image/chars/chara01_a1.png
/phina_samples/ASSETS/image/chars/chara04_a1.png
/phina_samples/ASSETS/image/chars/chara04_b1.png
/phina_samples/ASSETS/image/chars/chara06_a1.png
/phina_samples/ASSETS/image/chars/chara08_a1.png
/phina_samples/ASSETS/image/chars/china.png
/phina_samples/ASSETS/image/chars/convert_char_size_memo.txt
/phina_samples/ASSETS/image/chars/doors.png
/phina_samples/ASSETS/image/chars/dragon.png
/phina_samples/ASSETS/image/chars/elf.png
/phina_samples/ASSETS/image/chars/fairy.png
/phina_samples/ASSETS/image/chars/fire.png
/phina_samples/ASSETS/image/chars/general.png
/phina_samples/ASSETS/image/chars/goblin.png
/phina_samples/ASSETS/image/chars/gull.png
/phina_samples/ASSETS/image/chars/hawk.png
/phina_samples/ASSETS/image/chars/hero.png
/phina_samples/ASSETS/image/chars/heroine.png
/phina_samples/ASSETS/image/chars/hero_ken.png
/phina_samples/ASSETS/image/chars/hero_kentate.png
/phina_samples/ASSETS/image/chars/hobit.png
/phina_samples/ASSETS/image/chars/infantry.png
/phina_samples/ASSETS/image/chars/item5.png
/phina_samples/ASSETS/image/chars/items.png
/phina_samples/ASSETS/image/chars/kenhoko.png
/phina_samples/ASSETS/image/chars/kentate.png
/phina_samples/ASSETS/image/chars/king.png
/phina_samples/ASSETS/image/chars/knight.png
/phina_samples/ASSETS/image/chars/maid.png
/phina_samples/ASSETS/image/chars/maid2.png
/phina_samples/ASSETS/image/chars/maid3.png
/phina_samples/ASSETS/image/chars/noble.png
/phina_samples/ASSETS/image/chars/org.png
/phina_samples/ASSETS/image/chars/pigeon.png
/phina_samples/ASSETS/image/chars/pigeon_walk.png
/phina_samples/ASSETS/image/chars/prince.png
/phina_samples/ASSETS/image/chars/prince2.png
/phina_samples/ASSETS/image/chars/princess.png
/phina_samples/ASSETS/image/chars/queen.png
/phina_samples/ASSETS/image/chars/ref-chara07_a.png
/phina_samples/ASSETS/image/chars/rooster.png
/phina_samples/ASSETS/image/chars/slime.png
/phina_samples/ASSETS/image/chars/snake.png
/phina_samples/ASSETS/image/chars/soldier.png
/phina_samples/ASSETS/image/chars/spirit1.png
/phina_samples/ASSETS/image/chars/spirit2.png
/phina_samples/ASSETS/image/chars/spirit3.png
/phina_samples/ASSETS/image/chars/spirit4.png
/phina_samples/ASSETS/image/chars/spirit5.png
/phina_samples/ASSETS/image/chars/spirit6.png
/phina_samples/ASSETS/image/chars/split_chars_sheet.ods
/phina_samples/ASSETS/image/chars/statuses.png
/phina_samples/ASSETS/image/chars/swan_swim.png
/phina_samples/ASSETS/image/chars/switches.png
/phina_samples/ASSETS/image/chars/treasure_chest.png
/phina_samples/ASSETS/image/chars/turban.png
/phina_samples/ASSETS/image/chars/twin.png
/phina_samples/ASSETS/image/chars/wizard.png
/phina_samples/ASSETS/image/chars/wolf.png
/phina_samples/ASSETS/image/maps/bg_castle_1.png
/phina_samples/ASSETS/image/maps/bg_castle_2.png
/phina_samples/ASSETS/image/maps/bg_cave_1.png
/phina_samples/ASSETS/image/maps/bg_cave_2.png
/phina_samples/ASSETS/image/maps/bg_field_1.png
/phina_samples/ASSETS/image/maps/bg_field_2.png
/phina_samples/ASSETS/image/maps/bg_field_3.png
/phina_samples/ASSETS/image/maps/bg_rockey_1.png
/phina_samples/ASSETS/image/maps/bg_rockey_2.png
/phina_samples/ASSETS/image/maps/convert_mapchip_size_memo.txt
/phina_samples/ASSETS/image/other/image.png
/phina_samples/ASSETS/image/other/tr_icon_512x512.png
/phina_samples/ASSETS/json/map/map_sample.json
/phina_samples/ASSETS/json/map/symbolname_memo.txt
/phina_samples/ASSETS/sound/close12_r.mp3
/phina_samples/ASSETS/sound/cursor04.mp3
/phina_samples/ASSETS/sound/door03.mp3
/phina_samples/ASSETS/sound/hit48.mp3
/phina_samples/ASSETS/sound/md_bird04.mp3
/phina_samples/ASSETS/sound/md_se_door03.mp3
/phina_samples/ASSETS/sound/md_se_onepoint06.mp3
/phina_samples/ASSETS/sound/md_se_sys22.mp3
/phina_samples/ASSETS/sound/voice006.mp3
/phina_samples/ASSETS/sound/voice009.mp3
/phina_samples/ASSETS/sound/voice023_a.mp3
/phina_samples/ASSETS/sound_mm/animal00.wav
/phina_samples/ASSETS/sound_mm/close12_r.wav
/phina_samples/ASSETS/sound_mm/cursor04.wav
/phina_samples/ASSETS/sound_mm/door03.wav
/phina_samples/ASSETS/sound_mm/hit48.wav
/phina_samples/ASSETS/sound_mm/puu77_b.wav
/phina_samples/ASSETS/sound_mm/step10_a.wav
/phina_samples/ASSETS/sound_mm/voice006.wav
/phina_samples/ASSETS/sound_mm/voice023_a.wav
/phina_samples/ASSETS/sound_mm/voice023_b.wav
/phina_samples/ASSETS/sound_mm/whistle02.wav
/phina_samples/ASSETS/sound_mm/_bell00.wav
/phina_samples/ASSETS/sound_mm/_bosu39.wav
/phina_samples/ASSETS/sound_mm/_cursor16.wav
/phina_samples/ASSETS/sound_mm/_voice009.wav
/phina_samples/ASSETS/sound_mm/_voice026.wav
/phina_samples/ASSETS/sound_tk/blip03.mp3
/phina_samples/ASSETS/sound_tk/damage7.mp3
/phina_samples/ASSETS/sound_tk/defense1.mp3
/phina_samples/ASSETS/sound_tk/falling2.mp3
/phina_samples/ASSETS/sound_tk/hitting1.mp3
/phina_samples/ASSETS/sound_tk/jump13.mp3
/phina_samples/ASSETS/sound_tk/locker_C.mp3
/phina_samples/ASSETS/sound_tk/locker_O.mp3
/phina_samples/ASSETS/sound_tk/poka02.mp3
/phina_samples/ASSETS/sound_tk/powerdown01.mp3
/phina_samples/ASSETS/sound_tk/powerdown07.mp3
/phina_samples/ASSETS/sound_tk/select08.mp3
/phina_samples/ASSETS/sound_tk/strange_wave.mp3
/phina_samples/ASSETS/tmss/character.tmss
/phina_samples/ASSETS/tmss/door.tmss
/phina_samples/ASSETS/tmss/treasure.tmss
/phina_samples/char_sample.html
/phina_samples/fonts/PressStart2P-Regular.ttf
/phina_samples/fonts/Press_Start_2P/OFL.txt
/phina_samples/items_sample.html
/phina_samples/js/char/char.js
/phina_samples/js/char/collision_rect.js
/phina_samples/js/char/event.js
/phina_samples/js/char/sample.js
/phina_samples/js/game1/bonus_scene.js
/phina_samples/js/game1/credit_scene.js
/phina_samples/js/game1/game_scene.js
/phina_samples/js/game1/main.js
/phina_samples/js/game1/role_scene.js
/phina_samples/js/game1/timer.js
/phina_samples/js/game1/title_scene.js
/phina_samples/js/items/items.js
/phina_samples/js/items/sample.js
/phina_samples/js/items/_items.js
/phina_samples/js/lib/phina-collider.js
/phina_samples/js/lib/phina-gl2d.js
/phina_samples/js/lib/phina.js
/phina_samples/js/lib/phina.min.js
/phina_samples/js/map/map.js
/phina_samples/js/map/map_chip.js
/phina_samples/js/map/sample.js
/phina_samples/js/map_generator/level_graph.xlsx
/phina_samples/js/map_generator/map_generator.js
/phina_samples/js/map_generator/sample.js
/phina_samples/js/selector/sample.js
/phina_samples/js/selector/selector.js
/phina_samples/js/textbox/sample.js
/phina_samples/js/textbox/textbox.js
/phina_samples/js/util.js
/phina_samples/LICENSE
/phina_samples/map_generate_sample.html
/phina_samples/map_sample.html
/phina_samples/pwa/taprunner/icons/android/android-launchericon-144-144.png
/phina_samples/pwa/taprunner/icons/android/android-launchericon-192-192.png
/phina_samples/pwa/taprunner/icons/android/android-launchericon-48-48.png
/phina_samples/pwa/taprunner/icons/android/android-launchericon-512-512.png
/phina_samples/pwa/taprunner/icons/android/android-launchericon-72-72.png
/phina_samples/pwa/taprunner/icons/android/android-launchericon-96-96.png
/phina_samples/pwa/taprunner/icons/chrome/chrome-extensionmanagementpage-48-48.png
/phina_samples/pwa/taprunner/icons/chrome/chrome-favicon-16-16.png
/phina_samples/pwa/taprunner/icons/chrome/chrome-installprocess-128-128.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-128-128.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-16-16.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-256-256.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-32-32.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-48-48.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-64-64.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-general-90-90.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-marketplace-128-128.png
/phina_samples/pwa/taprunner/icons/firefox/firefox-marketplace-512-512.png
/phina_samples/pwa/taprunner/icons/msteams/msteams-192-192.png
/phina_samples/pwa/taprunner/icons/msteams/msteams-silhouette-32-32.png
/phina_samples/README.md
/phina_samples/samples.html
/phina_samples/selector_sample.html
/phina_samples/taprunner.doc.html
/phina_samples/taprunner.pwa.html
/phina_samples/taprunner_manifest.json
/phina_samples/taprunner_sw.js
/phina_samples/textbox_sample.html
`.split("\n")
.map(function(line){
  return line.replace(/^\s+|\s+$/g, "");
})
.filter(function(line){
  return !!line;
});


//Caching Files with Service Worker
//https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_STORAGE_NAME).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STORAGE_NAME)
    .then(function(cache) {
      return cache.addAll(files_to_cache);
    })
  );
});
