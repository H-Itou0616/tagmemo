// ======================================
// DOM取得・定数
const noteList = document.getElementById("note-list-ul");
const annotation = document.getElementById("annotation");
const searchInput = document.getElementById("search-keyword");
const radioTag = document.getElementById("radio-tag");

const searchButton = document.getElementById("search-btn");
const saveButton = document.getElementById("save-note-btn");
const resetButton = document.getElementById("reset-btn");
// DOM取得・定数 end
// ======================================

// ======================================
// 一意のID生成処理関数
function generalUniqueId(){
    // 被りをなくすため、ミリ秒単位でID生成
    // 個人使用前提のため、ランダムな数字は必要なし
    return Date.now().toString();
}
// 一意のID生成処理関数 end
// ======================================

// ======================================
// localStorage保存処理関数
function saveLocalStorage(){
    // 一意のIDを持ってくる
    const id = generalUniqueId();
    
    // タイトル、本文、タグを取得
    // タイトル
    const titleInput = document.getElementById("note-title");
    const title = titleInput.value;
    
    // 本文
    const bodyInput = document.getElementById("note-body");
    const body = bodyInput.value;
    
    if(!title || !body){
        alert("タイトルと本文は必須です");
        return;
    }

    // タグ
    const rawInput = document.getElementById("note-tag");
    const rawTags = rawInput.value;

    // タグをまとめる
    // splitでカンマを除去、
    // trimで空白除去、
    // filter(Boolean)で偽とみなされる値を除去
    const tags = rawTags.split(",").map(tag => tag.trim()).filter(Boolean);

    // ID、タイトル、本文、タグをまとめる
    const allContent = {
        id: id,
        title: title,
        body: body,
        tags: tags
    };

    // 保存済みのメモの配列を取得
    // 取得したメモの配列をオブジェクトに変換
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    // 取得した配列に新しいメモを追加
    savedNotes.push(allContent);

    // localStage.setItemで保存
    // オブジェクトでは保存できないのでstringifyを使って文字列に変換
    localStorage.setItem("notes",JSON.stringify(savedNotes));

    titleInput.value = "";
    bodyInput.value = "";
    rawInput.value = "";
}
// localStorage保存処理関数 end
// ======================================

// ======================================
// 表示処理関数
function renderSavedNotes(notes = null){
    const savedNotes = (notes || JSON.parse(localStorage.getItem("notes")) || [])
    .slice()
    .sort((a,b) => b.id - a.id);
    // 表示時は常に新しい順にするため、
    // 配列をコピー(.slice())してから
    // idを基準に降順（新しい順）(.sort(b-a))で並び変えている

    // ulに要素を追加するために、まずはulを取得
    noteList.innerHTML = "";

    // forEachを使いliを生成
    // liの中にそれぞれ要素とclassを生成・追加
    savedNotes.forEach(note => {
        // li生成
        const noteLi = document.createElement("li");
        noteLi.classList.add("note-card");

        // savedNotesからtitle付与
        const titleElem = document.createElement("h4");
        titleElem.textContent = note.title;

        // savedNotes作成日時を付与
        const dateElem = document.createElement("span");
        dateElem.classList.add("note-date");
        dateElem.textContent = "作成日時：" + new Date(Number(note.id)).toLocaleString();

        // savedNotesからbody付与
        const bodyElem = document.createElement("p");
        bodyElem.textContent = note.body;

        // savedNotesからtags付与
        const tagsElem = document.createElement("p");
        tagsElem.textContent = "タグ：";

        note.tags.forEach(tag => {
            const tagSpan = document.createElement("span");
            // 表示用
            tagSpan.textContent = tag;
            tagSpan.classList.add("note-tag");
            // 処理用
            // ここでdata-tagを生成
            tagSpan.dataset.tag = tag;

            tagsElem.appendChild(tagSpan);
        });

        // 削除ボタン生成
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";
        
        // savedNotesからid付与
        deleteBtn.classList.add("delete-btn");
        deleteBtn.classList.add("btn");
        deleteBtn.dataset.id = note.id;

        // 削除ボタン処理
        // deleteBtn.addEventListener("click", () =>{
        //     deleteNote(note.id);
        //     renderSavedNotes();
        // });

        noteLi.appendChild(titleElem);
        noteLi.appendChild(dateElem);
        noteLi.appendChild(bodyElem);
        noteLi.appendChild(tagsElem);
        noteLi.appendChild(deleteBtn);
        noteList.appendChild(noteLi);
    });

}

// 表示処理関数 end
// ======================================

// ======================================
// 検索処理関数

