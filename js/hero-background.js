import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';

class HeroBackground {
    constructor() {
        // Check if device is mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Don't initialize on mobile devices
        if (this.isMobile) {
            return;
        }

        this.container = document.querySelector('.hero');
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('hero-canvas');
        this.container.insertBefore(this.canvas, this.container.firstChild);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: window.devicePixelRatio === 1,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.symbols = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isAnimating = true;

        this.init();
        this.createSymbols();
        this.animate();
        this.addEventListeners();
    }

    init() {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.position.z = 100;

        // Optimize rendering
        this.renderer.shadowMap.enabled = false;
        this.renderer.physicallyCorrectLights = false;
    }

    createBookGeometry() {
        // Create book cover
        const coverShape = new THREE.Shape();
        coverShape.moveTo(-2.2, -3);
        coverShape.lineTo(2.2, -3);
        coverShape.lineTo(2.2, 3);
        coverShape.lineTo(-2.2, 3);
        coverShape.lineTo(-2.2, -3);

        // Create spine detail
        coverShape.moveTo(-2, -2.7);
        coverShape.lineTo(-2, 2.7);
        coverShape.lineTo(-2.2, 2.7);
        
        const extrudeSettings = {
            depth: 0.6,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.08,
            bevelSegments: 3
        };

        const bookGeometry = new THREE.ExtrudeGeometry(coverShape, extrudeSettings);

        // Add pages (multiple thin layers)
        const pagesGroup = new THREE.Group();
        const pageGeometry = new THREE.BoxGeometry(4.2, 5.7, 0.03);
        const pageMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < 12; i++) {
            const page = new THREE.Mesh(pageGeometry, pageMaterial);
            page.position.z = i * 0.04 - 0.22;
            pagesGroup.add(page);
        }

