(function(){
  const host=document.getElementById('arc-reactor');
  if(!host) return;
  const W=1200,H=270,CX=W/2,CY=H/2; // hero size
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  host.appendChild(svg);

  function el(n,attrs){const e=document.createElementNS(NS,n);for(const k in attrs)e.setAttribute(k,attrs[k]);return e}

  // defs
  const defs=el('defs',{});
  const bgGrad=el('radialGradient',{id:'bgGrad',cx:.5,cy:.5,r:.8});
  bgGrad.append(el('stop',{offset:'0%','stop-color':'#091019'}));
  bgGrad.append(el('stop',{offset:'60%','stop-color':'#09131f'}));
  bgGrad.append(el('stop',{offset:'100%','stop-color':'#070b12'}));
  const coreGrad=el('radialGradient',{id:'coreGrad',cx:.5,cy:.5,r:.7});
  coreGrad.append(el('stop',{offset:'0%','stop-color':'#e5fbff'}));
  coreGrad.append(el('stop',{offset:'60%','stop-color':'#6ee7ff'}));
  coreGrad.append(el('stop',{offset:'100%','stop-color':'#0ea5e9'}));
  const glowGrad=el('radialGradient',{id:'glowGrad',cx:.5,cy:.5,r:1});
  glowGrad.append(el('stop',{offset:'0%','stop-color':'rgba(255,255,255,.9)'}));
  glowGrad.append(el('stop',{offset:'100%','stop-color':'rgba(56,189,248,0)'}));
  const beamGrad=el('linearGradient',{id:'beamGrad',x1:0,y1:0,x2:0,y2:1});
  beamGrad.append(el('stop',{offset:'0%','stop-color':'#ffffff'}));
  beamGrad.append(el('stop',{offset:'50%','stop-color':'#e6f9ff'}));
  beamGrad.append(el('stop',{offset:'100%','stop-color':'#bdefff'}));
  const blur12=el('filter',{id:'blur12',x:'-20%',y:'-20%',width:'140%',height:'140%'});
  blur12.append(el('feGaussianBlur',{'in':'SourceGraphic',stdDeviation:'12'}));
  defs.append(bgGrad,coreGrad,glowGrad,beamGrad,blur12); svg.append(defs);

  // background
  svg.append(el('rect',{class:'bg',x:0,y:0,width:W,height:H}));

  // ring + ticks
  const gRot=el('g',{transform:`translate(${CX} ${CY})`}); svg.append(gRot);
  const outer=el('circle',{class:'ring',r:92,cx:0,cy:0}); gRot.append(outer);
  const ticks=el('g',{class:'ticks'}); gRot.append(ticks);
  for(let i=0;i<60;i++){
    const a=(i/60)*Math.PI*2; const r1=76,r2=(i%5===0)?88:84; 
    const x1=Math.cos(a)*r1,y1=Math.sin(a)*r1; const x2=Math.cos(a)*r2,y2=Math.sin(a)*r2;
    const ln=el('line',{x1,y1,x2,y2,opacity:(i%5===0)?1:.55}); ticks.append(ln);
  }

  // aperture (metal door segments that align)
  const aperture=el('g',{class:'aperture'}); gRot.append(aperture);
  const segCount=6, segW=18, segH=120;
  for(let i=0;i<segCount;i++){
    const g=el('g',{transform:`rotate(${(i*(360/segCount))})`});
    const r=el('rect',{x:-segW/2,y:-segH/2,width:segW,height:segH,rx:3,ry:3,fill:'#aab3bb',opacity:.85});
    g.append(r); aperture.append(g);
  }

  // core + inner glow
  const coreGlow=el('circle',{class:'glow',cx:CX,cy:CY,r:0}); svg.append(coreGlow);
  const core=el('circle',{class:'core',cx:CX,cy:CY,r:36}); svg.append(core);

  // beam (vertical)
  const beamW0=2; let beamW=beamW0; const beam=el('rect',{class:'beam',x:CX-beamW/2,y:0,width:beamW,height:H}); svg.append(beam);
  const beamGlow=el('rect',{class:'beamGlow',x:CX-1,y:0,width:2,height:H}); svg.append(beamGlow);
  const flash=el('rect',{class:'flash',x:0,y:0,width:W,height:H}); svg.append(flash);

  // timeline
  let start=null, ang=0, speed=360; // deg/s
  const SLOW_AT=1600, ALIGN_AT=2200, FIRE_AT=2800; // ms
  let aligned=false, fired=false;

  function raf(ts){
    if(!start) start=ts; const t=ts-start; const dt= (t<1?0: (ts-(raf.prev||ts)))/1000; raf.prev=ts;
    // rotation
    if(t<SLOW_AT){ speed = 360 - (320*(t/SLOW_AT)); } else { speed = 40; }
    ang = (ang + speed*dt) % 360; gRot.setAttribute('transform',`translate(${CX} ${CY}) rotate(${ang})`);

    // aperture alignment (snap to 0deg)
    if(t>ALIGN_AT && !aligned){ gRot.setAttribute('transform',`translate(${CX} ${CY}) rotate(0)`); aligned=true; }

    // glow grow
    const glowR = Math.min(150, 60 + t*0.06); coreGlow.setAttribute('r', glowR);
    coreGlow.setAttribute('opacity', aligned? .55:.35);

    // FIRE!
    if(t>FIRE_AT && !fired){ fired=true; flash.setAttribute('opacity',1); setTimeout(()=>flash.setAttribute('opacity',0),90);
      beam.setAttribute('opacity',1); beamGlow.setAttribute('opacity',.7);
    }
    if(fired){ // widen beam quickly then stabilize
      beamW += (24-beamW)*0.35; const x= CX - beamW/2; beam.setAttribute('x',x); beam.setAttribute('width',beamW);
      beamGlow.setAttribute('x',CX- (beamW*0.6)/2); beamGlow.setAttribute('width',beamW*0.6);
      // gentle fade to stable
      const bOp=parseFloat(beam.getAttribute('opacity')); if(bOp>0.65) beam.setAttribute('opacity', bOp-0.01);
    }

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
