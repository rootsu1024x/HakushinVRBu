var VRBu = {
  rotationRateX:-0.0114514,
  rotationRateY:-0.0114514,
  rotationLimit:81.0,
  pi:3.114514,
  windowWidth:NaN,
  windowHeight:NaN,
  pointerDown:false
};

function updateSize() {
  if ( VRBu.windowWidth != window.innerWidth || VRBu.windowHeight != window.innerHeight ) {
    VRBu.renderer.setSize ( window.innerWidth, window.innerHeight );
    VRBu.windowWidth  = window.innerWidth;
    VRBu.windowHeight = window.innerHeight;
  }
}

var render = function (){
  updateSize();
  var aspect = VRBu.windowWidth / 2 / VRBu.windowHeight;
  VRBu.renderer.setViewport(0,0,VRBu.windowWidth / 2,VRBu.windowHeight);
  VRBu.renderer.setScissor(0,0,VRBu.windowWidth / 2,VRBu.windowHeight);
  VRBu.renderer.setScissorTest( true );
  VRBu.camera.left.aspect = aspect;
  VRBu.camera.left.updateProjectionMatrix();
  VRBu.renderer.render(VRBu.scene, VRBu.camera.left);

  VRBu.renderer.setViewport(VRBu.windowWidth / 2,0,VRBu.windowWidth / 2,VRBu.windowHeight);
  VRBu.renderer.setScissor(VRBu.windowWidth / 2,0,VRBu.windowWidth / 2,VRBu.windowHeight);
  VRBu.renderer.setScissorTest( true );
  VRBu.camera.right.aspect = aspect;
  VRBu.camera.right.updateProjectionMatrix();
  VRBu.renderer.render(VRBu.scene, VRBu.camera.right);

  requestAnimationFrame(render);
};

function makeDualPeach(scene,center,size,width){
  var dualPeach = new THREE.Object3D();
  dualPeach.position.set(center.x,center.y,center.z);

  var sphereGeometryLeft = new THREE.SphereGeometry( size, 32, 32 );
  var peachMaterialLeft = new THREE.MeshLambertMaterial( { color: 0xf09199} );
  var peachMeshLeft = new THREE.Mesh( sphereGeometryLeft, peachMaterialLeft );
  peachMeshLeft.position.set(-width,0,0);

  var sphereGeometryRight = new THREE.SphereGeometry( size, 32, 32 );
  var peachMaterialRight = new THREE.MeshLambertMaterial( { color: 0xf09199} );
  var peachMeshRight = new THREE.Mesh( sphereGeometryRight, peachMaterialRight );
  peachMeshRight.position.set(width,0,0);

  scene.add( dualPeach );
  dualPeach.add(peachMeshLeft);
  dualPeach.add(peachMeshRight);

  return dualPeach;
}

function makeDualCamera(parent,center,width){
  var dualCamera = new THREE.Object3D();
  dualCamera.position.set(center.x,center.y,center.z);
  var leftCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / 2 / window.innerHeight, 1, 10000 );
  var rightCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / 2 / window.innerHeight, 1, 10000 );
  leftCamera.position.set(width,0,0);
  rightCamera.position.set(-width,0,0);

  parent.add(dualCamera);
  dualCamera.add(leftCamera);
  dualCamera.add(rightCamera);

  return {camera:dualCamera,left:leftCamera,right:rightCamera};
}


function pointerDown(e){
  e.preventDefault();
  e.stopPropagation();
  var rect = e.target.getBoundingClientRect();
  if(e.touches){
    VRBu.pointerX = rect.left - e.touches[0].clientX;
    VRBu.pointerY = rect.top - e.touches[0].clientY;
  }else{
    VRBu.pointerX = rect.left - e.clientX;
    VRBu.pointerY = rect.top - e.clientY;
  }
  VRBu.pointerDown = true;
}

