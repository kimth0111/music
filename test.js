class PlayList {
  constructor(data) {
    this.name = data.name;
    this.option = data.option;
    this.musicList = data.musicList;
    this.currentIndex = 0;
    this.audio = document.querySelector("audio");
    this.playing = false;
    this.id = data.id;
  }
  draw() {
    const container = document.querySelector(".playlist-container");
    container.querySelector(".current-name span").textContent = this.name;
    const listContainer = container.querySelector(".music-list");
    listContainer.innerHTML = "";

    this.musicList.forEach((name, index) => {
      const div = document.createElement("div");
      div.classList = "list-group-item";
      div.innerHTML = `<div class="row g-2 align-items-center">
                        <div class="col-auto fs-3">${index + 1}</div>
                        <div class="col-auto">
                          <img src="./dist/img/music.jpg" class="rounded" alt="music" width="40" height="40" />
                        </div>
                        <div class="col">${name}</div>
                        <div class="col-auto text-muted ms-auto">03:41</div>
                      </div>`;
      listContainer.append(div);
    });
    const div = document.createElement("div");
    div.classList = "list-group-item";
    listContainer.append(div);
    container.querySelector(".play-btn-container").style.display = "flex";
  }
  changeOption(option, change) {
    if (this.option.list && this.option.list.includes(change)) this.option[option] = change;
  }

  changeList(musicNames) {
    this.musicList = musicNames;
  }
  add(musicNames) {
    musicNames.forEach((musicName) => {
      this.musicList.push(musicName);
    });
  }
  delete(musicName) {
    for (let i = 0; i < this.musicLength; i++) {
      if (this.musicList[i] === musicName) this.musicList.splice(i--, 1);
    }
  }
  save() {
    musicData.playList[this.id] = {
      name: this.name,
      id: this.id,
      musicList: this.musicList,
      option: this.option,
    };

    localStorage.setItem("music-data", JSON.stringify(musicData));
    document.querySelector(".playlist-dropdown").innerHTML = "";
    Object.values(musicData.playList).forEach((el) => {
      const a = document.createElement("a");
      a.classList = "dropdown-item";
      a.textContent = el.name;
      a.addEventListener("click", () => {
        console.log(el);
        currentPlayList = new PlayList(el);
        currentPlayList.draw();
      });
      document.querySelector(".playlist-dropdown").append(a);
    });
  }
  play() {
    currentMusic = new Music(this);
    currentMusic.init();
  }
  changeName(name) {
    this.name = name;
  }
}

class Music {
  constructor(data) {
    this.musicList = data.musicList;
    this.name = data.name;
    this.option = data.option;
    this.musicList = data.musicList;
    this.currentIndex = 0;
    this.audio = document.querySelector("audio");
    this.playing = false;
    this.errorList = [];
  }
  get musicLength() {
    return this.musicList.length;
  }
  init() {
    this.draw();
    this.start();
  }
  draw() {
    const container = document.querySelector(".playing-list-container");
    container.querySelector(".playlist-name").textContent = this.name;
    container.querySelector(".music-name").textContent = this.musicList[this.currentIndex];

    const musicListHtml = container.querySelector(".playing-list");
    musicListHtml.innerHTML = "";

    let toScroll;
    this.musicList.forEach((name, index) => {
      const div = document.createElement("div");
      div.classList = "list-group-item";
      div.innerHTML = `
              <div>
                <span>${name}</span>
              </div>
      `;
      if (index == this.currentIndex) {
        div.classList.add("selected");
        toScroll = { div, index };
      }
      musicListHtml.append(div);
    });
    console.log(toScroll);

    musicListHtml.scrollTo(0, toScroll.div.offsetHeight * toScroll.index);
  }
  start() {
    this.playing = true;
    this.audio.querySelector("source").src = "audio/" + this.musicList[this.currentIndex];
    this.audio.load();
    this.play();
    this.draw();
  }
  play() {
    this.audio.play();
  }
  end() {
    if (this.option.isShuffle) {
      // Math.random(0,)
    } else {
      this.next();
    }
  }
  stop() {
    this.playing = false;
    this.audio.pause();
  }
  next() {
    this.currentIndex++;
    console.log(this.currentIndex, this.musicLength);
    if (this.currentIndex >= this.musicLength) {
      this.currentIndex = 0;
    }
    this.start();
  }
  prev() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.playingListLength - 1;
    }
    this.start();
  }
  error() {
    if (!this.errorList.includes(this.currentIndex)) this.errorList.push(this.currentIndex);
    if (this.errorList.length >= this.musicLength) return;

    this.next();
  }
}

let currentPlayList;
let currentMusic;

