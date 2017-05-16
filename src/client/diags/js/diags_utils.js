/*global moment*/
/*global $U*/
/*global StripeCheckout*/
/*global _*/

var $D = {
    openStripeModalPayOrder: openStripeModalPayOrder,
    rangeCollide: rangeCollide,
    getInvoiceHTMLContent:getInvoiceHTMLContent,
    createOrderDescription: createOrderDescription,
    normalizeOrderStartTime: normalizeOrderStartTime,
    OrderTotalTime: OrderTotalTime,
    OrderReplaceHTML: OrderReplaceHTML,
    subTotal: subTotal,
    sizePrice: sizePrice,
    totalPrice: totalPrice,
    createSelect: createSelect,
    createDateTimePickerData: createDateTimePickerData,
    ORDER_STATUS: {
        CREATED: 'created', //just created
        ORDERED: 'ordered', //client (agency/other) clicks invoice end of the month
        PREPAID: 'prepaid', //client paid first. When upload pdf -> complete
        DELIVERED: 'delivered', // PDF uploaded first. When client paid -> complete
        COMPLETED: 'completed' //pdf uploaded and order paid.
    },
    ORDER_STATUS_PAID: ['prepaid', 'completed'],
    createSiteSectionsCategories: createSiteSectionsCategories
};

function createSiteSectionsCategories(db) {
    //check if page cats exists.
    //create if not.
    db.ctrl('Category', 'get', {
        code: 'DIAGS'
    }).then(function(res) {
        if (res.ok && res.result) {
            _createPageSections(res);
        }
        else {
            _createRoot(_createPageSections)
        }
    });
    var categories = ['ERNMT', 'BOOKING_HOME', 'GENERAL_CONDITIONS', 'FAQ', 'LEGAL_MENTIONS'];

    function _createTextsItemsFor(_category) {
        var diags = ['DPE', 'AMIANTE', 'PLOMB', 'CARREZ', 'ERNMT', 'GAZ', 'ELECTRICITE', 'PARASITAIRE'];
        var cbCount = $U.cbHell(diags.length * 5, function() {
            console.info('create-page-category-#', diags.length * 5, 'texts-created-or-updated-success');
        });

        function _save(payload) {
            db.ctrl('Text', 'save', _.cloneDeep(payload)).then(cbCount.next);
        }

        var content = "Page section: BOOKING_HOME, Code: ";
        diags.forEach(function(code) {
            var name = code;
            var payload = {
                code: code,
                description: 'Auto generated block for ' + code + ' when you click the card in the home page.',
                content: '',
                _category: _category,
                __match: ['code']
            };

            payload.code = "PAGE_HOME_" + name + "_BLOCK_LEFT_TITLE";
            payload.content = content + payload.code;
            _save(payload);

            payload.code = "PAGE_HOME_" + name + "_BLOCK_LEFT_CONTENT";
            payload.content = content + payload.code;
            _save(payload);

            payload.code = "PAGE_HOME_" + name + "_BLOCK_RIGHT_TITLE",
                payload.content = content + payload.code;
            _save(payload);

            payload.code = "PAGE_HOME_" + name + "_BLOCK_RIGHT_CONTENT"
            payload.content = content + payload.code;
            _save(payload);

            payload.code = "PAGE_HOME_" + name + "_BLOCK_BOTTOM"
            payload.content = content + payload.code;
            _save(payload);

        });
    }

    function _createPageSections(res) {
        if (res && res.ok && res.result) {
            var root = res.result;
            var cbCount = $U.cbHell(categories.length, function() {
                console.info('create-page-categories#', categories.length, 'created-or-updated-success');
            });
            categories.forEach(function(cat) {
                var payload = {
                    code: cat,
                    description: 'Diags Site Section',
                    _parent: root._id,
                    __match: ['code']
                };
                db.ctrl('Category', 'save', payload).then(function(r) {
                    if (r && r.ok && r.result.code == 'BOOKING_HOME') {
                        _createTextsItemsFor(r.result._id);
                    }
                    cbCount.next();
                });

            });
        }
        else {
            console.warn('create-page-categories#create-page-sections=invalid-parameters,category-res-expected-and-got', res);
        }
    }

    function _createRoot(cb) {
        db.ctrl('Category', 'create', {
            code: "DIAGS",
            description: "Diags Root Category"
        }).then(cb);
    }
}

function createDateTimePickerData() {
    var o = {
        isOpen: false,
        openCalendar: function(e) {
            e.preventDefault();
            e.stopPropagation();
            o.isOpen = true;
        }
    };
    return o;
}

