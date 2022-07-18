const express = require('express');
const pizza_app = express();
const bodyParser = require('body-parser');

pizza_app.set('view engine', 'hbs');
pizza_app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 8000;

var pizzaOptions = [{
    "size": {
        "Small": 5,
        "Medium": 10,
        "Large": 15,
        "X-Large": 20,
        "Party": 25
    },

    "width": {
        "Thin": 3,
        "Medium": 4,
        "Thick": 5
    },

    "sort": {
        "Diced Mango": 2,
        "Artichokes": 1,
        "Broccoli": 2,
        "Caramelized onions": 2,
        "Fire roasted red peppers": 2,
        "Fresh mushrooms": 3,
        "Green peppers": 2,
        "Spinach": 1,
        "Grilled zucchini": 1,
        "Hot banana peppers": 2,
        "Steak strips": 3,
        "Pineapple": 1
    }
}];

var pizzaOptionsSizes;
var pizzaOptionsWidths;
var pizzaOptionsSorts;

const reducer = (accumulator, currentValue) => accumulator + currentValue;
sum1 = function(allValues, totalReturn, qty) {
    totalReturn = (allValues.reduce(reducer)) * qty;
    return totalReturn;
}

taxesCalculator = function(sum1) {
    sum1 = (sum1 * 0.07).toFixed(2);
    sum1 = parseFloat(sum1);
    return sum1;
}

totalCalculator = function(sum1, Totaltaxes, totalValue) {
    totalValue = sum1 + Totaltaxes;
    return totalValue;
}

if (pizzaOptions !== undefined) {
    if (pizzaOptions.length > 0) {
        pizzaOptions.forEach((types) => {
            pizzaOptionsSizes = types.size;
            pizzaOptionsWidths = types.width;
            pizzaOptionsSorts = types.sort;
        });
    }
}

const pizzaOptionsSize = Object.keys(pizzaOptionsSizes);
const pizzaOptionsSizePrice = Object.values(pizzaOptionsSizes);
const pizzaOptionsWidth = Object.keys(pizzaOptionsWidths);
const pizzaOptionsWidthPrice = Object.values(pizzaOptionsWidths);
const pizzaOptionsSort = Object.keys(pizzaOptionsSorts)
const pizzaOptionsSortPrice = Object.values(pizzaOptionsSorts)

pizza_app.get('/', (req, res) => {
    let pOpSize = pizzaOptionsSize;
    let pOpWidth = pizzaOptionsWidth;
    let pOpSorts = pizzaOptionsSort;
    res.render('index', { pOpSize: pOpSize, pOpWidth: pOpWidth, pOpSorts: pOpSorts });
});

let firstName = "",
    lastName = "",
    quantity = 1,
    sorts = [],
    size = "",
    width = "",
    phone, address = "";

pizza_app.use(express.json());


pizza_app.post('/order_page', (req, res) => {
    // console.log('Received ', req.body);
    quantity = req.body.quantity;
    sorts = req.body.sorts;
    size = req.body.size;
    width = req.body.width;
    firstName = req.body.firstName;
    lastName = req.body.lastName;
    phone = req.body.phone;
    address = req.body.address;
    let regexPhone = new RegExp('^[0-9]{10}$');
    var aaa = false;
    if (typeof(sorts) == 'object') {
        aaa = true;
    }

    if (firstName == "" || lastName == "" || sorts == undefined || width == 0 || size == 0 || phone == "" || address == "" || !regexPhone.test(phone)) {
        var errorLogin = 'Invalid Input, please try again!';
        const url = require('url');
        res.redirect(url.format({
            pathname: "/",
            error: errorLogin,
        }));
    } else {
        var pricePizza = []
        if (typeof(sorts) == 'object') {
            for (let i = 0; i < pizzaOptionsSort.length; i++) {
                if (pizzaOptionsSortPrice[pizzaOptionsSort.indexOf(sorts[i])] != undefined) {
                    pricePizza.push(pizzaOptionsSortPrice[pizzaOptionsSort.indexOf(sorts[i])])
                }
            }
        }
        pricePizza.push(pizzaOptionsSortPrice[pizzaOptionsSort.indexOf(sorts)])
            // console.log('Received ', pricePizza);

        var sizePrice = 0;
        var widthPrice = 0;
        if (pizzaOptionsSizePrice[pizzaOptionsSize.indexOf(size)] != undefined && pizzaOptionsWidthPrice[pizzaOptionsWidth.indexOf(width)] != undefined) {
            sizePrice = pizzaOptionsSizePrice[pizzaOptionsSize.indexOf(size)]
            widthPrice = pizzaOptionsWidthPrice[pizzaOptionsWidth.indexOf(width)]
        }
        let arrayTotal = [];
        arrayTotal = arrayTotal.concat(pricePizza, sizePrice, widthPrice);
        var sum_sub = 0;
        sum_sub = sum1(arrayTotal, sum_sub, quantity);
        var taxesValue = 0;
        taxesValue = taxesCalculator(sum_sub);
        var totalValue = 0;
        totalValue = totalCalculator(sum_sub, taxesValue, totalValue)
        res.render('order_page', { aaa: aaa, quantity: quantity, sorts: sorts, size: size, width: width, firstName: firstName, lastName: lastName, phone: phone, address: address, pizzaPrice: pricePizza, sizePrice: sizePrice, widthPrice: widthPrice, sum_sub: sum_sub, taxesValue: taxesValue, totalValue: totalValue });
    }
});

pizza_app.post('/order_done', (req, res) => {
    var pricePizza = []
    if (typeof(sorts) == 'object') {
        for (let i = 0; i < pizzaOptionsSort.length; i++) {
            if (pizzaOptionsSortPrice[pizzaOptionsSort.indexOf(sorts[i])] != undefined) {
                pricePizza.push(pizzaOptionsSortPrice[pizzaOptionsSort.indexOf(sorts[i])])
            }
        }
    }
    pricePizza.push(pizzaOptionsSortPrice[pizzaOptionsSort.indexOf(sorts)])
    var sizePrice = 0;
    var widthPrice = 0;
    if (pizzaOptionsSizePrice[pizzaOptionsSize.indexOf(size)] != undefined && pizzaOptionsWidthPrice[pizzaOptionsWidth.indexOf(width)] != undefined) {
        sizePrice = pizzaOptionsSizePrice[pizzaOptionsSize.indexOf(size)]
        widthPrice = pizzaOptionsWidthPrice[pizzaOptionsWidth.indexOf(width)]
    }
    let arrayTotal = [];
    arrayTotal = arrayTotal.concat(pricePizza, sizePrice, widthPrice);
    var sum_sub = 0;
    sum_sub = sum1(arrayTotal, sum_sub, quantity);
    var taxesValue = 0;
    taxesValue = taxesCalculator(sum_sub);
    var totalValue = 0;
    totalValue = totalCalculator(sum_sub, taxesValue, totalValue)
        // console.log('Received ', totalValue);
    let order = { "NAME": firstName + ' ' + lastName, "ADDRESS": address, "PHONE": phone, "ORDER": [sorts, size, width], "QTY": quantity };
    const fs = require('fs');
    let data = JSON.stringify(order, null, 2);
    fs.writeFileSync('orders.json', data);
    res.render('order_done', { firstName: firstName, lastName: lastName, totalValue: totalValue });
});

pizza_app.listen(port, () => console.log(
    `Express started on http://localhost:${port};` + `press Ctrl-C to terminate.`
));