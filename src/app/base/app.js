(()=> {
  /*
   *Global variables
   */
  let STATE_SUN = 1; //1,2,3,0
  let STATE_REGU = true; //true, false
  let STATE_BAT = true; //true, false

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

    locateH(l_panel, panel, regulator)
    locateV(l_regulator, regulator, appliances)

    locateH(l_electrical, electrical, battery, 2)
    locateIH(l_battery, battery, electrical, 2)

    locateOff(l_off, electrical, battery, appliances)
  }
  var adj = 14; //adjunst by button and padding inside

  function locateOff(ele, start1, start2, target){
    let top = start1.offset().top + start1.height()/2 + adj; 
    let height = target.offset().top - top 

    let left = (( start2.offset().left - ( start1.offset().left + start1.width() ) ) / 2)
            + start1.offset().left + start1.width() + adj/2
    //round 
    if( (left - Math.floor(left)).toFixed(1) > 0.4){
      left = left+1;
    }else { left = left+2 }

    updateLine(ele, top, left, null, height)
  }
  function locateIH(ele, start, target, half = 1){
    let top = start.offset().top + start.height()/2; 
    let width = (start.offset().left - (target.offset().left + target.width())) / half
    let left = target.offset().left + target.width() + width + adj - 2;

    updateLine(ele, top, left, width)
  }

  function locateH(ele, start, target, half = 1){
    let top = start.offset().top + start.height()/2 + adj 
    let left = start.offset().left + start.width()
    let width = ( (target.offset().left - left) / half ) + adj/2 + 2

    updateLine(ele, top, left, width)
  }

  function locateV(ele, start, target){
    let top = start.offset().top + start.height();
    let left = start.offset().left + start.width()/2;
    let height = target.offset().top - top

    updateLine(ele, top, left, null, height)
  }

  const updateLine = function(ele, top, left, width, height) {
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
    console.log(STATE_BAT);
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