function createSelect(opt) { //s:scope r:rootscope
    var o = {
        label: opt.label,
        click: (x) => {
            o.label = x.label || x;
            $U.setPropByGivenPath(opt.scope, opt.model, x);
            opt.change(x);
        },
        items: opt.items
    };
    opt.scope.$watch(opt.model, (v) => {
        if (v !== undefined) {
            o.label = v.label || (v.substring(0, 1).toUpperCase() + v.slice(1));
        }
        else {
            o.label = opt.label;
        }
    });
    return o;
}

function rangeCollide(d1s, d1e, d2s, d2e) {
    d1s = moment(d1s);
    d1e = moment(d1e);
    d2s = moment(d2s);
    d2e = moment(d2e);
    //D1S---D1E
    //D2S---D2E
    //
    var collide = false;
    //C1
    //D1S--D2S--D1E
    collide = d2s.isAfter(d1s) && d2s.isBefore(d1e);
    if (collide) return collide;
    //C2
    //D1S--D2E--D1S
    collide = d2e.isAfter(d1s) && d2e.isBefore(d1e);
    //C3
    //D1S--D2S--D2E--D1S
    //
    //C4
    //D2S--D1S--D2E
    collide = d1s.isAfter(d2s) && d1s.isBefore(d2e);
    if (collide) return collide;
    //C2
    //D2S--D1E--D2S
    collide = d1e.isAfter(d2s) && d1e.isBefore(d2e);
    return collide;
}


function openStripeModalPayOrder(order, cb, opt) {
    opt = opt || {
        config: {
            companyName: "Unknown"
        }
    };
    var handler = StripeCheckout.configure({
        key: 'pk_test_MDkxtBLcBpHwMCgkqX2dJHjO',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
            //id email created
            //console.info('TOKEN', token);

            cb(token);

        }
    });


    // Open Checkout with further options
    handler.open({
        name: opt.config.companyName || "[r.config.companyName]",
        description: 'Order payment',
        //email: opt.email || order._client.email, //email need to be ingresed.
        currency: "eur",
        amount: order.price * 100,
        //billingAddress:true,
        zipCode: false,
        allowRememberMe: false
    });

}

function getInvoiceHTMLContent(db, item, r, cb) {
    db.ctrl('Category', "createUpdate", {
        code: "DIAGS_SETTINGS",
        __match: ['code']
    }).then(function(_res) {
        if (_res && _res.ok && _res.result) {
            var _category = _res.result._id;
            db.ctrl('Text', 'get', {
                code: 'INVOICE',
            }).then(function(res) {
                if (res.ok) {
                    var html =
                        window.encodeURIComponent(
                            $D.OrderReplaceHTML(window.decodeURIComponent(res.result.content), _.cloneDeep(item), r));
                    cb(html);
                }
                else {
                    r.warningMessage('Configure the Invoice template first.');
                }
            });
        }
    });
}

function OrderReplaceHTML(html, _order, r) {
    _order["LOGO"] = "<img src='" + window.location.origin + '/img/logo.jpg' + "'>";
    _order['ORDER_DESCRIPTION'] = _order.info.description;
    _order['CLIENT_FULLNAME'] = _order._client.firstName + ' ' + (_order._client.lastName || '');
    _order['CLIENT_FIRSTNAME'] = _order._client.firstName;
    _order['CLIENT_LASTNAME'] = _order._client.lastName || '';
    _order['CLIENT_EMAIL'] = _order._client.email;
    _order['CLIENT_ADDRESS'] = _order._client.address;
    _order.createdAt = r.momentDateTime(_order.createdAt);
    return $U.replaceHTML(html, _order);
}


function createOrderDescription(_order) {
    //requires: info.sell, info.house, .city, .info.constructionPermissionDate, .info.squareMeters,
    //info.gasInstallation, info.electricityInstallation.
    _order.info = _order.info || {};
    var rta = "";
    if (_order.info.sell) rta += "Pack Vente: ";
    else rta += "Pack Location: ";
    if (_order.info.house) {
        rta += "Maison";
    }
    else {
        rta += "Appartement";
    }
    if (_order.city) {
        rta += " à " + _order.city;
    }
    if (_order.info.constructionPermissionDate) {
        rta += " " + _order.info.constructionPermissionDate;
    }
    if (_order.info.squareMeters) {
        rta += ', ' + _order.info.squareMeters;
    }
    if (_order.info.gasInstallation && !_.includes(['Non', 'Oui, Moins de 15 ans'], _order.info.gasInstallation)) {
        rta += ', Gaz';
    }
    if (_order.info.electricityInstallation && _order.info.electricityInstallation != 'Moins de 15 ans') {
        rta += ", Électricité";
    }
    rta += '.';
    return rta;
}

