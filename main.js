/* Minimal Planck.js boilerplate
   - SI units inside (meters, seconds, m/s^2)
   - Screen scale: 1 m = 100 px  =>  1 cm = 1 px
   - Piecewise-linear terrain
   - 2-wheel car with motorized revolute joints
*/

const pl = planck;
const Vec2 = pl.Vec2;

// Canvas and rendering setup
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// World scale
const MPP = 100; // meters to pixels (100 px per meter) => 1 cm = 1 px
const m2p = m => m * MPP;
const p2m = p => p / MPP;

// Physics world
const world = new pl.World({
  gravity: Vec2(0, -9.81), // m/s^2, Box2D Y+ is up, so negative for downwards on screen
});

// Camera (in world meters)
let cam = { x: 0, y: -0.3 }; // keep ground slightly above bottom of the screen
// Camera config: keep car ~65% from left to reveal rear area on the left
const camCfg = {
  followXFrac: 0.65, // fraction of canvas width where car should appear
};

// Terrain: custom profile (units in meters)
// Requirement (given in cm, converted to meters):
// 1) 5 m flat
// 2) curb 3 cm up, then ramp +10 cm over 50 cm
// 3) slope 5 m long descending 75 cm
// 4) 5 m flat
const terrain = {
  // Start terrain at the far left of the screen (cam.x = 0 initially, so x=0 is left edge)
  startX: 0,
  startY: 0,
  friction: 0.9,
};

// Live-editable parameters for section 3 (in centimeters): 3a, 3b, 3c each with Δx and Δy
const seg3 = [
  { id: '3a', dx_cm: 100, dy_cm: -5 },
  { id: '3b', dx_cm: 400, dy_cm: -70 },
  { id: '3c', dx_cm: 0, dy_cm: -0 },
];

let ground = world.createBody();
let updatingForm = false; // prevent feedback loops when syncing UI
function buildTerrain() {
  // Destroy and recreate the static ground body to rebuild fixtures
  if (ground) {
    world.destroyBody(ground);
  }
  ground = world.createBody();

  const verts = [];

  // Base point
  let x = terrain.startX;
  let y = terrain.startY;
  verts.push(Vec2(x, y));

  // Helper to push an absolute next point and create an edge from previous
  function pushTo(nx, ny) {
    const a = Vec2(x, y);
    const b = Vec2(nx, ny);
    ground.createFixture(pl.Edge(a, b), { friction: terrain.friction });
    verts.push(b);
    x = nx; y = ny;
  }

  // 1) 5 m flat
  pushTo(x + 5.0, y);

  // 2a) curb +3 cm (vertical step)
  pushTo(x, y + 0.03);

  // 2b) ramp +9 cm over 50 cm
  pushTo(x + 0.5, y + 0.02);

  // 3a, 3b, 3c custom segments
  for (const s of seg3) {
    const dx = Math.max(0, s.dx_cm) / 100;
    const dy = (s.dy_cm) / 100;
    pushTo(x + dx, y + dy);
  }

  // 4) 5 m flat
  pushTo(x + 5.0, y);

  terrain.verts = verts;

  // Update UI (coords + endpoints form)
  updateUIFromTerrain();
}

// initial build
buildTerrain();

// Hook up UI to live-update slope parameters (if present)
function hookUI() {
  const a_dx = document.getElementById('seg3a_dx');
  const a_dy = document.getElementById('seg3a_dy');
  const b_dx = document.getElementById('seg3b_dx');
  const b_dy = document.getElementById('seg3b_dy');
  const c_dx = document.getElementById('seg3c_dx');
  const c_dy = document.getElementById('seg3c_dy');
  if (!a_dx || !a_dy || !b_dx || !b_dy || !c_dx || !c_dy) return;

  const onChange = () => {
    if (updatingForm) return;
    const vals = [a_dx, a_dy, b_dx, b_dy, c_dx, c_dy].map(el => parseFloat(el.value));
    if (!vals.some(v => Number.isNaN(v))) {
      seg3[0].dx_cm = vals[0]; seg3[0].dy_cm = vals[1];
      seg3[1].dx_cm = vals[2]; seg3[1].dy_cm = vals[3];
      seg3[2].dx_cm = vals[4]; seg3[2].dy_cm = vals[5];
      buildTerrain();
    }
  };

  ['input', 'change'].forEach(evt => {
    a_dx.addEventListener(evt, onChange);
    a_dy.addEventListener(evt, onChange);
    b_dx.addEventListener(evt, onChange);
    b_dy.addEventListener(evt, onChange);
    c_dx.addEventListener(evt, onChange);
    c_dy.addEventListener(evt, onChange);
  });
}

// attach listeners now that DOM is ready
hookUI();

