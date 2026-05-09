/* ===== CLICQR — Premium E-Commerce with 3D ===== */
(function(){
'use strict';

/* --- Preloader --- */
const preloader=document.getElementById('preloader');
setTimeout(()=>{preloader.classList.add('done');initAll();},1800);

/* --- State --- */
let cart=[];
const cartSidebar=document.getElementById('cart-sidebar');
const cartOverlay=document.getElementById('cart-overlay');
const cartItems=document.getElementById('cart-items');
const cartFooter=document.getElementById('cart-footer');
const cartCount=document.getElementById('cart-count');
const cartHeaderCount=document.getElementById('cart-header-count');
const cartTotalPrice=document.getElementById('cart-total-price');
const toast=document.getElementById('toast');

/* --- Custom Cursor (Desktop) --- */
const dot=document.getElementById('cursor-dot');
const ring=document.getElementById('cursor-ring');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;if(dot){dot.style.left=cx+'px';dot.style.top=cy+'px';}});
function animCursor(){rx+=(cx-rx)*.12;ry+=(cy-ry)*.12;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px';}requestAnimationFrame(animCursor);}
animCursor();
document.querySelectorAll('a,button,[data-tilt]').forEach(el=>{el.addEventListener('mouseenter',()=>{if(ring)ring.style.cssText+=';width:50px;height:50px;border-color:rgba(232,115,74,.4)';});el.addEventListener('mouseleave',()=>{if(ring)ring.style.cssText+=';width:36px;height:36px;border-color:var(--accent)';});});

/* --- Navbar Scroll --- */
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',window.scrollY>50);});

/* --- Mobile Menu --- */
const menuBtn=document.getElementById('mobile-menu-btn');
const mobileMenu=document.getElementById('mobile-menu');
if(menuBtn){menuBtn.addEventListener('click',()=>{menuBtn.classList.toggle('active');mobileMenu.classList.toggle('active');document.body.style.overflow=mobileMenu.classList.contains('active')?'hidden':'';});}
document.querySelectorAll('.mobile-link').forEach(l=>{l.addEventListener('click',()=>{menuBtn.classList.remove('active');mobileMenu.classList.remove('active');document.body.style.overflow='';});});

/* --- Smooth Scroll --- */
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}});});

/* --- Cart --- */
document.getElementById('cart-btn').addEventListener('click',openCart);
document.getElementById('cart-close').addEventListener('click',closeCart);
cartOverlay.addEventListener('click',closeCart);
function openCart(){cartSidebar.classList.add('active');cartOverlay.classList.add('active');document.body.style.overflow='hidden';}
function closeCart(){cartSidebar.classList.remove('active');cartOverlay.classList.remove('active');document.body.style.overflow='';}
function updateCart(){
    cartCount.textContent=cart.length;
    cartHeaderCount.textContent='('+cart.length+')';
    if(cart.length===0){cartItems.innerHTML='<div class="cart-empty">Your bag is empty</div>';cartFooter.style.display='none';return;}
    cartFooter.style.display='block';
    let total=0;
    cartItems.innerHTML=cart.map((item,i)=>{total+=item.price;return`<div class="cart-item"><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">$${item.price}</div><button class="cart-item-remove" onclick="removeFromCart(${i})">Remove</button></div></div>`;}).join('');
    cartTotalPrice.textContent='$'+total;
}
window.removeFromCart=function(i){cart.splice(i,1);updateCart();showToast('Removed from bag');};

document.querySelectorAll('.quick-add-btn').forEach(btn=>{btn.addEventListener('click',e=>{
    e.stopPropagation();
    const name=btn.dataset.name;
    const price=parseInt(btn.dataset.price);
    cart.push({name,price});
    updateCart();
    showToast(name+' added to bag!');
});});

function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500);}

/* --- Product Filters --- */
const filterBtns=document.querySelectorAll('.filter-btn');
const productCards=document.querySelectorAll('.product-card');
filterBtns.forEach(btn=>{btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    productCards.forEach((card,i)=>{
        const match=f==='all'||card.dataset.category===f;
        card.style.display=match?'':'none';
        if(match){card.style.animation='none';card.offsetHeight;card.style.animation=`fadeUp .5s ${i*.08}s both`;}
    });
});});

/* --- 3D Tilt Cards --- */
document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='';});
});

/* --- Newsletter --- */
document.getElementById('newsletter-form').addEventListener('submit',e=>{e.preventDefault();showToast('Welcome to the inner circle! 🎉');e.target.reset();});