function normalizeOrderStartTime(t, forwardOnly, backwardOnly) {
    if (t.minutes < 30) {
        if (!forwardOnly) {
            t.minutes = 0;
        }
        else {
            t.minutes = 30;
        }
    }
    if (t.minutes == 30) t.minutes = 30;
    if (t.minutes > 30) {
        if (!backwardOnly) {
            t.minutes = 0;
            t.hours++;
        }
        else {
            t.minutes = 30;
        }
    }
    return t;
}

function normalizeOrderTime(t, eachTreintaOnly) {
    if (t.minutes > 0 && t.minutes < 15) {
        t.minutes = 15;
        if (eachTreintaOnly) t.minutes = 0;
    }
    if (t.minutes > 15 && t.minutes < 30) {
        t.minutes = 30;
    }
    if (t.minutes > 30 && t.minutes < 45) {
        t.minutes = 45;
        if (eachTreintaOnly) t.minutes = 30;
    }
    if (t.minutes > 45 && t.minutes < 59) {
        t.hours += 1;
        t.minutes = 0;
    }
    return t;
}

function subTotal(model, diags, basePrice, opt) {
    if (!model) return 0;
    opt = opt || {}; //s:scope
    if (opt.s) {
        opt.s.priceInfo = opt.s.priceInfo || {};
        opt.s.priceInfo.basePrice = opt.s.priceInfo.basePrice;
    }
    var total = 0;
    model.diags = model.diags || {};
    Object.keys(model.diags).forEach(function(mkey) {
        if (!model.diags[mkey]) {
            if (opt.s && opt.s.priceInfo[mkey]) {
                delete opt.s.priceInfo[mkey]
            }
            return;
        }
        diags.forEach(function(dval, dkey) {
            if (!dval.show) {
                return;
            }
            if (dval.name == mkey) {
                if (opt.s) opt.s.priceInfo[mkey] = dval.price;
                total += dval.price || 0;
                return false;
            }
        });
    });
    var rta = basePrice + total;
    if (total === 0) {
        if (opt.s) opt.s.priceInfo.basePrice = 0;
        rta = 0;
    }
    else {
        if (opt.s) opt.s.priceInfo.basePrice = basePrice;
    }
    return rta;
};

function sizePrice(model, diags, squareMetersPrice, basePrice, opt) {
    if (!model) return 0;
    var rta = 0;
    //
    //var isHouse = model.info ? model.info.house : model.house;
    var squareMeters = model.info ? model.info.squareMeters : model.squareMeters;
    //
    if (squareMeters) {
        var porcent = squareMetersPrice[squareMeters];
        if (_.isUndefined(porcent) || _.isNull(porcent)) {
            console.warn('sizePrice: squareMeters missing in model.');
            porcent = 0;
        }
        if (parseInt(porcent) === 0) {
            rta = 0;
        }
        else {
            var sub = subTotal(model, diags, basePrice, opt);
            rta = sub * parseInt(porcent);
            rta = rta / 100;
        }
    }
    if (opt && opt.s) {
        opt.s.priceInfo = opt.s.priceInfo || {};
        opt.s.priceInfo.sizePrice = rta;
    }
    return rta;
}

var isTomorrowSaturday = function(d) {
    return moment(d).add(1, 'day').day() === 6;
}
var isTomorrowSunday = function(d) {
    return moment(d).add(1, 'day').day() === 0;
}

var isTodaySaturday = function(d) {
    return moment(d).day() === 6;
}
var isTodaySunday = function(d) {
    return moment(d).day() === 0;
}

var isToday = (d) => moment().isSame(moment(d), 'day');
var isTomorrow = (d) => moment().add(1, 'day').isSame(moment(d), 'day');
var isSaturday = (d) => moment(d).day() === 6;
var isSunday = (d) => moment(d).day() === 0;

