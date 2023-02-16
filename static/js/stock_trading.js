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

$("#form").hide();
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
          document.getElementById('stock_no').value = words[0];
          document.getElementById('stock_name').value = words[1];
          $('#stock_name_display').text(words[1]);
          $('#stock_no_display').text(words[0]);
          taiwan_stock_tick_snapshot(stock_id);
          $("#form").show();
          clearInterval(myVar);
          myVar = setInterval(function() { taiwan_stock_tick_snapshot(stock_id); },10000);
        }
        document.getElementById('stock_id').value = '';
    });

});