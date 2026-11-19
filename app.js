// Элементы UI
const btnMenu = document.getElementById('btnMenu');
const bottomSheet = document.getElementById('bottomSheet');
const backdrop = document.getElementById('backdrop');
const userAvatar = document.getElementById('userAvatar');

// Открытие нижнего меню
btnMenu.addEventListener('click', () => {
  bottomSheet.classList.add('active');
  backdrop.classList.add('active');
});

// Закрытие меню при клике на затемнение
backdrop.addEventListener('click', closeMenu);

function closeMenu() {
  bottomSheet.classList.remove('active');
  backdrop.classList.remove('active');
}

// Пример логики для аватарки:
// Когда прикрутим Firebase, будем проверять user:
function updateHeaderAvatar(user) {
  if (user && user.photoURL) {
    userAvatar.src = user.photoURL;
  } else {
    userAvatar.src = 'icons/stock.png';
  }
}