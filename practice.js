var BudgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Current Type refers to which type is currently used, so it can be expense.value or income.value from above
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (currentType) {
            sum = sum + currentType.value;
        });
        // This updates the totals to the new sum in the next lines
        data.totals[type] = sum;
    };

    // Storing the Data
    var data = {
        allItems: {
            inc: [],
            exp: [],
        },
        totals: {
            inc: 0,
            exp: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, description, value) {
            var newItem, ID;

            // the if statements makes ID = 0, or else it would be -1 at no arrays
            if (data.allItems[type].length > 0) {
                // Create New ID
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on EXP OR INC type
            if (type === "exp") {
                newItem = new Expense(ID, description, value);
            } else if (type === "inc") {
                newItem = new Income(ID, description, value);
            }
            // Add new  item into the array
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calculateTotal("exp");
            calculateTotal("inc");

            // Calculate the budget: Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income spent

            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercent = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercent;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function () {
            console.log(data);
        },
    };
})();

var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };

    var formatNumber = function (number, type) {
        var numberSplit, integer, dec, type;

        // Absolute Number (Take away +/- sign)
        number = Math.abs(number);
        // Rounds numbers to 2 decimals
        number = number.toFixed(2);

        numberSplit = number.split(".");

        integer = numberSplit[0];
        if (integer.length > 3) {
            integer =
                integer.substr(0, integer.length - 3) +
                "," +
                integer.substr(integer.length - 3, 3);
        }

        dec = numberSplit[1];

        return (type === "exp" ? "-" : "+") + " " + integer + "." + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // Make it Public by putting it in a return
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc = income or exp = expense
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

        addListItem: function (newItem, type) {
            var html, newHtml, element;

            // Create a HTML String

            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with actual Data
            newHtml = html.replace("%id%", newItem.id);
            newHtml = newHtml.replace("%description%", newItem.description);
            newHtml = newHtml.replace(
                "%value%",
                formatNumber(newItem.value, type)
            );

            // Insert the HTML into the DOM (newHTML has the new replaced functions )
            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // Clear the fields after pressing enter
        clearFields: function () {
            var fields, fieldsArray;
            // .querySelectorAll returns node list, we need to change this into an array
            fields = document.querySelectorAll(
                DOMstrings.inputDescription + ", " + DOMstrings.inputValue
            );

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function (getBudget) {
            var type;
            getBudget.budget > 0 ? (type = "inc") : (type = "exp");

            document.querySelector(
                DOMstrings.budgetLabel
            ).textContent = formatNumber(getBudget.budget, type);
            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(getBudget.totalInc, "inc");
            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(getBudget.totalExp, "exp");

            if (getBudget.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    getBudget.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    "---";
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(
                DOMstrings.expensesPercentageLabel
            );
            // HTML TREES create a NODELIST (expensesPercentageLabel)

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        // Displaying the Month
        displayMonth: function () {
            var now, year, month, months;

            now = new Date();

            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =
                months[month] + " " + year;
        },

        // Making the tabs  red when selected  in  EXP
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType +
                    "," +
                    DOMstrings.inputDescription +
                    "," +
                    DOMstrings.inputValue
            );

            nodeListForEach(fields, function (current) {
                current.classList.toggle("red-focus");
            });
            // It will toggle red on  and off every time you change +/-
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        // Make DOM strings public by returning it so that you can use in Controller
        controllerDOMstrings: function () {
            return DOMstrings;
        },
    };
})();

var controller = (function (bController, uController) {
    var setupEventListeners = function () {
        // Retrieve DOM strings from UIController
        var DOM = uController.controllerDOMstrings();

        document
            .querySelector(DOM.inputBtn)
            .addEventListener("click", ctrlAddItem);

        // Make the Enter Key responsive to the page :
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener("change", uController.changedType);
    };

    // Main Function(s) ***

    var updateBudget = function () {
        // 1. Calculate the Budget
        bController.calculateBudget();

        // 2. Return the budget
        var budget = bController.getBudget();

        // 3.Display the budget
        uController.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. Calculate Percentages
        bController.calculatePercentages();

        // 2. Read Percentages from bController
        var percentages = bController.getPercentages();

        // 3.
        uController.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        input = uController.getInput();
        console.log(input);

        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // 2. Get item to the budget controller
            newItem = bController.addItem(
                input.type,
                input.description,
                input.value
            );
            console.log(newItem);

            // 3. Add thew item to the UI
            uController.addListItem(newItem, input.type);

            // 4.  Clear fields
            uController.clearFields();

            // 5.Update The Budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        // Makes the delete x button target into the ID parent
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //inc-1
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            bController.deleteItem(type, ID);

            // 2. Delete the item from the UI
            uController.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("Application has started");
            uController.displayMonth();
            uController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: "-1",
            });
            setupEventListeners();
        },
    };
})(BudgetController, UIController);

controller.init();
