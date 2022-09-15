let input = document.querySelector("#search-input");
let submit = document.querySelector("#search");
let books = document.querySelector(".books");
let results = document.querySelector(".results span");
let booksSection = document.querySelector(".books .container .category");
let bestSellers = document.querySelector(".myBestSwiper .swiper-wrapper");
let itemsCount = document.querySelector(".shop span");
let cartItems = document.querySelector(".all-items .items");
let totalAmount = document.querySelector(".all-items .total-amount span");
let removeAllItems = document.querySelector(".remove-all");
let itemsContent = "";

if (localStorage.itemsCount) {
  document.querySelector(".shop span").innerHTML = localStorage.itemsCount;
}
if (localStorage.itemsContent && cartItems) {
  addItems();
}
if (submit) {
  submit.addEventListener("click", () => {
    handleSearchAndLocalStorage();
  });
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      submit.click();
      handleSearchAndLocalStorage();
    }
  });
}
function handleSearchAndLocalStorage() {
  booksSection.innerHTML = "";
  if (input.value !== "" && input.value !== null) {
    results.innerHTML = input.value;
    getBooks(0);
    setTimeout(() => {
      books.classList.add("active");
      window.scroll(0, 649);
    }, 2000);
    setTimeout(() => {
      let cards = document.querySelectorAll(".cart");
      cards.forEach((card) => {
        card.addEventListener("click", () => {
          document.querySelector(".added").classList.add("active");
          setTimeout(() => {
            document.querySelector(".added").classList.remove("active");
          }, 1000);
          let book = card.parentNode.parentNode;
          let cartItems = localStorage.itemsContent;
          if (cartItems) {
            cartItems = JSON.parse(cartItems);
            let found = itemFound(
              cartItems,
              book.querySelector(".title").textContent
            );
            if (found) {
              cartItems[`book${found}`].count++;
            } else {
              itemsCount.innerHTML++;
              localStorage.setItem("itemsCount", itemsCount.innerHTML);
              cartItems = {
                ...cartItems,
                [`book${localStorage.itemsCount}`]: {
                  title: book.querySelector(".title").textContent,
                  author: book.querySelector(".author").textContent,
                  count: 1,
                  img: book.querySelector("img").src,
                  id: localStorage.itemsCount,
                },
              };
            }
          } else {
            itemsCount.innerHTML++;
            localStorage.setItem("itemsCount", itemsCount.innerHTML);
            cartItems = {
              [`book${localStorage.itemsCount}`]: {
                title: book.querySelector(".title").textContent,
                author: book.querySelector(".author").textContent,
                count: 1,
                img: book.querySelector("img").src,
                id: localStorage.itemsCount,
              },
            };
          }
          localStorage.setItem("itemsContent", JSON.stringify(cartItems));
        });
      });
    }, 3000);
  }
}
function getBooks(startIndex) {
  fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${input.value}&maxResults=40&startIndex=${startIndex}`
  )
    .then((res) => res.json())
    .then((res) => res.items)
    .then((books) => {
      books.forEach((book) => {
        let imgUrl;
        if (book.volumeInfo.imageLinks) {
          imgUrl = book.volumeInfo.imageLinks.thumbnail;
        } else {
          return;
        }
        let item = document.createElement("div");
        item.classList.add("book");
        let imgDiv = document.createElement("div");
        imgDiv.classList.add("img");
        let img = document.createElement("img");
        img.setAttribute("src", imgUrl);
        imgDiv.append(img);
        let link = document.createElement("a");
        link.setAttribute("href", book.volumeInfo.previewLink);
        link.setAttribute("target", "_blank");
        link.append(imgDiv);
        item.appendChild(link);
        let extra = document.createElement("div");
        extra.className = "extra-info";
        let bookTitle = document.createElement("h5");
        bookTitle.classList.add("title");
        bookTitle.textContent = book.volumeInfo.title;
        extra.append(bookTitle);
        let authors = book.volumeInfo.authors;
        let authorName = document.createElement("h5");
        authorName.classList.add("author");
        if (authors) {
          authorName.textContent = authors[0];
        } else {
          authorName.textContent = "NOT FOUND";
        }
        extra.append(authorName);
        let info = document.createElement("div");
        info.className = "info";
        info.appendChild(extra);
        let stars = document.createElement("div");
        stars.className = "stars";
        for (let i = 0; i < 5; i++) {
          let star = document.createElement("i");
          star.classList.add("fa-solid", "fa-star");
          stars.append(star);
        }
        info.append(stars);
        let cart = document.createElement("div");
        cart.className = "cart";
        cart.textContent = "Add To Cart";
        info.append(cart);
        item.append(info);
        booksSection.appendChild(item);
      });
      if(books.length === 40 && startIndex <= 200) {
        getBooks(startIndex+41)
      }
    });
}

function itemFound(cartItems, bookTitle) {
  let found = false;
  let i = 1;
  for (const val of Object.values(cartItems)) {
    if (val.title === bookTitle) {
      found = true;
      break;
    } else {
      i++;
    }
  }
  return found ? i : found;
}

function addItems() {
  cartItems.innerHTML = "";
  let itemsObj = JSON.parse(localStorage.itemsContent);
  for (const [key, obj] of Object.entries(itemsObj)) {
    cartItems.innerHTML += `
            <div class="item">
              <div class="book col">
                <img src="${obj.img}" alt="" />
                <div class="info">
                  <h5>${obj.title}</h5>
                  <h5 class="author"> Author: ${obj.author}</h5>
                </div>
              </div>
              <div class="quantity col" id=${obj.id}>
               <i class="fa-solid fa-circle-arrow-left decrease"></i>
               <h4>${obj.count}</h4>
               <i class="fa-solid fa-circle-arrow-right increase"></i>
              </div> 
              <h4 class="price col">USD $<span>15</span></h4>
              <h4 class="total col">USD $<span>${obj.count * 15}</span></h4>
              <h4 class="remove col"><i class="fa-solid fa-circle-xmark" id=${
                obj.id
              }></i></h4>
              </div>
              <hr>
            `;
    showTotal();
    changeQuantity();
    removeItem();
    removeAll();
  }
}
function changeQuantity() {
  let increases = document.querySelectorAll(".increase");
  let decreases = document.querySelectorAll(".decrease");
  increases.forEach((increase) => {
    increase.addEventListener("click", (e) => {
      let itemsObj = JSON.parse(localStorage.itemsContent);
      let id = e.target.parentElement.id;
      for (const [key, obj] of Object.entries(itemsObj)) {
        if (obj.id == id) {
          itemsObj[key].count++;
          e.target.parentElement.parentElement.querySelector(
            ".total span"
          ).innerHTML = itemsObj[key].count * 15;
        }
      }
      increase.parentElement.querySelector(".quantity h4").innerHTML++;
      localStorage.setItem("itemsContent", JSON.stringify(itemsObj));
      showTotal();
    });
  });
  decreases.forEach((decrease) => {
    decrease.addEventListener("click", (e) => {
      let itemsObj = JSON.parse(localStorage.itemsContent);
      let id = e.target.parentElement.id;
      for (const [key, obj] of Object.entries(itemsObj)) {
        if (obj.id == id) {
          itemsObj[key].count--;
          if (itemsObj[key].count <= 0) {
            itemsObj[key].count = 0;
            decrease.style.cursor = "auto";
          }
          e.target.parentElement.parentElement.querySelector(
            ".total span"
          ).innerHTML = itemsObj[key].count * 15;
          decrease.parentElement.querySelector(".quantity h4").innerHTML =
            itemsObj[key].count;
        }
      }
      showTotal();
      localStorage.setItem("itemsContent", JSON.stringify(itemsObj));
    });
  });
}
function removeItem() {
  let removeIcons = document.querySelectorAll(".remove i");
  removeIcons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      let i = 1;
      let itemsObj = JSON.parse(localStorage.itemsContent);
      let element = e.target.parentElement.parentElement;
      let hr = element.nextElementSibling;
      let id = element.querySelector(".remove i").id;
      element.remove();
      hr.remove();
      for (const [key, obj] of Object.entries(itemsObj)) {
        if (obj.id == id) {
          delete itemsObj[key];
          itemsCount.innerHTML--;
          localStorage.setItem("itemsCount", itemsCount.innerHTML);
        }
      }
      for (const [key, obj] of Object.entries(itemsObj)) {
        itemsObj[key].id = i;
        if (
          document.querySelectorAll(".quantity")[i - 1] &&
          document.querySelectorAll(".remove i")[i - 1]
        ) {
          document.querySelectorAll(".quantity")[i - 1].id = i;
          document.querySelectorAll(".remove i")[i - 1].id = i;
        }
        if (`book${i}` !== key) {
          delete Object.assign(itemsObj, { [`book${i}`]: itemsObj[key] })[key];
        }
        i++;
      }
      localStorage.setItem("itemsContent", JSON.stringify(itemsObj));
      showTotal();
    });
  });
}
function showTotal() {
  let amounts = document.querySelectorAll(".total span");
  let total = 0;
  amounts.forEach((amount) => {
    total += +amount.innerHTML;
  });
  document.querySelector(".total-amount span").innerHTML = total;
}
function removeAll() {
  removeAllItems.addEventListener("click", () => {
    cartItems.remove();
    showTotal();
    localStorage.clear();
  });
}
// loader
function loader() {
  let loaderContainer = document.querySelector(".loader-container");
  if (loaderContainer) {
    loaderContainer.classList.add("active");
  }
}
function fadeOut() {
  setTimeout(loader, 3000);
}
fadeOut();
