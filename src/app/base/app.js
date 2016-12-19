(()=> {
  /*
   *Global variables
   */
  let STATE_SUN = 1; //1,2,3,0
  let STATE_REGU = true; //true, false
  let STATE_ELECT = true; //true, false
  let STATE_BAT = 'b_on'; //b_on, b_ff, charging, uncharging, both 

  let TIMER = null;

  let STATE_APPL = {
    'air': {state: false, val: 3500},
    'wash': {state: false, val: 1200},
    'cleaner': {state: false, val: 1000},
    'tv': {state: false, val: 300},

    'pool': {state: false, val: 2000, sec: true},
    'jacuzzi': {state: false, val: 3000, sec: true},
    'air2': {state: false, val: 1500, sec: true},
    'bomb': {state: false, val: 1500, sec: true}
  }; 

  let USE_APPLIANCE = 0; //%
  let USE_APPLIANCE_SUM = 0; //sum 

  let USE_APPLIANCE2 = 0; //%
  let USE_APPLIANCE_SUM2 = 0; //sum 

  let BATTER_VOL = 1500;

  /*
   * Elements
   */
  let sun = $('#sun');
  let btn_sun = $('#btn-sun');
  let clouds = $('.back-top')
  let panel = $('#panel');
  let regulator = $('#regulator');
  let btn_regulator = $('#btn_regulator');
  let electrical = $('#electrical');
  let btn_electrical = $('#btn_electrical');
  let battery = $('#battery');
  let btn_battery = $('#btn_battery');
  let appliances = $('.appliances')
  //lines
  let l_panel = $('#line-panel');
  let l_regulator = $('#line-regulator');
  let l_electrical = $('#line-electrical');
  let l_battery = $('#line-battery');

  let l_off = $('#line-off');
  let l_appl_1 = $('#line-appl-1');
  let l_appl_2 = $('#line-appl-2');

  /*
   *MAIN FUNCTION
   */
  const init = () => {
    debounce(renderLines, 200);
    animations();
    events();

    debounce(updateSystem, 210);
  }
  const events = () => {
    btn_sun.on('click', incrementSun)
    btn_regulator.on('click', toggleRegulator)
    btn_electrical.on('click', toggleElectrical)
    btn_battery.on('click', toggleBattery)

    //appliances
    $.each(STATE_APPL, (key, val) => {
      $('#btn_'+key).on('click', () => { toggleAppl(key) })
    })
    //re-render lines on window resize
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
    left = v_left+2;
    width = battery.offset().left - left;
    _updateLine(l_battery, top, left, width)

    //V_LINE APPLIANCES or OFF
    top = t_top+2;
    left = v_left;
    height = appliances.offset().top + appliances.height()/2 - top + 2;
    _updateLine(l_off, top, left, null, height)

    //V_LINE APPL 1  
    top = appliances.offset().top + appliances.height()/2;
    left = appliances.offset().left + appliances.width()+2;
    width = v_left - appliances.offset().left - appliances.width();
    _updateLine(l_appl_1, top, left, width, null)
    
    //V_LINE APPL 2  
    top = appliances.offset().top + appliances.height()/2;
    left = v_left+2;
    width = v_left - appliances.offset().left - appliances.width() + 6;
    _updateLine(l_appl_2, top, left, width, null)
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

    updateSystem();
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

    //sky clouds effect
    if(STATE_SUN == 1){
      clouds.removeClass('night')
    } else if (STATE_SUN == 0) {
      clouds.addClass('night');
    }
  }
  function g_updateLinePanelRegualtor(){
    //reset animation on lines
    l_panel.removeClass('animate-line x2 x3')
    l_regulator.removeClass('animate-line-v x2 x3')

    if(STATE_SUN == 0 || !STATE_REGU){
      return;
    }else { 
      l_panel.addClass('animate-line')
      l_regulator.addClass('animate-line-v')
    }
    //add speed class
    if(STATE_SUN == 2 || STATE_SUN == 3){
      l_panel.addClass(`x${STATE_SUN}`)
      l_regulator.addClass(`x${STATE_SUN}`)
    }
  }

  //**** REGULATOR ****//
  function toggleRegulator(){
    STATE_REGU = !STATE_REGU;
    g_updateLinePanelRegualtor();
    g_updateRegulatorWifi();

    updateSystem();
  }
  function g_updateRegulatorWifi(){
    if(STATE_REGU){ //on
      regulator.removeClass('off')
      $('#wifi').removeClass('hide');
      $('#g_wifi').removeClass('w_off');
    }else{ //off
      regulator.addClass('off')
      $('#wifi').addClass('hide');
      $('#g_wifi').addClass('w_off');
    }
  }
  //**** ELECTRICAL SOURCE ****//
  function toggleElectrical(){
    STATE_ELECT = !STATE_ELECT;
    g_updateLinePanelRegualtor();

    updateSystem();
    if(STATE_ELECT){
      btn_electrical.removeClass('off');
    }else{
      btn_electrical.addClass('off');
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

    updateSystem();
  }
  function g_updateBatter(state){
    let list = ['b_on', 'b_off', 'charging',
                'uncharging', 'both']

    battery.removeClass( list.join(' ') )
    battery.addClass(state || STATE_BAT)
  }

  function chargeBattery(cb, s=7){
    //active bar
    l_battery.animateLine(`animate-line x${STATE_SUN}`)
    //active battery
    g_updateBatter('charging')
    //timer unactive bar and battery
    if (TIMER) clearTimeout(TIMER)
    TIMER = setTimeout(() => {
      l_battery.removeClass('animate-line x2 x3 reverse')
      g_updateBatter('b_on')
      if(cb) cb();
    }, (s - STATE_SUN) * 1000);
  }
  function feedElectrical(speed){
    l_electrical.animateLine(`animate-line reverse x${speed || STATE_SUN}`)
  }
  //**** APPLIANCES ****//
  function toggleAppl(key){
    STATE_APPL[key].state = !STATE_APPL[key].state;
    g_updateAppliances()
    updateSystem();
  }
  function g_updateAppliances(){
    $.each(STATE_APPL, (key, val) => {
      if(val.state) { $('#btn_'+key).removeClass('off') }
      else { $('#btn_'+key).addClass('off') }
    })
    calcAppliancesUse()
  }
  function calcAppliancesUse(){
    //fist block
    let sum = 0, total = 6000;
    $.each(STATE_APPL, (key, val) => {
      if(!val.sec && val.state) { sum+=val.val }
    })

    USE_APPLIANCE_SUM =  sum;
    USE_APPLIANCE =  sum*100/total;

    let tm = USE_APPLIANCE/10;
    if(tm < 1 && tm > 0) tm = tm=1;

    $('.blocks span').removeClass('on'); //clean
    for(let i = 0; i < parseInt(tm); i++){
      $('.blocks .block-'+i).addClass('on');
    }
    //second block
    sum = 0, total = 8000;
    $.each(STATE_APPL, (key, val) => {
      if(val.sec && val.state) { sum+=val.val }
    })

    USE_APPLIANCE_SUM2 =  sum;
    USE_APPLIANCE2 =  sum*100/total;

    tm = USE_APPLIANCE2/10;
    if(tm < 1 && tm > 0) tm = tm=1;

    $('.blocks2 span').removeClass('on'); //clean
    for(let i = 0; i < parseInt(tm); i++){
      $('.blocks2 .block-'+i).addClass('on');
    }
  }

  //GLOBAL
  function updateSystem(){
    l_off.animateLine('')
    l_electrical.animateLine('')
    l_battery.animateLine('')
    l_appl_1.animateLine('')
    l_appl_2.animateLine('')

    if (TIMER) clearTimeout(TIMER)

    let sun_val = STATE_SUN * 1000;

    if(STATE_SUN == 0 || !STATE_REGU){
      if(STATE_BAT != 'b_off'){ 
        if(USE_APPLIANCE > 0){ //accesories with regulator off and battery on
          l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )
          l_appl_1.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )

          g_updateBatter('uncharging');

          if(USE_APPLIANCE_SUM <= BATTER_VOL){
            l_battery.animateLine('animate-line reverse')
            if(USE_APPLIANCE_SUM < 1000){
            }else if(USE_APPLIANCE_SUM < 1300){
              l_battery.addClass('x2')
            }else {
              l_battery.addClass('x3')
            }
          }else{
            l_battery.animateLine('animate-line reverse')
            l_electrical.animateLine('animate-line')
            if(USE_APPLIANCE_SUM <= 2500){
              l_battery.addClass('x2');
              l_electrical.addClass('x2');
            }else{
              l_battery.addClass('x3');
              l_electrical.addClass('x3');
            }
          }
        }else{
          g_updateBatter(' ');
        }
        if( USE_APPLIANCE2 > 0 ){
          l_appl_2.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM)}` )
          l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM)}` )
          l_battery.animateLine(`animate-line reverse`)

          g_updateBatter('uncharging');
          if( USE_APPLIANCE_SUM + USE_APPLIANCE_SUM2 > BATTER_VOL ){
            l_electrical.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM)}` );
          }
        }
      }else{
        if(USE_APPLIANCE > 0){ //accesories with regulator off and battery off
          l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )
          l_appl_1.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )
          l_electrical.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` );
        }
        if( USE_APPLIANCE2 > 0 ){
          l_appl_2.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2)}` )
          l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM)}` )
          l_electrical.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM)}` );
        }

      }
    }else{
      if(STATE_BAT != 'b_off'){
        if(USE_APPLIANCE > 0){ //accesories with regulator on, battery on
          l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` );
          l_appl_1.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )

          batOnPanelOn(USE_APPLIANCE_SUM, sun_val); //function below same reusable for appliance 2 

          if(USE_APPLIANCE2 > 0){ //set appliances1 and appliances2 on //PICHERO

            l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM+USE_APPLIANCE_SUM2)}` );
            l_appl_2.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2)}` )

            if (TIMER) clearTimeout(TIMER)
            batOnPanelOn(USE_APPLIANCE_SUM + USE_APPLIANCE_SUM2, sun_val); //function below same reusable for appliance 2 
          }
        }else{
          if(USE_APPLIANCE2 > 0){ //app1 off app2 on
            l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM2)}` );
            l_appl_2.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2)}` )

            batOnPanelOn(USE_APPLIANCE_SUM2, sun_val); //function below same reusable for appliance 1 above 

          }else { //both appliances off 
            //if sun > 1 charge electrical and battery both
            if(STATE_SUN > 1){ 
              chargeBattery()
              feedElectrical();
            }else{
              chargeBattery(() => {
                feedElectrical();
              })
            }
          }
        }
      }else{
        if(USE_APPLIANCE > 0){ //accesories with regulator on, batery off
          l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` );
          l_appl_1.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )

          if(USE_APPLIANCE_SUM > sun_val) {
            l_electrical.animateLine( `animate-line ${getDiference(USE_APPLIANCE_SUM, sun_val)}` );
          }else if( USE_APPLIANCE_SUM == sun_val) {
            l_electrical.animateLine('');
          } else {
            l_electrical.animateLine('animate-line reverse');
          }

          if( USE_APPLIANCE2 > 0){ //both appliance 1 and 2 on
            l_appl_2.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM)}` )
            l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM)}` );
            if( ( sun_val - USE_APPLIANCE_SUM - USE_APPLIANCE_SUM2 ) > 0 ){
              l_electrical.animateLine('animate-line reverse');
            }else {
              l_electrical.animateLine( `animate-line 
                      ${getDiference(USE_APPLIANCE_SUM2 + USE_APPLIANCE_SUM, sun_val)}` );
            }

          }
        }else{
          if( USE_APPLIANCE2 > 0){ //just appliance 1 on
            l_off.animateLine( `animate-line-v ${getAppliencesSpeed(USE_APPLIANCE_SUM2)}` );
            l_appl_2.animateLine( `animate-line ${getAppliencesSpeed(USE_APPLIANCE_SUM2)}` )

            if(USE_APPLIANCE_SUM2 > sun_val) {
              l_electrical.animateLine( `animate-line ${getDiference(USE_APPLIANCE_SUM2, sun_val)}` );
            }else if( USE_APPLIANCE_SUM2 == sun_val) {
              l_electrical.animateLine('');
            } else {
              l_electrical.animateLine('animate-line reverse');
            }
          }else { // set appliance 1 and 2 off
            l_electrical.animateLine('animate-line reverse');
          }
        }
      }
    }

  };

  function getDiference(val1, val2, opt){
    let tmp = val1 - val2;
    if(opt) return tmp;

    if (tmp <= 1000) return '';
    if (tmp <= 1500) return ' x2';
    return ' x3'
  }
  function getAppliencesSpeed(val){
    if(val < 2500) return '';
    if(val <= 4500) return ' x2';
    return ' x3'
  }
  function batOnPanelOn(useAppS, sun_val){
    if(useAppS > sun_val){
      if(useAppS > (sun_val + BATTER_VOL)){
        l_battery.animateLine('animate-line reverse x3')
        l_electrical.animateLine('animate-line')
        g_updateBatter('uncharging')
      }else{
        if( (useAppS - sun_val) <= 500) {
          g_updateBatter('both')
        }else{
          g_updateBatter('uncharging')
        }
        l_battery.animateLine('animate-line reverse x3')
      }
    }else if( useAppS == sun_val ){
      g_updateBatter(' ')
    }else {
      //if sun > 1 charge electrical and battery both
      console.log(getDiference((sun_val + BATTER_VOL), useAppS, true));
      if( getDiference((sun_val + BATTER_VOL), useAppS, true) <= 2500 ){ 
        chargeBattery()
        feedElectrical('2');
      }else{
        chargeBattery(() => {
          feedElectrical('2');
        })
      }
    }
  }
  

  /*
   *HELPERS
   */
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
    },
    animateLine: function (animations) {
      var all = 'animate-line animate-line-v reverse x0 x1 x2 x3';
      this.removeClass(all).addClass(animations)
    }
  });


  init();

})()
