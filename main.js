import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';


// Scene setup  

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});

// Configure renderer

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


// Create and load HDRI environment map


const loader = new RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/rogland_clear_night_1k.hdr",
  function(texture){
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = texture;
  }
);

const radius = 1.3;
const segments = 64;  
const orbitRadius=4.5;
const textures =[
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];
const spheres= new THREE.Group();

const starTexture=new THREE.TextureLoader().load("./stars.jpg");
starTexture.colorSpace=THREE.SRGBColorSpace;

const starGeometry=new THREE.SphereGeometry(50,64,64);
const starMaterial=new THREE.MeshStandardMaterial({map:starTexture,side:THREE.BackSide,opacity:0.3});
const star=new THREE.Mesh(starGeometry,starMaterial);
scene.add(star);

const sphereMeshes=[];

for(let i=0;i<4;i++){

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace=THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({map:texture});
  const sphere = new THREE.Mesh(geometry, material);
  sphereMeshes.push(sphere);
  // Load texture for the sphere



const angle=(i/4)*(Math.PI*2);
sphere.position.x=orbitRadius*Math.cos(angle);
sphere.position.z=orbitRadius*Math.sin(angle);

  spheres.add(sphere);
}

spheres.rotation.x=0.1;
spheres.position.y=-0.8;
scene.add(spheres);

camera.position.z=9;
// Add orbit controls

let lastWheelTime=0;
const throttleDelay=2000;
let scrollCount=0;

function  throttledWheelHandler(event){
  const currentTime=Date.now();
  if(currentTime-lastWheelTime>=throttleDelay){

    

    lastWheelTime=currentTime;
    const direction=event.deltaY>0?"down":"up";
    scrollCount=(scrollCount+1)%4;


    const headings=document.querySelectorAll(".heading");
    gsap.to(headings,{
      duration:1,
      y:`-=${100}%`,
      ease:"power2.inOut",
    }); 

    gsap.to(spheres.rotation,{
      duration:1,
      y:`-=${Math.PI/2}`,
      ease:"power2.inOut",
    });

    if(scrollCount===0){
      gsap.to(headings,{
        duration:1,
        y:`0`,
        ease:"power2.inOut",
      }); 
    }

  
  }
}
    

window.addEventListener("wheel",throttledWheelHandler);


const clock=new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  for(let i=0;i<sphereMeshes.length;i++){
    const sphere=sphereMeshes[i];
    sphere.rotation.y=clock.getElapsedTime()*0.02;
  }
  renderer.render(scene, camera);
}

animate();

// Handle window resize

window.addEventListener('resize', () => {
  // Update camera aspect ratio

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
});