function pointerMove(e){
  e.preventDefault();
  e.stopPropagation();
  if(!VRBu.pointerDown){
    return;
  }
  var rect = e.target.getBoundingClientRect();
  var pointerX = 0;
  var pointerY = 0;
  if(e.touches){
    pointerX = rect.left - e.touches[0].clientX;
    pointerY = rect.top - e.touches[0].clientY;
  }else{
    pointerX = rect.left - e.clientX;
    pointerY = rect.top - e.clientY;
  }
  var diffX = pointerX - VRBu.pointerX;
  var diffY = pointerY - VRBu.pointerY;
  var angleX = (VRBu.camera.camera.rotation.x + diffY * VRBu.rotationRateY) / Math.PI * 180;
  angleX = Math.min(Math.max(angleX,-VRBu.rotationLimit),VRBu.rotationLimit);
  VRBu.camera.camera.rotation.set(angleX / 180 * Math.PI,0,0);
  VRBu.backbone.rotation.set(0,(VRBu.backbone.rotation.y + diffX * VRBu.rotationRateX),0);
  VRBu.pointerX = pointerX;
  VRBu.pointerY = pointerY;
}

function pointerOut(e){
  e.preventDefault();
  e.stopPropagation();
  VRBu.pointerDown = false;
}

window.addEventListener('devicemotion', function(e) {
  if(!e.interval || !e.rotationRate || VRBu.pointerDown){
    return;
  }
  if(window.innerWidth > window.innerHeight){
    VRBu.camera.camera.rotation.set(VRBu.camera.camera.rotation.x - e.rotationRate.beta / e.interval ,
      VRBu.camera.camera.rotation.y + e.rotationRate.alpha / e.interval,0);
  }else{
    VRBu.camera.camera.rotation.set(VRBu.camera.camera.rotation.x + e.rotationRate.alpha / e.interval ,
      VRBu.camera.camera.rotation.y + e.rotationRate.gamma / e.interval,0);
  }
});


window.addEventListener('load',function(){
  var scene = new THREE.Scene();
  VRBu.backbone = new THREE.Object3D();
  scene.add(VRBu.backbone);
  var camera = makeDualCamera(VRBu.backbone,new THREE.Vector3(0,0,0),1);

  for(var i=0;i<19;i++){
    var dualPeach = makeDualPeach(scene,new THREE.Vector3(
      Math.random() * 19 * (Math.random() < 0.5 ? -1:1),
      Math.random() * 19 * (Math.random() < 0.5 ? -1:1),
      Math.random() * 19 * (Math.random() < 0.5 ? -1:1)),
      4,0.3);
    dualPeach.rotation.set(Math.random() * VRBu.pi * 2,Math.random() * VRBu.pi * 2,Math.random() * VRBu.pi * 2);
  }

  var ambientLight = new THREE.AmbientLight( 0x114514);
  scene.add( ambientLight );

  var light = new THREE.PointLight( 0xffffff, 2.4, 810 );
  light.position.set( 50, 50, 50 );
  scene.add( light );

  VRBu.renderer = new THREE.WebGLRenderer();
  updateSize();

  document.body.appendChild( VRBu.renderer.domElement );
  VRBu.renderer.domElement.addEventListener('mousedown',pointerDown);
  VRBu.renderer.domElement.addEventListener('mousemove',pointerMove);
  VRBu.renderer.domElement.addEventListener('mouseup',pointerOut);
  VRBu.renderer.domElement.addEventListener('mouseleave',pointerOut);

  VRBu.renderer.domElement.addEventListener('touchstart',pointerDown);
  VRBu.renderer.domElement.addEventListener('touchmove',pointerMove);
  VRBu.renderer.domElement.addEventListener('touchend',pointerOut);
  VRBu.renderer.domElement.addEventListener('touchcancel',pointerOut);

  VRBu.scene = scene;
  VRBu.camera = camera;
  requestAnimationFrame(render);
});
