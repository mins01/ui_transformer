class Transformer{
  constructor() {
    this.debug = false;

    this._target = null;
    this._container = null;    
    this.pointerTarget = null;
    // this.minScale = 0.2; // 20%
    // this.maxScale = 3; // 300% 
    this.minScale = null; //null 이면 무제한 축소
    this.maxScale = null; //null 이면 무제한 확대
    // this.minRotate = -180; 
    // this.maxRotate = 180;
    this.minRotate = null; 
    this.maxRotate = null;
    
    this._tx = null;
    this._ty = null;
    this._tw = null;
    this._th = null;
    this._tRect = null;
    this._x0 = null;
    this._y0 = null;
    this._x1 = null;
    this._y1 = null;
  }
  init(container){
    if(!this.container){
      this.container = container;
      this.initEvent();
    }
  }
  set target(target){
    if(this._target){
      this._target.classList.remove('tf-on') 
    }
    
    this._target = target
    if(this._target){
      this.container.classList.add('tf-on');
      this._target.classList.add('tf-on') 
      this.container.dataset.targetNodeName = this._target.nodeName;
      if(this._target.dataset.targetExtTools===undefined) { delete this.container.dataset.targetExtTools}
      else{this.container.dataset.targetExtTools = this._target.dataset.targetExtTools}
    }else{
      this.container.classList.remove('tf-on');
      delete this.container.dataset.targetNodeName;
      delete this.container.dataset.targetExtTools;
    }
    this.syncGuide();
    this.syncTool();
  }
  get target(){
    return this._target;
  }
  get targetArea(){
    if(!this.target) return null;
    return this.target.closest('.tf-target-area');
  }
  set container(container){
    this._container = container
  }
  get container(){
    return this._container;
  }
  get targetBound(){
    if(!this.target) return null;
    let targetBound = this.target.querySelector('.tf-target-bound');
    if(!targetBound) targetBound = this.target;
    return targetBound;
  }
  
  // get box(){
  //   return this.target;
  // }
  get tool(){
    return this._container.querySelector('.tf-tool');
  }
  get guide(){
    return this._container.querySelector('.tf-guide');
  }
  syncTool(){
    if(!this.target){ return false }
    const rect = this.targetBound.getBoundingClientRect();
    const tool = this.tool;
    const toolRect = this.tool.getBoundingClientRect();
    tool.style.setProperty('--top',rect.top+(rect.height)+'px');
    tool.style.setProperty('--left',rect.left+(rect.width-toolRect.width)/2+'px');
  }
  syncGuide(){
    if(!this.target){ return false }
    const rect = this.targetBound.getBoundingClientRect();
    const guide = this.guide;
    guide.style.setProperty('top',rect.top+'px');
    guide.style.setProperty('left',rect.left+'px');
    guide.style.setProperty('width',rect.width+'px');
    guide.style.setProperty('height',rect.height+'px');

    
  }
  getCenterPosition(){
    if(!this.target){ return false }
    const targetArea = this.targetArea;
    const targetBound = this.targetBound;
    console.log(targetBound);
    if(targetArea){
      let tRect , taRect;
      taRect = targetArea.getBoundingClientRect();
      if(targetBound.getBBox ){
        tRect = targetBound.getBBox();
      }else{
        tRect = targetBound.getBoundingClientRect();
      }
      // let tWidth = (this.target.dataset.tfWidth !== undefined)?this.target.dataset.tfWidth:tRect.width;
      // let tHeight = tRect.width;

      let x = (taRect.width-tRect.width)/2;
      let y = (taRect.height-tRect.height)/2;
      return [x,y];
    }
    return null;
  }
  translateCenter(translateCenter){
    const centerPosition = this.getCenterPosition()
    if(centerPosition){
      const x = centerPosition[0];
      const y = centerPosition[1];
      this.translate(x,y)
    }
  }
  translate(x,y){
    if(!this.target){return false;}
    const targetArea = this.targetArea;
    const targetBound = this.targetBound;
    if(targetArea){
      let tRect , taRect;
      taRect = targetArea.getBoundingClientRect();
      if(targetBound.getBBox ){
        tRect = targetBound.getBBox();
      }else{
        tRect = targetBound.getBoundingClientRect();
      }
      // ! <text>인 경우 text-anchor 로인해서 위치가 틀어진다. <text> 자체로 사용하지 말고 <g><rect><text></g> 형식으로 묶어 서라.
      // console.log(taRect.width,tRect.width)
      x = Math.min(x,taRect.width - tRect.width/2);
      x = Math.max(x,-1*tRect.width/2)
      y = Math.min(y,taRect.height - tRect.height/2);
      y = Math.max(y,-1*tRect.height/2)
      
    }
    
    
    if(this.debug) console.log('translate',x,y);
    this.target.style.setProperty('--translate-x',x+'px');
    this.target.style.setProperty('--translate-y',y+'px');
    this.syncGuide();
    this.syncTool();
  }

  remove(remove){
    if(!this.target){return false;}
    this.target.remove();
    this.target = null;
  }

  scaleBy(scale){
    if(!this.target){return false;}
    this.scaleTo(parseFloat(getComputedStyle(this.target).getPropertyValue('--scale-x'))+scale)
  }
  scaleTo(scale){
    if(!this.target){return false;}
    if(this.minScale !== null) scale = Math.max(scale,this.minScale);
    if(this.maxScale !== null) scale = Math.min(scale,this.maxScale);
    
    this.target.style.setProperty('--scale-x',scale);
    this.target.style.setProperty('--scale-y',scale);
    this.syncGuide();
    // this.syncTool();
  }

  rotateBy(rotate){
    if(!this.target){return false;}
    const v = getComputedStyle(this.target).getPropertyValue('--rotate-y');
    if(v =='180deg'){
      rotate *= -1;
    }
    this.rotateTo(parseInt(getComputedStyle(this.target).getPropertyValue('--rotate'))+rotate)
  }
  rotateTo(rotate){
    if(!this.target){return false;}
    if(this.minRotate !== null) rotate = Math.max(rotate,this.minRotate);
    if(this.maxRotate !== null) rotate = Math.min(rotate,this.maxRotate);

    this.target.style.setProperty('--rotate',rotate+'deg');
    this.syncGuide();
    // this.syncTool();
  }
  rotateYToggle(){
    if(!this.target){return false;}
    const v = getComputedStyle(this.target).getPropertyValue('--rotate-y');
    if(v =='180deg'){
      this.target.style.setProperty('--rotate-y','0');
    }else{
      this.target.style.setProperty('--rotate-y','180deg');
    }
    this.syncGuide();
    // this.syncTool();
  }
  order(order){
    if(!this.target){return false;}
    const target = this.target;
    console.log(order);
    if(order < 0){
      let next = target.nextElementSibling;
      while(next && !next.classList.contains('tf-target')){
        next = next.nextElementSibling;
      }
      if(next) target.parentNode.insertBefore(next,target);
    }else{
      let prev = target.previousElementSibling;
      while(prev && !prev.classList.contains('tf-target')){
        prev = prev.previousElementSibling;
      }
      if(prev) target.parentNode.insertBefore(target,prev);
    }
  }


  // svg <text>용
  textAnchor(textAnchor){
    this.target.setAttribute('text-anchor',textAnchor)
    this.syncGuide();
  }
  
  stopevent(event){
		if(this.debug) console.log(event.type);
		event.preventDefault(); 
		event.stopPropagation();
    return false;
	}

  initEvent(){
    document.addEventListener('scroll',(event)=>{ 
      this.syncGuide();
      this.syncTool();
    });

    document.addEventListener('pointerup',(event)=>{ 
      this.pointerTarget = null;
      console.log('pointerup',this.pointerTarget);
      this.syncGuide();
    });

    document.addEventListener('pointermove', (event)=>{ 
      if(!this.pointerTarget){ return false; }
      console.log('pointermove2222222',this);

      this.stopevent(event);
      let x = event.x - this._x0;
      let y = event.y - this._y0;
      if(this.debug) console.log(this.pointerTarget.dataset.transform);
      this.translate(this._tx+x,this._ty+y);
      this.syncGuide();
    });
    window.addEventListener('touchstart',(event)=> {
      if(this.target){ event.preventDefault();  return false; }
    }, {passive:false});

    // translate
    document.addEventListener('pointerdown', (event)=>{ 
      const el = event.target.closest('.tf-target');
      // if(!this.target || this.target != el){return;}
      if(!el){return;}
      this.target = el;
      // event.preventDefault();
      this.stopevent(event);
      this.pointerTarget = el;
      this._tx = parseInt(getComputedStyle(this.target).getPropertyValue('--translate-x'));
      this._ty = parseInt(getComputedStyle(this.target).getPropertyValue('--translate-y'));
      this._x0 = event.x;
      this._y0 = event.y;
      return false;
    });

    //---
    this.container.querySelectorAll('.tf-btn-transform').forEach(element => {
      element.onclick = (event)=>{
        this.stopevent(event);
        const target = event.target;
        if(target.dataset.rotateTo !== undefined){
          this.rotateTo(parseInt(target.dataset.rotateTo));
        }
        if(target.dataset.rotateYToggle !== undefined){
          this.rotateYToggle();
        }
        if(target.dataset.rotateBy !== undefined){
          this.rotateBy(parseInt(target.dataset.rotateBy));
        }
        if(target.dataset.scaleTo !== undefined){
          this.scaleTo(parseFloat(target.dataset.scaleTo));
        }
        if(target.dataset.scaleBy !== undefined){
          this.scaleBy(parseFloat(target.dataset.scaleBy));
        }
        if(target.dataset.order !== undefined){
          this.order(parseFloat(target.dataset.order));
        }
        if(target.dataset.textAnchor !== undefined){
          this.textAnchor(target.dataset.textAnchor);
        }
        if(target.dataset.translateCenter !== undefined){
          this.translateCenter(target.dataset.translateCenter);
        }
        if(target.dataset.remove !== undefined){
          this.remove(target.dataset.remove);
        }
      }
      return false;

    });
    
  }

  initAutoSet(){
    document.addEventListener('click', (event)=>{ 
      const el = event.target.closest('.tf-target');
      if(!el){
        this.target = null;
        return;
      }
    });
  }

}