const DEFAULTS = {
    threshold: 2,
    maximumItems: 5,
    highlightTyped: true,
    highlightClass: 'text-primary',
    label: 'label',
    value: 'value',
    showValue: false,
    showValueBeforeLabel: false,
  };
  
  class Autocomplete {
    constructor(field, options) {
      this.field = field;
      this.options = Object.assign({}, DEFAULTS, options);
      this.dropdown = null;
  
      field.parentNode.classList.add('dropdown');
      field.setAttribute('data-bs-toggle', 'dropdown');
      field.classList.add('dropdown-toggle');
  
      const dropdown = ce(`<div class="dropdown-menu"></div>`);
      if (this.options.dropdownClass)
        dropdown.classList.add(this.options.dropdownClass);
  
      insertAfter(dropdown, field);
  
      this.dropdown = new bootstrap.Dropdown(field, this.options.dropdownOptions);
  
      field.addEventListener('click', (e) => {
        if (this.createItems() === 0) {
          e.stopPropagation();
          this.dropdown.hide();
        }
      });
  
      field.addEventListener('input', () => {
        if (this.options.onInput)
          this.options.onInput(this.field.value);
        this.renderIfNeeded();
      });
  
      field.addEventListener('keydown', (e) => {
        if (e.keyCode === 27) {
          this.dropdown.hide();
          return;
        }
        if (e.keyCode === 40) {
          this.dropdown._menu.children[0]?.focus();
          return;
        }
      });
    }
  
    setData(data) {
      this.options.data = data;
      this.renderIfNeeded();
    }
  
    renderIfNeeded() {
      if (this.createItems() > 0)
        this.dropdown.show();
      else
        this.field.click();
    }
  
    createItem(lookup, item) {
      let label;
      if (this.options.highlightTyped) {
        const idx = removeDiacritics(item.label)
            .toLowerCase()
            .indexOf(removeDiacritics(lookup).toLowerCase());
        const className = Array.isArray(this.options.highlightClass) ? this.options.highlightClass.join(' ')
          : (typeof this.options.highlightClass == 'string' ? this.options.highlightClass : '');
        label = item.label.substring(0, idx)
          + `<span class="${className}">${item.label.substring(idx, idx + lookup.length)}</span>`
          + item.label.substring(idx + lookup.length, item.label.length);
      } else {
        label = item.label;
      }
  
      if (this.options.showValue) {
        if (this.options.showValueBeforeLabel) {
          label = `${item.value} ${label}`;
        } else {
          label += ` ${item.value}`;
        }
      }
  
      return ce(`<button type="button" class="dropdown-item" data-label="${item.label}" data-value="${item.value}">${label}</button>`);
    }
  
    createItems() {
      const lookup = this.field.value;
      if (lookup.length < this.options.threshold) {
        this.dropdown.hide();
        return 0;
      }
  
      const items = this.field.nextSibling;
      items.innerHTML = '';
  
      const keys = Object.keys(this.options.data);
  
      let count = 0;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const entry = this.options.data[key];
        const item = {
            label: this.options.label ? entry[this.options.label] : key,
            value: this.options.value ? entry[this.options.value] : entry
        };
  
        if (removeDiacritics(item.label).toLowerCase().indexOf(removeDiacritics(lookup).toLowerCase()) >= 0) {
          items.appendChild(this.createItem(lookup, item));
          if (this.options.maximumItems > 0 && ++count >= this.options.maximumItems)
            break;
        }
      }
  
      this.field.nextSibling.querySelectorAll('.dropdown-item').forEach((item) => {
        item.addEventListener('click', (e) => {
          let dataLabel = e.currentTarget.getAttribute('data-label');
          let dataValue = e.currentTarget.getAttribute('data-value');
  
          this.field.value = dataLabel;
  
          if (this.options.onSelectItem) {
            this.options.onSelectItem({
              value: dataValue,
              label: dataLabel
            });
          }
  
          this.dropdown.hide();
        })
      });
  
      return items.childNodes.length;
    }
  }
  
  /**
   * @param html
   * @returns {Node}
   */
  function ce(html) {
    let div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  }
  
  /**
   * @param elem
   * @param refElem
   * @returns {*}
   */
  function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
  }
  
  /**
   * @param {String} str
   * @returns {String}
   */
  function removeDiacritics(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
  }

function datarangepicker(){
    
    var start = moment().subtract(6, 'month');
    var end = moment();
  
    $('#daterange').daterangepicker({
        opens: 'center',
        "showDropdowns": true,
        startDate: start,
        endDate: end,
        maxDate: end,
        locale: {
            "format": "YYYY/MM/DD",
        },
        ranges: {
            'Last Month': [moment().subtract(1, 'month'), moment()],
            'Last 3 Months': [moment().subtract(3, 'months'), moment()],
            'Last 6 Months': [moment().subtract(6, 'months'), moment()],
            'Last 1 Year': [moment().subtract(1, 'year'), moment()],
            'Last 3 Years': [moment().subtract(3, 'years'), moment()],
            'Last 5 Years': [moment().subtract(5, 'years'), moment()],
        }
    });
}

