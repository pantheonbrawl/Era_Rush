// --- PART 1: RACERS, TRACKS, AND UI ---

const baseRacers = [
    { name: "Apex", color: 0xff0044, style: 'sport', stats: { spd: 8, acc: 6, trn: 7, brk: 5 } },
    { name: "Neon", color: 0x00f2ff, style: 'cyber', stats: { spd: 9, acc: 5, trn: 6, brk: 4 } },
    { name: "Volt", color: 0xffea00, style: 'muscle', stats: { spd: 10, acc: 8, trn: 3, brk: 3 } },
    { name: "Shadow", color: 0x222222, style: 'sport', stats: { spd: 7, acc: 7, trn: 8, brk: 6 } },
    { name: "Toxic", color: 0x33ff33, style: 'cyber', stats: { spd: 8, acc: 9, trn: 5, brk: 4 } },
    { name: "Drift", color: 0xff8800, style: 'sport', stats: { spd: 6, acc: 6, trn: 10, brk: 8 } },
    { name: "Blizzard", color: 0xffffff, style: 'muscle', stats: { spd: 9, acc: 4, trn: 4, brk: 7 } },
    { name: "Ruby", color: 0xaa0033, style: 'sport', stats: { spd: 7, acc: 8, trn: 7, brk: 6 } },
    { name: "Ocean", color: 0x0044ff, style: 'cyber', stats: { spd: 8, acc: 7, trn: 8, brk: 5 } },
    { name: "Viper", color: 0x8800ff, style: 'muscle', stats: { spd: 9, acc: 9, trn: 2, brk: 2 } },
    { name: "Goldie", color: 0xffcc00, style: 'sport', stats: { spd: 6, acc: 10, trn: 6, brk: 7 } },
    { name: "Eco", color: 0x00aa44, style: 'cyber', stats: { spd: 5, acc: 7, trn: 9, brk: 10 } }
];

// Generate the massive 64-car roster
const RACERS = [...baseRacers];
const styles = ['sport', 'cyber', 'muscle'];
for(let i = 13; i <= 64; i++) {
    RACERS.push({
        name: "Bot " + i,
        color: Math.floor(Math.random() * 16777215), 
        style: styles[Math.floor(Math.random() * styles.length)],
        stats: { 
            spd: 4 + Math.random()*6, acc: 4 + Math.random()*6, 
            trn: 4 + Math.random()*6, brk: 4 + Math.random()*6 
        }
    });
}

const TRACKS = [
    { name: "Neo-Tokyo", desc: "Neon Circuit", sky: 0x050510, road: 0x111115, wall: 0x00f2ff },
    { name: "Dino Canyon", desc: "Dirt Oval", sky: 0x4a2e15, road: 0x3d230e, wall: 0xff6600 },
    { name: "Pharaoh's Dune", desc: "Ancient Egypt", sky: 0xff8833, road: 0xd4a373, wall: 0xffd700 },
    { name: "Gladiator Arena", desc: "The Colosseum", sky: 0x5599ff, road: 0x8b5a2b, wall: 0xdddddd },
    { name: "Cogwheel City", desc: "Steampunk", sky: 0x442211, road: 0x222222, wall: 0xff8c00 }
];

