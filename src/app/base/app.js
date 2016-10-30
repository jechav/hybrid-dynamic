(()=> {
  /*
   *Global variables
   */
  //let VIEW_TYPE = 'M' // M: mobile, T: tablet, D: desktop

  /*
   * Elements
   */
  let sun = $('#sun');
  let panel = $('#panel');
  let regulator = $('#regulator');
  let electrical = $('#electrical');
  let battery = $('#battery');
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
    renderLines()
    events();
  }
  const events = () => {
    sun.on('click', ()=>{
      console.log('click');
    })

    $(window).on("resize", () =>  debounce(renderLines, 200) );
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

  function locateOff(ele, start1, start2, target){
    let top = start1.offset().top + start1.height()/2; 
    let height = target.offset().top - top 

    let left = (( start2.offset().left - ( start1.offset().left + start1.width() ) ) / 2)
            + start1.offset().left + start1.width()
    //round 
    if( (left - Math.floor(left)).toFixed(1) > 0.4){
      left = left+1;
    }else { left = left+2 }

    updateLine(ele, top, left, null, height)
  }
  function locateIH(ele, start, target, half = 1){
    let top = start.offset().top + start.height()/2; 
    let width = (start.offset().left - (target.offset().left + target.width())) / half
    let left = target.offset().left + target.width() + width;

    updateLine(ele, top, left, width)
  }

  function locateH(ele, start, target, half = 1){
    let top = start.offset().top + start.height()/2
    let left = start.offset().left + start.width()
    let width = (target.offset().left - left) / half

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

  const hide = function(ele){
    ele.css({ display: 'none' })
  }
  const debounce = function(method, delay) {
    clearTimeout(method._tId);
    method._tId = setTimeout(() => {
      method();
    }, delay);
  };

  init();

})()
