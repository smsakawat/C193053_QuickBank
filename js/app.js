'use strict';

// Navigate to home page
document.getElementById('home_btn').addEventListener('click', function () {
  console.log('clicked');
  window.location.href = './index.html';
});

// Bank Data
const account1 = {
  owner: 'Sakawat Hossain',
  movements: [200, 455.23, -306.5, 25000],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2024-05-12T13:15:33.035Z',
    '2024-05-17T09:48:16.867Z',
    '2024-06-01T06:04:23.907Z',
    '2024-06-05T14:18:46.235Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account2 = {
  owner: 'James Cameron',
  movements: [5000, 3400, -150, -790],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2024-05-17T13:15:33.035Z',
    '2024-05-30T09:48:16.867Z',
    '2024-06-06T06:04:23.907Z',
    '2024-06-12T14:18:46.235Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// All Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// State variables
let currentUser, timer;

// Creating username
const createUserName = accounts => {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(n => n[0])
      .join('');
  });
};
createUserName(accounts);

// Displaying balance
const displayBalance = user => {
  labelBalance.textContent = `${user.movements
    .reduce((acc, move) => acc + move, 0)
    .toFixed(2)}$`;
};

// Displaying movements or transactions
const displayMovements = (user, sort = false) => {
  containerMovements.innerHTML = '';

  const movements = sort
    ? user.movements.slice().sort((a, b) => a - b)
    : user.movements;
  movements.forEach((move, i) => {
    // Calculating date of movement
    const now = new Date(user.movementsDates[i]);
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();

    const moveDate = `${day}/${month}/${year}`;

    const moveType = move > 0 ? 'deposit' : 'withdrawal';
    const moveRowHtml = `
  <div class="movements__row">
    <div class="movements__type movements__type--${moveType}">${
      i + 1
    } ${moveType}</div>
    <div class="movements__date">${moveDate}</div>
    <div class="movements__value">${move.toFixed(2)}$</div>
  </div>
  `;
    containerMovements.insertAdjacentHTML('afterbegin', moveRowHtml);
  });
};

// Displaying summary
const displaySummary = user => {
  labelSumIn.textContent = user.movements
    .filter(move => move > 0)
    .reduce((acc, move) => acc + move, 0)
    .toFixed(2);
  labelSumOut.textContent = Math.abs(
    user.movements
      .filter(move => move < 0)
      .reduce((acc, move) => acc + move, 0)
      .toFixed(2)
  );
  labelSumInterest.textContent = user.movements
    .filter(move => move > 0)
    .map(deposit => deposit * (user.interestRate / 100))
    .filter(interest => interest > 1)
    .reduce((acc, interest, i, arr) => {
      // console.log(arr);
      return acc + interest;
    }, 0)
    .toFixed(2);
};

// Updating UI
const updateUI = user => {
  //Display balance
  displayBalance(user);

  // Displaying movements
  displayMovements(user);

  // Display summary
  displaySummary(user);
};

// Log out timer count down
const logOutTimer = () => {
  // Setting the time and showing the time
  let countDown = 600;

  const clock = function () {
    const min = String(Math.floor(countDown / 60)).padStart(2, 0);
    const sec = String(countDown % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    // Stop timer
    if (countDown === 0) {
      clearInterval(timer);
      containerApp.style.opacity = '0';
      labelWelcome.textContent = `Login to get started`;
    }
    countDown--;
  };
  clock();

  const timer = setInterval(clock, 1000);
  return timer;
};

// Logging in User
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  const inputName = inputLoginUsername.value;
  const inputPin = Number(inputLoginPin.value);

  currentUser = accounts.find(acc => acc.username === inputName);
  if (currentUser.pin === inputPin) {
    // Displaying UI
    containerApp.style.opacity = '1';
    inputLoginUsername.value = inputLoginPin.value = '';
    labelWelcome.textContent = `Welcome, ${currentUser.owner.split(' ')[0]}`;

    // Updating the UI after user logged in
    updateUI(currentUser);

    // Starting timer
    if (timer) clearInterval(timer);
    timer = logOutTimer();
  } else {
    alert('Wrong credentials');
  }
});

// Transferring money
const transferMoneyHandler = e => {
  e.preventDefault();
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const totalBalance = currentUser.movements.reduce(
    (acc, move) => acc + move,
    0
  );
  const transferAmount = +inputTransferAmount.value;

  if (
    receiverAccount &&
    transferAmount > 0 &&
    receiverAccount.username !== currentUser.username &&
    totalBalance >= transferAmount
  ) {
    // Adding movements
    receiverAccount.movements.push(transferAmount);
    currentUser.movements.push(-transferAmount);

    // Adding date
    receiverAccount.movementsDates.push(new Date().toISOString());
    currentUser.movementsDates.push(new Date().toISOString());

    // Updating UI transfer operation
    updateUI(currentUser);

    // Starting timer
    clearInterval(timer);
    timer = logOutTimer();
  } else {
    alert('Please provide correct input');
  }

  inputTransferAmount.value = inputTransferTo.value = '';
};
btnTransfer.addEventListener('click', transferMoneyHandler);

// Requesting loan
const requestLoanHandler = e => {
  e.preventDefault();
  const loanAmount = +inputLoanAmount.value;

  // Updating movements and UI
  currentUser.movements
    .filter(move => move > 0)
    .some(deposit => deposit > loanAmount * 0.1) &&
    currentUser.movements.push(loanAmount) &&
    currentUser.movementsDates.push(new Date().toISOString()) &&
    updateUI(currentUser);

  // Starting new timer
  if (
    currentUser.movements
      .filter(move => move > 0)
      .some(deposit => deposit > loanAmount * 0.1) &&
    currentUser.movements.push(loanAmount) &&
    currentUser.movementsDates.push(new Date().toISOString())
  ) {
    clearInterval(timer);
    timer = logOutTimer();
  }
  inputLoanAmount.value = '';
};
btnLoan.addEventListener('click', requestLoanHandler);

// Closing account
const closeAccountHandler = e => {
  e.preventDefault();
  const inputUserName = inputCloseUsername.value;
  const inputUserPin = +inputClosePin.value;
  //check credentials
  if (
    currentUser.username === inputUserName &&
    currentUser.pin === inputUserPin
  ) {
    //delete account
    const userPosition = accounts.findIndex(
      acc => acc.username === inputUserName
    );
    accounts.splice(userPosition, 1);

    //hide UI
    // labelWelcome.textContent = `Log in to get started`;
    containerApp.style.opacity = '0';
    window.location.href = 'index.html';

    //logout time expires
  } else {
    alert('Wrong credentials');
  }

  inputCloseUsername.value = inputClosePin.value = '';
};
btnClose.addEventListener('click', closeAccountHandler);

let sorted = false;
// Sorting movements
const moveSortHandler = () => {
  displayMovements(currentUser, !sorted);
  sorted = !sorted;
  btnSort.blur(); //removing focus state
};
btnSort.addEventListener('click', moveSortHandler);