const UI = {
    selectedRacer: 0, p2SelectedRacer: 1, selectedTrack: 0, numPlayers: 1,
    garageScene: null, garageCamera: null, garageRenderer: null, garageCar: null,

    init: function() {
        // Mode Selector Buttons
        const menu = document.getElementById('screen-roster');
        if (menu) {
            const modeDiv = document.createElement('div');
            modeDiv.style.marginBottom = "20px";
            modeDiv.style.display = "flex";
            modeDiv.style.gap = "10px";
            modeDiv.style.justifyContent = "center";
            modeDiv.innerHTML = `
                <button id="btn-1p" style="padding:10px 20px; font-size:1.2rem; background:var(--accent); color:#000; border:none; cursor:pointer;">1 PLAYER</button>
                <button id="btn-2p" style="padding:10px 20px; font-size:1.2rem; background:#333; color:#fff; border:1px solid var(--accent); cursor:pointer;">2 PLAYER (SPLIT)</button>
            `;
            // Insert right after the <h2> tag
            if (menu.children.length > 1) {
                menu.insertBefore(modeDiv, menu.children[1]); 
            } else {
                menu.appendChild(modeDiv);
            }

            document.getElementById('btn-1p').onclick = (e) => {
                this.numPlayers = 1;
                e.target.style.background = 'var(--accent)'; e.target.style.color = '#000'; e.target.style.border = 'none';
                document.getElementById('btn-2p').style.background = '#333'; document.getElementById('btn-2p').style.color = '#fff'; document.getElementById('btn-2p').style.border = '1px solid var(--accent)';
                this.updateMenuVisuals();
            };
            document.getElementById('btn-2p').onclick = (e) => {
                this.numPlayers = 2;
                e.target.style.background = 'var(--accent)'; e.target.style.color = '#000'; e.target.style.border = 'none';
                document.getElementById('btn-1p').style.background = '#333'; document.getElementById('btn-1p').style.color = '#fff'; document.getElementById('btn-1p').style.border = '1px solid var(--accent)';
                this.updateMenuVisuals();
            };
        }

        // Build the Roster Grid
        const rGrid = document.getElementById('roster-grid');
        if (rGrid) {
            baseRacers.forEach((r, i) => {
                const div = document.createElement('div');
                div.className = `char-card ${i===0?'selected':''}`;
                
                const drawStat = (label, val) => `
                    <div style="display:flex; align-items:center; margin-top:2px; font-size:0.7rem;">
                        <span style="width:30px; text-align:left;">${label}</span>
                        <div style="flex-grow:1; background:#333; height:6px; margin-left:5px; border-radius:3px;">
                            <div style="width:${val*10}%; background:var(--accent); height:100%; border-radius:3px;"></div>
                        </div>
                    </div>`;

                div.innerHTML = `
                    <b>${r.name}</b><br><small style="color:#aaa;">${r.style.toUpperCase()}</small>
                    <div style="margin-top:8px;">
                        ${drawStat('SPD', r.stats.spd)}
                        ${drawStat('ACC', r.stats.acc)}
                        ${drawStat('TRN', r.stats.trn)}
                        ${drawStat('BRK', r.stats.brk)}
                    </div>
                `;
                
                div.onclick = () => {
                    if (this.numPlayers === 1) {
                        this.selectedRacer = i;
                        this.updateMenuVisuals();
                    }
                };
                rGrid.appendChild(div);
            });
        }

        // Build the Track Grid
        const tGrid = document.getElementById('track-grid');
        if (tGrid) {
            TRACKS.forEach((t, i) => {
                const div = document.createElement('div');
                div.className = 'char-card';
                div.id = `trk-${i}`;
                div.innerHTML = `<b>${t.name}</b><br><small>${t.desc}</small>`;
                div.onclick = () => this.setTrack(i);
                tGrid.appendChild(div);
            });
        }

        this.setTrack(0);

        // --- KEYBOARD SELECTION LOGIC ---
        window.addEventListener('keydown', (e) => {
            const rosterScreen = document.getElementById('screen-roster');
            if (!rosterScreen || rosterScreen.classList.contains('hidden')) return;

            const total = RACERS.length; 
            const cols = 12; 

            if (this.numPlayers === 1) {
                // 1-Player Mode: Both WASD and Arrows control the selection
                if (e.code === 'KeyD' || e.code === 'ArrowRight') this.selectedRacer = (this.selectedRacer + 1) % total;
                if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.selectedRacer = (this.selectedRacer - 1 + total) % total;
                if (e.code === 'KeyS' || e.code === 'ArrowDown') this.selectedRacer = (this.selectedRacer + cols) % total;
                if (e.code === 'KeyW' || e.code === 'ArrowUp') this.selectedRacer = (this.selectedRacer - cols + total) % total;
            } else {
                // 2-Player Mode: Split controls
                // Player 1 (WASD)
                if (e.code === 'KeyD') this.selectedRacer = (this.selectedRacer + 1) % total;
                if (e.code === 'KeyA') this.selectedRacer = (this.selectedRacer - 1 + total) % total;
                if (e.code === 'KeyS') this.selectedRacer = (this.selectedRacer + cols) % total;
                if (e.code === 'KeyW') this.selectedRacer = (this.selectedRacer - cols + total) % total;
                
                // Player 2 (Arrows)
                if (e.code === 'ArrowRight') this.p2SelectedRacer = (this.p2SelectedRacer + 1) % total;
                if (e.code === 'ArrowLeft') this.p2SelectedRacer = (this.p2SelectedRacer - 1 + total) % total;
                if (e.code === 'ArrowDown') this.p2SelectedRacer = (this.p2SelectedRacer + cols) % total;
                if (e.code === 'ArrowUp') this.p2SelectedRacer = (this.p2SelectedRacer - cols + total) % total;
            }

            this.updateMenuVisuals();
        });
    },
    
    updateMenuVisuals: function() {
        const cards = document.querySelectorAll('#roster-grid .char-card');
        cards.forEach((c, i) => {
            c.style.border = '2px solid #333'; 
            c.style.background = '#222';
            
            if (this.numPlayers === 2) {
                if (i === this.selectedRacer && i === this.p2SelectedRacer) {
                    c.style.border = '3px solid #b700ff';
                } else if (i === this.selectedRacer) {
                    c.style.border = '3px solid var(--accent)';
                } else if (i === this.p2SelectedRacer) {
                    c.style.border = '3px solid #ff0044';
                }
            } else {
                if (i === this.selectedRacer) {
                    c.style.border = '3px solid var(--accent)';
                }
            }
        });
    },

    show: function(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    },

    goToGarage: function() {
        this.show('screen-garage');
        if(!this.garageRenderer) this.initGarage();
        
        if(this.garageCar) this.garageScene.remove(this.garageCar);
        this.garageCar = VehicleFactory.create(baseRacers[this.selectedRacer]);
        this.garageScene.add(this.garageCar);
    },

    initGarage: function() {
        const container = document.getElementById('garage-container');
        if (!container) return;
        this.garageScene = new THREE.Scene();
        this.garageScene.background = new THREE.Color(0x111111);
        this.garageCamera = new THREE.PerspectiveCamera(50, 500/350, 0.1, 100);
        this.garageCamera.position.set(4, 3, 5);
        this.garageCamera.lookAt(0, 0, 0);
        
        this.garageRenderer = new THREE.WebGLRenderer({antialias: true});
        this.garageRenderer.setSize(500, 350);
        container.appendChild(this.garageRenderer.domElement);
        
        this.garageScene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        this.garageScene.add(light);

        const animate = () => {
            requestAnimationFrame(animate);
            const garageScreen = document.getElementById('screen-garage');
            if(this.garageCar && garageScreen && !garageScreen.classList.contains('hidden')) {
                this.garageCar.rotation.y += 0.01;
                this.garageRenderer.render(this.garageScene, this.garageCamera);
            }
        };
        animate();
    },

    setTrack: function(idx) {
        this.selectedTrack = idx;
        for(let i = 0; i < TRACKS.length; i++) {
            let el = document.getElementById(`trk-${i}`);
            if(el) el.style.borderColor = (idx === i) ? 'var(--accent)' : '#333';
        }
    }
};

