/*global moment*/
/*global $U*/
/*global _*/
((global) => {
    global.diagsCalculateAvailableSlots = diagsCalculateAvailableSlots;
    global.diagsGetAvailableRanges = diagsGetAvailableRanges;
    
    var DEBUG = false;

    function diagsGetAvailableRanges(order, ctrl) {
        if (!isFinite(new Date(order.day))) {
            throw Error('getAvailableRanges Invalid order day');
        }

        //helpers
        function diagsPriority(cb) {
            ctrl('User', 'getAll', {
                userType: 'diag',
                __rules: {
                    disabled: {
                        $ne: true
                    } //exclude disabled diags
                },
                __select: 'priority'
            }).then((data) => {
                cb(data.result.map((v) => ({
                    _id: v._id,
                    priority: v.priority
                })));
            })
        }

        function timeRangesDiagSayHeCantWorktype(cb) {
            ctrl('TimeRange', 'getAll', {
                type: 'work-exception',
                __select: '_user start end repeat'
            }).then((data) => {
                cb(data.result.map((v) => (v)));
            })
        }

        function timeRangesDiagIsWorking(order, cb) {
            ctrl('Order', 'getAll', {
                __select: 'start end _diag',
                __rules: {
                    status: {
                        $ne: 'complete'
                    }
                }
            }).then((data) => {

                data.result = data.result.filter(v => {
                    return moment(v.start).isSame(moment(order.day), 'day');
                });

                cb(data.result.map((v) => ({
                    _user: v._diag,
                    start: v.start,
                    end: v.end
                })));
            })
        }
        //

        function _data(cb) {
            timeRangesDiagIsWorking(order, (working) => {
                timeRangesDiagSayHeCantWorktype((exceptions) => {
                    diagsPriority((diags) => {
                        cb(working, exceptions, diags);
                    });
                });
            });
        }

        function calc(order, working, exceptions, diags) {
            return diagsCalculateAvailableSlots(order, working, exceptions, diags);
            //order: {day:moment(),time{hours,minutes}} // the time that the order last.
            //working: [{_user,start,end}] // the times that a diag is occupied.
            //exceptions: [{_user,start,end,repeat}] // the times that the diag can't work.
            //diags: [{_user, priority}] //a list of diags.
            //
            //RULES
            //-book the whole day of the diag with Priority = 1 then 2 then 3 
            //-Working day is from 8h to 19h (8am to 7pm)
            //-diagnositquer do not work on sunday
            //We propose Two rendez vous in the morning and two in the afternoon 
            //9h and 10h are proposed by default when calendat is empty for the morning
            //14h and 15h are proposed by default for the afternoon is empty
            //Last beginning time for morning : 11h30
            //Last diag of the day has to finish at 19h  7pm max
            //A diag can start at 00min or 30 ex: 9H30 10H 10h30
            //The diagnostiquer need 30 minutes. Its minimum time between to mission.
            //one hour minimum between each diag beginning
        }
        return $U.MyPromise(function(resolve, error) {
            _data((working, exceptions, diags) => {
                resolve(calc(order, working, exceptions, diags));
            });
        });
    }
    //////////////////
    function diagsCalculateAvailableSlots(order, working, exceptions, diags) {
        //console.log('diagsCalculateAvailableSlots');
        var slots = {
            morning: [],
            afternoon: []
        };
        var diags = _.orderBy(diags, (v) => v.priority);
        diags.forEach((diag) => {
            //
            //if an exception collide with the whole day, skip.
            if (isExceptionCollidingWholeDay(diag, order, exceptions)) {
                if(DEBUG) console.log(diag._id + ' exception colliding whole day');
                return;
            }


            //exceptions that collide in the whole day.
            var _exceptions = orderDiagExceptions(order, diag, exceptions);
            //a sum of the active orders of the day plus exceptions.
            var _collisions = _.union(filterOrders(working, diag), _exceptions);
            //
            //we sum already assigned slots
            _collisions = _.union(_collisions, slots.morning);
            _collisions = _.union(_collisions, slots.afternoon);
            //
            if (slots.morning.length < 2) {
                if (freeMorning(order, _collisions)) {
                    //slots.morning.push(slot(9, 0, order, diag), slot(10, 0, order, diag));
                    slots = allocateFixedMorning(slots, order, diag);
                }
                else {
                    var sumo = allocateMorning(diag, order, _collisions, slots);
                    if (sumo && slots.morning.length < 2) {
                        _collisions.push(slots.morning[slots.morning.length - 1]);
                        allocateMorning(diag, order, _collisions, slots);
                    }
                }
            }
            //
            if (slots.afternoon.length < 2) {
                if (freeAfternoon(order, _collisions)) {
                    //slots.afternoon.push(slot(14, 0, order, diag), slot(15, 0, order, diag));
                    slots = allocateFixedAfternoon(slots,order,diag);
                }
                else {
                    var sumo = allocateAfternoon(diag, order, _collisions, slots);
                    if (sumo && slots.afternoon.length < 2) {
                        _collisions.push(slots.afternoon[slots.afternoon.length - 1]);
                        allocateAfternoon(diag, order, _collisions, slots);
                    }
                }
            }
            //
            //console.info(_collisions);
        });
        return _.union(slots.morning, slots.afternoon);
    }
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    function allocateFixedMorning(_slots, order, diag) {
        if (isToday(order)) {
            //after 11:300, none.
            //before 8:00am, fixed slots are at 9h00 and 10h00.
            //past 8:00, fixed slots are one hour after current time. Separated by one hour.
            //if past 11h30, there are not fixed slots for the morning.
            if (moment().isBefore(moment().hour(11).minutes(30))) {
                if (moment().isBefore(moment().hour(8).minutes(0))) {
                    _slots.morning.push(slot(9, 0, order, diag), slot(10, 0, order, diag));
                    if(DEBUG) console.log('allocate-fixed-morning-today-at-9h00-and-10h00-current-time-before-08h00: ');
                }
                else {
                    var fixed = moment().add(1, 'hour');
                    if (fixed.isBefore(moment().hour(11).minutes(30))) {
                        var minutes = parseInt(parseInt(fixed.minutes()) / 10, 10) * 10;
                        _slots.morning.push(slot(fixed.hours(), minutes, order, diag));
                        if(DEBUG) console.log('allocate-fixed-morning-today-at: ',fixed);
                        fixed = fixed.add(1, 'hour');
                        if (fixed.isBefore(moment().hour(11).minutes(30))) {
                            _slots.morning.push(slot(fixed.hours(), minutes, order, diag));
                            if(DEBUG) console.log('allocate-fixed-morning-today-at: ',fixed);
                        }else{
                            if(DEBUG) console.log('allocate-fixed-morning-today-skip: fixed beyond limit (11h30)',fixed);
                        }
                    }else{
                        if(DEBUG) console.log('allocate-fixed-morning-today-skip: fixed beyond limit (11h30)',fixed);
                    }
                }
            }
            else {
                //none
                if(DEBUG) console.log('allocate-fixed-morning-skip-current-time-after-11h30: ',fixed);
            }
        }
        else {
            _slots.morning.push(slot(9, 0, order, diag), slot(10, 0, order, diag)); // normal
        }
        return _slots;
    }

    function allocateFixedAfternoon(_slots, order, diag) {
        if (isToday(order)) {
            //past 13:00am
            //past 19h00, none.
            if (moment().isAfter(moment().hour(13).minutes(0))) {
                var fixed = moment().add(1, 'hour');
                //the limit were a fixed slot can start during the afternoon is 19h00 minus the order time.
                var limit = moment().hours(19).minutes(0).subtract(order.time.hours, 'hours').subtract(order.time.minutes, 'minutes');
                //
                if (fixed.isBefore(limit)) {
                    var minutes = parseInt(parseInt(fixed.minutes()) / 10, 10) * 10;
                    _slots.afternoon.push(slot(fixed.hours(), minutes, order, diag));
                    if(DEBUG) console.log('allocate-fixed-afternoon-today-at: ',fixed);
                    fixed = fixed.add(1, 'hour');
                    if (fixed.isBefore(limit)) {
                        _slots.afternoon.push(slot(fixed.hours(), minutes, order, diag));
                        if(DEBUG) console.log('allocate-fixed-afternoon-today-at: ',fixed);
                    }else{
                        if(DEBUG) console.log('allocate-fixed-afternoon-today-skip: fixed beyond limit',limit,fixed);
                    }
                }else{
                    if(DEBUG) console.log('allocate-fixed-afternoon-today-skip: fixed beyond limit',limit,fixed);
                }
            }
            else {
                _slots.afternoon.push(slot(14, 0, order, diag), slot(15, 0, order, diag)); //normal (is today in the morning, so allocate afternoon as normal)
                if(DEBUG) console.log('allocate-fixed-afternoon-today-at-14-and-15-current-time-before-13h00: ',fixed);
            }
        }
        else {
            _slots.afternoon.push(slot(14, 0, order, diag), slot(15, 0, order, diag)); //normal fixed allocation
        }
        return _slots;
    }

    function isToday(order) {
        return moment(order.day).isSame(moment(), 'day');
    }

    function filterOrders(orders, diag) {
        return orders.filter(v => {
            return v._user == diag._id;
        });
    }

    function allocateMorning(diag, order, collisions, arr) {
        var startMinH = 8;
        var startMinM = 0;

        if (isToday(order)) {
            if (moment().isAfter(moment().hour(11).minutes(30))) { //now is after 11:30?
                return false; //do not allocate in morning then.
            }
            else {
                startMinH = moment().add(1, 'hour').hours(); //allocate morning staring in one hour.
                startMinM = moment().minutes();
            }
        }

        return allocate(startMinH, startMinM, 11, 30, diag, order, collisions, arr, 'morning');
    }

    function allocateAfternoon(diag, order, collisions, arr) {
        var startMinH = 13;
        var startMinM = 0;
        var startMax = moment(order.day).hours(19).minutes(0).subtract(order.time.hours, 'hour').subtract(order.time.minutes, 'minutes');
        //
        if (isToday(order)) {
            if (moment().isAfter(moment().hour(startMax.hours()).minutes(startMax.minutes()))) {
                //now is after 19:00 minus order time?
                return false; //do not allocate in afternoon then.
            }
            else {
                startMinH = moment().add(1, 'hour').hours(); //allocate afternoon staring in one hour.
                startMinM = moment().minutes();
            }
        }
        //
        return allocate(startMinH, startMinM, startMax.hours(), startMax.minutes(), diag, order, collisions, arr, 'afternoon');
    }

    function normalizeStart(start) {
        start = moment(start);
        var h = start.hours();
        var m = start.minutes();
        if (m > 0 && m < 30) m = 30;
        if (m > 30) {
            m = 0;
            h++;
        }
        return start.hours(h).minutes(m);
    }

    //arr: represents the current allocated slots.
    function allocate(startMinH, startMinM, startMaxH, startMaxM, diag, order, collisions, arr, propName) {
        var startMin = moment(order.day).hour(startMinH).minutes(startMinM);
        var startMax = moment(order.day).hour(startMaxH).minutes(startMaxM);
        var cut = false,
            start = moment(startMin),
            _cols = [],
            c = 0;
        //rangeCollisions4(start, order, collisions);
        //console.log('allocate[' + diag._id + ']:start=' + start.format('HH:mm'));
        do {
            //------------------
            //rangeCollision4: start, end: order duration.
            _cols = rangeCollisions4(start, order, collisions);
            if (_cols.length == 0) {
                _cols = rangeCollisions5(orderEnd(start, order), 1, 30, collisions);
                if (_cols.length == 0) {
                    //available!
                    var _s = slot(start.hours(), start.minutes(), order, diag);
                    //console.info('allocate:success=' + JSON.stringify(_s));
                    arr[propName].push(_s);
                    return true;
                }
                else {
                    start = moment(_cols[_cols.length - 1].end).add(1, 'hours').add(30, 'minutes');
                    start = normalizeStart(start);
                }
            }
            else {
                start = moment(_cols[_cols.length - 1].end).add(1, 'hours').add(30, 'minutes');
                start = normalizeStart(start);
            }
            //console.log('allocate:moving=' + start.format('HH:mm'));
            //------------------
            c++;
            if (c > 20) cut = true;
        } while (moment(start).isBefore(moment(startMax)) || cut);
        if (cut) {
            //console.warn('allocate while warning.');
        }
        else {
            //console.log('allocate:not-posible');
        }
        return false;
    }

    function freeMorning(order, collisions) {
        var lastAssignableMorningDate = moment(order.day).hours(11).minutes(30);
        return collisions.filter(v => {
            return moment(v.start).isBefore(lastAssignableMorningDate);
        }).length == 0;
    }

    function freeAfternoon(order, collisions) {
        var minAssignableAfternoonDate = moment(order.day).hours(13).minutes(0);
        return collisions.filter(v => {
            return moment(v.start).isAfter(minAssignableAfternoonDate);
        }).length == 0;
    }

    function slot(h, m, order, diag) {
        var start = moment(order.day).hour(h).minutes(m);
        return {
            _diag: diag._id,
            start: start,
            end: moment(start).add(order.time.hours, 'hours').add(order.time.minutes, 'minutes')
        };
    }

    function orderEnd(start, order) {
        return moment(start).add(order.time.hours, 'hours').add(order.time.minutes, 'minutes');
    }

    function rangeCollisions5(date, hp, mp, collisions) {
        return rangeCollisions2(
            date, moment(date).hours(), moment(date).minutes(), hp, mp, collisions);
    }

    function rangeCollisions4(start, order, collisions) {
        return rangeCollisions(start, orderEnd(start, order), collisions);
    }

    function rangeCollisions3(date, h, m, timePlus, collisions) {
        return rangeCollisions2(date, h, m, timePlus.hours, timePlus.minutes, collisions);
    }

    function rangeCollisions2(date, h, m, hp, mp, collisions) {
        var start = moment(date).hour(h).minutes(m);
        var end = moment(start).add(hp, 'hours').add(mp, 'minutes');
        return rangeCollisions(start, end, collisions)
    }

    function rangeCollisions(start, end, collisions) {
        var get = (cb) => (collisions.filter(v => cb(v)) || []);
        var rta = get((r) => (
            moment(r.start).isSameOrAfter(start) &&
            moment(r.start).isSameOrBefore(end)
        ));
        _.union(rta, get((r) => (
            moment(r.end).isSameOrAfter(start) &&
            moment(r.end).isSameOrBefore(end)
        )));
        //
        /*
        console.info('rangeCollisions ' + moment(start).format('HH:mm') + ' - ' + moment(end).format('HH:mm') + ' collisions:' + JSON.stringify(collisions.map(v => {
             return
             moment(v.start).format('HH:mm') + ' - ' + moment(v.end).format('HH:mm');

         })) + ' == Collisions: ' + (rta.length));*/
        return rta;
    }

    function orderDiagExceptions(order, diag, exceptions) {
        var sameDay = false,
            repeatDay = false,
            repeatWeek, sameDOW, collide;
        return exceptions.filter((range) => {
            if (range._user !== diag._id) return false;
            collide = true;
            sameDay = moment(range.start).isSame(order.day, 'day');
            repeatDay = range.repeat == 'day';
            repeatWeek = range.repeat == 'week';
            sameDOW = moment(order.day).day() == moment(range.start).day();
            collide = collide &&
                (
                    sameDay || repeatDay || (repeatWeek && sameDOW)
                );
            return collide;
        });
    }

    function isExceptionCollidingWholeDay(diag, order, exceptions) {
        return exceptions.some(ex => {
            var o = moment(order.day);
            if (ex._user != diag._id) return false;
            return moment(ex.start).isBefore(o.hour(8).minutes(0)) && moment(ex.end).isAfter(o.hour(19).minutes(0))
        });
    }
})(typeof exports !== 'undefined' && exports || window);