let musicData = JSON.parse(localStorage.getItem("music-data")) || {
  option: {
    startVolume: 0.1,
    loopStyle: "all",
  },
  currentId: 0,
  playList: {},
  musicListAll: [],
};

if (musicData.playList) {
  drawPlaylistDropdown();
}

window.onload = () => {
  document.querySelector(".prev-btn").addEventListener("click", () => {
    if (!currentMusic) return;
    currentMusic.prev();
  });
  document.querySelector(".next-btn").addEventListener("click", () => {
    if (!currentMusic) return;
    currentMusic.next();
  });
  document.querySelector(".stop-btn").addEventListener("click", () => {
    if (!currentMusic) return;
    if (currentMusic.playing) currentMusic.stop();
    else currentMusic.play();
  });

  document.querySelector(".play-btn").addEventListener("click", () => {
    currentPlayList.play();
  });
  document.querySelector(".save-btn").addEventListener("click", () => {
    currentPlayList.save();
  });

  document.querySelector("audio").addEventListener("ended", () => {
    currentMusic.next();
  });

  document.querySelector(".music-selector-form").addEventListener("submit", (el) => {
    el.preventDefault();
    const selectedMusics = [];
    musicData.musicListAll.forEach((name) => {
      if (el.target[name] && el.target[name].checked) {
        selectedMusics.push(name);
      }
    });
    currentPlayList.changeList(selectedMusics);
    currentPlayList.changeName(el.target.name.value);
    console.log(el.target.name.value);

    currentPlayList.draw();
  });

  document.querySelector(".view-btn").addEventListener("click", () => {
    const container = document.querySelector("#modal-all-list");
    const ul = container.querySelector(".music-select-list");
    ul.innerHTML = "";
    musicData.musicListAll.forEach((name) => {
      const label = document.createElement("label");
      label.class = "form-selectgroup-item flex-fill";
      label.innerHTML = `
                                
                                <div class="form-selectgroup-label d-flex align-items-center p-3">
                                  <div class="form-selectgroup-label-content d-flex align-items-center">
                                    <div>
                                      <div class="font-weight-medium">${name}</div>
                                    </div>
                                  </div>
                                </div>
      `;
      ul.append(label);
    });
  });
  document.querySelector(".create-btn").addEventListener("click", () => {
    currentPlayList = new PlayList({
      name: "재생목록1",
      musicList: [],
      option: {
        ...musicData.option,
      },
      id: musicData.currentId++,
    });

    drawMusicSelector();
  });
  document.querySelector(".add-btn").addEventListener("click", () => {
    drawMusicSelector();
  });
}; //승연이 종문썜

function drawMusicSelector() {
  const container = document.querySelector("#modal-selector");
  const ul = container.querySelector(".music-select-list");
  ul.innerHTML = "";
  musicData.musicListAll.forEach((name) => {
    const label = document.createElement("label");
    label.class = "form-selectgroup-item flex-fill";
    label.innerHTML = `
                                <input type="checkbox" name="${name}" class="form-selectgroup-input" style="display:none">
                                <div class="form-selectgroup-label d-flex align-items-center p-3">
                                  <div class="me-3">
                                    <span class="form-selectgroup-check"></span>
                                  </div>
                                  <div class="form-selectgroup-label-content d-flex align-items-center">
                                    <div>
                                      <div class="font-weight-medium">${name}</div>
                                    </div>
                                  </div>
                                </div>
      `;

    if (currentPlayList.musicList.includes(name)) label.querySelector("input").checked = true;
    if (currentPlayList) container.querySelector(".form-playlist-name").value = currentPlayList.name;
    ul.append(label);
  });
}

function drawPlaylistDropdown() {
  document.querySelector(".playlist-dropdown").innerHTML = "";
  Object.values(musicData.playList).forEach((el) => {
    const a = document.createElement("a");
    a.classList = "dropdown-item";
    a.textContent = el.name;
    a.addEventListener("click", () => {
      console.log(el);
      currentPlayList = new PlayList(el);
      currentPlayList.draw();
    });
    document.querySelector(".playlist-dropdown").append(a);
  });
}

const input = document.querySelector("#file-input");

const list = [];
input.addEventListener("change", showTextFile);
function showTextFile() {
  const selectedFiles = input.files;
  console.log(input.files);
  console.log("hihihihi");
  console.log(input);

  Object.keys(selectedFiles).forEach((index) => {
    list.push(selectedFiles[index].name);
  });

  musicData.musicListAll = list;
  console.log(list);
  localStorage.setItem("music-data", JSON.stringify(musicData));
}

document.querySelector("source").addEventListener("error", () => {
  currentMusic.error();
});