const VehicleFactory = {
    create: function(racerConfig) {
        const group = new THREE.Group();
        const paint = new THREE.MeshPhongMaterial({ color: racerConfig.color, shininess: 80 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        const glass = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 5.5), paint);
        chassis.position.y = 0.6;
        group.add(chassis);

        let cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.5);
        const cabin = new THREE.Mesh(cabinGeo, glass);
        cabin.position.set(0, 1.2, 0.2);
        group.add(cabin);

        if(racerConfig.style !== 'muscle') {
            const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.6), dark);
            spoiler.position.set(0, 1.4, 2.3); 
            const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.2), dark);
            strutL.position.set(-0.8, 1.0, 2.3);
            const strutR = strutL.clone(); strutR.position.x = 0.8;
            group.add(spoiler, strutL, strutR);
        }

        const wGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
        const positions = [ [-1.4, 0.6, 1.8], [1.4, 0.6, 1.8], [-1.4, 0.6, -1.8], [1.4, 0.6, -1.8] ];
        positions.forEach(p => {
            const w = new THREE.Mesh(wGeo, dark);
            w.rotation.z = Math.PI / 2;
            w.position.set(...p);
            group.add(w);
        });

        return group;
    }
};

// --- PART 2: THE GAME ENGINE ---

const Game = {
    scene: null, camera1: null, camera2: null, renderer: null,
    player1: null, player2: null, opponents: [], trackNodes: [], animatedProps: [],
    
    state: 'menu', maxLaps: 3, keys: {}, trackWidth: 120, 
    animId: null, countdownIntv: null, listenersAdded: false,

    reset: function() {
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this.countdownIntv) clearInterval(this.countdownIntv);
        if (this.renderer && this.renderer.domElement) {
            document.body.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }

        this.state = 'menu'; 
        this.opponents = []; this.trackNodes = []; this.animatedProps = []; this.keys = {};

        const hud = document.getElementById('hud');
        const cd = document.getElementById('countdown');
        if (hud) hud.style.display = 'none';
        if (cd) cd.style.display = 'none';
        
        UI.show('screen-start'); 
    },

    initRace: function() {
        UI.show('none'); 
        this.scene = new THREE.Scene();
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        if (UI.numPlayers === 2) {
            let aspect = (window.innerWidth / 2) / window.innerHeight;
            this.camera1 = new THREE.PerspectiveCamera(75, aspect, 0.1, 8000);
            this.camera2 = new THREE.PerspectiveCamera(75, aspect, 0.1, 8000);
            this.renderer.setScissorTest(true);
        } else {
            let aspect = window.innerWidth / window.innerHeight;
            this.camera1 = new THREE.PerspectiveCamera(75, aspect, 0.1, 8000);
            this.camera2 = null; 
            this.renderer.setScissorTest(false);
        }

        const env = TRACKS[UI.selectedTrack];
        this.scene.background = new THREE.Color(env.sky);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const sun = new THREE.DirectionalLight(0xffffff, 0.6);
        sun.position.set(100, 300, 100);
        this.scene.add(sun);

        this.buildCircuit(env);
        this.spawnEntities();
        
        const hud = document.getElementById('hud');
        if (hud) {
            if (UI.numPlayers === 2) {
                hud.innerHTML = `
                    <div style="position:absolute; top:20px; left:20px; font-size:1.5rem; text-shadow: 2px 2px 0 #000;">
                        <span style="color:var(--accent)">P1 (WASD)</span><br>
                        LAP: <span id="p1-lap">1</span>/${this.maxLaps} | POS: <span id="p1-pos">1</span>/64
                    </div>
                    <div style="position:absolute; top:20px; right:20px; text-align:right; font-size:1.5rem; text-shadow: 2px 2px 0 #000;">
                        <span style="color:#ff0044">P2 (ARROWS)</span><br>
                        LAP: <span id="p2-lap">1</span>/${this.maxLaps} | POS: <span id="p2-pos">1</span>/64
                    </div>
                    <div style="position:absolute; top:0; left:50%; width:4px; height:100%; background:#222; transform:translateX(-50%); border-left:2px solid var(--accent); border-right:2px solid #ff0044;"></div>
                `;
            } else {
                hud.innerHTML = `
                    <div style="position:absolute; top:20px; left:20px; font-size:1.5rem; text-shadow: 2px 2px 0 #000;">
                        <span style="color:var(--accent)">P1 (WASD or ARROWS)</span><br>
                        LAP: <span id="p1-lap">1</span>/${this.maxLaps}<br>POS: <span id="p1-pos">1</span>/64
                    </div>
                `;
            }
        }

        if (!this.listenersAdded) {
            window.addEventListener('keydown', e => {
                this.keys[e.code] = true;
                if (e.key.toLowerCase() === 'r') this.reset();
            });
            window.addEventListener('keyup', e => this.keys[e.code] = false);
            window.addEventListener('resize', () => {
                if(this.renderer) {
                    if (UI.numPlayers === 2 && this.camera1 && this.camera2) {
                        let newAspect = (window.innerWidth / 2) / window.innerHeight;
                        this.camera1.aspect = newAspect; this.camera1.updateProjectionMatrix();
                        this.camera2.aspect = newAspect; this.camera2.updateProjectionMatrix();
                    } else if (this.camera1) {
                        this.camera1.aspect = window.innerWidth / window.innerHeight;
                        this.camera1.updateProjectionMatrix();
                    }
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                }
            });
            this.listenersAdded = true;
        }

        this.startCountdown();
        this.loop();
    },

    buildCircuit: function(env) {
        const segments = 300; 
        const baseRadius = 600; 
        const roadMat = new THREE.MeshStandardMaterial({ color: env.road, roughness: 0.9 });
        const wallMat = new THREE.MeshStandardMaterial({ color: env.wall, emissive: env.wall, emissiveIntensity: 0.6 });

        for(let i=0; i<segments; i++) {
            let t1 = (i / segments) * Math.PI * 2;
            let r1 = baseRadius + Math.sin(t1 * 3) * 150;
            let p1 = new THREE.Vector3(Math.cos(t1)*r1, 0, Math.sin(t1)*r1);

            let t2 = ((i+1) % segments) / segments * Math.PI * 2;
            let r2 = baseRadius + Math.sin(t2 * 3) * 150;
            let p2 = new THREE.Vector3(Math.cos(t2)*r2, 0, Math.sin(t2)*r2);

            let dir = new THREE.Vector3().subVectors(p2, p1);
            let length = dir.length();
            dir.normalize();
            let yaw = Math.atan2(dir.x, dir.z);

            this.trackNodes.push({ pos: p1, rot: yaw, dir: dir });

            const segGroup = new THREE.Group();
            const road = new THREE.Mesh(new THREE.PlaneGeometry(this.trackWidth, length), roadMat);
            road.rotation.x = -Math.PI/2; road.position.z = length/2;
            segGroup.add(road);

            const lw = new THREE.Mesh(new THREE.BoxGeometry(2, 4, length), wallMat);
            lw.position.set(-this.trackWidth/2, 2, length/2);
            const rw = lw.clone(); rw.position.x = this.trackWidth/2;
            segGroup.add(lw, rw);

            segGroup.position.copy(p1);
            segGroup.rotation.y = yaw;
            this.scene.add(segGroup);
        }

        this.trackNodes.forEach(n => { n.dir.negate(); n.rot += Math.PI; });
        let reversedNodes = [this.trackNodes[0]];
        for(let i = this.trackNodes.length - 1; i > 0; i--) reversedNodes.push(this.trackNodes[i]);
        this.trackNodes = reversedNodes;

        const startNode = this.trackNodes[0];
        const finishGroup = new THREE.Group();
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const pGeo = new THREE.CylinderGeometry(3, 3, 50, 16);
        const lp = new THREE.Mesh(pGeo, pillarMat); lp.position.set(-this.trackWidth/2 - 5, 25, 0);
        const rp = new THREE.Mesh(pGeo, pillarMat); rp.position.set(this.trackWidth/2 + 5, 25, 0);
        const bGeo = new THREE.BoxGeometry(this.trackWidth + 20, 8, 4);
        const banner = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({color: 0xffffff, emissive:0x444444}));
        banner.position.set(0, 50, 0);
        finishGroup.add(lp, rp, banner);
        finishGroup.position.copy(startNode.pos);
        finishGroup.rotation.y = startNode.rot; 
        this.scene.add(finishGroup);

        this.buildEnvironment(env.name);
    },

    buildEnvironment: function(trackName) {
        if (trackName === "Dino Canyon") {
            const skin = new THREE.MeshStandardMaterial({ color: 0x3d6e3d, roughness: 0.9 });
            for(let i=0; i<8; i++) {
                const rex = new THREE.Group();
                const body = new THREE.Mesh(new THREE.BoxGeometry(20, 15, 40), skin); body.position.y = 25;
                const head = new THREE.Mesh(new THREE.BoxGeometry(16, 18, 25), skin); head.position.set(0, 35, 25);
                const tail = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 35), skin); tail.position.set(0, 25, -30);
                const legL = new THREE.Mesh(new THREE.BoxGeometry(8, 25, 10), skin); legL.position.set(-12, 12, -5);
                const legR = legL.clone(); legR.position.x = 12;
                rex.add(body, head, tail, legL, legR);
                let angle = (i/8) * Math.PI * 2; let radius = 800 + Math.random() * 300;
                rex.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
                this.scene.add(rex);
                this.animatedProps.push({ mesh: rex, type: 'dino', speed: 0.5 + Math.random()*0.5 });
            }
        } else if (trackName === "Gladiator Arena") {
            const stone = new THREE.MeshStandardMaterial({ color: 0xddcbaa, roughness: 1.0 });
            for(let tier=0; tier<3; tier++) {
                let h = tier * 60;
                for(let i=0; i<40; i++) {
                    let angle = (i/40) * Math.PI * 2; let radius = 900;
                    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 50, 8), stone);
                    pillar.position.set(Math.cos(angle)*radius, h + 25, Math.sin(angle)*radius);
                    this.scene.add(pillar);
                    const archTop = new THREE.Mesh(new THREE.BoxGeometry(150, 10, 20), stone);
                    archTop.position.set(Math.cos(angle)*radius, h + 55, Math.sin(angle)*radius);
                    archTop.rotation.y = -angle;
                    this.scene.add(archTop);
                }
            }
        } else if (trackName === "Cogwheel City") {
            const brass = new THREE.MeshStandardMaterial({ color: 0xb5a642, metalness: 0.8, roughness: 0.4 });
            for(let i=0; i<15; i++) {
                const gear = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, 20, 16), brass);
                gear.position.set((Math.random()-0.5)*1500, Math.random()*300, (Math.random()-0.5)*1500);
                gear.rotation.set(Math.random()*Math.PI, 0, Math.random()*Math.PI);
                this.scene.add(gear);
                this.animatedProps.push({ mesh: gear, type: 'gear', speed: 0.01 });
            }
        } else if (trackName === "Neo-Tokyo") {
            const bMat = new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.9 });
            const neonColors = [0x00f2ff, 0xff0044, 0xb700ff]; // Cyan, Pink, Purple

            for(let i=0; i<150; i++) {
                let h = 100 + Math.random() * 500;
                
                // Group to hold both the solid building and its glowing outline
                const bGroup = new THREE.Group();
                
                // The dark solid core of the building
                const building = new THREE.Mesh(new THREE.BoxGeometry(60, h, 60), bMat);
                
                // The glowing neon outline
                const outlineColor = neonColors[Math.floor(Math.random() * neonColors.length)];
                const neonMat = new THREE.MeshBasicMaterial({ 
                    color: outlineColor, 
                    wireframe: true, 
                    transparent: true, 
                    opacity: 0.4 
                });
                const outline = new THREE.Mesh(new THREE.BoxGeometry(62, h+2, 62), neonMat);

                bGroup.add(building, outline);

                let angle = Math.random() * Math.PI * 2; 
                
                // SUPER STRICT ZONING: Track max radius is ~810, min is ~390.
                // Safely spawn WAY outside or WAY inside.
                let radius = Math.random() > 0.3 ? (1050 + Math.random() * 1000) : (50 + Math.random() * 150);
                
                bGroup.position.set(Math.cos(angle)*radius, h/2, Math.sin(angle)*radius);
                this.scene.add(bGroup);
            }
        }
    },

    spawnEntities: function() {
        let startNode = this.trackNodes[0];

        // Player 1
        this.player1 = VehicleFactory.create(RACERS[UI.selectedRacer]);
        this.player1.position.copy(startNode.pos);
        if (UI.numPlayers === 2) {
            this.player1.position.add(new THREE.Vector3().crossVectors(startNode.dir, new THREE.Vector3(0,1,0)).normalize().multiplyScalar(-10));
        }
        this.player1.rotation.y = startNode.rot;
        
        // ADDED ALTERNATE KEYS FOR 1-PLAYER MODE
        this.player1.userData = { 
            currentNode: 0, lastNode: 0, lap: 1, vel: 0, angle: startNode.rot,
            stats: RACERS[UI.selectedRacer].stats,
            keys: { 
                up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
                altUp: UI.numPlayers === 1 ? 'ArrowUp' : null,
                altDown: UI.numPlayers === 1 ? 'ArrowDown' : null,
                altLeft: UI.numPlayers === 1 ? 'ArrowLeft' : null,
                altRight: UI.numPlayers === 1 ? 'ArrowRight' : null
            }
        };
        this.scene.add(this.player1);

        // Player 2
        let aiRoster = RACERS.filter((r, i) => i !== UI.selectedRacer);
        if (UI.numPlayers === 2) {
            let p2RacerIndex = UI.p2SelectedRacer; 
            
            this.player2 = VehicleFactory.create(RACERS[p2RacerIndex]);
            this.player2.position.copy(startNode.pos);
            this.player2.position.add(new THREE.Vector3().crossVectors(startNode.dir, new THREE.Vector3(0,1,0)).normalize().multiplyScalar(10));
            this.player2.rotation.y = startNode.rot;
            this.player2.userData = { 
                currentNode: 0, lastNode: 0, lap: 1, vel: 0, angle: startNode.rot,
                stats: RACERS[p2RacerIndex].stats,
                keys: { 
                    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
                    altUp: null, altDown: null, altLeft: null, altRight: null
                }
            };
            this.scene.add(this.player2);
            
            aiRoster = RACERS.filter((r, i) => i !== UI.selectedRacer && i !== p2RacerIndex);
        } else {
            this.player2 = null;
        }

        // Fill rest with AI
        for(let i=0; i < aiRoster.length; i++) {
            let ai = VehicleFactory.create(aiRoster[i]);
            let offsetNode = (this.trackNodes.length - 2 - Math.floor(i * 1.5)) % this.trackNodes.length;
            let aiSpdMod = (aiRoster[i].stats.spd / 10) * 0.4;
            
            ai.userData = { 
                progress: offsetNode, currentNode: offsetNode,
                speed: 0.6 + aiSpdMod + (Math.random() * 0.2), 
                latOffset: (Math.random() - 0.5) * (this.trackWidth - 14) 
            };
            this.opponents.push(ai);
            this.scene.add(ai);
        }
    },

    startCountdown: function() {
        this.state = 'countdown';
        const cd = document.getElementById('countdown');
        if (!cd) return;
        cd.style.display = 'block'; cd.style.fontSize = '5rem'; 
        let count = 3; cd.innerText = count;
        if (this.countdownIntv) clearInterval(this.countdownIntv);
        
        this.countdownIntv = setInterval(() => {
            count--;
            if(count > 0) cd.innerText = count;
            else if(count === 0) cd.innerText = "GO!";
            else {
                cd.style.display = 'none'; clearInterval(this.countdownIntv);
                if (this.state === 'countdown') {
                    this.state = 'racing';
                    const hud = document.getElementById('hud');
                    if (hud) hud.style.display = 'block';
                }
            }
        }, 1000);
    },

    getNearestNode: function(pos) {
        let nearest = 0; let minDist = Infinity;
        for(let i=0; i<this.trackNodes.length; i+=2) {
            let d = pos.distanceToSquared(this.trackNodes[i].pos);
            if(d < minDist) { minDist = d; nearest = i; }
        }
        return nearest;
    },

    updatePlayerPhysics: function(player, prefix) {
        if (!player) return;

        // READ INPUTS FROM PRIMARY OR ALTERNATE KEYS
        let accel = this.keys[player.userData.keys.up] || (player.userData.keys.altUp && this.keys[player.userData.keys.altUp]);
        let brake = this.keys[player.userData.keys.down] || (player.userData.keys.altDown && this.keys[player.userData.keys.altDown]);
        let left = this.keys[player.userData.keys.left] || (player.userData.keys.altLeft && this.keys[player.userData.keys.altLeft]);
        let right = this.keys[player.userData.keys.right] || (player.userData.keys.altRight && this.keys[player.userData.keys.altRight]);

        let pStats = player.userData.stats;
        let maxVel = 1.0 + (pStats.spd * 0.1);    
        let accRate = 0.01 + (pStats.acc * 0.003); 
        let turnRate = 0.02 + (pStats.trn * 0.004); 
        let brkRate = 0.02 + (pStats.brk * 0.005);  

        // THE SECRET CHEAT CODE (The Physics Redline)
        if (UI.numPlayers === 1 && player === this.player1) {
            if (this.keys['KeyW'] && this.keys['ArrowUp']) {
                maxVel *= 4.5;    // The absolute limit before clipping through walls
                accRate *= 6;     // Enough torque to get you there instantly
            }
        }

        if(accel) player.userData.vel = Math.min(player.userData.vel + accRate, maxVel);
        else if(brake) player.userData.vel = Math.max(player.userData.vel - brkRate, -0.5);
        else player.userData.vel *= 0.98;

        if(Math.abs(player.userData.vel) > 0.1) {
            let turnMod = turnRate * (1.2 - (Math.abs(player.userData.vel) / maxVel) * 0.5);
            if(left) player.userData.angle += turnMod;
            if(right) player.userData.angle -= turnMod;
        }

        player.rotation.y = player.userData.angle;
        let moveVec = new THREE.Vector3(0,0, -player.userData.vel).applyAxisAngle(new THREE.Vector3(0,1,0), player.userData.angle);
        let nextPos = player.position.clone().add(moveVec);

        let nearestIdx = this.getNearestNode(nextPos);
        let node = this.trackNodes[nearestIdx];
        player.userData.currentNode = nearestIdx;

        let vToPlayer = new THREE.Vector3().subVectors(nextPos, node.pos);
        let trackRight = new THREE.Vector3().crossVectors(node.dir, new THREE.Vector3(0,1,0)).normalize();
        let distFromCenter = vToPlayer.dot(trackRight);

        let maxDist = this.trackWidth/2 - 2;
        if(Math.abs(distFromCenter) > maxDist) {
            let side = Math.sign(distFromCenter); 
            let playerDir = new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0), player.userData.angle);
            let hitSeverity = Math.abs(playerDir.dot(trackRight)); 

            if(hitSeverity > 0.6) player.userData.vel *= 0.4; 
            else player.userData.vel *= 0.95; 

            player.userData.angle += side * hitSeverity * 0.5;

            let safePos = node.pos.clone().add(trackRight.clone().multiplyScalar(maxDist * side));
            let zProgress = vToPlayer.dot(node.dir); 
            safePos.add(node.dir.clone().multiplyScalar(zProgress));
            
            player.position.copy(safePos);
        } else {
            player.position.copy(nextPos);
        }

        if(nearestIdx === 0 && player.userData.lastNode > this.trackNodes.length - 15) {
            player.userData.lap++;
            if(player.userData.lap > this.maxLaps) { 
                this.state = 'finished'; 
                const cd = document.getElementById('countdown');
                if (cd) {
                    cd.innerText = `${prefix.toUpperCase()} WINS!\nPress 'R'`;
                    cd.style.display = 'block'; cd.style.fontSize = '3rem'; 
                }
            } else {
                const lapEl = document.getElementById(`${prefix}-lap`);
                if (lapEl) lapEl.innerText = player.userData.lap;
            }
        }
        player.userData.lastNode = nearestIdx;

        // Rank Check
        let currentRank = 1;
        let playerNode = player.userData.currentNode;
        
        if (UI.numPlayers === 2) {
            let otherPlayer = player === this.player1 ? this.player2 : this.player1;
            if (otherPlayer && otherPlayer.userData.currentNode > playerNode) currentRank++;
            else if (otherPlayer && otherPlayer.userData.currentNode === playerNode && 
                     otherPlayer.position.distanceToSquared(this.trackNodes[(playerNode + 1) % this.trackNodes.length].pos) < 
                     player.position.distanceToSquared(this.trackNodes[(playerNode + 1) % this.trackNodes.length].pos)) {
                currentRank++;
            }
        }

        this.opponents.forEach(ai => {
            if (ai.userData.currentNode > playerNode) currentRank++;
            else if (ai.userData.currentNode === playerNode) {
                let nextNode = (playerNode + 1) % this.trackNodes.length;
                if (ai.position.distanceToSquared(this.trackNodes[nextNode].pos) < 
                    player.position.distanceToSquared(this.trackNodes[nextNode].pos)) {
                    currentRank++;
                }
            }
        });
        const posEl = document.getElementById(`${prefix}-pos`);
        if (posEl) posEl.innerText = currentRank;
    },

    handleCollisions: function() {
        let allCars = [this.player1, ...this.opponents];
        if (this.player2) allCars.push(this.player2);

        for (let i = 0; i < allCars.length; i++) {
            for (let j = i + 1; j < allCars.length; j++) {
                let carA = allCars[i], carB = allCars[j];
                let distSq = carA.position.distanceToSquared(carB.position);
                
                if (distSq < 25 && distSq > 0.1) {
                    let dist = Math.sqrt(distSq);
                    let overlap = 5 - dist; 
                    let pushVec = new THREE.Vector3().subVectors(carA.position, carB.position).normalize();
                    let bumpStrength = overlap * 1.5; 
                    
                    if (carA === this.player1 || carA === this.player2) carA.position.add(pushVec.clone().multiplyScalar(bumpStrength));
                    if (carB === this.player1 || carB === this.player2) carB.position.sub(pushVec.clone().multiplyScalar(bumpStrength));
                    
                    if (carA === this.player1 || carB === this.player1) this.player1.userData.vel *= 0.85; 
                    if (this.player2 && (carA === this.player2 || carB === this.player2)) this.player2.userData.vel *= 0.85; 
                }
            }
        }
    },

    loop: function() {
        this.animId = requestAnimationFrame(() => this.loop());
        
        this.animatedProps.forEach(prop => {
            if(prop.type === 'dino') {
                prop.mesh.rotation.y += 0.01;
                let fwd = new THREE.Vector3(0,0,prop.speed).applyAxisAngle(new THREE.Vector3(0,1,0), prop.mesh.rotation.y);
                prop.mesh.position.add(fwd);
            } else if (prop.type === 'gear') {
                prop.mesh.rotation.y += prop.speed;
            }
        });

        if(this.state === 'racing') {
            this.updatePlayerPhysics(this.player1, 'p1');
            if (UI.numPlayers === 2) this.updatePlayerPhysics(this.player2, 'p2');

            this.opponents.forEach((ai) => {
                ai.userData.progress += ai.userData.speed * 0.12; 
                if (ai.userData.progress >= this.trackNodes.length) ai.userData.progress -= this.trackNodes.length;

                let pFloor = Math.floor(ai.userData.progress);
                let pCeil = (pFloor + 1) % this.trackNodes.length;
                let percent = ai.userData.progress - pFloor;

                let nodeA = this.trackNodes[pFloor], nodeB = this.trackNodes[pCeil];
                let basePos = new THREE.Vector3().lerpVectors(nodeA.pos, nodeB.pos, percent);
                
                let dir = new THREE.Vector3().subVectors(nodeB.pos, nodeA.pos).normalize();
                let aiRight = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();
                
                let finalPos = basePos.clone().add(aiRight.multiplyScalar(ai.userData.latOffset));
                ai.position.copy(finalPos);
                ai.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI; 
                ai.userData.currentNode = pFloor;
            });

            this.handleCollisions();
        }

        let w = window.innerWidth;
        let h = window.innerHeight;

        if (UI.numPlayers === 2 && this.camera1 && this.camera2) {
            let camOffset1 = new THREE.Vector3(0, 8, 18).applyQuaternion(this.player1.quaternion);
            this.camera1.position.lerp(this.player1.position.clone().add(camOffset1), 0.15);
            this.camera1.lookAt(this.player1.position.clone().add(new THREE.Vector3(0, 2, 0)));

            let camOffset2 = new THREE.Vector3(0, 8, 18).applyQuaternion(this.player2.quaternion);
            this.camera2.position.lerp(this.player2.position.clone().add(camOffset2), 0.15);
            this.camera2.lookAt(this.player2.position.clone().add(new THREE.Vector3(0, 2, 0)));

            this.renderer.setViewport(0, 0, w/2, h);
            this.renderer.setScissor(0, 0, w/2, h);
            this.renderer.render(this.scene, this.camera1);

            this.renderer.setViewport(w/2, 0, w/2, h);
            this.renderer.setScissor(w/2, 0, w/2, h);
            this.renderer.render(this.scene, this.camera2);
        } else if (this.camera1) {
            let camOffset1 = new THREE.Vector3(0, 8, 18).applyQuaternion(this.player1.quaternion);
            this.camera1.position.lerp(this.player1.position.clone().add(camOffset1), 0.15);
            this.camera1.lookAt(this.player1.position.clone().add(new THREE.Vector3(0, 2, 0)));

            this.renderer.setViewport(0, 0, w, h);
            this.renderer.render(this.scene, this.camera1);
        }
    }
};

window.onload = () => UI.init();