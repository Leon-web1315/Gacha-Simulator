//ガチャのアイテム
const items = [
    {name: "Dragon Sword", rarity: "SSR", category: "Weapon"},
    {name: "Magic Ring", rarity: "SR", category: "Accessory"},
    {name: "Slime Shield", rarity: "R", category: "Armor"},
    {name: "Thunder Bow", rarity: "SR", category: "Weapon"},
];


//DOM取得
const gachaBtn = document.getElementById("gacha-btn");
const gacha10Btn = document.getElementById("gacha10-btn");
const gachaResult = document.getElementById("result");


//ガチャの状態を管理する変数
let ssrCount = 0;
let srCount = 0;
let rCount = 0;
let pityCount = 0;
let timers = [];
let currentResults = [];
let isRevealing = false;
let finishTimer;



//ガチャカードをクリックするとスキップ
gachaResult.onclick = () => {

    if (isRevealing === false) {
        return;
    }

    skipReveal(currentResults);

};


//ガチャを引く関数
function drawGacha() {

    //SSRが出てからのガチャ回数を１増やす
    pityCount++;

    let rarity;
    let isPity = false;


    //５０連で天井
    if (pityCount >= 50) {

        rarity = "SSR";
        isPity = true;

    } else {

        //１から１００までのランダムな数字を生成
        const randomNumber = Math.floor(
            Math.random() * 100 + 1
        );

        //各レア度の排出率
        if (randomNumber <= 1) {
            rarity = "SSR";
        } else if (randomNumber <= 31) {
            rarity = "SR";
        } else {
            rarity = "R";
        }
    }

    

    //決まったレア度のアイテムだけ残す
    const filteredItems = 
    items.filter(item => {

        return item.rarity === rarity;

    });


    //絞り込んだアイテムからランダムな番号を作る
    const randomIndex = Math.floor(
        Math.random() * filteredItems.length
    );

    const result = filteredItems[randomIndex];


    //各レア度に応じた表示情報とカウント設定
    if (result.rarity === "SSR") {

        pityCount = 0;
        result.icon = "🌈";
        result.rate = isPity
            ? "(天井確定)"
            : "(1%)";
            
        ssrCount++;

    } else if (result.rarity === "SR") {

        result.icon = "🎉";
        result.rate = "(30%)";
        srCount++;

    } else {

        result.icon = "🎉";
        result.rate = "(69%)";
        rCount++;

    }


    //resultを返す
    return result;
}




//各レア度の排出結果カウントと合計
function updateCounts() {

    document.getElementById("ssr-count").textContent =
    `🌈SSR：${ssrCount}回`;

    document.getElementById("sr-count").textContent =
    `SR：${srCount}回`;

    document.getElementById("r-count").textContent =
    `R：${rCount}回`;

     document.getElementById("total-count").textContent =
    `合計：${ssrCount + srCount + rCount}回`;

};



//SSR確定までの残り回数を画面に表示する関数
function updatePityCount() {

    const remainingCount = 50 - pityCount;

    document.getElementById("pity-count").textContent = `SSR確定まであと${remainingCount}回`;

}



//カードからcan-skipを外す
function removeSkipStyle() {

    const cards = document.querySelectorAll(".result-card");

    cards.forEach((card) => {

        card.classList.remove("can-skip");

    });
}




//カードを順番にめくる関数
function revealCards(results) {

    //今回のめくりタイマーIDを保存するために空にする
    timers = [];

    const cards =
        document.querySelectorAll(".result-card");
    

    //カードにcan-skipを追加
    cards.forEach((card) => {

        card.classList.add("can-skip");

    });

    results.forEach((result, index) => {

        const timer = setTimeout(() => {

                        //カードにflipを追加してCSSでめくる
                        cards[index].classList.add("flip");

                
                        //SSRだけ演出追加
                        if (result.rarity === "SSR") {

                        cards[index].classList.add("ssr-pop");

                        }


                    }, index * 300);

        //timersにtimerを追加
        timers.push(timer);

    });

}



//めくる演出をスキップする関数
function skipReveal(results) {

    //カードを順番にめくるタイマーを消す
    timers.forEach((timer) => {

        clearTimeout(timer);

    });

    //通常の演出終了のタイマーを止める
    clearTimeout(finishTimer);

    const cards = document.querySelectorAll(".result-card");

    //全カードをめくる
    results.forEach((result, index) => {

        cards[index].classList.add("flip");

        //SSRのみ演出追加
        if (result.rarity === "SSR") {

            cards[index].classList.add("ssr-pop");

        }
    });

    //使用済みタイマーを空にする
    timers = [];

    isRevealing = false;

    removeSkipStyle();

    updateCounts();
    updatePityCount();

    setGachaButtonsDisabled(false);

}





//ガチャカード生成
function createCard(result) {

    return  `
        <div class="result-card">

            <div class="card-front">
                ❓️
            </div>
        
            <div class="card-back ${result.rarity.toLowerCase()}">
                ${result.icon} ${result.rarity}<br>
                ${result.name}<br>
                ${result.rate}<br>
                ${result.category}
            </div>
            
        </div>
        
        `;
        
}




//ガチャ演出がおわるまで次のガチャをひけなくする関数
function setGachaButtonsDisabled(isDisabled) {

    gachaBtn.disabled = isDisabled;
    gacha10Btn.disabled = isDisabled;

}



//単発ガチャ
gachaBtn.onclick = () => {

    setGachaButtonsDisabled(true);

    const result = drawGacha();

    //スキップ処理でも使えるように現在のガチャ結果を保存
    currentResults = [result];

    //ガチャ中メッセージ
    gachaResult.innerHTML = `
        <p>ガチャ中...</p>
        <div id="result-list"></div>
        `;
    
    //単発ガチャを中央に配置するためにflexに変更
    const resultList =
    document.getElementById("result-list");
    resultList.style.display = "flex";
    resultList.style.justifyContent = "center";


    resultList.innerHTML = createCard(result);


    setTimeout(() => {

        //ガチャ結果メッセージ
        const message =
        gachaResult.querySelector("p");

        message.textContent = "ガチャ結果！";

        //ここからスキップ可能
        isRevealing = true;

        revealCards(currentResults);

    }, 2000);


    //演出終了後の後処理
    finishTimer = setTimeout(() => {
        
        updateCounts();
        updatePityCount();

        isRevealing = false;

        removeSkipStyle();

        setGachaButtonsDisabled(false);

    }, 2700);


};




//10連ガチャ
gacha10Btn.onclick = () => {

    setGachaButtonsDisabled(true);

    let results = [];

    gachaResult.innerHTML = `
        <p>１０連ガチャ中...</p>
        <div id="result-list"></div>
        `;

    const resultList =
    document.getElementById("result-list");


    //ガチャを引くのと結果をresultsに追加を１０回くりかえす
    for (let i = 0; i < 10; i++) {

        const result = drawGacha();

        results.push(result);

    }


    //スキップ処理でも使えるように現在のガチャ結果を保存
    currentResults = results;

    //resultsをもとにアイテムカード生成
    results.forEach((result) => {

        resultList.innerHTML += createCard(result);

    });


    setTimeout(() => {

        const message = 
        gachaResult.querySelector("p");

        message.textContent = "１０連ガチャ結果！";

        //ここからスキップ可能
        isRevealing = true;

        revealCards(currentResults);
    
    }, 2000);


    //演出終了後の後処理
    finishTimer = setTimeout(() => {

        updateCounts();
        updatePityCount();

        isRevealing = false;

        removeSkipStyle();
        
        setGachaButtonsDisabled(false);

    }, 5400);
};