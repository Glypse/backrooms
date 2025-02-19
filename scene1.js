import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let hallway;
let sceneEmpty;

export const scene1 = async (scene, posZ) => {
    sceneEmpty = new THREE.Group();
    sceneEmpty.position.set(0, 0, -posZ);
    scene.add(sceneEmpty);

    new GLTFLoader().load(
        `${import.meta.env.BASE_URL}assets/Hlw0.3.glb`,
        (gltf) => {
            hallway = gltf.scene;
            hallway.traverse((child) => {
                if (child.isMesh) {
                    child.receiveShadow = true;
                    child.material.normalScale.set(0.5, 0.5);
                    /* child.material.normalMap = null; */
                    /* child.material.bumpMap = null;
                child.material.map = null;
                child.material.roughnessMap = null; */
                    /* child.material.onBeforeCompile = function (shader) {
                        shader.fragmentShader = shader.fragmentShader.replace(
                            "#include <roughnessmap_fragment>",
                            THREE.ShaderChunk.roughnessmap_fragment.replace(
                                "texelRoughness =",
                                "texelRoughness = 1. -",
                            ),
                        );
                    }; */
                }
            });
            hallway.rotateY(-Math.PI / 2);
            hallway.position.set(0, 0, -12);
            sceneEmpty.add(hallway);
        },
    );

    const lightColor = 0xe6fff2;
    const light = new THREE.PointLight(lightColor, 4, 0, 2);
    const lightBoxGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const lightBoxMaterial = new THREE.MeshStandardMaterial({
        color: lightColor,
        emissive: lightColor,
        emissiveIntensity: 0.5,
    });
    const lightBox = new THREE.Mesh(lightBoxGeometry, lightBoxMaterial);
    for (let i = 0; i < 6; i++) {
        const lightInstance = light.clone();
        const lightBoxInstance = lightBox.clone();
        lightInstance.position.set(0, 2.445, -i * 4.5);
        lightInstance.castShadow = true;
        sceneEmpty.add(lightInstance);
        lightInstance.add(lightBoxInstance);
        lightBoxInstance.position.set(0, 0.1, 0);
    }

    const orbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const orbMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        roughness: 0.4,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 1,
        sheenRoughness: 0.4,
        sheenColor: 0xffffff,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 1.5, -6.5);
    orb.castShadow = true;
    orb.receiveShadow = true;
    sceneEmpty.add(orb);

    /* const wallBlockerGeometry = new THREE.PlaneGeometry(200, 200);
    const wallBlockerMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
    });
    const wallBlocker = new THREE.Mesh(
        wallBlockerGeometry,
        wallBlockerMaterial,
    );
    wallBlocker.rotateZ(-Math.PI / 2);
    wallBlocker.position.set(0, 1.25, -2);
    wallBlocker.castShadow = true;
    sceneEmpty.add(wallBlocker); */

    /* const wallGroundGeometry = new THREE.PlaneGeometry(800, 4);
    const wallGroundMaterial = new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        color: 0x000000,
    });
    const wallGround = new THREE.Mesh(wallGroundGeometry, wallGroundMaterial);
    wallGround.receiveShadow = true;
    wallGround.rotateZ(-Math.PI / 2);
    wallGround.position.set(0, -400, -25);
    sceneEmpty.add(wallGround); */
};
