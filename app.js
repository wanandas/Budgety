// BUDGET Controller
var budgetController = (function() {

    var Expense = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
    };

    var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    };


    var calculateTotal = function(type){
        var sum  = 0 
        data.allitem[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allitem : {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1
    };

    return {
        additem : function(type, des, val){
            var newItem,ID;
            
            // Create new ID
            if(data.allitem[type].length > 0){
                ID = data.allitem[type][data.allitem[type].length - 1].id + 1; 
            } else {
                ID = 0
            }

            // Create new Item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allitem[type].push(newItem);

            // Return the new element
            return newItem;

        },

        deleteItem : function(type, id){
            var ids, index;
            // id = 6 
            //data.alltiems[type][id];
            //ids = [1 2 4 6 8]
            //index = 3
            
            ids = data.allitem[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allitem[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the Budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0) {            
                data.percentage = Math.round((data.totals.exp / data.totals.inc)* 100);
            } else{ 
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return { 
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }


    };

})();


// UI Controller
var UIController = (function() {

    var DOMstrings ={ 
        inputType : '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabal:'.budget__income--value',
        expensesLabal:'.budget__expenses--value',
        percentageLabal:'.budget__expenses--percentage',
        container: '.container'
    };

    return {
        getInput:function() { 
            return { 
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value, // 
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };      
        },
        getDOMString : function() {
            return DOMstrings;
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }        

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function() {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index, Array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabal).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabal).textContent = obj.totalExp;

            if(obj > 0  ){
                document.querySelector(DOMstrings.percentageLabal).textContent = obj.percentage;
            } else { 
                document.querySelector(DOMstrings.percentageLabal).textContent = '---';

            }

        }
    }
     
})();




// GLOBAL App Controller
var controller = (function(budgeCtrl, UICtrl){

    var setupEventListener = function() {
        
        var DOM = UICtrl.getDOMString();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event) {  
            if (event.keycode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleleItem);

    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgeCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgeCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;

         // 1. Get the field input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){ 
        // 2. Add the item to the budget controller
        newItem =  budgeCtrl.additem(input.type, input.description, input.value);
        
        // 3. Add the item to the UI 
        UICtrl.addListItem(newItem, input.type);

        // 4. clear the fields
        UICtrl.clearFields();

        // 5. Calculate and update budget
        updateBudget();

        }       
    };

    var ctrlDeleleItem = function(event){
        var itemID, splitID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgeCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show the new Budget
            updateBudget();

        }
        

    };
     
    return {
        init: function() {
            console.log('Apprication Start!');
            UICtrl.displayBudget({ 
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
    };
 

  

})(budgetController, UIController);

controller.init();




