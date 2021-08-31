'use strict';

// Data
const accounts = [
  {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
  
    movementsDates: [
      '2019-11-18T21:31:17.178Z',
      '2019-12-23T07:42:02.383Z',
      '2020-01-28T09:15:04.904Z',
      '2020-04-01T10:17:24.185Z',
      '2020-05-08T14:11:59.604Z',
      '2021-08-27T17:01:17.194Z',
      '2021-08-29T23:36:17.929Z',
      '2021-08-31T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'en-GB', // de-DE
  }, 
  {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  }
];

// Elements
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
const btnTheme = document.querySelector('.theme');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////

const changeTheme = theme => {
  if (theme) {
    DarkReader.setFetchMethod(window.fetch)
    DarkReader.enable({
      brightness: 100,
      contrast: 90,
      sepia: 10
  });
    btnTheme.textContent = 'Light mode';
  } else{
    DarkReader.disable();
    btnTheme.textContent = 'Dark mode';
  }
}

const formatCur = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
}

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) => 
    Math.round(Math.abs(date2 - date1) / (1000*60*60*24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  } 
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = formatCur(
    account.balance, account.locale, account.currency
  );
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements.reduce((acc, mov) => {
    return mov > 0 ? acc + mov : acc;
  }, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements.reduce((acc, mov) => {
    return mov < 0 ? acc + mov : acc;
  }, 0);
  labelSumOut.textContent = formatCur(Math.abs(outcomes), acc.locale, acc.currency);

  const interest = acc.movements.reduce((acc, mov) => {
    if (mov > 0) {
      const int = mov * 1.2/100;
      if (int >= 1) return acc + int;
    }
    return acc; 
  }, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
}

const createUsernames = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

createUsernames(accounts);

const updateUI = (acc) => {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
}

const startLogoutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    
    if (!time) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started'
      containerApp.style.opacity = 0;
    }

    time--
  }
  // set time to 5 minutes
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

// EVENT HANDLERS
let currentAccount, timer;

// Login
btnLogin.addEventListener('click', (event) => {
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value 
  );
  // optional chaining, checks if currentAccount exists
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time

    // Internationalization API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long', //2-digit, numeric
      year: 'numeric',
      weekday: 'long' // short
    }
    //const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale, options).format(now
    );


    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    //labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear inputLoanAmount.value = ''; fields
    inputLoginUsername.value = inputLoginPin.value = '';
    // makes inputLoanAmount.value = ''; loose focus on login
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    updateUI(currentAccount)
  }
})

// Transfer
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (amount > 0 && 
      receiver &&
      amount <= currentAccount.balance &&
      // does receiver exists ?, if it does check statement
      receiver?.username !== currentAccount.username) {
        currentAccount.movements.push(-amount);
        receiver.movements.push(amount);

        // Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        receiver.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);

        // Reset timer
        clearInterval(timer);
        timer = startLogoutTimer();
  }
})

// Loan
btnLoan.addEventListener('click', event=> {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(
    mov => mov >= amount * 0.1
  )){
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      // Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2000);  
  }
  inputLoanAmount.value = '';
})

// Close account
btnClose.addEventListener('click', event => {
  event.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ){
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // Delete acc
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
})

// Sort
let sorted = false;
btnSort.addEventListener('click', event => {
  event.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
})

// Theme
let dark = false;
btnTheme.addEventListener('click', event => {
  event.preventDefault();
  changeTheme(!dark);
  dark = !dark;
})




















// const deposits = movements.filter(mov => mov > 0);
// const withdrawals = movements.filter(mov => mov < 0);

// mov is every element of the array, acc is the value we
// eventually return to the max
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov -> acc = mov
//   else return mov;
//   if we dont provide initial value, it will be value of 1st element
//   and iteration will start from the 2nd element
// }, movements[0]);

// 1st parameter is accumulator -> snowball
// 0 -> starting value of accumulator

// const arr = [5, 2, 4, 1, 15, 8, 3];
// const calcAge = arr => {
//   const filteredAges = arr.map(age => {
//       return age <= 2 ? age * 2 : 16 + age * 4;
//   })
//   .filter(age => age >= 18)
//   const sumAges = filteredAges.reduce(
//     (acc, mov, i, array) => acc + mov / array.length, 0);
//   return sumAges;
// };
// console.log(calcAge(arr));

