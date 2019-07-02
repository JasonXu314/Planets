import * as BABYLON from 'babylonjs';
import * as Materials from 'babylonjs-materials';

let rotationVector = new BABYLON.Vector3(0, 0, 0);
let speed = 0.02;
const canvas = document.getElementById('canvas');
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.CannonJSPlugin());
let camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 50, 0), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.speed = 0.2;

let sunTexture = new BABYLON.Texture('./Sun.png', scene);
let mercuryTexture = new BABYLON.Texture('./Mercury.png', scene);

let sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
sunMaterial.emissiveTexture = sunTexture;
sunMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
let mercuryMaterial = new BABYLON.StandardMaterial('mercuryMaterial', scene);
mercuryMaterial.ambientTexture = mercuryTexture;

let glowLayer = new BABYLON.GlowLayer('corona', scene);
glowLayer.intensity = 0.5;

let sun = BABYLON.Mesh.CreateSphere('sun', 32, 10, scene);
sun.position.y = 2;
sun.material = sunMaterial;
let sunImpostor = new BABYLON.PhysicsImpostor(sun, BABYLON.PhysicsImpostor.SphereImpostor, {
    mass: 6054794.52
}, scene);

let sunLight = new BABYLON.PointLight('sunLight', new BABYLON.Vector3(0, 2, 0), scene);
sunLight.setEnabled(true);

let shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
shadowGenerator.usePoissonSampling = true;

let mercury = BABYLON.Mesh.CreateSphere('mercury', 16, 1, scene);
mercury.position.y = 2;
mercury.position.x = 20;
shadowGenerator.addShadowCaster(mercury, true);
mercury.material = mercuryMaterial;
let mercuryImpostor = new BABYLON.PhysicsImpostor(mercury, BABYLON.PhysicsImpostor.SphereImpostor, {
    mass: 1
}, scene);
mercuryImpostor.applyImpulse(new BABYLON.Vector3(0, 0, 3), mercury.getAbsolutePosition());

let tracker = BABYLON.LinesBuilder.CreateLines('tracker', {
    points: [mercury.position.add(new BABYLON.Vector3(0, 100, 0)), mercury.position.add(new BABYLON.Vector3(0, 100, 0))]
}, scene);
let groundMaterial = new Materials.GridMaterial('grid', scene);

let ground = BABYLON.Mesh.CreateGround('ground1', 1000, 1000, 2, scene);
ground.position.y = -5;
ground.material = groundMaterial;
ground.receiveShadows = true;

let skyMaterial = new Materials.SkyMaterial('sky', scene);
skyMaterial.backFaceCulling = false;
skyMaterial.inclination = 0;

let sky = BABYLON.Mesh.CreateBox('sky1', 1000, scene);
sky.material = skyMaterial;

engine.runRenderLoop(() => {
    scene.render();
    camera.position = camera.getFrontPosition(speed);
    camera.rotation = camera.rotation.add(rotationVector);
    tracker.dispose(false);
    tracker = BABYLON.LinesBuilder.CreateLines('tracker', {
        points: [mercury.position.add(new BABYLON.Vector3(0, 100, 0)), mercury.position.add(new BABYLON.Vector3(0, -100, 0))]
    }, scene);
    let direction = sun.position.subtract(mercury.position);
    mercuryImpostor.applyImpulse(direction.scale(6.67 * (10 ** -11) * sunImpostor.mass * mercuryImpostor.mass/(direction.length() ** 2)).scale(275), mercury.position);
});

window.addEventListener('keydown', (e) => {
    switch (e.keyCode)
    {
        case (37):
            if (rotationVector.y === 0.02)
            {
                rotationVector = new BABYLON.Vector3(0, -0.02, 0);
            }
            else if (rotationVector.y !== -0.02)
            {
                rotationVector = rotationVector.add(new BABYLON.Vector3(0, -0.02, 0));
            }
            break;
        case (38):
            if (rotationVector.x === 0.02)
            {
                rotationVector = new BABYLON.Vector3(-0.02, 0, 0);
            }
            else if (rotationVector.x !== -0.02)
            {
                rotationVector = rotationVector.add(new BABYLON.Vector3(-0.02, 0, 0));
            }
            break;
        case (39):
            if (rotationVector.y === -0.02)
            {
                rotationVector = new BABYLON.Vector3(0, 0.02, 0);
            }
            else if (rotationVector.y !== 0.02)
            {
                rotationVector = rotationVector.add(new BABYLON.Vector3(0, 0.02, 0));
            }
            break;
        case (40):
            if (rotationVector.x === -0.02)
            {
                rotationVector = new BABYLON.Vector3(0.02, 0, 0);
            }
            else if (rotationVector.x !== 0.02)
            {
                rotationVector = rotationVector.add(new BABYLON.Vector3(0.02, 0, 0));
            }
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.keyCode)
    {
        case (37):
        case (39):
            rotationVector.y = 0;
            break;
        case (38):
        case (40):
            rotationVector.x = 0;
            break;
    }
});

window.addEventListener('wheel', (e) => {
    if (e.target === canvas)
    {
        e.preventDefault();
    }
    speed -= e.deltaY/10000;
});