class Transformer{
  init(container){
    this.debug = false;

    this._target = null;
    this._container = null;
    if(!this.container){
      this.container = container;
      this.initEvent();
    }
    
    this.pointerTarget = null;

    
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
  set target(target){
    if(this._target){
      this._target.classList.remove('tf-on') 
    }
    
    this._target = target
    if(this._target){
      this.container.classList.add('tf-on');
      this._target.classList.add('tf-on') 
    }else{
      this.container.classList.remove('tf-on');
    }
    this.syncGuide();
    this.syncTool();
  }
  get target(){
    return this._target;
  }
  set container(container){
    this._container = container
  }
  get container(){
    return this._container;
  }
  get box(){
    return this.target;
  }
  get tool(){
    return this._container.querySelector('.tf-tool');
  }
  get guide(){
    return this._container.querySelector('.tf-guide');
  }
  syncTool(){
    if(!this.target){ return false }
    const rect = this.target.getBoundingClientRect();
    const tool = this.tool;
    tool.style.setProperty('--top',rect.top+(rect.height)+'px');
    tool.style.setProperty('--left',rect.left+(rect.width-200)/2+'px');
  }
  syncGuide(){
    if(!this.target){ return false }
    const rect = this.target.getBoundingClientRect();
    const guide = this.guide;
    guide.style.setProperty('top',rect.top+'px');
    guide.style.setProperty('left',rect.left+'px');
    guide.style.setProperty('width',rect.width+'px');
    guide.style.setProperty('height',rect.height+'px');

    
  }

  translate(x,y){
    if(this.debug) console.log('translate',x,y);
    this.box.style.setProperty('--translate-x',x+'px');
    this.box.style.setProperty('--translate-y',y+'px');
    this.syncGuide();
    this.syncTool();
  }

  scaleBy(scale){
    this.scaleTo(parseFloat(getComputedStyle(this.box).getPropertyValue('--scale-x'))+scale)
  }
  scaleTo(scale){
    this.box.style.setProperty('--scale-x',scale);
    this.box.style.setProperty('--scale-y',scale);
    this.syncGuide();
    // this.syncTool();
  }

  rotateBy(rotate){
    const v = getComputedStyle(this.box).getPropertyValue('--rotate-y');
    if(v =='180deg'){
      rotate *= -1;
    }
    this.rotateTo(parseInt(getComputedStyle(this.box).getPropertyValue('--rotate'))+rotate)
  }
  rotateTo(rotate){

    
    this.box.style.setProperty('--rotate',rotate+'deg');
    this.syncGuide();
    // this.syncTool();
  }
  rotateYToggle(){
    const v = getComputedStyle(this.box).getPropertyValue('--rotate-y');
    if(v =='180deg'){
      this.box.style.setProperty('--rotate-y','0');
    }else{
      this.box.style.setProperty('--rotate-y','180deg');
    }
    this.syncGuide();
    // this.syncTool();
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
      this.syncGuide();
    });

    document.addEventListener('pointermove', (event)=>{ 
      if(!this.pointerTarget){ return false; }
      this.stopevent(event);
      let x = event.x - this._x0;
      let y = event.y - this._y0;
      if(this.debug) console.log(this.pointerTarget.dataset.transform);
      this.translate(this._tx+x,this._ty+y);
      this.syncGuide();
    });
    window.addEventListener('touchstart',(event)=> {
      if(this.pointerTarget){ this.stopevent(event); return false; }
    }, {passive:false});

    // translate
    document.onpointerdown = (event)=>{ 
      const el = event.target.closest('.tf-target');
      if(!this.target || this.target != el){return;}
      
      this.stopevent(event);
      this.pointerTarget = el;
      this._tx = parseInt(getComputedStyle(this.target).getPropertyValue('--translate-x'));
      this._ty = parseInt(getComputedStyle(this.target).getPropertyValue('--translate-y'));
      this._x0 = event.x;
      this._y0 = event.y;
      return false;
    };

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
      console.log('click')
      this.target = el;
    });
  }

}