/* ===== THREE.JS 3D BACKGROUND ===== */
function initThree(){
    const c=document.getElementById('three-bg');
    if(!c||typeof THREE==='undefined')return;
    const renderer=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,.1,100);
    camera.position.z=6;

    // Materials
    const mat1=new THREE.MeshStandardMaterial({color:0xe8734a,metalness:.3,roughness:.5,wireframe:false,transparent:true,opacity:.6});
    const mat2=new THREE.MeshStandardMaterial({color:0x6c5ce7,metalness:.3,roughness:.5,transparent:true,opacity:.5});
    const mat3=new THREE.MeshStandardMaterial({color:0xf0a0c0,metalness:.4,roughness:.4,transparent:true,opacity:.4});
    const wireMat=new THREE.MeshBasicMaterial({color:0xe8734a,wireframe:true,transparent:true,opacity:.08});

    // Shapes
    const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(.9,1),mat1);ico.position.set(3,1.5,-2);scene.add(ico);
    const icoW=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,1),wireMat);icoW.position.copy(ico.position);scene.add(icoW);
    const torus=new THREE.Mesh(new THREE.TorusGeometry(1.2,.03,8,80),new THREE.MeshBasicMaterial({color:0x6c5ce7,transparent:true,opacity:.15}));torus.position.set(-3,.5,-2);torus.rotation.x=Math.PI/3;scene.add(torus);
    const oct=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),mat2);oct.position.set(-2,-1.5,-1);scene.add(oct);
    const sphere=new THREE.Mesh(new THREE.SphereGeometry(.4,16,16),mat3);sphere.position.set(2,-2,-1.5);scene.add(sphere);
    const torus2=new THREE.Mesh(new THREE.TorusKnotGeometry(.3,.08,64,8),new THREE.MeshStandardMaterial({color:0xf5a623,metalness:.5,roughness:.3,transparent:true,opacity:.4}));torus2.position.set(0,2.5,-3);scene.add(torus2);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff,.6));
    const dl=new THREE.DirectionalLight(0xffd0a0,1.5);dl.position.set(5,5,5);scene.add(dl);
    const dl2=new THREE.DirectionalLight(0xc0a0ff,1);dl2.position.set(-5,-3,3);scene.add(dl2);

    let mx=0,my=0,tmx=0,tmy=0;
    document.addEventListener('mousemove',e=>{tmx=(e.clientX/window.innerWidth-.5)*2;tmy=(e.clientY/window.innerHeight-.5)*2;});

    let t=0;
    function animate(){
        requestAnimationFrame(animate);
        t+=.005;mx+=(tmx-mx)*.03;my+=(tmy-my)*.03;
        ico.rotation.x=t*.4+my*.3;ico.rotation.y=t*.6+mx*.3;icoW.rotation.copy(ico.rotation);
        torus.rotation.z=t*.3;torus.rotation.y=t*.15+mx*.2;
        oct.rotation.x=t*.5;oct.rotation.y=t*.7+mx*.2;
        sphere.position.y=-2+Math.sin(t*2)*.3;sphere.rotation.y=t;
        torus2.rotation.x=t*.3;torus2.rotation.y=t*.4;
        camera.position.x=mx*.4;camera.position.y=my*.3;camera.lookAt(scene.position);
        renderer.render(scene,camera);
    }
    animate();
    window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
}

/* ===== GSAP ANIMATIONS ===== */
function initGSAP(){
    if(typeof gsap==='undefined')return;
    gsap.registerPlugin(ScrollTrigger);
    const tl=gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to('.hero-badge',{opacity:1,y:0,duration:.8})
      .to('.title-word',{y:0,opacity:1,duration:1,stagger:.1},'-=.4')
      .to('.hero-subtitle',{opacity:1,y:0,duration:.8},'-=.5')
      .to('.hero-actions',{opacity:1,y:0,duration:.8},'-=.5')
      .to('.hero-stats',{opacity:1,y:0,duration:.8},'-=.4')
      .to('.floating-tag',{opacity:1,duration:.6,stagger:.15},'-=.3')
      .to('.scroll-indicator',{opacity:.6,duration:.6},'-=.2');

    // Hero image parallax
    gsap.to('.hero-image-card',{y:-30,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.5}});

    // Section reveals
    gsap.utils.toArray('.section-tag').forEach(el=>{gsap.from(el,{opacity:0,y:20,duration:.8,scrollTrigger:{trigger:el,start:'top 88%'}});});
    gsap.utils.toArray('.section-title').forEach(el=>{gsap.from(el,{opacity:0,y:30,duration:1,scrollTrigger:{trigger:el,start:'top 88%'}});});

    // Product cards stagger
    ScrollTrigger.create({trigger:'.products-grid',start:'top 85%',onEnter:()=>{document.querySelectorAll('.product-card').forEach((c,i)=>{setTimeout(()=>c.classList.add('visible'),i*100);});}});

    // Category cards
    gsap.from('.category-card',{y:60,opacity:0,duration:1,stagger:.15,scrollTrigger:{trigger:'.categories-grid',start:'top 85%'}});

    // About
    gsap.from('.about-text',{x:-40,opacity:0,duration:1,scrollTrigger:{trigger:'.about-grid',start:'top 80%'}});
    gsap.from('.about-image-stack',{x:40,opacity:0,duration:1,scrollTrigger:{trigger:'.about-grid',start:'top 80%'}});

    // Testimonials
    gsap.from('.testimonial-card',{y:40,opacity:0,duration:.8,stagger:.12,scrollTrigger:{trigger:'.testimonials-grid',start:'top 85%'}});

    // Counter animation
    document.querySelectorAll('.stat-num').forEach(el=>{
        const target=parseFloat(el.dataset.count);
        const isFloat=target%1!==0;
        gsap.to(el,{innerText:target,duration:2,snap:isFloat?{innerText:.1}:{innerText:1},ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
    });
}

function initAll(){initThree();initGSAP();}

// Inject fadeUp keyframe
const style=document.createElement('style');
style.textContent='@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(style);
})();