function chart_init(){
    var chart = klinecharts.init('chart', {
        candle: {
            bar: {
                upColor: '#EF5350',
                downColor: '#26A69A',
            },
            priceMark: {
                last: {
                    upColor: '#EF5350',
                    downColor: '#26A69A',
                }
            },
            tooltip: {
                labels: ['時間', '開', '收', '高', '低', '成交量'],
            },
        },
        technicalIndicator:{
            bar: {
                upColor: '#EF5350',
                downColor: '#26A69A',
            },
            circle: {
                upColor: '#EF5350',
                downColor: '#26A69A',
            },
        },
    })
    chart.createTechnicalIndicator('MA', false, { id: 'candle_pane' })
    chart.createTechnicalIndicator('VOL', false, {height: 80})
    chart.createTechnicalIndicator('MACD' ,false, {height: 80})
    chart.setDataSpace(15)
    return chart;
}

function chart_new_data(chart, stock_id){
    daterange = $('#daterange').val().split(' ');
    $.ajax({
        url: 'https://api.finmindtrade.com/api/v4/data?',
        method: 'get',
        data: {
            dataset : 'TaiwanStockPrice',
            data_id :  stock_id.toString(),
            start_date: daterange[0].replaceAll('/', '-'),
            end_date: daterange[2].replaceAll('/', '-'),
        },
        success: res =>{
            data = res.data
            var chartDataList = data.map(function (data) {
                return {
                    timestamp: + (Date.parse(data.date)).toString(),
                    open: + data.open.toString(),
                    high: + data.max.toString(),
                    low: + data.min.toString(),
                    close: + data.close.toString(),
                    volume: + data.Trading_Volume.toString(),
                    turnover: + data.Trading_turnover.toString(),
                }
            });
            chart.applyNewData(chartDataList)
        },
        error: err =>{
            console.log(err)
        },
    });
}

function taiwan_stock_tick_snapshot(stock_id){
    $.ajax({
        url: $SCRIPT_ROOT + '/taiwan_stock_tick_snapshot',
        method: 'get',
        data: {
            data_id : stock_id.toString(),
        },
        success: res =>{
            $('#stock_time_display').text('更新時間：' + res['etl_date']);
            if(res['udp'].includes("+")){
                $('#stock_current_price_display').css('color', 'red');
                 $('#stock_change_price_display').css('color', 'red');
                 $('#stock_change_percent_display').css('color', 'red');
            }
            else if(res['udp'].includes("-")){
                $('#stock_current_price_display').css('color', 'green');
                $('#stock_change_price_display').css('color', 'green');
                $('#stock_change_percent_display').css('color', 'green');
            }
            else{
                $('#stock_current_price_display').css('color', 'Gold');
                $('#stock_change_price_display').css('color', 'Gold');
                $('#stock_change_percent_display').css('color', 'Gold');
            }
            $('#stock_current_price_display').text(res['price']);
            $('#stock_change_price_display').text(res['ud']);
            $('#stock_change_percent_display').text('(' + res['udp'] + ')');
        },
        error: err =>{
            console.log(err)
        },
    });
}

$(document).ready(function() {
    
  
  const ac = new Autocomplete(document.getElementById('stock_id'), {
    maximumItems: 5,
    data: twstock_info,
    label: "text",
    value: "value",
    onSelectItem: ({label, value}) => {
      document.getElementById('stock_id').value = value;
      console.log("user selected:", label, value);
    },
    threshold: 1,
  });
    
    datarangepicker();
    var chart = chart_init();
    var myVar;
    var stock_id;
    var found;
    var words;
    $("#stock").click(function() {
        stock_id = $('#stock_id').val();
        found = twstock_info.find(element => element.value === stock_id);
        if(found === undefined){
          $("#stock_id").addClass("is-invalid");  
        }
        else{
          words = found.text.split(' ');
          $("#stock_id").removeClass("is-invalid");
          $('#stock_name_display').text(words[1]);
          $('#stock_no_display').text(words[0]);
          taiwan_stock_tick_snapshot(stock_id);
          chart_new_data(chart, stock_id);
          clearInterval(myVar);
          myVar = setInterval(function() { taiwan_stock_tick_snapshot(stock_id); },10000);
        }
        document.getElementById('stock_id').value = '';
    });

    $(window).resize(function () {chart.resize()});
    
});