function totalPrice(showRounded, model, diags, squareMetersPrice, basePrice, opt) {
    opt = opt || {};
    if (opt.basePrice) {
        basePrice = opt.basePrice;
    }
    var _sizePrice = sizePrice(model, diags, squareMetersPrice, basePrice, opt);
    var tot = subTotal(model, diags, basePrice, opt) + _sizePrice;

    if (opt.s) {

        opt.s.priceInfo = opt.s.priceInfo || {};
    }

    if (opt.r) {
        opt.r.dom(function() {
            opt.r.__debugPriceModifiers = {
                sizePrice: _sizePrice
            };
        });
    }

    if (!model) return 0; //The order may be not prepared.

    if (opt.s) {

        var date = model.start;
        if (opt.dt) date = opt.dt;

        if (opt.s.settings) {
            if (opt.s.settings.pricePercentageIncrease && date) {
                var increase = opt.s.settings.pricePercentageIncrease;
                var percentage = 0;

                if (isSaturday(date) && !isToday(date)) {
                    percentage = (percentage > increase.saturday) ? percentage : increase.saturday;
                    if (opt.r) opt.r.dom(function() {
                        opt.r.__debugPriceModifiers.saturday = percentage;
                    })
                    delete opt.s.priceInfo['increase-today'];
                    delete opt.s.priceInfo['increase-tomorrow'];
                    delete opt.s.priceInfo['increase-sunday'];
                    opt.s.priceInfo['increase-saturday'] = tot * (percentage / 100) + ' (' + percentage + '%)';
                }

                if (isSunday(date) && !isToday(date)) {
                    percentage = (percentage > increase.saturday) ? percentage : increase.saturday;
                    if (opt.r) opt.r.dom(function() {
                        opt.r.__debugPriceModifiers.sunday = percentage;
                    })
                    delete opt.s.priceInfo['increase-today'];
                    delete opt.s.priceInfo['increase-tomorrow'];
                    delete opt.s.priceInfo['increase-saturday'];
                    opt.s.priceInfo['increase-sunday'] = tot * (percentage / 100) + ' (' + percentage + '%)';
                }

                if (isTomorrow(date)) {
                    percentage = (percentage > increase.tomorrow) ? percentage : increase.tomorrow;

                    if (isTomorrowSaturday(date)) {
                        percentage = increase.tomorrowSaturday;
                        if (opt.r) opt.r.dom(function() {
                            opt.r.__debugPriceModifiers.tomorrowSaturday = percentage;
                        })
                    }
                    else {
                        if (isTomorrowSunday(date)) {
                            percentage = increase.tomorrowSunday;
                            if (opt.r) opt.r.dom(function() {
                                opt.r.__debugPriceModifiers.tomorrowSunday = percentage;
                            })
                        }
                        else {
                            percentage = increase.tomorrowMondayToFriday;
                            if (opt.r) opt.r.dom(function() {
                                opt.r.__debugPriceModifiers.tomorrowMondayToFriday = percentage;
                            })
                        }
                    }

                    delete opt.s.priceInfo['increase-today'];
                    delete opt.s.priceInfo['increase-saturday'];
                    opt.s.priceInfo['increase-tomorrow'] = tot * (percentage / 100) + ' (' + percentage + '%)';
                }
                if (isToday(date)) {
                    percentage = (percentage > increase.today) ? percentage : increase.today;
                    if (isTodaySaturday(date)) {
                        percentage = increase.todaySaturday;
                        if (opt.r) opt.r.dom(function() {
                            opt.r.__debugPriceModifiers.todaySaturday = percentage;
                        })
                    }
                    else {
                        if (isTodaySunday(date)) {
                            percentage = increase.todaySunday;
                            if (opt.r) opt.r.dom(function() {
                                opt.r.__debugPriceModifiers.todaySunday = percentage;
                            })
                        }
                        else {
                            percentage = increase.todayMondayToFriday;
                            if (opt.r) opt.r.dom(function() {
                                opt.r.__debugPriceModifiers.todayMondayToFriday = percentage;
                            })
                        }
                    }
                    delete opt.s.priceInfo['increase-tomorrow'];
                    delete opt.s.priceInfo['increase-saturday'];
                    opt.s.priceInfo['increase-today'] = tot * (percentage / 100) + ' (' + percentage + '%)';
                }


                tot = tot + tot * (percentage / 100);
            }
        }

        //_client discount (if any)
        if ($U.val(model, '_client.discount')) {
            var discount = $U.val(model, '_client.discount');
            if (discount > 0) {
                opt.s.priceInfo['client-discount'] = -tot * (discount / 100) + ' (' + discount + '%)';
                tot = tot - tot * (discount / 100);

                if (opt.r) opt.r.dom(function() {
                    opt.r.__debugPriceModifiers.clientDiscount = discount;
                })
            }
        }
    }
    else {
        console.warn('$D totalPrice opt.s required');
    }

    var realTot = parseInt(parseInt(tot) / 10, 10) * 10;


    if (opt.s) {
        opt.s.priceInfo = opt.s.priceInfo || {};
        opt.s.priceInfo['Round-to-near-10'] = (tot - realTot) * -1;
    }

    if (opt.overwriteModel === false) {

    }
    else {
        model.price = realTot;
    }

    return showRounded ? realTot : tot;
};

function OrderTotalTime(selectedDiags, diags) {
    var total = 0;
    if (!selectedDiags) return 0;
    Object.keys(selectedDiags).forEach(function(mkey) {
        if (!selectedDiags[mkey]) return;
        diags.forEach(function(dval, dkey) {
            if (dval.name == mkey) {
                dval.time = dval.price / 4;
                total += dval.time || 0;
                return false;
            }
        });
    });
    total = parseInt(parseInt(total) / 10, 10) * 10 + 10;
    var hours = Math.floor(total / 60);
    var minutes = total % 60;
    var t = {
        hours: hours,
        minutes: minutes
    };
    return t;
};
