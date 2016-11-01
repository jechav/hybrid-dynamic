(()=> {
  /*
   *Global variables
   */
  let STATE_SUN = 1; //1,2,3,0
  let STATE_REGU = true; //true, false
  let STATE_BAT = 'b_on'; //b_on, b_ff, charging, uncharging, both 

  let STATE_APPL = {
    'air': {state: false, val: 3500},
    'wash': {state: false, val: 1200},
    'cleaner': {state: false, val: 1000},
    'tv': {state: false, val: 300}
  }; 
  let USE_APPLIANCE = 0;

  /*
   * Elements
   */
  let sun = $('#sun');
  let btn_sun = $('#btn-sun');
  let clouds = $('.cloud')
  let panel = $('#panel');
  let regulator = $('#regulator');
  let btn_regulator = $('#btn_regulator');
  let electrical = $('#electrical');
  let battery = $('#battery');
  let btn_battery = $('#btn_battery');
  let appliances = $('.appliances')
  //lines
  let l_panel = $('#line-panel');
  let l_regulator = $('#line-regulator');
  let l_electrical = $('#line-electrical');
  let l_battery = $('#line-battery');
  let l_off = $('#line-off');

  /*
   *MAIN FUNCTION
   */
  const init = () => {
    debounce(renderLines, 200);
    animations()
    events();
  }
  const events = () => {
    btn_sun.on('click', incrementSun)
    btn_regulator.on('click', toggleRegulator)
    btn_battery.on('click', toggleBattery)

    //appliances
    $.each(STATE_APPL, (key, val) => {
      $('#btn_'+key).on('click', () => { toggleAppl(key) })
      //$('#btn_air').on('click', () => { toggleAppl('air') })
    })
    $(window).on("resize", () =>  debounce(renderLines, 200) );
  }
  const animations = () => {
    g_updateLinePanelRegualtor();
    g_updateRegulatorWifi();
    g_updateAppliances()
  }


  /*
   * RENDER LINES
   */
  function renderLines(){
    console.info('UPDATE LINES');
    let top, left, width, height, v_left, t_top;

    //PANEL REGULATOR
    top = panel.offset().top + panel.height()/2
    left = panel.offset().left + panel.width()
    width = regulator.offset().left - left
    _updateLine(l_panel, top, left, width)

    //REGULATOR APPLIANCES
    top = regulator.offset().top + regulator.height();
    left = v_left = regulator.offset().left + regulator.width()/2; //save on v_left for next line
    height = appliances.offset().top - top
    _updateLine(l_regulator, top, left, null, height)

    //TOWER V_LINE
    top = t_top = electrical.offset().top + electrical.height()/2 //save on t_top for next line
    left = electrical.offset().left + electrical.width()
    width = v_left - left
    _updateLine(l_electrical, top, left, width)

    //V_LINE BATTERY
    top = t_top;
    left = v_left+4;
    width = battery.offset().left - left;
    _updateLine(l_battery, top, left, width)

    //V_LINE APPLIANCES or OFF
    top = t_top;
    left = v_left;
    height = appliances.offset().top - top;
    _updateLine(l_off, top, left, null, height)
  }
  const _updateLine = function(ele, top, left, width, height) {
    ele.css({
      top: top,
      left: left,
      width: width,
      height: height,
      display: 'block'
    })
  }
  /*
   *EVENTS
   */

  //**** SUN  ****//
  function incrementSun(){
    STATE_SUN = (STATE_SUN == 3)?0:STATE_SUN+1; 
    updateSun()
    g_updateLinePanelRegualtor();
  }
  function updateSun(){
    const list = [
      'sun0', 'sun01',
      'sun02', 'sun03'
    ]
    sun.removeClass(list.join(' '))
    sun.addClass(list[STATE_SUN]);
    $('#info-sun').html(STATE_SUN).animateCss('fadeIn');;
    $('#info-panel').text(`${STATE_SUN * 1000}W`).animateCss('bounceIn');

    if(STATE_SUN == 1){
      clouds.removeClass('night')
    } else if (STATE_SUN == 0) {
      clouds.addClass('night');
    }
  }
  function g_updateLinePanelRegualtor(){
    l_panel.removeClass('animate-line x2 x3')
    l_regulator.removeClass('animate-line-v x2 x3')

    if(STATE_SUN != 0){
      l_panel.addClass('animate-line')
      l_regulator.addClass('animate-line-v')
    }else { return; }
    if(STATE_SUN == 2 || STATE_SUN == 3){
      l_panel.addClass(`x${STATE_SUN}`)
      l_regulator.addClass(`x${STATE_SUN}`)
    }
  }

  //**** REGULATOR ****//
  function toggleRegulator(){
    STATE_REGU = !STATE_REGU;
    g_updateRegulatorWifi();
  }
  function g_updateRegulatorWifi(){
    if(STATE_REGU){ //on
      regulator.removeClass('off')
      $('#wifi').removeClass('hide');
    }else{ //off
      regulator.addClass('off')
      $('#wifi').addClass('hide');
    }
  }
  //**** BATTERY ****//
  function toggleBattery(){
    if(STATE_BAT != 'b_off'){
      STATE_BAT = 'b_off'
    }else{
      STATE_BAT = 'charging'
    }
    g_updateBatter()
  }
  function g_updateBatter(){
    let list = ['b_on', 'b_off', 'charging',
                'uncharging', 'both']

    battery.removeClass( list.join(' ') )
    battery.addClass(STATE_BAT)
  }
  //**** APPLIANCES ****//
  function toggleAppl(key){
    STATE_APPL[key].state = !STATE_APPL[key].state;
    g_updateAppliances()
  }
  function g_updateAppliances(){
    $.each(STATE_APPL, (key, val) => {
      if(val.state) { $('#btn_'+key).removeClass('off') }
      else { $('#btn_'+key).addClass('off') }
    })
    calcAppliancesUse()
  }
  function calcAppliancesUse(){
    let sum = 0, total = 6000;
    $.each(STATE_APPL, (key, val) => {
      if(val.state) { sum+=val.val }
    })
    USE_APPLIANCE =  (sum*100/total)/10;

    $('.blocks span').removeClass('on'); //clean
    for(let i = 0; i < USE_APPLIANCE; i++){
      $('.block-'+i).addClass('on');
    }
  }
  

  /*
   *HELPERS
   */
  const hide = function(ele){
    ele.css({ display: 'none' })
  }
  const debounce = function(method, delay) {
    clearTimeout(method._tId);
    method._tId = setTimeout(() => {
      method();
    }, delay);
  };


  //ANIMATION
  $.fn.extend({
    animateCss: function (animationName) {
      var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      this.addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName);
      });
    }
  });


  init();

})()
