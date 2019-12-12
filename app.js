//  BudgetController Module
var budgetController = (function () {

    var Expense = function (id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    var Income = function (id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0 ) {
            this.percentage = Math.round ((this.value / totalIncome) * 100 );
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    // This data Object is having all the info about the objects creaeted for income and expenses
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    return {
        addItem : function (type,des,val) {
            var newItem,ID;
            // todo case
            if(data.allItems[type].length === 0) {
                ID = 0;
            }else{
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            // todo id part
            //create a new item
            if(type === 'exp') {
                newItem = new Expense(ID,des,val);
            }else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            
            // updating the data part to have all info
            data.allItems[type].push(newItem);
            // return the newItem
            return newItem;
        },
        deleteItem : function (type,id) {
            var ids,index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);


            if(index !== -1) {
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget : function () {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget - income - expenses

            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of INCOME that we spent 
            if(data.totals.inc > 0 ) {
                data.percentage = Math.round(( data.totals.exp / data.totals.inc ) * 100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentage : function() {

           data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
           });
        },
        getPercentages : function () {
            var allPercentages;
            allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },
        getBudget : function () {
            return {
                budget:data.budget,
                income:data.totals.inc,
                expense:data.totals.exp,
                percentage:data.percentage
            };
        },
        testing : function () {
            console.log(data);
        }
    }

   
})();

// UI module
var UIController = (function () {
    // have all the constants string
    var DOMStrings = {
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputButton:'.add__btn',
        inputKeyPress:'keypress',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        budgetIncome:'.budget__income--value',
        budgetExpense:'.budget__expenses--value',
        budgetExpensePercentage:'.budget__expenses--percentage',
        deleteItemContainer:'.container',
        itemPercentage:'.item__percentage',
        fullYear:'.budget__title--month'
    }
    var formatNumber = function (num,type) {
        var numSplit,numInt,numDec;
        // format + or - 
        // 2 decimal points
        // comma separating the thousands
        num = Math.abs(num);
        // toFixed is method in number prototype
        num = num.toFixed(2);

        numSplit = num.split('.');

        numInt = numSplit[0];
        if(numInt.length > 3) {
            numInt = numInt.substr(0,numInt.length - 3) + ',' + numInt.substr(numInt.length - 3,3);
        }
        numDec = numSplit[1];

        return (type == 'inc' ? '+' : '-') + numInt + '.' + numDec;
         
    };
    var nodeListForEach = function (list,callback) {
        for(var i = 0;i < list.length; i++) {
            callback(list[i],i);
        }
        
    };
    
    // public methods 
    return {
        getInput : function() {
            return {
                type : document.querySelector(DOMStrings.inputType).value,// will be either inc or exp
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value) 
            }
           
        },
        addListItem : function (obj,type) {
            // create html string html tags
            var html,newHtml,element;
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp') {
                element = DOMStrings.expenseContainer;
                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // replace the placeholder with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            // Insert the HTML to the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem : function(selectorId) {
            var element = document.getElementById(selectorId);

            element = element.parentNode.removeChild(element);
        },
        clearFields : function () {
            var fields,fieldArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(element => {
                element.value = "";
            });
            fieldArr[0].focus();
        },
        displayBudget : function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber (obj.budget,type);
            document.querySelector(DOMStrings.budgetIncome).textContent = formatNumber (obj.income,'inc');
            document.querySelector(DOMStrings.budgetExpense).textContent =  formatNumber(obj.expense,'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.budgetExpensePercentage).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.budgetExpensePercentage).textContent = '---';
            }

        },
        displayPercentage : function (percentage) {
            var fields = document.querySelectorAll(DOMStrings.itemPercentage);
           
            nodeListForEach (fields,function(cur,index) {
                if(percentage[index] > 0) {
                    cur.textContent = percentage[index] + '%';
                }else{
                    cur.textContent = '---';
                }
            });
        },
        displayDate : function () {
            var now,year,month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth() + 1;
            date  = now.getDate();
            document.querySelector(DOMStrings.fullYear).textContent = year + '-' +  month + '-' + date;
        },
        changedType : function () {
            var field;
            field = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue);

                nodeListForEach(field,function(cur) {
                    cur.classList.toggle('red-focus');
                });
                document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },
        getDomStrings : function () {
            return DOMStrings;
        }
    };



})();

// App Module
var controller = (function (budgetCtrl,UICtrl) {

    var setUpEventListeners = function () {
        var DOM = UICtrl.getDomStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener(DOM.inputKeyPress,function (event) {
            // event.which is for older browsers
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            } 
        });

        document.querySelector(DOM.deleteItemContainer).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    }
        // update the Budget
     var updateBudget = function  () {
        //4.Calculate the budget
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        //5.Display budget
        UICtrl.displayBudget(budget);
    }
    // update the percentage
    var updatePercentage = function  () {
        //4.Calculate the percentage
            budgetCtrl.calculatePercentage();
        // return the Percentage
      var percentage =   budgetCtrl.getPercentages();
        //5.Display Persentage
        UICtrl.displayPercentage(percentage);
        // console.log(percentage);
    }
        


    var ctrlAddItem = function () {
        var input,newItem;
         // 1. Get input data from input field
        input = UICtrl.getInput();
        // checks if input description and value is having some valid values
        if(input.description !== "" &&  !isNaN(input.value) && input.value > 0) {
                    // 2.Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            // temporary method will remove later
            budgetCtrl.testing();
                //3.Add the item to UI
            UICtrl.addListItem(newItem,input.type);
            // clear the list items
            UICtrl.clearFields();
            // calculate and update the budget
            updateBudget();
            // calculate and update the percentage
            updatePercentage();
        }
    }
    // delete the elements
    var ctrlDeleteItem = function (event) {
        var itemId,splitId,type,id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // if itemId is present
        if(itemId) {
           splitId = itemId.split('-');
           type = splitId[0];  
           id = parseInt(splitId[1]); 
            //delete an item from budget controller
            budgetCtrl.deleteItem(type,id);
            //delete the item for UI
            UICtrl.deleteListItem(itemId);
            // update the budget
            updateBudget();
              // calculate and update the percentage
              updatePercentage();
        }
    }
    // return an object all the methods which are going to be public
    return {
        init : function () {
            console.log('Application is started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget:0,
                income:0,
                expense:0,
                percentage:-1
            });
            setUpEventListeners();
        }
    };
    

})(budgetController,UIController);
// initialization function to start the application
controller.init();