// Sync endpoint fields with current terrain vertices
function updateEndpointsForm() {
  const end3X = document.getElementById('slope3EndX');
  const end3Y = document.getElementById('slope3EndY');
  const end4X = document.getElementById('slope4EndX');
  const end4Y = document.getElementById('slope4EndY');
  if (!terrain.verts || terrain.verts.length < 6) return;
  const pts = terrain.verts;
  const toCm = (m) => (m * 100);
  updatingForm = true;
  try {
    if (end3X) end3X.value = toCm(pts[4].x).toFixed(1);
    if (end3Y) end3Y.value = toCm(pts[4].y).toFixed(1);
    if (end4X) end4X.value = toCm(pts[5].x).toFixed(1);
    if (end4Y) end4Y.value = toCm(pts[5].y).toFixed(1);
  } finally {
    updatingForm = false;
  }
}

function updateUIFromTerrain() {
  updateCoordsPanel();
  updateEndpointsForm();
}

// Car parameters (meters) — Renault Megane E-Tech (scaled accurately)
// Specs provided:
//  - Length: 4.200 m
//  - Wheelbase (empattement): 2.685 m
//  - Ground clearance (garde au sol): 0.135 m
//  - Front overhang: 0.800 m
//  - Rear overhang: 0.715 m
// Assumptions (since wheel/tire diameter and body thickness not given):
//  - Wheel radius r ≈ 0.31 m (∅ ≈ 0.62 m)
//  - Chassis visual thickness ≈ 0.42 m
// With these, set axleDrop so clearance = r + axleDrop - chassisH/2 = 0.135 m ⇒ axleDrop = 0.035 m.
const carSpec = {
  length: 4.2,            // chassis visual length
  chassisW: 4.2,          // alias used by rendering (keep API)
  chassisH: 0.42,         // visual thickness of body
  wheelR: 0.31,           // assumed realistic wheel radius
  // Axle longitudinal offsets from chassis center (asymmetric to match overhangs)
  // front axle x = + (L/2 - frontOverhang), rear axle x = - (L/2 - rearOverhang)
  axleFrontX: 4.2 / 2 - 0.8,   // +1.3 m
  axleRearX: - (4.2 / 2 - 0.715), // -1.385 m
  axleDrop: 0.035,        // wheel axle below chassis center

  // Physical properties
  chassisDensity: 2.0,
  wheelDensity: 1.0,
  wheelFriction: 1.2,
  maxMotorTorque: 80,     // N·m
  baseMotorSpeed: 12,     // rad/s

  // Start position: keep car fully on the initial 5 m flat
  startX: 2.0,            // chassis center x, so rear ≈ 0.615 m, front ≈ 3.3 m
  // Start Y slightly above rest so it settles: (r + axleDrop) + 0.01
  startY: 0.31 + 0.035 + 0.01,
};

// Car bodies and joints
let chassis, wheelL, wheelR, jointL, jointR;

function buildCar() {
  // Remove old bodies if resetting
  if (chassis) world.destroyBody(chassis);
  if (wheelL) world.destroyBody(wheelL);
  if (wheelR) world.destroyBody(wheelR);

  const { startX, startY, chassisW, chassisH, wheelR: r, axleFrontX, axleRearX, axleDrop } = carSpec;

  chassis = world.createDynamicBody(Vec2(startX, startY));
  chassis.createFixture(pl.Box(chassisW / 2, chassisH / 2), {
    density: carSpec.chassisDensity,
    friction: 0.6,
  });

  // Treat wheelL as REAR, wheelR as FRONT (based on X)
  wheelL = world.createDynamicBody(Vec2(startX + axleRearX, startY - axleDrop));
  wheelL.createFixture(pl.Circle(r), {
    density: carSpec.wheelDensity,
    friction: carSpec.wheelFriction,
  });

  wheelR = world.createDynamicBody(Vec2(startX + axleFrontX, startY - axleDrop));
  wheelR.createFixture(pl.Circle(r), {
    density: carSpec.wheelDensity,
    friction: carSpec.wheelFriction,
  });

  // Motorized revolute joints (simpler than full suspension with WheelJoint)
  jointL = world.createJoint(pl.RevoluteJoint(
    {
      enableMotor: true,
      motorSpeed: 0,
      maxMotorTorque: carSpec.maxMotorTorque,
      collideConnected: false,
    },
    chassis,
    wheelL,
    wheelL.getPosition()
  ));

  jointR = world.createJoint(pl.RevoluteJoint(
    {
      enableMotor: true,
      motorSpeed: 0,
      maxMotorTorque: carSpec.maxMotorTorque,
      collideConnected: false,
    },
    chassis,
    wheelR,
    wheelR.getPosition()
  ));

  // Initialize camera horizontally using the follow rule
  const initFollowOffsetM = (canvas.width * camCfg.followXFrac) / MPP;
  cam.x = Math.max(0, chassis.getPosition().x - initFollowOffsetM);
}
buildCar();

// Input handling
let throttle = 0;     // -1 (reverse), 0 (coast), 1 (forward)
let braking = false;  // spacebar

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowRight') throttle = 1;
  if (e.code === 'ArrowLeft') throttle = -1;
  if (e.code === 'Space') braking = true;
  if (e.code === 'KeyR') buildCar();
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowRight' && throttle === 1) throttle = 0;
  if (e.code === 'ArrowLeft' && throttle === -1) throttle = 0;
  if (e.code === 'Space') braking = false;
});

