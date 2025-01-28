import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let grassMaterial;
const clock = new THREE.Clock();
const grassDensity = 50,
    planeWidth = 4,
    planeDepth = 10;
let sceneEmpty;

const createGrass = async () => {
    const groundGeometry = new THREE.PlaneGeometry(planeWidth, planeDepth);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x408f40 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    sceneEmpty.add(ground);

    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(
        `${import.meta.env.BASE_URL}assets/grassLOD1File.glb`,
    );

    grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x408f40,
        emissive: 0x408f40,
        emissiveIntensity: 0.1,
        roughnessMap: new THREE.TextureLoader().load(
            `${import.meta.env.BASE_URL}assets/grassRoughness.png`,
        ),
        bumpMap: new THREE.TextureLoader().load(
            `${import.meta.env.BASE_URL}assets/grassBump.png`,
        ),
        bumpScale: 4,
    });

    /* grassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughnessMap: new THREE.TextureLoader().load(
            "assets/grassRoughness.png",
        ),
        bumpMap: new THREE.TextureLoader().load("assets/grassBump.png"),
        bumpScale: 4,
        thickness: 2,
        attenuationColor: 0x56bf56,
        attenuationDistance: 0.5,
        transmission: 1,
    }); */
    grassMaterial.side = THREE.DoubleSide;
    grassMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };

        shader.vertexShader = `
            attribute float curvature;
            uniform float time;
            ${shader.vertexShader}
        `;

        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
            #include <begin_vertex>
            float angle = curvature * position.y;
            mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            transformed.yx = rotation * transformed.yx;
          `,
        );

        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
            #include <begin_vertex>
            vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
            worldPos.z += sin((time * 2.0) + worldPos.z + (worldPos.x/5.0)) * 0.15 * position.y;
            transformed = (inverse(modelMatrix * instanceMatrix) * worldPos).xyz;
          `,
        );

        grassMaterial.userData.shader = shader;
    };

    const grassBlade = gltf.scene.children[0];
    const numInstances = grassDensity * planeWidth * planeDepth;
    const instancedMesh = new THREE.InstancedMesh(
        grassBlade.geometry,
        grassMaterial,
        numInstances,
    );

    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const curvatureArray = new Float32Array(numInstances);
    for (let i = 0; i < numInstances; i++) {
        curvatureArray[i] = Math.random() * 0.3;
    }

    instancedMesh.geometry.setAttribute(
        "curvature",
        new THREE.InstancedBufferAttribute(curvatureArray, 1),
    );

    const dummy = new THREE.Object3D();
    let index = 0;
    for (let i = 0; i < planeWidth; i++) {
        for (let j = 0; j < planeDepth; j++) {
            for (let k = 0; k < grassDensity; k++) {
                dummy.position.set(
                    i - planeWidth / 2 + Math.random(),
                    0,
                    j - planeDepth / 2 + Math.random(),
                );
                dummy.rotation.y = Math.random() * Math.PI * 2;
                dummy.scale.setScalar(Math.random() * 0.75 + 0.75);
                dummy.scale.z *= 0.75;
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(index++, dummy.matrix);
            }
        }
    }

    sceneEmpty.add(instancedMesh);
};

export const scene3 = async (scene, posZ) => {
    sceneEmpty = new THREE.Group();
    sceneEmpty.position.set(0, 0, -posZ);
    scene.add(sceneEmpty);

    const light = new THREE.PointLight(0xff967c, 100, 5, 1);
    /* const lightHelper = new THREE.PointLightHelper(light); */
    light.position.set(0, 2.25, 0);
    sceneEmpty.add(light);

    const orbGeometry = new THREE.SphereGeometry(0.25, 32, 16);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0xff967c,
        emissive: 0xff967c,
        emissiveIntensity: 10,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    light.add(orb);

    const wallGroundGeometry = new THREE.PlaneGeometry(800, 4);
    const wallGroundMaterial = new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        color: 0x000000,
    });
    const wallGround = new THREE.Mesh(wallGroundGeometry, wallGroundMaterial);
    wallGround.receiveShadow = true;
    wallGround.rotateZ(-Math.PI / 2);
    wallGround.position.set(0, -400, -5);
    sceneEmpty.add(wallGround);

    createGrass();
    animatescene3();
};

export const animatescene3 = () => {
    if (
        grassMaterial &&
        grassMaterial.userData &&
        grassMaterial.userData.shader
    ) {
        grassMaterial.userData.shader.uniforms.time.value =
            clock.getElapsedTime();
    }
};
