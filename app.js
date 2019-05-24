// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1
  };

  Expense.prototype.percentageCal = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  }

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (currentElement) {
      sum += currentElement.value;
    });
    return data.total[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create New Item
      if (type === 'exp') {
        newItem = new Expense (ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income (ID, des, val);
      }

      //Push New Item to its own array
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var newArr, index;
      newArr = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = newArr.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // 1. Calculate total Incomes and Expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // 2. Calculate budget: Incomes - Expenses
        data.budget = data.total.inc - data.total.exp;

      // 3. Calculate percentage of the Expenses
      if(data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      }

    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (element) {
        element.percentageCal(data.total.inc);
      });
    },

    getPercentage: function () {
      var allPercentage = data.allItems.exp.map(function (element) {
        return element.getPercentage();
      });
      return allPercentage;
    },

    getBudget: function () {
      return {
        budget: (data.budget),
        totalInc: (data.total.inc),
        totalExp: (data.total.exp),
        percentage: (data.percentage)
      }
    },

    test: function () {
      console.log(data);
    }
  };

})();


// UI CONTROLLER
var UIcontroller = (function () {

  var DomStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addButton: '.add__btn',
    incomeList: '.income__list',
    expenseList: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    itemPercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function (num, type) {
    var splitNum, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    splitNum = num.split('.');
    int = splitNum[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = splitNum[1];

    return (type === 'exp' ? '-' : '+') + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for(var i = 0; i< list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getDataInput: function () {
      return {
        type: document.querySelector(DomStrings.inputType).value,
        description: document.querySelector(DomStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DomStrings.inputValue).value)
      };
    },

    getDomStrings: function () {
      return DomStrings;
    },

    addListItem: function (obj, type) {
      var html, newHtml, domElement;
      //Create Html with placeholder text
      if (type === 'inc') {
        domElement = DomStrings.incomeList;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fas fa-trash"></i></button></div></div></div>';
      } else if (type === 'exp') {
        domElement = DomStrings.expenseList;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="fas fa-trash"></i></button></div></div></div>';
      }

      //Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert the Html into the DOM
        document.querySelector(domElement).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectedItem) {
      var element = document.getElementById(selectedItem);
      element.parentNode.removeChild(element);
    },

    //Clear text fields after the input
    clearField: function () {
        var inputFields, inputFieldArr;
        inputFields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);
        inputFieldArr = Array.prototype.slice.call(inputFields);
        inputFieldArr.forEach( function (current, index, array) {
          current.value = '';
        inputFieldArr[0].focus();
        });
    },

    //Display Budget on UI
    displayBudget: function (obj) {
      var type;
      obj.budget >= 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DomStrings.percentageLabel).textContent = '--';
      }
    },

    //Display Percentage of each Item
    displayPercentages: function (percentage) {
      var percentageArray = document.querySelectorAll(DomStrings.itemPercentage);

      nodeListForEach(percentageArray, function (element, index) {
        if (percentage[index] > 0 ) {
          element.textContent = percentage[index] + '%';
        } else {
          element.textContent = '--';
        }
      });
    },

    // Display Date
    displayDate: function () {
      var months, now, month, year;
      months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'Septemper', 'October', 'November', 'December'];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    // Change focus color of inputs based on types
    changeType: function () {
      var fields = document.querySelectorAll(
        DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue
      );

      nodeListForEach(fields, function (currentElement) {
        currentElement.classList.toggle('red-focus');
      });

      document.querySelector(DomStrings.addButton).classList.toggle('red');
    }

  };

})();


//GLOBAL CONTROLLER
var controller = (function (budgetCtrl, UIctrl) {

  var eventListenerHandler = function () {
      // Dom strings passed from UIcontroller module
      var DOM = UIctrl.getDomStrings();
      // addEventListener for mouse click
      document.querySelector(DOM.addButton).addEventListener('click', controlAddItem);
      // addEventListener for keyboard click (Enter key)
      document.addEventListener('keypress', function (event) {
        if (event.keyCode === 13 || event.which === 13) {
          controlAddItem();
        }
      });
      // Delete item
      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      // Change the focus color of the inputs and addButton when it's toggled between Income and Expense
      document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changeType);

  };

  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    console.log(budget);
    UIctrl.displayBudget(budget);

  };

  var updateExpensePercentage = function () {
    // 1. Calculate Percentages
      budgetCtrl.calculatePercentages();
    // 2. Update from BudgetController
    var percentage = budgetCtrl.getPercentage();
    // 3. Update to the UI
    UIctrl.displayPercentages(percentage);
  };

  var controlAddItem = function () {
      var input, newItem;
    // 1. Get the input data
      input = UIctrl.getDataInput();
      if (input.description !== '' && input.value !== NaN && input.value > 0) {
    // 2. Add the item to the BUDGET CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    // 3. Add the item to the UI
      UIctrl.addListItem(newItem, input.type);
    // budgetCtrl.test();

    // 4. Clear the input inputFields
      UIctrl.clearField();

    // 5. Calculate and update budget
      updateBudget();

    // 6.Calculate and update percentages
      updateExpensePercentage();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitId, type, id;
    // console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitId = itemID.split('-');
      type = splitId[0];
      id = parseFloat(splitId[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, id);
      // 2. Update to the UI
      UIctrl.deleteListItem(itemID);
      // 3. Update to Budget
      updateBudget();
      // 4. Update and Calculate Percentages;
      updateExpensePercentage();
    }
  };

  return {
    init: function () {
      console.log('Application has started!');
      var initBudget = {
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      };
      UIctrl.displayBudget(initBudget);
      UIctrl.displayDate();
      eventListenerHandler();

    }
  };

})(budgetController, UIcontroller);

controller.init();