// const calcAge = arr => {
//   const avgAge = arr.reduce((acc, mov, i, array) => {
//     const age = mov <= 2 ? mov * 2 : 16 + mov * 4;
//     if (age >= 18) {
//       return acc + age / (array.length - 2); 
//     }
//     return acc;
//   }, 0)
//   return avgAge;
// }

// console.log(calcAge([5, 2, 4, 1, 15, 8, 3]));



  // const incomes = account.movements
  //   .filter(mov => mov > 0)
  //   .reduce((acc, mov) => acc + mov, 0)
  // labelSumIn.textContent = `${incomes}€`

  // const outcomes = account.movements
  //   .filter(mov => mov < 0)
  //   .reduce((acc, mov) => acc + mov, 0)
  // labelSumOut.textContent = `${Math.abs(outcomes)}€`

  // const interest = account.movements
  //   .filter(mov => mov > 0)
  //   .map(deposit => deposit * account.interestRate/100)
  //   .filter(int => int >= 1)
  //   .reduce((acc, int) => acc + int, 0);
  // labelSumInterest.textContent = `${interest}€`

// console.log(incomes, outcomes, interest);

// const interest = movements
//     .filter(mov => mov > 0)
//     .map(deposit => deposit * 1.2/100)
//     .filter(int => int >= 1)
//     .reduce((acc, int) => acc + int, 0);


// 1st element that satis the condition
// const _find = movements.find(mov => mov < 0);
// console.log(_find);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

// for (const account of accounts) {
//   if (account.owner === 'Jessica Davis') console.log(account);
// }


// CODING CHALLENGE #4
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] }
// ];

// // 1
// dogs.forEach(dog => {
//   dog.recommendedFood = ((dog.weight ** 0.75 * 28)).toFixed(2);
// })

// // 2
// const dog = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(dog.curFood > dog.recommendedFood ? 'to much' : 'to litle');

// // 3
// const ownersEatTooMuch = dogs.filter(
//   dog => dog.curFood > dog.recommendedFood
// ).map(dog => dog.owners);
// console.log(ownersEatTooMuch);
// // OR
// const reduceOwnerEatTooMuch = dogs.reduce((prev, curr) => {
//   if (curr.curFood > curr.recommendedFood) {
//     prev.push(...curr.owners);
//   }
//   return prev;
// }, []);
// console.log(reduceOwnerEatTooMuch);

// // 5 & 6
// const exactly = dogs.some(e => {
//   e.curFood > (e.recommendedFood * 0.9) &&
//   e.curFood > (e.recommendedFood * 1.1)
// });
// console.log(exactly);
// console.log(dogs);

// Date
// const now = new Date();
// console.log(now);

// console.log(new Date('Aug 30 2021 19:38:13'));

// console.log(accounts[0].movementsDates[0]);

// console.log(new Date(2037, 10, 19, 15, 23, 5));

// console.log(new Date(0));

// const date = new Date(2037, 10, 19, 15, 23);
// console.log(date);
// console.log(date.getFullYear()); //getMonth, getDate, getDay ...
// console.log(date.toISOString());
// date.setFullYear(2040); //setMonth ...

// const future = new Date(2037, 10, 19, 15, 23);
// //converts date obj to number
// console.log(+future);

// const daysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000*60*60*24);

// const days1 = daysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24))

// console.log(days1);

// const num = 3884764.23;

// const options = {
//   style: 'unit',
//   unit: 'mile-per-hour',
//   currency: 'EUR'
// }

// console.log(new Intl.NumberFormat('en-US', options).format(num));
// // returnds 3,884,764.23 mph

// console.log(new Intl.NumberFormat('de-DE', options).format(num));
// // returnds 3.884.764,23 mi/h


// const ingredients = ['cheese', 'pepperoni']
// const pizza = setTimeout((ing1, ing2) => 
//   console.log(
//     `Here is your pizza with ${ing1} and ${ing2} !`), 
//     3000, 
//     ...ingredients
//   )
// ;

// // cancels the call of callback function
// if(ingredients.includes('cheese')) clearTimeout(pizza);

// creates loop
// setInterval(() => {
//   const now = new Date();
//   console.log(now);
// }, 1000);