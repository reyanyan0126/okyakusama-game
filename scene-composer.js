/* A scene is a room, a counter or floor prop, and the people involved.
 * Coordinates use a 360 × 144 stage. All people come from the current PNG cast. */
(function (root) {
  "use strict";
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const scene = (room, subject, lead, cast, sign, description) => ({room, subject, lead, cast, sign, description});
  const actions = {
    raise: scene("aisle","highprice","worker","customer","値上げ","棚の値札を高い値段に貼り替える"),
    lower: scene("aisle","lowprice","worker","customer","値下げ","棚に値下げ札をつける"),
    shrink: scene("kitchen","shrink","worker","customer","内容量","大きなトレーから小さなトレーに中身を詰め替える"),
    cheap: scene("kitchen","cheap","worker","","代替食材","安い材料の箱を開けて弁当を詰める"),
    quality: scene("kitchen","ingredients","worker","","食材検品","新鮮な野菜と弁当の中身を照らし合わせる"),
    staff: scene("checkout","register","worker","queue","稼働 1台","一人の店員が長いレジ待ちの列をさばく"),
    explain: scene("aisle","label","manager","customer","価格の内訳","値札の隣に価格の説明を掲示する"),
    sale: scene("front","discount","worker","queue","特売","赤札を下げた店頭に買い物客が集まる"),
    points: scene("checkout","card","manager","customer","ポイント改定","新しいポイントカードをレジで説明する"),
    pop: scene("aisle","poster","worker","","新商品！","商品棚に特大の広告を取り付ける"),
    tasting: scene("kitchen","sample","worker","customer","試食","小皿に分けた試食を渡す"),
    local: scene("market","produce","worker","customer","地元直送","店頭に農家の野菜箱を並べる"),
    restorestaff: scene("checkout","twotills","worker","manager","稼働 2台","二人で二台のレジを開ける"),
    apology: scene("press","microphones","boss","","謝罪会見","並んだマイクに向かって社長が謝罪する"),
    recall: scene("kitchen","more","worker","customer","増量","容器におかずを足す"),
    blame: scene("press","microphones","boss","customer","当社見解","社長がカメラに向かって苦情に反論する"),
    loyalty: scene("meeting","feedback","manager","customer","ご意見","常連の話を聞き、意見カードに記録する"),
    stamp: scene("front","stamp","worker","customer","期間限定","買い物客の台紙にスタンプを押す"),
    audit: scene("press","ledger","manager","","決算公開","報道席に帳簿と内訳を公開する"),
    maintenance: scene("back","fridge","worker","","点検","冷凍庫を開けて工具で点検する"),
    loan: scene("office","loan","you","manager","銀行融資","融資の書類と現金を受け渡す"),
    airtax: scene("checkout","fee","boss","customer","快適料","レジに追加料金の箱を置く"),
    photo: scene("kitchen","camerafood","worker","","広告撮影","撮影用のカメラを弁当に近づける"),
    ceocut: scene("office","chair","boss","","経費削減","社長椅子に処分札を貼る"),
    bills: scene("office","invoices","manager","","経費精査","請求書を費目ごとに仕分ける"),
    apologybot: scene("press","robot","", "customer","自動謝罪","社長の代わりに謝罪ロボットが会見する"),
    fix_equipment: scene("back","tools","worker","manager","設備更新","工具箱を開けて冷凍設備を修理する"),
    fix_people: scene("back","roster","manager","worker","新人研修","勤務表を見ながら新しい人員を訓練する"),
    fix_fans: scene("aisle","feedback","manager","customer","常連相談","常連の要望を一件ずつ受け取る"),
    arc_register_boss: scene("checkout","register","boss","queue","社長レジ","社長がレジを操作し客が待つ"),
    arc_register_pay: scene("checkout","twotills","manager","worker","応援レジ","応援の従業員が二台目のレジを開ける"),
    arc_register_machine: scene("checkout","selfscan","","queue","セルフレジ","客がセルフレジに商品をかざす"),
    arc_register_graduation: scene("back","flowers","manager","worker","卒業式","退職する店員に花束を渡す"),
    arc_bento_real: scene("kitchen","more","worker","customer","唐揚げ増量","唐揚げを五個詰めた弁当を手渡す"),
    arc_bento_camera: scene("kitchen","camerafood","boss","","撮影専用","巨大な見本の弁当を社長が撮影する"),
    arc_bento_chef: scene("kitchen","ingredients","worker","manager","料理人監修","料理人の指示で食材と弁当を確かめる"),
    arc_bento_label: scene("aisle","poster","worker","customer","写真はイメージ","棚の実商品より大きい注意書きを掲げる"),
    arc_staff_listen: scene("back","feedback","manager","worker","現場面談","作業を止めてスタッフの要求を聞く"),
    arc_staff_robot: scene("aisle","robot","","customer","試験運転","ロボットが店頭で客を案内する"),
    arc_staff_pizza: scene("back","pizza","boss","worker","差し入れ","社長がスタッフにピザを一枚差し出す"),
    arc_staff_resign: scene("back","contract","boss","worker","現場責任者","社長が現場責任者の辞令を受け取る"),
    arc_media_open: scene("press","ledger","manager","worker","全資料公開","マイクの前に帳簿を広げる"),
    arc_media_fake: scene("press","camera","boss","","密着取材","カメラの前で社長がポーズをとる"),
    arc_media_ignore: scene("aisle","produce","worker","customer","売場改善","取材を断り店員が棚の商品を整える"),
    arc_media_silence: scene("office","phone","boss","worker","一斉メール","社内メールを一斉送信し受信通知が広がる"),
    arc_festival_locals: scene("market","produce","manager","queue","農家の屋台","屋台に地元野菜を並べて販売する"),
    arc_festival_parade: scene("market","banner","boss","queue","社長パレード","沿道の行列と社長のパレード旗"),
    arc_festival_free: scene("market","sample","worker","queue","無料試食","屋台で試食皿を無料配布する"),
    arc_festival_fee: scene("market","fee","boss","customer","歩行協力金","通行口に協力金の箱を設置する"),
    arc_finale_team: scene("meeting","trophy","manager","worker","現場表彰","店長から従業員にトロフィーを渡す"),
    arc_finale_steal: scene("meeting","trophy","boss","worker","社長表彰","従業員を横に社長が賞を受け取る"),
    arc_finale_vote: scene("meeting","vote","manager","customer","公開投票","買い物客が投票用紙を箱へ入れる"),
    arc_finale_contract: scene("meeting","contract","you","boss","最終契約","社長の前に最終契約書を広げる")
  };
  const events = {
    queue:scene("checkout","register","manager","queue","最後尾 →","長い列の先で店長がレジを打つ"),
    surplus:scene("kitchen","unsold","worker","","売れ残り","売れ残った弁当が台の端まで積み重なる"),
    empty:scene("aisle","basket","","","買い物かご","客が去った売場に空のかごが残る"),
    staff:scene("back","roster","worker","manager","欠員","穴の空いたシフト表の前で従業員が疲れている"),
    fire:scene("aisle","phone","customer","manager","通知","投稿への通知が広がり店長が慌てる"),
    cash:scene("office","billpile","manager","","支払期限","机の上を埋める請求書を店長が数える"),
    busy:scene("checkout","twotills","worker","queue","営業中","レジが次々に商品を通し買い物客が続く"),
    normal:scene("aisle","produce","worker","customer","青果売場","商品棚を補充する店員と買い物客"),
    comparison:scene("kitchen","shrink","customer","manager","旧商品 ／ 現品","常連が大きさの違う商品を見比べる"),
    growth:scene("meeting","ledger","manager","worker","再建会議","成績表に上向きの数字が並ぶ"),
    resign:scene("back","contract","worker","manager","退職願","従業員が退職願を店長に差し出す"),
    press:scene("press","camera","manager","","取材","店長に向けて取材カメラが回る"),
    contract:scene("meeting","contract","manager","you","再建依頼","店長とあなたの間に再建依頼書が置かれる"),
    rival:scene("front","discount","customer","","競合店 特売","向かいの特売札に買い物客が引き寄せられる"),
    market:scene("market","banner","manager","customer","町のお祭り","のぼりが並ぶ屋台に客が集まる"),
    devil:scene("night","contract","devil","you","契約期限","夜の机で悪魔が契約書を差し出す"),
    freezer:scene("back","brokenfridge","worker","","故障中","冷凍庫が止まり冷気が漏れる"),
    power:scene("checkout","outage","manager","queue","停止中","画面が消えたレジの前に列ができる"),
    waste:scene("back","waste","worker","","廃棄","傷んだ在庫を廃棄用の箱に移す"),
    delivery:scene("front","truck","worker","","配送遅延","配送トラックが止まり店員が待つ"),
    rain:scene("rain","basket","","","雨天","店頭の軒下に雨が降り客の姿が消える"),
    viral:scene("aisle","phone","worker","customer","いいね！","接客への好意的な投稿が広がる"),
    bread:scene("market","bread","worker","queue","パン販売","余ったパンに買い物の列ができる"),
    closed:scene("closed","closed","","","閉店","シャッターの下りた店に閉店札が下がる"),
    memory:scene("office","archive","manager","","過去の記録","古い資料とレシートが机に並ぶ"),
    calendar:scene("office","calendar","you","","第4週","事務所で養育費の支払日を確認する"),
    ring:scene("office","telephone","you","","着信","机の電話が鳴り、あなたが手を伸ばす"),
    request:scene("office","telephone","manager","","電話中","店長が事務所から助けを求める"),
    wallet:scene("office","wallet","you","","残金","わずかな現金と請求書が机に置かれる")
  };
  const briefs = {opening:"growth",checkout:"queue",bento:"surplus",survey:"empty",package:"comparison",rival:"rival",staff:"staff",costs:"bills",investigate:"press",quarter:"cash",tv:"press",final:"arc_finale_contract",package2:"comparison",profit:"ceocut",retirement:"resign",media:"fire",community:"market",deadline:"cash",complaint2:"fire",inflation2:"bills",growth:"growth",loyal:"loyalty",cash:"cash",crisis:"fire",chapter2:"growth",chapter3:"growth",done:"closed"};
  const story = {register:"queue",bento:"comparison",staff:"staff",media:"press",festival:"market",finale:"arc_finale_contract"};
  const news = {fire:"fire",memory:"memory",freezer:"freezer",power:"power",waste:"waste",absent:"queue",delivery:"delivery",complaint:"comparison",rival:"rival",rain:"rain",viral:"viral",festival:"market",donation:"bread",boycott:"empty",devil:"devil"};
  const endings = {ideal:"busy",profit:"audit",customer:"loyalty",black:"staff",viral:"fire",legend:"arc_finale_steal",bankrupt:"closed",revenge:"arc_finale_contract"};
  const prologue = ["wallet","calendar","ring","request","normal","arc_finale_contract","devil"];
  const rect = (x,y,w,h,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  const path = (d,fill,stroke="none",width=1) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
  const circle = (x,y,r,color) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const group = (x,y,content,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${content}</g>`;
  const times = (n,fn) => Array.from({length:n},(_,i)=>fn(i)).join("");
  const type = (x,y,value,size,color,anchor="start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="800">${escape(value)}</text>`;
  const ink="#353c43", paper="#fff4d8", mint="#72af98", blue="#52788b", red="#c75c4c", gold="#e5ae55", wood="#a57a58";
  function windowPane(dark=false) {
    return rect(0,0,73,47,ink)+rect(3,3,67,41,dark?"#334b68":"#a4d5d6")+
      (dark?circle(51,12,6,paper)+times(8,i=>rect(6+i*8,8+(i*11)%22,2,2,"#f3e1b5")):path("M4 36l17-13 15 6 13-9 21 10v13H4Z","#77aa9c"))+
      rect(34,2,3,43,paper)+rect(1,29,70,2,paper)+rect(-3,46,79,4,wood);
  }
  function shelf(x,y,muted=false) {
    const colors=muted?["#acb7a1","#c3b296","#b6c0ac"]:["#da9c60","#9ab39d","#d8c273","#bf8a7f","#98acb2"];
    return group(x,y,rect(0,0,94,52,"#d7c8a8")+times(2,j=>times(9,i=>group(3+i*10,j*23+4,rect(0,5,8,12,colors[(i+j*3)%colors.length])+rect(1,9,6,3,paper)))+rect(0,j*23+22,94,4,"#8a8e77")+rect(0,j*23+22,94,1,paper)));
  }
  function roomArt(room) {
    const outdoors=["market","front","rain","closed"].includes(room);
    const dark=room==="night";
    const office=["office","meeting","night","press"].includes(room);
    let back=rect(0,0,360,144,dark?"#384459":outdoors?"#c0dada":"#efe5cc");
    back+=rect(0,77,360,67,dark?"#534c54":outdoors?"#beb4a0":office?"#c8ac89":"#d4c8b0");
    back+=path("M0 94h360m-360 23h360m-265-40-44 67m136-67-4 67m92-67 45 67","none",dark?"#625a60":"#b9ac94",1);
    if(outdoors) {
      back+=rect(0,13,360,12,"#49786f")+rect(0,28,360,6,paper)+times(18,i=>rect(i*20,25,20,7,i%2?"#bd6255":"#f2d69a"));
      back+=group(12,38,windowPane())+group(267,38,windowPane());
      if(room==="market")back+=times(10,i=>path(`M${i*38} 3l14 17 9-14Z`,[red,gold,mint][i%3]));
      if(room==="closed")back+=rect(70,34,220,63,"#999b96")+times(10,i=>rect(71,37+i*6,218,2,"#707774"));
      if(room==="rain")back+=times(27,i=>path(`M${i*14} ${(i*7)%45}l-4 12`,"none","#7598a6",2));
    } else if(office) {
      back+=group(15,9,windowPane(dark))+group(273,9,windowPane(dark));
      back+=rect(117,8,132,47,dark?"#635f63":"#a79172")+rect(120,11,126,41,dark?"#756d68":"#c6b18b");
      back+=times(4,i=>rect(129+i*27,15+i%2*6,20,25,dark?"#b6aa91":paper)+rect(133+i*27,20+i%2*6,12,2,"#a4a490"));
      if(room==="press")back+=times(9,i=>rect(i*43,63,37,7,i%2?blue:"#e3c58d"));
    } else if(room==="back"||room==="kitchen") {
      back+=rect(0,10,360,47,"#d4ded4")+times(3,j=>rect(0,10+j*16,360,1,"#b4c3ba"))+times(16,i=>rect(i*24,10,1,47,"#b4c3ba"));
      back+=group(8,13,windowPane())+shelf(254,14,true);
    } else {
      back+=shelf(3,11,true)+shelf(105,11,true)+shelf(207,11,true)+shelf(309,11,true);
    }
    return back;
  }
  function tray(n=4) {
    return rect(0,4,45,21,ink)+rect(2,3,41,19,"#a45142")+rect(4,6,14,12,paper)+
      times(n,i=>circle(23+(i%3)*7,10+Math.floor(i/3)*6,4,i%3===2?"#719263":"#df9d4c"))+rect(4,21,36,1,"#e2b49a");
  }
  const doc = (color=paper) => rect(0,0,35,27,"#806f61")+rect(0,-2,33,26,color)+rect(4,2,17,3,red)+times(3,i=>rect(4,9+i*4,22-i*3,1,"#897f74"));
  const till = () => rect(0,20,36,8,ink)+rect(3,17,30,6,"#85978b")+rect(10,10,6,9,ink)+rect(3,-3,29,17,ink)+rect(6,0,23,10,"#a3d7bc")+type(26,8,"¥",9,ink,"end")+times(4,i=>rect(5+i*6,19,3,2,paper));
  const card = () => rect(0,0,43,27,blue)+rect(3,3,37,21,paper)+rect(4,5,35,4,mint)+times(5,i=>circle(8+i*6,17,2,gold));
  const camera = () => path("M15 12L1 37m14-25 16 25","none",ink,3)+rect(-4,-9,40,21,ink)+rect(0,-14,10,6,blue)+circle(20,1,8,"#80b7bf")+circle(20,1,4,ink)+rect(1,-5,6,3,paper);
  const crate = (muted=false) => times(7,i=>circle(5+i*5,1-i%2*4,6,muted?"#8b8962":["#779954",red,"#dca14d"][i%3]))+rect(0,1,42,20,wood)+rect(2,5,38,2,"#d4ac78")+rect(3,13,36,2,"#d4ac78");
  const coins = () => times(3,i=>rect(i*11,7-i*3,14,10+i*3,"#a37840")+rect(i*11,5-i*3,14,4,gold));
  const board = (word,color=red) => rect(14,2,4,36,wood)+rect(-12,-21,58,28,ink)+rect(-10,-19,54,24,color)+type(17,-3,word,word.length>5?7:11,paper,"middle");
  const pos = (x,y,a,s=1) => group(x,y,a,s);
  function objectArt(subject,sign) {
    const paperStack=times(4,i=>pos(i*7,-i*3,doc()));
    const food=pos(-30,0,tray(5))+pos(31,0,tray(1));
    const tel=rect(0,8,45,14,ink)+path("M0 9V3l5-5h34l6 6v6h-9l-2-6H12L9 10Z",blue)+path("M49 2l6-5m-4 13h8","none",gold,3);
    const phone=rect(0,-24,27,49,ink)+rect(3,-20,21,38,paper)+times(3,i=>rect(5,-15+i*9,17-i*2,5,i===0?red:mint))+circle(23,-21,9,red)+type(23,-18,"!",11,"white","middle");
    const fridge=rect(-5,-47,57,77,ink)+rect(-2,-44,51,70,"#b1c7c3")+rect(2,-40,42,28,"#7fa6a9")+path("M3-9h42m-7 6v13","none",blue,3);
    const wrench=path("M4 0l6 5 18-19 7-1 3-7-7 4-5-4 3-6-8 4-1 7Z","#738791",ink,1);
    const basket=path("M-3 4h48l-5 22H3Z",red)+path("M4 6l13-14h10l12 14","none",ink,3)+times(5,i=>rect(6+i*7,10,3,11,paper));
    const poster=rect(-12,-34,68,63,wood)+rect(-10,-32,64,56,"#c85748")+path("M-8-14 5-19l7-10 9 9 13-4 5 10 13 5-11 9 3 12-15-2-9 9-7-8-15 2 4-11-9-4Z","#ffda79")+type(21,-1,sign,sign.length>5?7:10,ink,"middle");
    switch(subject) {
      case "highprice": case "lowprice": case "discount": return pos(-29,4,crate())+pos(24,-1,board(subject==="highprice"?"¥ ↑":subject==="lowprice"?"¥ ↓":"SALE",subject==="highprice"?red:blue));
      case "shrink":return food+path("M16 6h13l-6-5m6 5-6 5","none",red,3);
      case "more":return pos(-20,1,tray(1))+pos(28,-2,tray(5),1.2);
      case "cheap":return pos(-26,0,crate(true))+pos(25,3,tray(2));
      case "ingredients":return pos(-26,0,crate())+pos(25,3,tray(5));
      case "produce": case "waste":return pos(-28,0,crate(subject==="waste"))+pos(19,4,crate(subject==="waste"));
      case "unsold":return times(5,i=>pos(-37+i%3*30,Math.floor(i/3)*13-4,tray(),.78));
      case "register":return pos(-18,-3,till(),1.28)+pos(34,6,basket,.7);
      case "twotills":return pos(-37,-5,till())+pos(27,-5,till())+pos(4,11,basket,.6);
      case "outage":return pos(-11,-1,till(),1.2)+rect(-5,-1,26,11,ink)+path("M2 0l8 8m0-8-8 8","none",red,2);
      case "selfscan":return rect(-8,-25,44,57,ink)+rect(-5,-22,38,23,mint)+type(14,-7,"SCAN",9,ink,"middle")+rect(-2,8,33,4,red)+pos(33,11,basket,.65);
      case "label":return pos(-19,1,board("価格の内訳",blue))+pos(31,5,doc());
      case "card": case "stamp":return pos(-11,-4,card(),1.35)+(subject==="stamp"?rect(37,-12,7,23,wood)+rect(32,8,18,6,red):"");
      case "poster": case "banner":return pos(-3,-2,poster);
      case "sample":return times(4,i=>pos(-30+i*22,5+i%2*6,path("M0 0h24l-4 10H4Z",paper)+circle(12,-1,5,"#bd7443")+path("M11-1l8-13","none",wood,2)));
      case "camera":return pos(6,-12,camera());
      case "camerafood":return pos(-28,-12,camera())+pos(15,4,tray(5),1.2);
      case "microphones":return times(3,i=>pos(-28+i*26,-4+i%2*6,rect(8,-12,4,38,ink)+rect(1,-21,16,15,blue)+rect(3,-21,12,5,paper)+rect(1,24,18,4,ink)));
      case "ledger":return pos(-28,0,doc())+pos(13,-5,rect(0,-8,52,34,paper)+times(4,i=>rect(5+i*11,13-i*5,7,10+i*5,mint)));
      case "fridge":case "tools":case "brokenfridge":return pos(-9,0,fridge)+(subject==="brokenfridge"?path("M6-41l9 9-7 8 10 7-8 6","none",red,3):pos(31,24,wrench));
      case "loan":case "wallet":return pos(-26,-1,doc())+pos(16,5,coins(),1.3);
      case "fee":case "vote":return rect(-18,-6,67,34,wood)+rect(-19,-9,69,7,gold)+rect(-5,-7,34,2,ink)+type(15,17,subject==="vote"?"投票":"¥",13,paper,"middle")+(subject==="vote"?pos(8,-21,doc(),.5):pos(50,9,coins(),.68));
      case "chair":return rect(0,-22,36,36,ink)+rect(4,-19,28,29,"#986b61")+rect(-5,12,45,7,ink)+rect(14,18,7,13,ink)+rect(1,28,34,3,ink)+pos(33,1,board("売却",red),.7);
      case "billpile":return pos(-39,3,paperStack)+pos(4,-13,paperStack)+pos(27,8,doc());
      case "invoices":case "archive":return pos(-18,1,paperStack)+pos(31,2,doc("#dac698"));
      case "robot":return times(2,i=>circle(-3+i*32,25,7,ink))+rect(-10,-15,47,37,"#b3c6c1")+rect(-16,-46,59,31,ink)+rect(-13,-43,53,24,mint)+rect(-5,-37,8,6,ink)+rect(21,-37,8,6,ink)+rect(9,-25,9,2,ink)+path("M-11-9l-15 10m62-10 13 6","none",blue,5);
      case "roster":case "calendar":return rect(-20,-22,71,49,ink)+rect(-18,-20,67,45,paper)+rect(-18,-20,67,8,red)+times(15,i=>rect(-13+(i%5)*12,-7+Math.floor(i/5)*10,8,6,i%4===0?red:"#b8c6b3"))+(subject==="calendar"?type(43,19,"4週",12,ink,"end"):"");
      case "feedback":return pos(-28,4,doc())+pos(13,2,doc())+path("M24 15l24-22 4 3-23 23-7 3Z",gold);
      case "flowers":return path("M-12-9l49-6-21 41Z",paper)+times(6,i=>circle(-5+i*7,-13-(i%2)*6,7,[red,gold,"#c48faa"][i%3]));
      case "pizza":return rect(-25,-3,81,30,wood)+rect(-23,-6,77,28,paper)+path("M-16 8Q10-13 47 7 28 30-16 8Z",gold)+times(7,i=>circle(-4+i*6,6+i%2*4,3,red));
      case "contract":return pos(-23,-7,doc(),1.7)+circle(20,22,6,red)+rect(39,6,10,18,wood)+rect(36,23,16,4,red);
      case "phone":return pos(-5,-3,phone,1.1)+times(2,i=>pos(32+i*10,-23+i*21,rect(0,0,29,12,i?mint:red)+rect(4,5,18,2,paper)));
      case "telephone":return pos(-9,-2,tel,1.18);
      case "trophy":return path("M-3-26h37l-5 28-11 6v12h11v5H1v-5h11V8L1 1Z",gold,wood,2)+path("M-3-22h-12q0 22 17 21m31-21h12q-1 21-17 21","none",gold,4);
      case "truck":return rect(-37,-18,65,39,blue)+rect(29,-6,29,27,gold)+rect(33,-4,17,12,paper)+circle(-22,22,7,ink)+circle(42,22,7,ink);
      case "bread":return times(5,i=>pos(-26+i*16,2+i%2*7,path("M0 12Q0-7 17-5Q26-3 21 9L16 17H3Z",gold,wood,1)+path("M7 2l4 3m3-7 4 3","none",paper,2)));
      case "closed":return pos(-10,-5,board("閉 店",blue),1.4);
      case "basket":return pos(-9,0,basket);
    }
    return "";
  }
  function statusKey(s) {
    if(s.bankrupt)return "closed";
    if(s.cash<85000)return "cash";
    if(s.fire>=50)return "fire";
    if(s.staff<45 || s.workforce?.fatigue>=80)return "queue";
    return s.sat>=70?"busy":"normal";
  }
  function render(options) {
    const {phase,state:s={},visualId,problemId,endingId,step=0}=options;
    const h=s.lastResult || {};
    const actionId=["working","outcome"].includes(phase)?h.actionId:options.actionId;
    const art=options.art || (["working","outcome"].includes(phase)?h.storyEvent?.art:"");
    let key;
    switch(phase){
      case "home":key=story[art]||briefs[problemId]||statusKey(s);break;
      case "title":key="normal";break;
      case "contracts":key="contract";break;
      case "prologue":key=prologue[step];break;
      case "news":key=visualId==="memory"&&actions[actionId]?actionId:news[visualId]||story[String(visualId).replace(/^echo-/,"")]||"memory";break;
      case "rescue":key="cash";break;
      case "ending":key=endings[endingId]|| (s.bankrupt?"closed":"contract");break;
      case "status":key=statusKey(s);break;
      default:key=actionId;
    }
    const isAction=["working","outcome","preview"].includes(phase)||phase==="news"&&visualId==="memory"&&actions[actionId];
    const def=(isAction?actions[key]:events[key])||actions[key]||events.normal;
    const tier=options.resultTier||h.performanceTier||"success";
    const reaction=phase==="outcome"||phase==="working"&&step===2;
    const unhappyCustomer=reaction && ((h.actionImpact?.sat || 0)<0 || (h.actionImpact?.fire || 0)>0);
    const face=reaction?(tier==="failure"?"angry":tier==="great"?"happy":"normal"):(["cash","fire","queue"].includes(key)?"anxious":"normal");
    const png=(file,x,y,w,height)=>`<image aria-hidden="true" href="assets/ui/${file}.png" x="${x}" y="${y}" width="${w}" height="${height}" preserveAspectRatio="xMidYMax meet"/>`;
    const person=(role,x,y,w,height,mood)=>png(role+"-"+mood,x,y,w,height);
    let people="";
    if(def.lead)people+=person(def.lead,54,19,111,105,reaction&&tier==="failure"?"confused":face);
    if(def.cast==="queue"){
      for(let i=0;i<3;i++)people+=png("guest-"+(1+((s.week||1)*3+i)%40),210+i*40,29+i*4,69,84);
    }else if(def.cast)people+=person(def.cast,230,27,98,96,def.cast==="customer"&&unhappyCustomer?"angry":face);
    else if(reaction)people+=person("customer",230,28,98,96,unhappyCustomer?"angry":face);
    let shopLayer="",buildCaption="";
    if(s.strategyVersion===380 && ["home","status","preview","working","outcome","ending"].includes(phase) && key!=="closed"){
      const trend=root.StrategyStyles.dominant(s);
      const displays={
        QUALITY:()=>group(6,68,crate()+group(20,9,tray()),.58),
        PEOPLE:()=>person("worker",0,25,65,66,"happy"),
        LOCAL:()=>group(5,65,board("地元直送",mint),.62),
        COST:()=>group(7,66,crate(true),.7),
        PROMOTION:()=>group(7,67,board("特売",red),.66),
        TRUST:()=>group(10,60,doc(),.86),
        EFFICIENCY:()=>group(19,75,objectArt("selfscan",""),.48),
        BLACK:()=>group(6,63,board("売上優先",red),.64)
      };
      if(trend?.level && displays[trend.id]){
        buildCaption=trend.name+" Lv"+trend.level;
        shopLayer=trend.id==="PEOPLE" && [def.lead,def.cast].includes("worker") ? group(12,60,doc(),.9) : displays[trend.id]();
      }
      if(s.upgrades?.equipment>=2 && ["back","kitchen"].includes(def.room)){
        shopLayer+=group(312,64,rect(0,-39,38,66,blue)+rect(3,-36,32,27,"#b1d8dc")+rect(4,-4,30,1,paper)+rect(27,-1,2,8,ink));
        buildCaption=buildCaption || "設備更新";
      }
    }
    const counter=rect(39,97,195,31,wood)+rect(35,94,203,7,paper)+rect(47,106,174,4,"#c39e73");
    const trayX=phase==="working"&&step===0?106:153;
    const props=group(trayX,84,objectArt(def.subject,def.sign));
    const stepArt=phase==="working"&&step===3?group(258,95,doc()+group(32,2,coins())):"";
    const reactionArt=reaction?group(299,26,rect(-13,-13,29,21,paper)+path("M-7 7l-5 7 13-7Z",paper)+type(2,2,tier==="failure"||unhappyCustomer?"!?":tier==="great"?"♥":"♪",14,tier==="failure"?red:blue,"middle")):"";
    let buildArt="";
    if(s.strategyVersion===380 && ["status","home","ending"].includes(phase) && def.room!=="closed"){
      const trend=root.StrategyStyles.dominant(s);
      if(trend?.level){
        const cue={QUALITY:["produce","産直棚"],PEOPLE:["roster","交代表"],LOCAL:["card","常連証"],COST:["ledger","経費表"],PROMOTION:["banner","本日特売"],TRUST:["label","価格内訳"],EFFICIENCY:["selfscan","自動精算"],BLACK:["highprice","新価格"]}[trend.id];
        buildArt=group(314,100,objectArt(cue[0],cue[1]),.58);
      }
      if(s.upgrades?.equipment>=2 && def.room==="kitchen")buildArt+=group(19,72,objectArt("fridge","設備更新"),.5);
    }
    if(phase==="title"){
      const facade=roomArt("front")+rect(77,30,203,66,"#d2b993")+rect(89,43,53,47,blue)+rect(153,43,48,53,ink)+rect(160,48,33,40,"#92c4c1")+rect(211,43,53,47,blue)+rect(71,12,216,24,ink)+type(179,29,"モグモグマート",17,paper,"middle")+group(37,94,crate())+person("worker",263,39,64,68,"normal");
      return `<figure class="composed-scene"><svg viewBox="0 0 360 144" role="img" aria-label="店先に商品が並ぶモグモグマート">${facade}</svg></figure>`;
    }
    return `<figure class="composed-scene" data-phase="${escape(phase)}" data-scene="${escape(key)}" data-action-id="${escape(actionId||"")}" data-step="${step}" data-art="${escape(art||"")}" data-visual="${escape(visualId||"")}"><svg viewBox="0 0 360 144" role="img" aria-label="${escape(def.description)}"><title>${escape(def.description)}</title>${roomArt(def.room)}${shopLayer}${people}${def.lead?counter:""}${props}${buildArt}${stepArt}${reactionArt}</svg><figcaption>${escape(def.sign)}</figcaption>${buildCaption?`<small class="scene-build">${escape(buildCaption)}</small>`:""}</figure>`;
  }
  root.SceneComposer={render,actions,events,briefs,story,news,endings};
})(typeof window==="undefined"?globalThis:window);