searchButton.addEventListener("click", () =>{
    // 選ばれているラジオボタンを取得する
    const selectedRadio = document.querySelector('input[name="search-target"]:checked');

    // selectedRadioが選ばれていたらラジオボタンの値を取得
    // どれもチェックされていなければnull
    // エラー回避のためにnullを入れてある
    const target = selectedRadio ? selectedRadio.value : null;

    // キーワードの取得
    // .trim()で前後の空白削除
    // .toLowerCase()で大文字小文字の区別をなくしている
    const keyword = searchInput.value.trim().toLowerCase();
        if(!target || !keyword){
            renderSavedNotes();
            return;
        }
    // 文字列は扱えないのでオブジェクトに変換
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    
    const filteredNotes = savedNotes.filter(note => {
        if(target === "タイトル"){
            return note.title.toLowerCase().includes(keyword);
        } else if(target === "本文"){
            return note.body.toLowerCase().includes(keyword);
        } else if(target ==="タグ"){
            return note.tags.some(tag => tag.toLowerCase().includes(keyword));
        }
    });
    // console.log(filteredNotes);
    renderSavedNotes(filteredNotes);

    annotation.innerHTML = `※検索結果は下にある「メモ一覧」に表示されます。<br>※${target}「${keyword}」で検索中`;
});
// 検索処理関数 end
// ======================================


// ======================================
// 保存ボタンを押したときの処理関数

saveButton.addEventListener("click", () =>{
    saveLocalStorage();
    renderSavedNotes();
});
// ボタンを押したときの処理関数 end
// ======================================

// ======================================
// 検索結果リセット処理関数
function resetSearchForm(){
    // 検索キーワードリセット
    // inputのvalueを空にしてリセット
    searchInput.value="";

    // ラジオボタン（検索対象）を全て未選択にする
    // ラジオボタンは1個ずつしか触れないため、
    // グループすべてをfalseにする
    const radios = document.querySelectorAll('input[name="search-target"]');
    radios.forEach(radio => {
        radio.checked = false;
    });

    // 検索状態表示を初期文言に戻す
    annotation.textContent = "※検索結果は下にある「メモ一覧」に表示されます。";

    // 検索条件と表示状態をリセットすることで、
    // ユーザーが迷わず初期状態に戻れるようにしている
}



// すべて表示ボタンを押すとリセット処理と、再表示の関数が実行
resetButton.addEventListener("click",() =>{
    // メモ一覧を全て表示
    resetSearchForm();
    renderSavedNotes();
});
// 検索結果リセット処理関数 end
// ======================================

// ======================================
// 削除関数
function deleteNote(targetId){
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    const filteredNotes = savedNotes.filter(note => note.id !== targetId);
    localStorage.setItem("notes",JSON.stringify(filteredNotes));
}
// 削除関数 end
// ======================================

// ======================================
// ulにイベントを付ける


// イベント判定
noteList.addEventListener("click", (e) => {
    // タグがクリックされた場合
    if(e.target.classList.contains("note-tag")){
        // クリックされたタグ名を取得
        const tag = e.target.dataset.tag.toLowerCase();

        // 検索UIと状態を同期
        // （ラジオボタンを"タグ"にして、inputにキーワードを入力させる）
        radioTag.checked = true;
        searchInput.value = tag;

        // 保存済みメモ全体から取得したタグを持つメモだけ抽出
        const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

        const filteredNotes = savedNotes.filter(note => 
            note.tags.some(t => t.toLowerCase() === tag)
        );
        // 新しい順で表示
        renderSavedNotes(filteredNotes);
        // 検索中表示を更新
        annotation.innerHTML = `※検索結果は下にある「メモ一覧」に表示されます。<br>※タグ「${tag}」で検索中`;

    }


    //押されたのが削除ボタンか判断
    if(e.target.classList.contains("delete-btn")){
        const targetId = e.target.dataset.id;

        // 誤操作防止のため、削除前に確認ダイアログを表示
        // キャンセル時は処理を中断する
        const isDelete = confirm("このメモを削除しますか？");
        if(!isDelete) return;
        deleteNote(targetId);
        renderSavedNotes();
    }
});

// 削除ボタンは動的に生成されるため
// 親要素にイベントを1つだけ持たせるイベント委譲を使っている
// 「たぐめも」は検索で再描画、削除で再描画する
// 今後も並び替えやタグ検索も増えることを考慮すると
// DOMが頻繁に入れ替わるアプリのため、イベント委譲はかなり相性がいい
// ulにイベントを付ける end
// ======================================


// ======================================
// ページを開いたときに実行される関数
// 無名関数で書くことで拡張性の確保とエラーの危険性を回避
window.addEventListener("load",() => {
    renderSavedNotes();
});
// ページを開いたときに実行される関数 end
// ======================================