        const geometries = [bookGeometry, ...pagesGroup.children.map(page => page.geometry)];
        return geometries;
    }

    createPencilGeometry() {
        // Pencil body
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(-0.3, -3);
        bodyShape.lineTo(0.3, -3);
        bodyShape.lineTo(0.3, 2.2);
        bodyShape.lineTo(0, 3);
        bodyShape.lineTo(-0.3, 2.2);
        bodyShape.lineTo(-0.3, -3);

        const bodyExtrudeSettings = {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.08,
            bevelSegments: 2
        };

        const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, bodyExtrudeSettings);

        // Pencil tip
        const tipShape = new THREE.Shape();
        tipShape.moveTo(0, 3);
        tipShape.lineTo(0.3, 2.2);
        tipShape.lineTo(0, 2.5);
        tipShape.lineTo(-0.3, 2.2);
        tipShape.lineTo(0, 3);

        const tipExtrudeSettings = {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.04,
            bevelSegments: 2
        };

        const tipGeometry = new THREE.ExtrudeGeometry(tipShape, tipExtrudeSettings);

        return [bodyGeometry, tipGeometry];
    }

    createGraduationCapGeometry() {
        const shape = new THREE.Shape();
        // Board
        shape.moveTo(-1.5, -0.2);
        shape.lineTo(1.5, -0.2);
        shape.lineTo(1.5, 0.2);
        shape.lineTo(-1.5, 0.2);
        // Tassel
        shape.moveTo(0, 0.2);
        shape.lineTo(0.5, -1);

        const extrudeSettings = {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 2
        };

        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    createSymbols() {
        const materials = {
            book: new THREE.MeshPhongMaterial({
                color: 0x00BFB3,
                transparent: true,
                opacity: 0.8,
                specular: 0x464B8C,
                shininess: 100
            }),
            bookPages: new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                specular: 0xffffff,
                shininess: 50
            }),
            pencilBody: new THREE.MeshPhongMaterial({
                color: 0x464B8C,
                transparent: true,
                opacity: 0.8,
                specular: 0x00BFB3,
                shininess: 100
            }),
            pencilTip: new THREE.MeshPhongMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.9,
                specular: 0x666666,
                shininess: 200
            })
        };

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        
        directionalLight1.position.set(10, 10, 10);
        directionalLight2.position.set(-10, -10, 15);
        
        this.scene.add(ambientLight);
        this.scene.add(directionalLight1);
        this.scene.add(directionalLight2);

        const numSymbols = 32;
        const spread = 120; 
        const minDistance = 20; 

        // Create grid positions for more even distribution
        const gridSize = Math.ceil(Math.sqrt(numSymbols));
        const positions = [];
        const cellSize = spread / gridSize;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                positions.push({
                    x: (i - gridSize/2) * cellSize + (Math.random() - 0.5) * cellSize * 0.8,
                    y: (j - gridSize/2) * cellSize + (Math.random() - 0.5) * cellSize * 0.8,
                    z: (Math.random() - 0.5) * 60
                });
            }
        }

        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        for (let i = 0; i < numSymbols; i++) {
            let symbol;
            if (i % 2 === 0) {
                const bookGeometries = this.createBookGeometry();
                symbol = new THREE.Group();
                
                const cover = new THREE.Mesh(bookGeometries[0], materials.book);
                symbol.add(cover);

                for (let j = 1; j < bookGeometries.length; j++) {
                    const page = new THREE.Mesh(bookGeometries[j], materials.bookPages);
                    symbol.add(page);
                }
            } else {
                const pencilGeometries = this.createPencilGeometry();
                symbol = new THREE.Group();
                
                const body = new THREE.Mesh(pencilGeometries[0], materials.pencilBody);
                const tip = new THREE.Mesh(pencilGeometries[1], materials.pencilTip);
                
                symbol.add(body);
                symbol.add(tip);
            }

            // Use pre-calculated positions
            const pos = positions[i];
            symbol.position.set(pos.x, pos.y, pos.z);

            symbol.rotation.x = Math.random() * Math.PI;
            symbol.rotation.y = Math.random() * Math.PI;

            // Add repulsion radius
            symbol.userData = {
                velocity: {
                    x: (Math.random() - 0.5) * 0.03,
                    y: (Math.random() - 0.5) * 0.03,
                    rotationX: (Math.random() - 0.5) * 0.002,
                    rotationY: (Math.random() - 0.5) * 0.002
                },
                repulsionRadius: minDistance
            };

            this.symbols.push(symbol);
            this.scene.add(symbol);
        }
    }

    updateSymbols() {
        const time = Date.now() * 0.0005;

        // Apply repulsion forces between symbols
        for (let i = 0; i < this.symbols.length; i++) {
            for (let j = i + 1; j < this.symbols.length; j++) {
                const symbol1 = this.symbols[i];
                const symbol2 = this.symbols[j];
                
                const dx = symbol2.position.x - symbol1.position.x;
                const dy = symbol2.position.y - symbol1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < symbol1.userData.repulsionRadius + symbol2.userData.repulsionRadius) {
                    const force = 0.05 * (symbol1.userData.repulsionRadius + symbol2.userData.repulsionRadius - distance);
                    const angle = Math.atan2(dy, dx);
                    
                    symbol2.position.x += Math.cos(angle) * force;
                    symbol2.position.y += Math.sin(angle) * force;
                    symbol1.position.x -= Math.cos(angle) * force;
                    symbol1.position.y -= Math.sin(angle) * force;
                }
            }
        }

        this.symbols.forEach(symbol => {
            // Slower floating movement
            symbol.position.x += Math.sin(time * 0.3 + symbol.position.y * 0.02) * 0.01;
            symbol.position.y += Math.cos(time * 0.3 + symbol.position.x * 0.02) * 0.01;
            
            // Gentle spiral motion
            const radius = 10;
            const spiralX = Math.sin(time * 0.2 + symbol.position.y * 0.05) * radius;
            const spiralY = Math.cos(time * 0.2 + symbol.position.x * 0.05) * radius;
            
            // Very gentle mouse interaction
            symbol.position.x += (spiralX + this.mouseX - symbol.position.x) * 0.002;
            symbol.position.y += (spiralY + this.mouseY - symbol.position.y) * 0.002;

            // Slow rotation
            symbol.rotation.x += Math.sin(time * 0.3) * 0.008;
            symbol.rotation.y += Math.cos(time * 0.3) * 0.008;
            symbol.rotation.z = Math.sin(time * 0.2 + symbol.position.x * 0.02) * 0.03;

            // Keep within bounds with gentle force
            ['x', 'y'].forEach(axis => {
                if (Math.abs(symbol.position[axis]) > 70) {
                    const force = (70 - Math.abs(symbol.position[axis])) * 0.01;
                    symbol.position[axis] += force * (symbol.position[axis] > 0 ? -1 : 1);
                }
            });

            // Subtle scale pulsing
            const scale = 1 + Math.sin(time * 1.2 + symbol.position.x * 0.05) * 0.05;
            symbol.scale.set(scale, scale, scale);

            // Smooth opacity changes
            symbol.children.forEach(child => {
                const opacity = 0.6 + Math.sin(time * 1.5 + symbol.position.x * 0.05) * 0.15;
                if (child.material) {
                    child.material.opacity = Math.max(0.5, Math.min(0.8, opacity));
                }
            });
        });
    }

    animate() {
        if (!this.isAnimating) return;
        
        requestAnimationFrame(this.animate.bind(this));
        
        this.updateSymbols();

        const time = Date.now() * 0.0005;
        const cameraX = Math.sin(time * 0.2) * 8 + this.mouseX * 0.03;
        const cameraY = Math.cos(time * 0.2) * 8 - this.mouseY * 0.03;
        
        this.camera.position.x += (cameraX - this.camera.position.x) * 0.02;
        this.camera.position.y += (cameraY - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('visibilitychange', () => {
            this.isAnimating = !document.hidden;
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX - window.innerWidth / 2) * 2;
        this.mouseY = -(event.clientY - window.innerHeight / 2) * 2;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeroBackground();
});
