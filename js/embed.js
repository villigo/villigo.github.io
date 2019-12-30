(function ($) {

    $.fn.MoneyMetals = function (options) {

        var domain = "https://www.moneymetals.com";
        var origin = "https://www.moneymetals.com/buy/gold";
        var chart_id = "ilb-display-chart";
        var chart_div = "chart_div";
        var json_data = domain + "/api/charts/data.json";
        var live_data = domain + "/api/spot-prices.json";
        var grams_per_oz = 31.1034768;


        if ($(this).prop("id") != chart_id) {
            //user initialized ILB on different ID
            return false;
        }

        if (window.jQuery == "undefined" || !window.jQuery) {
            window.getElementById(chart_id).innerHTML = "Unable to load Money Metal Charts Jquery is Missing .";
            return false;
        }

        if ($("#" + chart_id + " a").prop("tagName") != "A" || $("#" + chart_id + " a").prop("href") != origin) {
            return false;
        }

        var activeTabClass = 'active',
            activeMetalClass = 'btn-charts',
            chart = null,
            chartData = [],
            chartOptions = {
                global: {
                    timezoneOffset: 0,
                    useUTC: false
                },
                chart: {
                    renderTo: 'chart_div'
                },
                credits: {
                    enabled: false
                },
                rangeSelector: {
                    inputEnabled: $('#chart_div').width() > 480,
                    inputDateFormat: '%Y-%m-%d',
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    },
                        {
                            type: 'month',
                            count: 3,
                            text: '3m'
                        },
                        {
                            type: 'month',
                            count: 6,
                            text: '6m'
                        },
                        {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        },
                        {
                            type: 'year',
                            count: 3,
                            text: '3y'
                        },
                        {
                            type: 'year',
                            count: 5,
                            text: '5y'
                        },
                        {
                            type: 'ytd',
                            text: 'YTD'
                        },

                        {
                            type: 'all',
                            text: 'All'
                        }],
                    selected: 0
                },
                title: {
                    text: '<a style="color: #3080bf;" href="https://www.moneymetals.com/precious-metals-charts">Money Metals Exchange</a>'
                }
            },
            metalButtons = null,
            measurementButtons = null,
            daysTabs = null,
            daysTabLinks = null,
            data = [],
            db_size = 0,
            auth_user = "";

        var Charts = {

            ILB: [],

            liveData: [],

            Cookie: [],

            highChart: null,

            default_metal: options.hasOwnProperty("default_metal") ? options["default_metal"] : 'gold',

            default_measurement: options.hasOwnProperty("default_measurement") ? options["default_measurement"] : 'ounces',

            show_all_metals: options.hasOwnProperty("show_all_metals") ? options["show_all_metals"] : 1,

            body_width: options.hasOwnProperty("body_width") ? options["body_width"] : 1800,

            body_height: options.hasOwnProperty("body_height") ? options["body_height"] : 500,

            chart_width: options.hasOwnProperty("chart_width") ? options["chart_width"] : 500,

            chart_height: options.hasOwnProperty("chart_height") ? options["chart_height"] : 300,

            currentTab: "all",

            currentMetal: "gold",

            init: function () {


                //Set Global Data
                $.ajax({
                    type: "GET",
                    url: json_data + "?metal=" + Charts.default_metal + "&show_all=" + Charts.show_all_metals
                }).done(function (ilbjson) {

                    Charts.ILB = $.parseJSON(ilbjson.ilb);
                    Charts.Cookie = $.parseJSON(ilbjson.cookie);
                    Charts.liveData = $.parseJSON(ilbjson.live);
                    data = $.parseJSON(ilbjson.chart);
                    db_size = data.prices.gold.length;

                    $('#' + chart_id).append($(ilbjson.html));
                    $('#' + chart_id).css('width', Charts.body_width);
                    $('#' + chart_id).css('height', Charts.body_height);
                    $('#' + chart_div).css('width', Charts.chart_width);
                    $('#' + chart_div).css('height', Charts.chart_height);

                    window.chart = Charts.liveData;
                    window.ilb_idx = Charts.liveData.stop_at_index;

                    if (Charts.liveData.dates.length == 0) {
                        //Remove Live Chart
                        $('#days-buttons #live').remove();
                        Charts.refresh_live = 0;
                    }

                    daysTabs = $('#days-buttons').children();
                    daysTabLinks = daysTabs.children();
                    metalButtons = $('div#metals button');
                    measurementButtons = $('div#measurements button');

                    setInterval(Charts.updateLiveData, 15000);
//                    setInterval(Charts.updateLiveData, 60000);

                    if (!hasCookie(Charts.Cookie['name'])) {
                        createCookie(Charts.Cookie['name'], Charts.Cookie['value'], Charts.Cookie['expires']);
                        auth_user = Charts.Cookie['value'];

                    }
                    else {
                        auth_user = getCookie(Charts.Cookie['name']);
                    }

                    Charts.logDomain(Charts.Cookie['response_url'], auth_user);

                    $.getScript('https://www.moneymetals.com/plugins/highstock.js', function () {
                        var tempData = [];

                        Charts.drawChart();


                    });

                });
            },

            logDomain: function (url, auth_user) {
                $.ajax({
                    type: "GET",
                    url: url + "?domain=" + document.domain + "&user=" + auth_user
                }).done(function (response) {
                });
            },

            updateLiveData: function () {
                $.ajax({
                    type: "GET",
                    url: live_data
                }).done(function (response) {

                    chartData = [];

                    Charts.liveData.dates[window.ilb_idx] = response.dates;
                    Charts.liveData.prices.gold[window.ilb_idx] = parseFloat(response.natural.gold_ask);
                    Charts.liveData.prices.palladium[window.ilb_idx] = parseFloat(response.natural.palladium_ask);
                    Charts.liveData.prices.platinum[window.ilb_idx] = parseFloat(response.natural.platinum_ask);
                    Charts.liveData.prices.silver[window.ilb_idx] = parseFloat(response.natural.silver_ask);
                    Charts.liveData.prices.rhodium[window.ilb_idx] = parseFloat(response.natural.rhodium_ask);

                    window.ilb_idx++;

                    if (Charts.refresh_live == 1) {

                        var divideby = 1;
                        var multiplyby = Charts.currentMeasurement == 'kilos' ? 1000 : 1;
                        if (Charts.currentMeasurement == 'grams' || Charts.currentMeasurement == 'kilos') {
                            divideby = grams_per_oz;
                        }

                        for (var i = 0; i < Charts.liveData.prices[Charts.currentMetal].length; i++) {
                            if (Charts.liveData.prices[Charts.currentMetal][i] !== null) {
                                var price = (Charts.liveData.prices[Charts.currentMetal][i] / divideby) * multiplyby;
                            } else {
                                price = null;
                            }
                            chartData.push([Charts.liveData.dates[i], price]);
                        }

                        Charts.highChart.series[0].setData(chartData);
                        Charts.highChart.series[0].redraw();


                    }

                });
            },


            changeMetal: function (evt) {
                Charts.setParams(evt.target.id, Charts.currentTab, true);

            },

            changeMeasurement: function (evt) {
                Charts.setMeasurement(evt.target.id, Charts.measurement, true);
            },

            setParams: function (metal, tab, redraw) {

                $('#' + Charts.currentTab).removeClass(activeTabClass);
                $('#' + tab).addClass(activeTabClass);

                $("#" + Charts.currentMetal).removeClass(activeMetalClass);
                $("#" + metal).addClass(activeMetalClass);

                Charts.currentTab = tab;

                Charts.currentMetal = metal;

                if (redraw)
                    getNewChartData();
            },

            setMeasurement: function (measurement, tab, redraw) {
                $("#" + Charts.currentMeasurement).removeClass(activeMetalClass);
                $("#" + measurement).addClass(activeMetalClass);

                Charts.currentMeasurement = measurement;

                if (redraw)
                    getNewChartData();
            },

            drawChart: function () {

                daysTabLinks.click({tab: true}, getNewChartData);

                metalButtons.click(Charts.changeMetal);

                measurementButtons.click(Charts.changeMeasurement);

                var selected_metal = Charts.default_metal;
                var selected_measurement = Charts.default_measurement;
                var selected_tab = $('#selected_tab').val();

                if (selected_metal != null || selected_tab != null) {
                    Charts.setParams(selected_metal, selected_tab, true);
                } else {
                    Charts.setParams("gold", "all", true);
                }
                if (selected_measurement != null || selected_tab != null) {
                    Charts.setMeasurement(selected_measurement, selected_tab, true);
                } else {
                    Charts.setMeasurement("ounces", "all", true);
                }

            }
        };

        Charts.init();

        function hasCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return true;
            }
            return false;
        }

        function getCookie(cookie_name) {
            var all_cookies = document.cookie;

            // Get all the cookies pairs in an array
            var cookie_array = all_cookies.split(';');

            // Now take key value pair out of this array
            for (var i = 0; i < cookie_array.length; i++) {
                var name = cookie_array[i].split('=')[0];
                var value = cookie_array[i].split('=')[1];

                if (cookie_name == name) {
                    return value;
                }
            }
            return null;
        }

        function createCookie(name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            }
            else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
        }

        function getNewChartData(event) {

            if (event != null && event.data != null)
                Charts.setParams(Charts.currentMetal, event.target.parentElement.id);

            chartData = [];

            var tempData = [];

            if (Charts.currentTab == "live") {
                tempData = Charts.liveData;
                Charts.refresh_live = 1;
            }
            else {
                tempData = data;
                Charts.refresh_live = 0;
            }

            var divideby = 1;
            var multiplyby = Charts.currentMeasurement == 'kilos' ? 1000 : 1;
            if (Charts.currentMeasurement == 'grams' || Charts.currentMeasurement == 'kilos') {
                divideby = grams_per_oz;
            }

            for (var i = 0; i < tempData.prices[Charts.currentMetal].length; i++) {
                if (tempData.prices[Charts.currentMetal][i] !== null) {
                    var price = (tempData.prices[Charts.currentMetal][i] / divideby) * multiplyby;
                } else {
                    price = null;
                }
                chartData.push([tempData.dates[i], price]);
            }

            Charts.highChart = new Highcharts.StockChart(chartOptions);

            Charts.highChart.addSeries(getSeries(Charts.currentMetal.charAt(0).toUpperCase() + Charts.currentMetal.substring(1),
                data.colors[Charts.currentMetal],
                data.gradient[Charts.currentMetal]["start"],
                data.gradient[Charts.currentMetal]["end"],
                '$ ',
                2
            ));
        }

        function getSeries(ILBname, ILBcolor, ILBgradientStart, ILBgradientEnd, ILBvaluePrefix, ILBvalueDecimals) {

            return {
                name: ILBname,
                type: 'areaspline',
                data: chartData,
                threshold: null,
                color: ILBcolor,
                column: {
                    allowPointSelect: true
                },
                tooltip: {
                    valuePrefix: ILBvaluePrefix,
                    valueDecimals: ILBvalueDecimals
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, ILBgradientStart],
                        [1, ILBgradientEnd]
                    ]
                }
            };

        }

        return false;

    };

}(jQuery));