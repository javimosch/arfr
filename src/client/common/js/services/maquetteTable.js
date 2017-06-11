import maquette from 'maquette';
export const maquetteTable = {
    name: "maquetteTable",
    def: [function() {
        var self = {};
        var normalizeName = (x) => x.replace(/([A-Z])/g, ' $1').replace(/^./, function(str) {
            return str.toUpperCase();
        });
        self.create = function(domNode, items, options) {

            var itemFields = (item) => {
                return Object.keys(item).filter(key => {
                    if (options && options.columns) {
                        return options.columns.indexOf(key) !== -1;
                    }
                    else {
                        return true;
                    }
                });
            };

            function renderHeaderColumns() {
                if (items.length > 0) {
                    return h('thead.panel-rt5.hide-mobile', [
                        h('tr', [
                            itemFields(items[0]).map(key =>
                                h('td.panel-rt5', [normalizeName(key)])
                            )
                        ])
                    ]);
                }
                else {
                    return undefined;
                }
            }

            var h = maquette.h;
            var projector = maquette.createProjector();
            var perPage = 10;
            var pagination = {
                totalCount: function() {
                    return items.length;
                },
                perPage: perPage,
                page: 0,
                pages: function() {
                    return Math.ceil(this.totalCount() / this.perPage);
                },
                offset: 0,
                paginate: function(evt) {
                    this.page = evt.target.value;
                    this.offset = this.page * this.perPage; //0*10=0  1*10=10 2*10=20
                    projector.scheduleRender();
                },
                generateButtons: function() {
                    var li = [],
                        pages = this.pages();
                    for (var x = 1; x <= pages; x++)
                        li.push(h('li.paginator', {
                            bind: pagination,
                            key: x,
                            value: x - 1,
                            onclick: this.paginate,
                            classes: {
                                selected: x === this.page + 1
                            }
                        }, [x]));
                    return li;
                },
                generateItems: function() {
                    var itemsForPage = items.slice(this.offset, this.offset + this.perPage);
                    return itemsForPage.map((item, i) =>
                        h('tr.panel-rt5', {
                                key: item._id || 'k' + i
                            },
                            itemFields(item).map(key =>
                                h('td.panel-rt5', [
                                    h('span.only-mobile', [normalizeName(key)]), item[key]
                                ])
                            )
                        )
                    );
                }
            };

            function renderMaquette() {
                return h('div.wrapper', {
                    styles: {
                        //'max-height': '200px',
                        //overflow: 'overlay'
                    }
                }, [
                    h('div.paginator-wrapper', [
                        h('ul.paginator.panel-rt5', {
                            styles: {
                                'list-style': 'none'
                            }
                        }, [
                            pagination.generateButtons()
                        ])
                    ]),
                    h('table.panel-rt5', [
                        renderHeaderColumns(),
                        h('tbody', [
                            pagination.generateItems()
                        ])

                    ])
                ]);
            }
            projector.append(domNode, renderMaquette);
        };
        return self;
    }]
};