// Physics stepping
const fixedDt = 1 / 60;
let acc = 0;
let lastT = performance.now();

function step() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastT) / 1000); // clamp delta
  lastT = now;
  acc += dt;

  // Motor control
  const targetSpeed = carSpec.baseMotorSpeed * throttle;
  if (braking) {
    // crude brake: oppose current rotation
    jointL.setMotorSpeed(-wheelL.getAngularVelocity() * 2);
    jointR.setMotorSpeed(-wheelR.getAngularVelocity() * 2);
  } else {
    // Negative motor speed tends to roll right (due to coordinate conventions)
    jointL.setMotorSpeed(-targetSpeed);
    jointR.setMotorSpeed(-targetSpeed);
  }

  // Fixed update(s)
  while (acc >= fixedDt) {
    world.step(fixedDt);
    acc -= fixedDt;
  }

  // Camera follows car (x) with horizontal offset and keeps ground baseline at ~60% of screen height (y)
  const pos = chassis.getPosition();
  const followOffsetM = (canvas.width * camCfg.followXFrac) / MPP;
  cam.x = Math.max(0, pos.x - followOffsetM);
  const targetGroundScreenY = canvas.height * 0.6; // 60% from top
  // Place world y=0 (terrain baseline) at targetGroundScreenY:
  // target = H - m2p(0 - cam.y) => cam.y = (target - H) / MPP
  cam.y = (targetGroundScreenY - canvas.height) / MPP;

  render();
  requestAnimationFrame(step);
}

// Convert from world meters to screen pixels
function worldToScreen(vec) {
  return {
    x: m2p(vec.x - cam.x),
    y: canvas.height - m2p(vec.y - cam.y),
  };
}

function drawSegment(a, b, color = '#3a4a6a', width = 2) {
  const A = worldToScreen(a);
  const B = worldToScreen(b);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.stroke();
}

function drawPolygon(center, angle, w, h, color = '#0f6', stroke = '#083') {
  const c = worldToScreen(center);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(-angle); // canvas y+ down; Box2D y+ up
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;

  const hw = m2p(w / 2);
  const hh = m2p(h / 2);
  ctx.beginPath();
  ctx.rect(-hw, -hh, 2 * hw, 2 * hh);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawWheel(center, r, angle, color = '#333', ring = '#666') {
  const c = worldToScreen(center);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(-angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = ring;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, m2p(r), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Spokes
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * m2p(r), Math.sin(a) * m2p(r));
    ctx.stroke();
  }
  ctx.restore();
}

function renderTerrain() {
  // Draw terrain segments
  const verts = terrain.verts;
  for (let i = 0; i < verts.length - 1; i++) {
    drawSegment(verts[i], verts[i + 1], '#2f3d5b', 3);
  }

  // Fill under terrain to look like ground
  const baseY = -5; // extend far below for fill
  ctx.fillStyle = '#c7d7ff';
  ctx.beginPath();
  const first = worldToScreen(verts[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < verts.length; i++) {
    const v = worldToScreen(verts[i]);
    ctx.lineTo(v.x, v.y);
  }
  const last = worldToScreen(verts[verts.length - 1]);
  ctx.lineTo(last.x, worldToScreen(Vec2(verts[verts.length - 1].x, baseY)).y);
  ctx.lineTo(first.x, worldToScreen(Vec2(verts[0].x, baseY)).y);
  ctx.closePath();
  ctx.fill();
}

function renderCar() {
  // Chassis
  const cp = chassis.getPosition();
  const ca = chassis.getAngle();
  drawPolygon(cp, ca, carSpec.chassisW, carSpec.chassisH, '#1ecf7c', '#0a7d45');

  // Wheels
  drawWheel(wheelL.getPosition(), carSpec.wheelR, wheelL.getAngle());
  drawWheel(wheelR.getPosition(), carSpec.wheelR, wheelR.getAngle());
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderTerrain();
  renderCar();
}

function updateCoordsPanel() {
  const el = document.getElementById('coordsList');
  if (!el || !terrain.verts) return;
  const pts = terrain.verts;
  const toCm = (m) => (m * 100);
  const fmt = (v) => v.toFixed(1);
  const labels = [
    '0. Start',
    '1. After 1) 5m flat',
    '2. After 2a) +3cm curb',
    '3. After 2b) +10cm / 50cm',
    '4. After 3a)',
    '5. After 3b)',
    '6. After 3c)',
    '7. After 4) 5m flat',
  ];
  let html = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const xcm = toCm(p.x);
    const ycm = toCm(p.y);
    const label = labels[i] || `${i}. Point`;
    html += `${label}: x=${fmt(xcm)}, y=${fmt(ycm)}<br/>`;
  }
  el.innerHTML = html;
}

requestAnimationFrame(step);